-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 79_mkt_whatsapp_groups_enhancements.sql
-- Description: WhatsApp Group Management Enhancements
-- Version: 1.0
-- Date: 2025-12-31
-- Dependencies: 74_mkt_whatsapp.sql
-- =====================================================

-- =====================================================
-- SECTION 1: ENHANCE mkt_wap_groups TABLE
-- =====================================================

-- Add new columns to mkt_wap_groups
ALTER TABLE mkt_wap_groups 
  ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contacts_count_at_last_scrape INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_admin_only_group BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS internal_description TEXT;

-- Add index for hidden groups filter
CREATE INDEX IF NOT EXISTS idx_mkt_wap_groups_hidden 
  ON mkt_wap_groups(is_hidden) WHERE is_hidden = false;

-- Add index for favorite groups filter
CREATE INDEX IF NOT EXISTS idx_mkt_wap_groups_favorite 
  ON mkt_wap_groups(is_favorite) WHERE is_favorite = true;

-- Add index for last_scraped_at
CREATE INDEX IF NOT EXISTS idx_mkt_wap_groups_last_scraped 
  ON mkt_wap_groups(last_scraped_at DESC) WHERE last_scraped_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN mkt_wap_groups.last_scraped_at IS 'Last time contacts were scraped from this group';
COMMENT ON COLUMN mkt_wap_groups.contacts_count_at_last_scrape IS 'Number of contacts when last scraped';
COMMENT ON COLUMN mkt_wap_groups.is_hidden IS 'Hide personal/non-relevant groups from UI';
COMMENT ON COLUMN mkt_wap_groups.is_favorite IS 'Mark group as favorite/featured for easy access';
COMMENT ON COLUMN mkt_wap_groups.is_admin_only_group IS 'Whether group is admin-only (only admins can post)';
COMMENT ON COLUMN mkt_wap_groups.internal_description IS 'Internal notes/description for team use';

-- =====================================================
-- SECTION 2: GROUP-ACCOUNT ACCESS TABLE
-- =====================================================

-- Group-Account Access (Many-to-Many: Accounts ↔ Groups)
-- Tracks which accounts have access to which groups, with permissions
CREATE TABLE IF NOT EXISTS mkt_wap_group_account_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  
  -- Account's Role in Group
  is_account_admin BOOLEAN NOT NULL DEFAULT false, -- Is our account an admin?
  is_account_super_admin BOOLEAN NOT NULL DEFAULT false, -- Is our account a super admin?
  
  -- Group Permissions (from WhatsApp)
  can_add_contacts BOOLEAN NOT NULL DEFAULT false, -- Can account add new members?
  can_post_messages BOOLEAN NOT NULL DEFAULT true, -- Can account post messages?
  can_edit_group_info BOOLEAN NOT NULL DEFAULT false, -- Can account edit group name/description?
  
  -- Group Settings (from WhatsApp)
  is_admin_only_group BOOLEAN NOT NULL DEFAULT false, -- Is group admin-only? (synced from group)
  
  -- Discovery
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When account discovered this group
  last_accessed_at TIMESTAMPTZ, -- Last time account accessed this group
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(group_id, account_id)
);

-- Indexes
CREATE INDEX idx_mkt_wap_group_account_access_group ON mkt_wap_group_account_access(group_id);
CREATE INDEX idx_mkt_wap_group_account_access_account ON mkt_wap_group_account_access(account_id);
CREATE INDEX idx_mkt_wap_group_account_access_admin ON mkt_wap_group_account_access(is_account_admin) WHERE is_account_admin = true;

-- Trigger
CREATE TRIGGER update_mkt_wap_group_account_access_updated_at
  BEFORE UPDATE ON mkt_wap_group_account_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_wap_group_account_access IS 'Maps accounts to groups with permissions - enables deduplication of same group across accounts';
COMMENT ON COLUMN mkt_wap_group_account_access.is_account_admin IS 'Whether our account is an admin of this group';
COMMENT ON COLUMN mkt_wap_group_account_access.can_add_contacts IS 'Whether account can add new members to group';
COMMENT ON COLUMN mkt_wap_group_account_access.can_post_messages IS 'Whether account can post messages to group';

-- =====================================================
-- SECTION 3: GROUP-CONTACT MAPPING TABLE
-- =====================================================

-- Group-Contact Mapping (Many-to-Many: Groups ↔ Contacts)
-- Tracks which contacts are in which groups, with admin status
CREATE TABLE IF NOT EXISTS mkt_wap_group_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES mkt_wap_contacts(id) ON DELETE CASCADE,
  
  -- Membership Details
  is_admin BOOLEAN NOT NULL DEFAULT false, -- Is contact an admin?
  is_super_admin BOOLEAN NOT NULL DEFAULT false, -- Is contact a super admin?
  is_left BOOLEAN NOT NULL DEFAULT false, -- Contact left the group (don't remove, just mark)
  
  -- Timestamps
  joined_at TIMESTAMPTZ, -- When contact joined (from WhatsApp, if available)
  left_at TIMESTAMPTZ, -- When contact left (if applicable)
  first_scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- First time we scraped this contact
  last_seen_at TIMESTAMPTZ, -- Last time we saw this contact in group (updated on each scrape)
  
  -- Metadata
  scraped_by_account_id UUID REFERENCES mkt_wap_accounts(id) ON DELETE SET NULL, -- Which account scraped this contact
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(group_id, contact_id)
);

-- Indexes
CREATE INDEX idx_mkt_wap_group_contacts_group ON mkt_wap_group_contacts(group_id);
CREATE INDEX idx_mkt_wap_group_contacts_contact ON mkt_wap_group_contacts(contact_id);
CREATE INDEX idx_mkt_wap_group_contacts_admin ON mkt_wap_group_contacts(is_admin) WHERE is_admin = true;
CREATE INDEX idx_mkt_wap_group_contacts_left ON mkt_wap_group_contacts(is_left) WHERE is_left = true;
CREATE INDEX idx_mkt_wap_group_contacts_active ON mkt_wap_group_contacts(group_id, is_left) WHERE is_left = false;

-- Trigger
CREATE TRIGGER update_mkt_wap_group_contacts_updated_at
  BEFORE UPDATE ON mkt_wap_group_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_wap_group_contacts IS 'Maps contacts to groups with admin status - tracks membership state (active/left)';
COMMENT ON COLUMN mkt_wap_group_contacts.is_left IS 'Contact left the group - keep record but mark as left';
COMMENT ON COLUMN mkt_wap_group_contacts.last_seen_at IS 'Last time contact was seen in group (updated on each scrape)';

-- =====================================================
-- SECTION 4: HELPER FUNCTIONS
-- =====================================================
-- Note: Data migration section removed as there is no existing data
-- If you need to migrate existing data in the future, use:
-- INSERT INTO mkt_wap_group_account_access (group_id, account_id, discovered_at, created_at, updated_at)
-- SELECT id AS group_id, account_id, discovered_at, created_at, updated_at
-- FROM mkt_wap_groups WHERE account_id IS NOT NULL
-- ON CONFLICT (group_id, account_id) DO NOTHING;


-- Function to get active contact count for a group
CREATE OR REPLACE FUNCTION get_group_active_contact_count(group_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM mkt_wap_group_contacts
    WHERE group_id = group_uuid
      AND is_left = false
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get account's groups (excluding hidden)
CREATE OR REPLACE FUNCTION get_account_groups(account_uuid UUID, include_hidden BOOLEAN DEFAULT false)
RETURNS TABLE (
  group_id UUID,
  whatsapp_group_id TEXT,
  name TEXT,
  description TEXT,
  member_count INTEGER,
  is_active BOOLEAN,
  is_account_admin BOOLEAN,
  can_post_messages BOOLEAN,
  last_scraped_at TIMESTAMPTZ,
  contacts_count_at_last_scrape INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id AS group_id,
    g.group_id AS whatsapp_group_id,
    g.name,
    g.description,
    g.member_count,
    g.is_active,
    gaa.is_account_admin,
    gaa.can_post_messages,
    g.last_scraped_at,
    g.contacts_count_at_last_scrape
  FROM mkt_wap_groups g
  JOIN mkt_wap_group_account_access gaa ON g.id = gaa.group_id
  WHERE gaa.account_id = account_uuid
    AND (include_hidden = true OR g.is_hidden = false)
  ORDER BY g.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 5: VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Groups with account access details
CREATE OR REPLACE VIEW v_mkt_wap_groups_with_access AS
SELECT 
  g.id,
  g.group_id,
  g.name,
  g.description,
  g.member_count,
  g.is_active,
  g.region,
  g.state,
  g.district,
  g.segment_tags,
  g.profile_pic_url,
  g.notes,
  g.last_scraped_at,
  g.contacts_count_at_last_scrape,
  g.is_hidden,
  g.is_admin_only_group,
  g.internal_description,
  g.discovered_at,
  g.created_at,
  g.updated_at,
  -- Account access details (from junction table)
  gaa.account_id,
  gaa.is_account_admin,
  gaa.is_account_super_admin,
  gaa.can_add_contacts,
  gaa.can_post_messages,
  gaa.can_edit_group_info,
  gaa.discovered_at AS account_discovered_at,
  gaa.last_accessed_at AS account_last_accessed_at,
  (SELECT COUNT(*) FROM mkt_wap_group_contacts gc WHERE gc.group_id = g.id AND gc.is_left = false) AS active_contacts_count
FROM mkt_wap_groups g
LEFT JOIN mkt_wap_group_account_access gaa ON g.id = gaa.group_id;

-- View: Contacts in groups with details
CREATE OR REPLACE VIEW v_mkt_wap_group_contacts_detail AS
SELECT 
  gc.*,
  c.phone_number,
  c.name AS contact_name,
  c.profile_pic_url AS contact_profile_pic,
  g.name AS group_name,
  g.group_id AS whatsapp_group_id
FROM mkt_wap_group_contacts gc
JOIN mkt_wap_contacts c ON gc.contact_id = c.id
JOIN mkt_wap_groups g ON gc.group_id = g.id;

-- =====================================================
-- SECTION 6: CONSTRAINTS & VALIDATIONS
-- =====================================================

-- Ensure contact count at last scrape is non-negative
ALTER TABLE mkt_wap_groups 
  ADD CONSTRAINT chk_contacts_count_at_last_scrape 
  CHECK (contacts_count_at_last_scrape >= 0);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary:
-- ✅ Added columns to mkt_wap_groups: last_scraped_at, contacts_count_at_last_scrape, is_hidden, is_admin_only_group, internal_description
-- ✅ Created mkt_wap_group_account_access table (enables deduplication)
-- ✅ Created mkt_wap_group_contacts table (tracks contacts with admin status and left state)
-- ✅ Created helper functions and views
-- ✅ Added indexes for performance
-- ✅ Fixed view to avoid duplicate account_id column

