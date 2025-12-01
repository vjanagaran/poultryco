-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 20_biz_core.sql
-- Description: Business profiles and core information
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: BUSINESS PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS biz_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Owner
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Basic Information
  business_name TEXT NOT NULL,
  display_name TEXT,
  business_slug TEXT UNIQUE NOT NULL,
  business_type_id UUID REFERENCES ref_business_types(id),
  
  -- Branding
  logo_url TEXT,
  cover_photo_url TEXT,
  tagline TEXT CHECK (char_length(tagline) <= 200),
  about TEXT CHECK (char_length(about) <= 2000),
  
  -- Business Details
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  founded_year INTEGER CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  website_url TEXT,
  
  -- Verification
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  
  -- Statistics (denormalized)
  followers_count INTEGER NOT NULL DEFAULT 0,
  products_count INTEGER NOT NULL DEFAULT 0,
  team_members_count INTEGER NOT NULL DEFAULT 0,
  
  -- Visibility
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biz_profiles_owner ON biz_profiles(owner_id);
CREATE INDEX idx_biz_profiles_slug ON biz_profiles(business_slug);
CREATE INDEX idx_biz_profiles_type ON biz_profiles(business_type_id);
CREATE INDEX idx_biz_profiles_verified ON biz_profiles(is_verified) WHERE is_verified = true;
CREATE INDEX idx_biz_profiles_active ON biz_profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_biz_profiles_followers ON biz_profiles(followers_count DESC);

-- Full-text search
CREATE INDEX idx_biz_profiles_search ON biz_profiles USING gin(
  to_tsvector('english',
    business_name || ' ' ||
    COALESCE(display_name, '') || ' ' ||
    COALESCE(tagline, '') || ' ' ||
    COALESCE(about, '')
  )
);

CREATE TRIGGER update_biz_profiles_updated_at
  BEFORE UPDATE ON biz_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: BUSINESS CONTACT INFORMATION
-- =====================================================

CREATE TABLE IF NOT EXISTS biz_contact_info (
  business_id UUID PRIMARY KEY REFERENCES biz_profiles(id) ON DELETE CASCADE,
  
  -- Primary Contact
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  
  -- Business Hours
  business_hours JSONB, -- {monday: {open: '09:00', close: '18:00'}, ...}
  
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

CREATE INDEX idx_biz_contact_info_location ON biz_contact_info(state, city);

CREATE TRIGGER update_biz_contact_info_updated_at
  BEFORE UPDATE ON biz_contact_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: BUSINESS LOCATIONS (Multiple locations)
-- =====================================================

CREATE TABLE IF NOT EXISTS biz_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES biz_profiles(id) ON DELETE CASCADE,
  
  -- Location Details
  location_name TEXT NOT NULL,
  location_type TEXT CHECK (location_type IN ('headquarters', 'branch', 'warehouse', 'factory', 'office')),
  
  -- Address
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  
  -- Coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
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

CREATE INDEX idx_biz_locations_business ON biz_locations(business_id);
CREATE INDEX idx_biz_locations_primary ON biz_locations(business_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_biz_locations_location ON biz_locations(state, city);
CREATE INDEX idx_biz_locations_coordinates ON biz_locations(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE TRIGGER update_biz_locations_updated_at
  BEFORE UPDATE ON biz_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: SERVICE AREAS
-- =====================================================

CREATE TABLE IF NOT EXISTS biz_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES biz_profiles(id) ON DELETE CASCADE,
  
  -- Service Area
  country TEXT NOT NULL DEFAULT 'India',
  state TEXT,
  district TEXT,
  city TEXT,
  
  -- Delivery
  delivery_available BOOLEAN NOT NULL DEFAULT false,
  delivery_time_days INTEGER,
  minimum_order_value DECIMAL(10, 2),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biz_service_areas_business ON biz_service_areas(business_id);
CREATE INDEX idx_biz_service_areas_location ON biz_service_areas(country, state, district);

-- =====================================================
-- SECTION 5: BUSINESS STATISTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS biz_stats (
  business_id UUID PRIMARY KEY REFERENCES biz_profiles(id) ON DELETE CASCADE,
  
  -- Followers
  followers_count INTEGER NOT NULL DEFAULT 0,
  
  -- Content
  products_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  
  -- Team
  team_members_count INTEGER NOT NULL DEFAULT 0,
  
  -- Engagement
  profile_views_count INTEGER NOT NULL DEFAULT 0,
  inquiries_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biz_stats_followers ON biz_stats(followers_count DESC);
CREATE INDEX idx_biz_stats_products ON biz_stats(products_count DESC);

-- =====================================================
-- SECTION 6: HELPER FUNCTIONS
-- =====================================================

-- Create default contact info
CREATE OR REPLACE FUNCTION create_default_biz_contact_info()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO biz_contact_info (business_id)
  VALUES (NEW.id)
  ON CONFLICT (business_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_biz_contact_info
  AFTER INSERT ON biz_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_biz_contact_info();

-- Create default stats
CREATE OR REPLACE FUNCTION create_default_biz_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO biz_stats (business_id)
  VALUES (NEW.id)
  ON CONFLICT (business_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_biz_stats
  AFTER INSERT ON biz_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_biz_stats();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE biz_profiles IS 'Business profiles';
COMMENT ON TABLE biz_contact_info IS 'Business contact information';
COMMENT ON TABLE biz_locations IS 'Business physical locations';
COMMENT ON TABLE biz_service_areas IS 'Business service/delivery areas';
COMMENT ON TABLE biz_stats IS 'Business statistics';

