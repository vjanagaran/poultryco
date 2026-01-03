-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 80_mkt_whatsapp_multi_account_groups.sql
-- Description: Multi-Account Group Support - Remove account_id, Rename Table
-- Version: 1.0
-- Date: 2026-01-02
-- Dependencies: 79_mkt_whatsapp_groups_enhancements.sql
-- =====================================================

-- =====================================================
-- SECTION 1: RENAME TABLE
-- =====================================================

-- Rename mkt_wap_group_account_access to mkt_wap_group_accounts
ALTER TABLE IF EXISTS mkt_wap_group_account_access 
  RENAME TO mkt_wap_group_accounts;

-- Rename indexes
ALTER INDEX IF EXISTS idx_mkt_wap_group_account_access_group 
  RENAME TO idx_mkt_wap_group_accounts_group;

ALTER INDEX IF EXISTS idx_mkt_wap_group_account_access_account 
  RENAME TO idx_mkt_wap_group_accounts_account;

ALTER INDEX IF EXISTS idx_mkt_wap_group_account_access_admin 
  RENAME TO idx_mkt_wap_group_accounts_admin;

-- Rename unique constraint
ALTER TABLE mkt_wap_group_accounts
  DROP CONSTRAINT IF EXISTS mkt_wap_group_account_access_group_account_unique;

ALTER TABLE mkt_wap_group_accounts
  ADD CONSTRAINT mkt_wap_group_accounts_group_account_unique 
  UNIQUE(group_id, account_id);

-- Rename trigger
DROP TRIGGER IF EXISTS update_mkt_wap_group_account_access_updated_at ON mkt_wap_group_accounts;

CREATE TRIGGER update_mkt_wap_group_accounts_updated_at
  BEFORE UPDATE ON mkt_wap_group_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update comments
COMMENT ON TABLE mkt_wap_group_accounts IS 'Maps accounts to groups with permissions - enables deduplication of same group across accounts';
COMMENT ON COLUMN mkt_wap_group_accounts.is_account_admin IS 'Whether our account is an admin of this group';
COMMENT ON COLUMN mkt_wap_group_accounts.can_add_contacts IS 'Whether account can add new members to group';
COMMENT ON COLUMN mkt_wap_group_accounts.can_post_messages IS 'Whether account can post messages to group';

-- =====================================================
-- SECTION 2: REMOVE account_id FROM mkt_wap_groups
-- =====================================================

-- First, migrate any existing account_id relationships to mkt_wap_group_accounts
-- This ensures we don't lose data when removing account_id
INSERT INTO mkt_wap_group_accounts (group_id, account_id, discovered_at, created_at, updated_at)
SELECT 
  g.id AS group_id,
  g.account_id AS account_id,
  COALESCE(g.discovered_at, g.created_at) AS discovered_at,
  g.created_at,
  g.updated_at
FROM mkt_wap_groups g
WHERE g.account_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM mkt_wap_group_accounts gaa 
    WHERE gaa.group_id = g.id 
      AND gaa.account_id = g.account_id
  )
ON CONFLICT (group_id, account_id) DO NOTHING;

-- Drop foreign key constraint on account_id
ALTER TABLE mkt_wap_groups 
  DROP CONSTRAINT IF EXISTS mkt_wap_groups_account_id_fkey;

-- Drop index on account_id
DROP INDEX IF EXISTS idx_mkt_wap_groups_account;

-- Remove account_id column
ALTER TABLE mkt_wap_groups 
  DROP COLUMN IF EXISTS account_id;

-- Update comment
COMMENT ON TABLE mkt_wap_groups IS 'WhatsApp groups - global records, one per WhatsApp group. Account relationships stored in mkt_wap_group_accounts';

-- =====================================================
-- SECTION 3: UPDATE VIEWS
-- =====================================================

-- Drop and recreate view with new table name
DROP VIEW IF EXISTS v_mkt_wap_groups_with_access;

CREATE OR REPLACE VIEW v_mkt_wap_groups_with_access AS
SELECT 
  g.id,
  g.group_id AS whatsapp_group_id,
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
  g.is_favorite,
  g.is_admin_only_group,
  g.internal_description,
  g.discovered_at,
  g.created_at,
  g.updated_at,
  -- Account access fields
  gaa.account_id,
  gaa.is_account_admin,
  gaa.is_account_super_admin,
  gaa.can_add_contacts,
  gaa.can_post_messages,
  gaa.can_edit_group_info,
  gaa.is_admin_only_group AS account_is_admin_only_group,
  gaa.discovered_at AS account_discovered_at,
  gaa.last_accessed_at
FROM mkt_wap_groups g
LEFT JOIN mkt_wap_group_accounts gaa ON g.id = gaa.group_id;

COMMENT ON VIEW v_mkt_wap_groups_with_access IS 'Groups with account access information - joins groups with account mappings';

-- =====================================================
-- SECTION 4: UPDATE HELPER FUNCTION
-- =====================================================

-- Drop existing function first (if it exists) to allow return type changes
DROP FUNCTION IF EXISTS get_account_groups(UUID, BOOLEAN);

-- Recreate function with new table name and updated return type
CREATE FUNCTION get_account_groups(account_uuid UUID, include_hidden BOOLEAN DEFAULT false)
RETURNS TABLE (
  group_id UUID,
  whatsapp_group_id TEXT,
  name TEXT,
  description TEXT,
  member_count INTEGER,
  is_active BOOLEAN,
  region TEXT,
  state TEXT,
  district TEXT,
  segment_tags TEXT[],
  profile_pic_url TEXT,
  is_hidden BOOLEAN,
  is_favorite BOOLEAN,
  is_admin_only_group BOOLEAN,
  internal_description TEXT,
  discovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  account_id UUID,
  is_account_admin BOOLEAN,
  is_account_super_admin BOOLEAN,
  can_add_contacts BOOLEAN,
  can_post_messages BOOLEAN,
  can_edit_group_info BOOLEAN
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
    g.region,
    g.state,
    g.district,
    g.segment_tags,
    g.profile_pic_url,
    g.is_hidden,
    g.is_favorite,
    g.is_admin_only_group,
    g.internal_description,
    g.discovered_at,
    g.created_at,
    g.updated_at,
    gaa.account_id,
    gaa.is_account_admin,
    gaa.is_account_super_admin,
    gaa.can_add_contacts,
    gaa.can_post_messages,
    gaa.can_edit_group_info
  FROM mkt_wap_groups g
  JOIN mkt_wap_group_accounts gaa ON g.id = gaa.group_id
  WHERE gaa.account_id = account_uuid
    AND (include_hidden = true OR g.is_hidden = false)
  ORDER BY g.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 5: VERIFICATION
-- =====================================================

-- Verify table rename
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'mkt_wap_group_accounts'
  ) THEN
    RAISE EXCEPTION 'Table mkt_wap_group_accounts does not exist after migration';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mkt_wap_groups' 
      AND column_name = 'account_id'
  ) THEN
    RAISE EXCEPTION 'Column account_id still exists in mkt_wap_groups after migration';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully';
END $$;

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================

-- ✅ Renamed mkt_wap_group_account_access to mkt_wap_group_accounts
-- ✅ Removed account_id column from mkt_wap_groups
-- ✅ Migrated existing account_id relationships to mkt_wap_group_accounts
-- ✅ Updated all indexes, triggers, and views
-- ✅ Groups are now global (one record per WhatsApp group)
-- ✅ Account relationships stored in mkt_wap_group_accounts

