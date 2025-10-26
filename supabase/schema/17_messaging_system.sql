-- =====================================================
-- PoultryCo Database Schema
-- File: 17_messaging_system.sql
-- Description: Real-time messaging and conversations
-- Version: 1.0
-- Date: 2025-10-25
-- Dependencies: 01_core_profiles.sql
-- =====================================================

-- =====================================================
-- SECTION 1: CONVERSATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS conversations (
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

-- Indexes
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_is_group ON conversations(is_group);

-- Trigger
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: CONVERSATION PARTICIPANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Role in conversation
  is_admin BOOLEAN NOT NULL DEFAULT false, -- Can add/remove members, change group settings
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  -- Read tracking
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unread_count INTEGER NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  
  -- Notifications
  muted_until TIMESTAMPTZ,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  
  -- Unique participant per conversation
  UNIQUE(conversation_id, user_id)
);

-- Indexes
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_active ON conversation_participants(is_active);
CREATE INDEX idx_conversation_participants_unread ON conversation_participants(user_id, unread_count) WHERE unread_count > 0;

-- =====================================================
-- SECTION 3: MESSAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN (
    'text', 'image', 'video', 'document', 'audio', 'location', 'contact', 'system'
  )),
  
  -- Media attachments
  media_urls TEXT[] DEFAULT '{}',
  
  -- Reply/Forward
  reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  forwarded_from_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  
  -- Metadata
  edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  
  -- Read tracking
  read_by UUID[] DEFAULT '{}',
  delivered_to UUID[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_reply_to ON messages(reply_to_message_id);
CREATE INDEX idx_messages_not_deleted ON messages(conversation_id, created_at DESC) WHERE NOT deleted;

-- Trigger
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation last_message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = CASE
      WHEN NEW.message_type = 'text' THEN LEFT(NEW.content, 200)
      WHEN NEW.message_type = 'image' THEN '📷 Image'
      WHEN NEW.message_type = 'video' THEN '🎥 Video'
      WHEN NEW.message_type = 'document' THEN '📄 Document'
      WHEN NEW.message_type = 'audio' THEN '🎵 Audio'
      ELSE '📎 Attachment'
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new messages
CREATE TRIGGER message_insert_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Function to increment unread count for participants
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
    AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for unread count
CREATE TRIGGER message_unread_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (NEW.message_type != 'system')
  EXECUTE FUNCTION increment_unread_count();

-- =====================================================
-- SECTION 4: MESSAGE READ RECEIPTS
-- =====================================================

CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique receipt per message per user
  UNIQUE(message_id, user_id)
);

-- Indexes
CREATE INDEX idx_message_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX idx_message_read_receipts_user ON message_read_receipts(user_id);

-- =====================================================
-- SECTION 5: MESSAGE REACTIONS (EMOJI REACTIONS)
-- =====================================================

CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reaction (emoji)
  reaction TEXT NOT NULL CHECK (char_length(reaction) <= 10),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One reaction per user per message (can change reaction)
  UNIQUE(message_id, user_id)
);

-- Indexes
CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user ON message_reactions(user_id);

-- =====================================================
-- SECTION 6: CONVERSATION HELPER FUNCTIONS
-- =====================================================

-- Function to create a direct message conversation
CREATE OR REPLACE FUNCTION create_direct_conversation(
  p_user_id_1 UUID,
  p_user_id_2 UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_existing_conversation_id UUID;
BEGIN
  -- Check if conversation already exists
  SELECT c.id INTO v_existing_conversation_id
  FROM conversations c
  INNER JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = p_user_id_1
  INNER JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = p_user_id_2
  WHERE c.is_group = false
  LIMIT 1;
  
  IF v_existing_conversation_id IS NOT NULL THEN
    RETURN v_existing_conversation_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO conversations (is_group, created_by)
  VALUES (false, p_user_id_1)
  RETURNING id INTO v_conversation_id;
  
  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES 
    (v_conversation_id, p_user_id_1),
    (v_conversation_id, p_user_id_2);
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Update last_read_at and reset unread_count
  UPDATE conversation_participants
  SET 
    last_read_at = NOW(),
    unread_count = 0
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
  
  -- Insert read receipts for unread messages
  INSERT INTO message_read_receipts (message_id, user_id)
  SELECT m.id, p_user_id
  FROM messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM message_read_receipts mrr
      WHERE mrr.message_id = m.id AND mrr.user_id = p_user_id
    )
  ON CONFLICT (message_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ENABLE RLS ON ALL MESSAGING TABLES
-- =====================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR MESSAGING
-- =====================================================

-- Conversations: Users can view their own conversations
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth_uid()
        AND is_active = true
    )
  );

-- Conversations: Users can create conversations
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (created_by = auth_uid());

-- Conversations: Admins can update conversations
CREATE POLICY "Conversation admins can update"
  ON conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth_uid()
        AND is_admin = true
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth_uid()
        AND is_admin = true
        AND is_active = true
    )
  );

-- Participants: Users can view participants of their conversations
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth_uid()
        AND cp.is_active = true
    )
  );

-- Participants: Admins can add participants
CREATE POLICY "Conversation admins can add participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth_uid()
        AND cp.is_admin = true
        AND cp.is_active = true
    )
  );

-- Participants: Users can update their own participation
CREATE POLICY "Users can update own participation"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth_uid())
  WITH CHECK (user_id = auth_uid());

-- Messages: Participants can view messages
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    NOT deleted AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth_uid()
        AND is_active = true
    )
  );

-- Messages: Participants can send messages
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth_uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth_uid()
        AND is_active = true
    )
  );

-- Messages: Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth_uid())
  WITH CHECK (sender_id = auth_uid());

-- Messages: Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (sender_id = auth_uid());

-- Read receipts: Participants can create
CREATE POLICY "Participants can create read receipts"
  ON message_read_receipts FOR INSERT
  WITH CHECK (user_id = auth_uid());

-- Read receipts: Participants can view
CREATE POLICY "Participants can view read receipts"
  ON message_read_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      INNER JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_read_receipts.message_id
        AND cp.user_id = auth_uid()
        AND cp.is_active = true
    )
  );

-- Reactions: Participants can react to messages
CREATE POLICY "Participants can react to messages"
  ON message_reactions FOR ALL
  USING (user_id = auth_uid())
  WITH CHECK (user_id = auth_uid());

-- =====================================================
-- ENABLE REALTIME FOR MESSAGING
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_read_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE conversations IS 'Chat conversations (1:1 or group)';
COMMENT ON TABLE conversation_participants IS 'Members of each conversation';
COMMENT ON TABLE messages IS 'Chat messages with media support';
COMMENT ON TABLE message_read_receipts IS 'Read tracking for messages';
COMMENT ON TABLE message_reactions IS 'Emoji reactions to messages';

COMMENT ON FUNCTION create_direct_conversation IS 'Creates or returns existing 1:1 conversation between two users';
COMMENT ON FUNCTION mark_messages_as_read IS 'Marks all messages in a conversation as read for a user';

-- =====================================================
-- END OF FILE
-- =====================================================

