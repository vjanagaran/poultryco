-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 50_msg_core.sql
-- Description: Messaging system (WhatsApp-style)
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: CONVERSATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS msg_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type
  is_group BOOLEAN NOT NULL DEFAULT false,
  
  -- Group details (if is_group = true)
  group_name TEXT CHECK (is_group = false OR group_name IS NOT NULL),
  group_photo_url TEXT,
  group_description TEXT CHECK (char_length(group_description) <= 500),
  
  -- Creator
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Last message tracking
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT CHECK (char_length(last_message_preview) <= 200),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_msg_conversations_created_by ON msg_conversations(created_by);
CREATE INDEX idx_msg_conversations_last_message ON msg_conversations(last_message_at DESC);
CREATE INDEX idx_msg_conversations_is_group ON msg_conversations(is_group);

CREATE TRIGGER update_msg_conversations_updated_at
  BEFORE UPDATE ON msg_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: CONVERSATION PARTICIPANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS msg_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES msg_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Role in conversation
  is_admin BOOLEAN NOT NULL DEFAULT false,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  -- Read tracking
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unread_count INTEGER NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  
  -- Notifications
  is_muted BOOLEAN NOT NULL DEFAULT false,
  muted_until TIMESTAMPTZ,
  
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_msg_participants_conversation ON msg_participants(conversation_id);
CREATE INDEX idx_msg_participants_user ON msg_participants(user_id);
CREATE INDEX idx_msg_participants_active ON msg_participants(is_active);
CREATE INDEX idx_msg_participants_unread ON msg_participants(user_id, unread_count) WHERE unread_count > 0;

-- =====================================================
-- SECTION 3: MESSAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS msg_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES msg_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN (
    'text', 'image', 'video', 'document', 'audio', 'location', 'contact', 'system'
  )),
  
  -- Media attachments
  media_urls TEXT[] DEFAULT '{}',
  
  -- Reply/Forward
  reply_to_message_id UUID REFERENCES msg_messages(id) ON DELETE SET NULL,
  forwarded_from_message_id UUID REFERENCES msg_messages(id) ON DELETE SET NULL,
  
  -- Status
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_for_everyone BOOLEAN NOT NULL DEFAULT false,
  
  -- Delivery status
  delivered_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_msg_messages_conversation ON msg_messages(conversation_id, created_at DESC);
CREATE INDEX idx_msg_messages_sender ON msg_messages(sender_id);
CREATE INDEX idx_msg_messages_reply ON msg_messages(reply_to_message_id);
CREATE INDEX idx_msg_messages_type ON msg_messages(message_type);
CREATE INDEX idx_msg_messages_deleted ON msg_messages(is_deleted) WHERE is_deleted = false;

CREATE TRIGGER update_msg_messages_updated_at
  BEFORE UPDATE ON msg_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: MESSAGE REACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS msg_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES msg_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reaction
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(message_id, user_id)
);

CREATE INDEX idx_msg_reactions_message ON msg_reactions(message_id);
CREATE INDEX idx_msg_reactions_user ON msg_reactions(user_id);

-- =====================================================
-- SECTION 5: READ RECEIPTS
-- =====================================================

CREATE TABLE IF NOT EXISTS msg_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES msg_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Timestamp
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(message_id, user_id)
);

CREATE INDEX idx_msg_read_receipts_message ON msg_read_receipts(message_id);
CREATE INDEX idx_msg_read_receipts_user ON msg_read_receipts(user_id);

-- =====================================================
-- SECTION 6: HELPER FUNCTIONS
-- =====================================================

-- Update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE msg_conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 200),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_conversation_last_message
  AFTER INSERT ON msg_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Update unread count
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment unread for all participants except sender
  UPDATE msg_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
    AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_unread_count
  AFTER INSERT ON msg_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_unread_count();

-- Mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  -- Update participant last_read_at and reset unread_count
  UPDATE msg_participants
  SET 
    last_read_at = NOW(),
    unread_count = 0
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE msg_conversations IS 'Chat conversations (1:1 and groups)';
COMMENT ON TABLE msg_participants IS 'Conversation participants with read tracking';
COMMENT ON TABLE msg_messages IS 'Chat messages';
COMMENT ON TABLE msg_reactions IS 'Message reactions (emoji)';
COMMENT ON TABLE msg_read_receipts IS 'Message read receipts';

