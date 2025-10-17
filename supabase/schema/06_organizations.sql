-- =====================================================
-- PoultryCo Database Schema
-- File: 06_organizations.sql
-- Description: Organization details, offices, leadership, committees
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: ORGANIZATION OFFICES
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Type
  office_type TEXT NOT NULL CHECK (office_type IN (
    'headquarters', 'regional', 'state', 'district', 'branch'
  )),
  
  -- Address
  office_name TEXT,
  address TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  city TEXT,
  pincode TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  
  -- Contact
  phone TEXT,
  email TEXT,
  
  -- Coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Display
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_org_offices_org ON organization_offices(organization_id);
CREATE INDEX idx_org_offices_type ON organization_offices(office_type);
CREATE INDEX idx_org_offices_state ON organization_offices(state);
CREATE INDEX idx_org_offices_primary ON organization_offices(is_primary);

-- Trigger
CREATE TRIGGER update_organization_offices_updated_at
  BEFORE UPDATE ON organization_offices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: ORGANIZATION LEADERSHIP
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Position
  position_title TEXT NOT NULL,
  position_level TEXT CHECK (position_level IN (
    'president', 'vice_president', 'secretary', 'treasurer',
    'director', 'board_member', 'advisor', 'other'
  )),
  
  -- Term
  term_start_date DATE NOT NULL,
  term_end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  
  -- Display
  show_on_page BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_org_leadership_org ON organization_leadership(organization_id);
CREATE INDEX idx_org_leadership_profile ON organization_leadership(profile_id);
CREATE INDEX idx_org_leadership_current ON organization_leadership(is_current);
CREATE INDEX idx_org_leadership_level ON organization_leadership(position_level);

-- Trigger
CREATE TRIGGER update_organization_leadership_updated_at
  BEFORE UPDATE ON organization_leadership
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: MEMBERSHIP TIERS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Tier
  tier_name TEXT NOT NULL,
  tier_description TEXT,
  
  -- Fees
  annual_fee DECIMAL(10, 2),
  joining_fee DECIMAL(10, 2),
  
  -- Benefits
  benefits TEXT[],
  
  -- Limits
  max_members INTEGER,
  
  -- Display
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique tier name per organization
  UNIQUE(organization_id, tier_name)
);

-- Indexes
CREATE INDEX idx_membership_tiers_org ON organization_membership_tiers(organization_id);
CREATE INDEX idx_membership_tiers_active ON organization_membership_tiers(is_active);

-- Trigger
CREATE TRIGGER update_organization_membership_tiers_updated_at
  BEFORE UPDATE ON organization_membership_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: COMMITTEES
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Committee
  committee_name TEXT NOT NULL,
  committee_description TEXT,
  
  -- Purpose
  focus_areas TEXT[],
  
  -- Chairperson
  chairperson_id UUID REFERENCES profiles(id),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  formed_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_org_committees_org ON organization_committees(organization_id);
CREATE INDEX idx_org_committees_active ON organization_committees(is_active);
CREATE INDEX idx_org_committees_chair ON organization_committees(chairperson_id);

-- Trigger
CREATE TRIGGER update_organization_committees_updated_at
  BEFORE UPDATE ON organization_committees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Committee members
CREATE TABLE IF NOT EXISTS organization_committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES organization_committees(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Role
  member_role TEXT CHECK (member_role IN ('chairperson', 'co_chair', 'member', 'advisor')),
  
  -- Term
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One profile per committee
  UNIQUE(committee_id, profile_id)
);

-- Indexes
CREATE INDEX idx_committee_members_committee ON organization_committee_members(committee_id);
CREATE INDEX idx_committee_members_profile ON organization_committee_members(profile_id);

-- =====================================================
-- SECTION 5: ORGANIZATION RESOURCES
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Resource
  resource_title TEXT NOT NULL,
  resource_description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'document', 'video', 'link', 'guideline', 'report', 
    'newsletter', 'presentation', 'policy', 'other'
  )),
  
  -- File
  file_url TEXT,
  external_link TEXT,
  
  -- Access
  access_level TEXT NOT NULL CHECK (access_level IN ('public', 'members_only', 'leadership_only')),
  
  -- Tags
  tags TEXT[] DEFAULT '{}',
  
  -- Stats
  download_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_org_resources_org ON organization_resources(organization_id);
CREATE INDEX idx_org_resources_type ON organization_resources(resource_type);
CREATE INDEX idx_org_resources_access ON organization_resources(access_level);
CREATE INDEX idx_org_resources_published ON organization_resources(published_at DESC);
CREATE INDEX idx_org_resources_tags ON organization_resources USING gin(tags);

-- Trigger
CREATE TRIGGER update_organization_resources_updated_at
  BEFORE UPDATE ON organization_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 6: ORGANIZATION ANNOUNCEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Announcement
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Type
  announcement_type TEXT CHECK (announcement_type IN (
    'general', 'urgent', 'event', 'meeting', 'update', 'reminder'
  )),
  
  -- Target
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all_members', 'specific_tier', 'leadership')),
  target_tier_id UUID REFERENCES organization_membership_tiers(id),
  
  -- Notification
  send_email BOOLEAN NOT NULL DEFAULT false,
  send_push BOOLEAN NOT NULL DEFAULT false,
  
  -- Status
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- Stats
  view_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_org_announcements_org ON organization_announcements(organization_id);
CREATE INDEX idx_org_announcements_type ON organization_announcements(announcement_type);
CREATE INDEX idx_org_announcements_published ON organization_announcements(is_published, published_at DESC);
CREATE INDEX idx_org_announcements_creator ON organization_announcements(created_by);

-- Trigger
CREATE TRIGGER update_organization_announcements_updated_at
  BEFORE UPDATE ON organization_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE organization_offices IS 'Multiple office locations for organizations';
COMMENT ON TABLE organization_leadership IS 'Governance structure and leadership team';
COMMENT ON TABLE organization_membership_tiers IS 'Different membership levels with fees and benefits';
COMMENT ON TABLE organization_committees IS 'Specialized committees within organization';
COMMENT ON TABLE organization_committee_members IS 'Committee membership junction table';
COMMENT ON TABLE organization_resources IS 'Document library for members';
COMMENT ON TABLE organization_announcements IS 'Communication to members with targeting';

-- =====================================================
-- END OF FILE
-- =====================================================

