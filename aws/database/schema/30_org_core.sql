-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 30_org_core.sql
-- Description: Organization profiles and core information
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: ORGANIZATION PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS org_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Owner/Admin
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Basic Information
  organization_name TEXT NOT NULL,
  display_name TEXT,
  organization_slug TEXT UNIQUE NOT NULL,
  organization_type_id UUID REFERENCES ref_organization_types(id),
  
  -- Branding
  logo_url TEXT,
  cover_photo_url TEXT,
  tagline TEXT CHECK (char_length(tagline) <= 200),
  mission TEXT CHECK (char_length(mission) <= 1000),
  vision TEXT CHECK (char_length(vision) <= 1000),
  about TEXT CHECK (char_length(about) <= 2000),
  
  -- Details
  founded_year INTEGER CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  website_url TEXT,
  
  -- Statistics (denormalized)
  members_count INTEGER NOT NULL DEFAULT 0,
  followers_count INTEGER NOT NULL DEFAULT 0,
  events_count INTEGER NOT NULL DEFAULT 0,
  
  -- Verification
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- Visibility
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_profiles_created_by ON org_profiles(created_by);
CREATE INDEX idx_org_profiles_slug ON org_profiles(organization_slug);
CREATE INDEX idx_org_profiles_type ON org_profiles(organization_type_id);
CREATE INDEX idx_org_profiles_verified ON org_profiles(is_verified) WHERE is_verified = true;
CREATE INDEX idx_org_profiles_active ON org_profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_org_profiles_members ON org_profiles(members_count DESC);

-- Full-text search
CREATE INDEX idx_org_profiles_search ON org_profiles USING gin(
  to_tsvector('english',
    organization_name || ' ' ||
    COALESCE(display_name, '') || ' ' ||
    COALESCE(tagline, '') || ' ' ||
    COALESCE(about, '')
  )
);

CREATE TRIGGER update_org_profiles_updated_at
  BEFORE UPDATE ON org_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: ORGANIZATION CONTACT INFORMATION
-- =====================================================

CREATE TABLE IF NOT EXISTS org_contact_info (
  organization_id UUID PRIMARY KEY REFERENCES org_profiles(id) ON DELETE CASCADE,
  
  -- Primary Contact
  email TEXT,
  phone TEXT,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  
  -- Social Media
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_contact_info_location ON org_contact_info(state, city);

CREATE TRIGGER update_org_contact_info_updated_at
  BEFORE UPDATE ON org_contact_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: ORGANIZATION OFFICES
-- =====================================================

CREATE TABLE IF NOT EXISTS org_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
  
  -- Office Details
  office_name TEXT NOT NULL,
  office_type TEXT CHECK (office_type IN ('headquarters', 'regional', 'branch', 'chapter')),
  
  -- Address
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  
  -- Contact
  phone TEXT,
  email TEXT,
  
  -- Status
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_offices_organization ON org_offices(organization_id);
CREATE INDEX idx_org_offices_primary ON org_offices(organization_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_org_offices_location ON org_offices(state, city);

CREATE TRIGGER update_org_offices_updated_at
  BEFORE UPDATE ON org_offices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: ORGANIZATION LEADERSHIP
-- =====================================================

CREATE TABLE IF NOT EXISTS org_leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Position
  position TEXT NOT NULL,
  position_level INTEGER DEFAULT 0, -- 0 = highest (President), 1 = VP, etc.
  
  -- Tenure
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  
  -- Responsibilities
  responsibilities TEXT[],
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_leadership_organization ON org_leadership(organization_id, display_order);
CREATE INDEX idx_org_leadership_profile ON org_leadership(profile_id);
CREATE INDEX idx_org_leadership_current ON org_leadership(organization_id, is_current) WHERE is_current = true;

CREATE TRIGGER update_org_leadership_updated_at
  BEFORE UPDATE ON org_leadership
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: ORGANIZATION STATISTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS org_stats (
  organization_id UUID PRIMARY KEY REFERENCES org_profiles(id) ON DELETE CASCADE,
  
  -- Members
  members_count INTEGER NOT NULL DEFAULT 0,
  individual_members_count INTEGER NOT NULL DEFAULT 0,
  business_members_count INTEGER NOT NULL DEFAULT 0,
  
  -- Followers
  followers_count INTEGER NOT NULL DEFAULT 0,
  
  -- Content
  events_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  resources_count INTEGER NOT NULL DEFAULT 0,
  
  -- Engagement
  profile_views_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_stats_members ON org_stats(members_count DESC);
CREATE INDEX idx_org_stats_events ON org_stats(events_count DESC);

-- =====================================================
-- SECTION 6: HELPER FUNCTIONS
-- =====================================================

-- Create default contact info
CREATE OR REPLACE FUNCTION create_default_org_contact_info()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO org_contact_info (organization_id)
  VALUES (NEW.id)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_org_contact_info
  AFTER INSERT ON org_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_org_contact_info();

-- Create default stats
CREATE OR REPLACE FUNCTION create_default_org_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO org_stats (organization_id)
  VALUES (NEW.id)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_org_stats
  AFTER INSERT ON org_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_org_stats();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE org_profiles IS 'Organization profiles (associations, cooperatives, etc.)';
COMMENT ON TABLE org_contact_info IS 'Organization contact information';
COMMENT ON TABLE org_offices IS 'Organization physical offices';
COMMENT ON TABLE org_leadership IS 'Organization leadership team';
COMMENT ON TABLE org_stats IS 'Organization statistics';

