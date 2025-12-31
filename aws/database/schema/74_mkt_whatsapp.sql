-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 74_mkt_whatsapp.sql
-- Description: Marketing module - WhatsApp Integration
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 70_mkt_common.sql, 72_mkt_content.sql, 73_mkt_persona.sql
-- =====================================================

-- =====================================================
-- SECTION 1: WHATSAPP ACCOUNTS
-- =====================================================

-- WhatsApp Accounts (Multi-Account Support)
CREATE TABLE IF NOT EXISTS mkt_wap_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Account Identity
  phone_number TEXT UNIQUE,
  account_name TEXT NOT NULL,
  push_name TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'standby', 'warming', 'banned', 'inactive')),
  
  -- Health Monitoring
  health_score INTEGER NOT NULL DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  daily_usage_count INTEGER NOT NULL DEFAULT 0,
  daily_usage_limit INTEGER NOT NULL DEFAULT 200,
  
  -- Session Management
  session_data JSONB,
  session_storage_path TEXT,
  last_connected_at TIMESTAMPTZ,
  last_disconnected_at TIMESTAMPTZ,
  
  -- Safety Controls
  is_rate_limited BOOLEAN NOT NULL DEFAULT false,
  rate_limit_until TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_wap_accounts_phone ON mkt_wap_accounts(phone_number);
CREATE INDEX idx_mkt_wap_accounts_status ON mkt_wap_accounts(status);
CREATE INDEX idx_mkt_wap_accounts_health ON mkt_wap_accounts(health_score DESC);
CREATE INDEX idx_mkt_wap_accounts_active ON mkt_wap_accounts(status) WHERE status = 'active';

-- Trigger
CREATE TRIGGER update_mkt_wap_accounts_updated_at
  BEFORE UPDATE ON mkt_wap_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_wap_accounts IS 'WhatsApp accounts for multi-account support';
COMMENT ON COLUMN mkt_wap_accounts.daily_usage_limit IS 'Rate limit: 200 messages per account per day';

-- =====================================================
-- SECTION 2: WHATSAPP GROUPS
-- =====================================================

-- WhatsApp Groups
CREATE TABLE IF NOT EXISTS mkt_wap_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Group Identity
  group_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Group Details
  member_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Geographic Classification
  region TEXT,
  state TEXT,
  district TEXT,
  
  -- Segment Tags (for persona mapping)
  segment_tags TEXT[],
  
  -- Account Management
  account_id UUID REFERENCES mkt_wap_accounts(id) ON DELETE SET NULL,
  
  -- Metadata
  profile_pic_url TEXT,
  notes TEXT,
  
  -- Timestamps
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_wap_groups_group_id ON mkt_wap_groups(group_id);
CREATE INDEX idx_mkt_wap_groups_active ON mkt_wap_groups(is_active);
CREATE INDEX idx_mkt_wap_groups_account ON mkt_wap_groups(account_id);
CREATE INDEX idx_mkt_wap_groups_region ON mkt_wap_groups(region, state);

-- Trigger
CREATE TRIGGER update_mkt_wap_groups_updated_at
  BEFORE UPDATE ON mkt_wap_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_wap_groups IS 'WhatsApp groups discovered and managed for marketing campaigns';

-- =====================================================
-- SECTION 3: WHATSAPP CONTACTS
-- =====================================================

-- WhatsApp Contacts
CREATE TABLE IF NOT EXISTS mkt_wap_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact Identity
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT,
  profile_pic_url TEXT,
  
  -- Persona Link
  persona_contact_id UUID REFERENCES mkt_persona_contacts(id) ON DELETE SET NULL,
  
  -- Group Memberships (denormalized for quick access)
  group_memberships UUID[],
  
  -- Engagement
  engagement_score INTEGER NOT NULL DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  last_interaction_at TIMESTAMPTZ,
  
  -- Source
  source TEXT,
  scraped_from_groups UUID[],
  
  -- Metadata
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_wap_contacts_phone ON mkt_wap_contacts(phone_number);
CREATE INDEX idx_mkt_wap_contacts_persona ON mkt_wap_contacts(persona_contact_id);
CREATE INDEX idx_mkt_wap_contacts_engagement ON mkt_wap_contacts(engagement_score DESC);

-- Trigger
CREATE TRIGGER update_mkt_wap_contacts_updated_at
  BEFORE UPDATE ON mkt_wap_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_wap_contacts IS 'WhatsApp contacts scraped from groups, linked to persona data for ICP matching';

-- =====================================================
-- SECTION 4: WHATSAPP MESSAGES
-- =====================================================

-- WhatsApp Messages (Links directly to campaigns, NO separate campaigns table)
CREATE TABLE IF NOT EXISTS mkt_wap_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign Link (Direct link to top-level campaign)
  campaign_id UUID NOT NULL REFERENCES mkt_campaigns(id) ON DELETE CASCADE,
  
  -- Content Link
  content_id UUID REFERENCES mkt_con_content(id) ON DELETE SET NULL,
  
  -- Message Details
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'document', 'link')),
  message_text TEXT,
  media_url TEXT,
  link_url TEXT,
  link_preview_data JSONB,
  
  -- Target
  channel_type TEXT NOT NULL CHECK (channel_type IN ('group', 'individual', 'broadcast')),
  target_group_id UUID REFERENCES mkt_wap_groups(id) ON DELETE SET NULL,
  target_contact_id UUID REFERENCES mkt_wap_contacts(id) ON DELETE SET NULL,
  
  -- Account Used
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE RESTRICT,
  
  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Error Handling
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  
  -- Performance
  delivery_confirmations INTEGER NOT NULL DEFAULT 0,
  read_confirmations INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_wap_messages_campaign ON mkt_wap_messages(campaign_id);
CREATE INDEX idx_mkt_wap_messages_content ON mkt_wap_messages(content_id);
CREATE INDEX idx_mkt_wap_messages_status ON mkt_wap_messages(status);
CREATE INDEX idx_mkt_wap_messages_account ON mkt_wap_messages(account_id);
CREATE INDEX idx_mkt_wap_messages_group ON mkt_wap_messages(target_group_id);
CREATE INDEX idx_mkt_wap_messages_contact ON mkt_wap_messages(target_contact_id);
CREATE INDEX idx_mkt_wap_messages_scheduled ON mkt_wap_messages(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_mkt_wap_messages_sent ON mkt_wap_messages(sent_at DESC);

-- Trigger
CREATE TRIGGER update_mkt_wap_messages_updated_at
  BEFORE UPDATE ON mkt_wap_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_wap_messages IS 'WhatsApp messages - links directly to mkt_campaigns (NO separate WhatsApp campaigns table)';
COMMENT ON COLUMN mkt_wap_messages.campaign_id IS 'Direct link to top-level marketing campaign';
COMMENT ON COLUMN mkt_wap_messages.channel_type IS 'group = send to group, individual = DM, broadcast = broadcast list';

-- =====================================================
-- SECTION 5: PERSONA GROUP MEMBERSHIPS
-- =====================================================

-- Persona Group Memberships (Group → Persona Mapping)
-- Note: Defined here to avoid circular dependency (references mkt_wap_groups)
CREATE TABLE IF NOT EXISTS mkt_persona_group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  contact_id UUID NOT NULL REFERENCES mkt_persona_contacts(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  
  -- Membership Details
  role_in_group TEXT CHECK (role_in_group IN ('admin', 'member', 'unknown')),
  joined_at TIMESTAMPTZ,
  
  -- Persona Contribution
  contributes_to_persona BOOLEAN NOT NULL DEFAULT true,
  persona_weight DECIMAL(3,2) NOT NULL DEFAULT 1.0 CHECK (persona_weight >= 0 AND persona_weight <= 1),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(contact_id, group_id)
);

-- Indexes
CREATE INDEX idx_mkt_persona_group_memberships_contact ON mkt_persona_group_memberships(contact_id);
CREATE INDEX idx_mkt_persona_group_memberships_group ON mkt_persona_group_memberships(group_id);

-- Trigger
CREATE TRIGGER update_mkt_persona_group_memberships_updated_at
  BEFORE UPDATE ON mkt_persona_group_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_persona_group_memberships IS 'Maps contacts to WhatsApp groups for persona calculation';

