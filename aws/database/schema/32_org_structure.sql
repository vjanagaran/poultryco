-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 32_org_structure.sql
-- Description: Organization committees, resources, announcements
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 31_org_membership.sql
-- =====================================================

-- =====================================================
-- SECTION 1: COMMITTEES
-- =====================================================

CREATE TABLE IF NOT EXISTS org_committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
  
  -- Committee details
  name TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_committees_organization ON org_committees(organization_id);
CREATE INDEX idx_org_committees_active ON org_committees(is_active) WHERE is_active = true;

CREATE TRIGGER update_org_committees_updated_at
  BEFORE UPDATE ON org_committees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: COMMITTEE MEMBERS
-- =====================================================

CREATE TABLE IF NOT EXISTS org_committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES org_committees(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES org_members(id) ON DELETE CASCADE,
  
  -- Role
  role TEXT NOT NULL,
  is_chair BOOLEAN NOT NULL DEFAULT false,
  
  -- Tenure
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(committee_id, member_id)
);

CREATE INDEX idx_org_committee_members_committee ON org_committee_members(committee_id);
CREATE INDEX idx_org_committee_members_member ON org_committee_members(member_id);
CREATE INDEX idx_org_committee_members_chair ON org_committee_members(committee_id, is_chair) WHERE is_chair = true;

CREATE TRIGGER update_org_committee_members_updated_at
  BEFORE UPDATE ON org_committee_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: RESOURCES
-- =====================================================

CREATE TABLE IF NOT EXISTS org_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
  
  -- Resource details
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('document', 'guideline', 'report', 'publication', 'form', 'other')),
  
  -- File
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  
  -- Access
  access_level TEXT NOT NULL DEFAULT 'members' CHECK (access_level IN ('public', 'members', 'leadership')),
  
  -- Metadata
  tags TEXT[],
  category TEXT,
  
  -- Stats
  download_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_resources_organization ON org_resources(organization_id);
CREATE INDEX idx_org_resources_type ON org_resources(resource_type);
CREATE INDEX idx_org_resources_access ON org_resources(access_level);
CREATE INDEX idx_org_resources_downloads ON org_resources(download_count DESC);

CREATE TRIGGER update_org_resources_updated_at
  BEFORE UPDATE ON org_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: ANNOUNCEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS org_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
  
  -- Announcement details
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT CHECK (announcement_type IN ('general', 'event', 'policy', 'urgent')),
  
  -- Targeting
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'members', 'leadership')),
  
  -- Priority
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER DEFAULT 0,
  
  -- Publishing
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Author
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Stats
  views_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_announcements_organization ON org_announcements(organization_id);
CREATE INDEX idx_org_announcements_type ON org_announcements(announcement_type);
CREATE INDEX idx_org_announcements_published ON org_announcements(published_at DESC);
CREATE INDEX idx_org_announcements_pinned ON org_announcements(organization_id, is_pinned) WHERE is_pinned = true;

CREATE TRIGGER update_org_announcements_updated_at
  BEFORE UPDATE ON org_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE org_committees IS 'Organization committees';
COMMENT ON TABLE org_committee_members IS 'Committee membership';
COMMENT ON TABLE org_resources IS 'Organization resources and documents';
COMMENT ON TABLE org_announcements IS 'Organization announcements';

