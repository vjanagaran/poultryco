-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 78_mkt_whatsapp_groups_enhancements.sql
-- Description: Marketing module - WhatsApp Groups Enhancements (Persona, Tags, Metadata)
-- Version: 1.0
-- Date: 2025-12-30
-- Dependencies: 74_mkt_whatsapp.sql, 73_mkt_persona.sql
-- =====================================================

-- =====================================================
-- SECTION 1: GROUP METADATA ENHANCEMENTS
-- =====================================================

-- Add metadata columns to groups table
ALTER TABLE mkt_wap_groups 
ADD COLUMN IF NOT EXISTS first_connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_message_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS mapped_contacts_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS new_contacts_since_scrape INTEGER NOT NULL DEFAULT 0;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_mkt_wap_groups_first_connected ON mkt_wap_groups(first_connected_at);
CREATE INDEX IF NOT EXISTS idx_mkt_wap_groups_last_message ON mkt_wap_groups(last_message_sent_at);
CREATE INDEX IF NOT EXISTS idx_mkt_wap_groups_last_scraped ON mkt_wap_groups(last_scraped_at);

-- =====================================================
-- SECTION 2: GROUP PERSONA MAPPING
-- =====================================================

-- Group to Persona mapping (many-to-many)
-- Note: Using persona_contact_id as reference, but this could be segment_id if preferred
CREATE TABLE IF NOT EXISTS mkt_wap_group_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Group reference
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  
  -- Persona reference (using persona contact as base)
  -- This links to the persona system for targeting
  persona_contact_id UUID REFERENCES mkt_persona_contacts(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES mkt_segments(id) ON DELETE SET NULL, -- Alternative: link to segment
  
  -- Mapping metadata
  confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  mapping_method TEXT, -- 'manual', 'auto', 'ai'
  mapped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mapped_by UUID REFERENCES adm_users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(group_id, persona_contact_id)
);

-- Indexes
CREATE INDEX idx_mkt_wap_group_personas_group ON mkt_wap_group_personas(group_id);
CREATE INDEX idx_mkt_wap_group_personas_persona ON mkt_wap_group_personas(persona_contact_id);
CREATE INDEX idx_mkt_wap_group_personas_segment ON mkt_wap_group_personas(segment_id);

-- =====================================================
-- SECTION 3: GROUP TAGS
-- =====================================================

-- Group tags for filtering and organization
CREATE TABLE IF NOT EXISTS mkt_wap_group_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Group reference
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  
  -- Tag
  tag TEXT NOT NULL,
  tag_color TEXT, -- Optional: color for UI display
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES adm_users(id) ON DELETE SET NULL,
  
  UNIQUE(group_id, tag)
);

-- Indexes
CREATE INDEX idx_mkt_wap_group_tags_group ON mkt_wap_group_tags(group_id);
CREATE INDEX idx_mkt_wap_group_tags_tag ON mkt_wap_group_tags(tag);

-- =====================================================
-- SECTION 4: GROUP SCRAPE HISTORY
-- =====================================================

-- Track contact scraping history per group
CREATE TABLE IF NOT EXISTS mkt_wap_group_scrape_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Group reference
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  
  -- Account reference
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  
  -- Scrape results
  contacts_found INTEGER NOT NULL DEFAULT 0,
  contacts_new INTEGER NOT NULL DEFAULT 0,
  contacts_mapped INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scraped_by UUID REFERENCES adm_users(id) ON DELETE SET NULL,
  notes TEXT
);

-- Indexes
CREATE INDEX idx_mkt_wap_group_scrape_history_group ON mkt_wap_group_scrape_history(group_id);
CREATE INDEX idx_mkt_wap_group_scrape_history_account ON mkt_wap_group_scrape_history(account_id);
CREATE INDEX idx_mkt_wap_group_scrape_history_date ON mkt_wap_group_scrape_history(scraped_at);

-- =====================================================
-- SECTION 5: OUR SENT MESSAGES TRACKING
-- =====================================================

-- Ensure mkt_wap_messages table tracks our sent messages properly
-- This table already exists, but we need to ensure it only saves our sent messages
-- Add index for group-based queries
CREATE INDEX IF NOT EXISTS idx_mkt_wap_messages_group ON mkt_wap_messages(target_group_id);
CREATE INDEX IF NOT EXISTS idx_mkt_wap_messages_sent_at ON mkt_wap_messages(sent_at);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE mkt_wap_group_personas IS 'Maps WhatsApp groups to personas for targeted messaging';
COMMENT ON TABLE mkt_wap_group_tags IS 'Tags for organizing and filtering WhatsApp groups';
COMMENT ON TABLE mkt_wap_group_scrape_history IS 'History of contact scraping operations per group';

COMMENT ON COLUMN mkt_wap_groups.first_connected_at IS 'Date when group was first discovered/connected';
COMMENT ON COLUMN mkt_wap_groups.last_message_sent_at IS 'Date/time of last message sent from our system';
COMMENT ON COLUMN mkt_wap_groups.last_scraped_at IS 'Date/time of last contact scrape';
COMMENT ON COLUMN mkt_wap_groups.mapped_contacts_count IS 'Number of contacts mapped to our persona system';
COMMENT ON COLUMN mkt_wap_groups.new_contacts_since_scrape IS 'Number of new contacts since last scrape';

COMMENT ON COLUMN mkt_wap_group_personas.confidence_score IS 'Confidence score for persona mapping (0-100)';
COMMENT ON COLUMN mkt_wap_group_personas.mapping_method IS 'How the mapping was created: manual, auto, or ai';

