-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 01_core_and_ref.sql
-- Description: Core profiles and reference data tables
-- Version: 2.0
-- Date: 2025-12-01
-- =====================================================

-- =====================================================
-- SECTION 1: CORE PROFILES TABLE
-- =====================================================

-- Main personal profile table (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  full_name TEXT NOT NULL,
  profile_slug TEXT UNIQUE NOT NULL,
  profile_photo_url TEXT,
  cover_photo_url TEXT,
  headline TEXT CHECK (char_length(headline) <= 150),
  bio TEXT CHECK (char_length(bio) <= 500),
  
  -- Location
  location_state TEXT NOT NULL,
  location_district TEXT,
  location_city TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  
  -- Contact (from auth)
  phone TEXT NOT NULL,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  email TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  whatsapp_number TEXT,
  
  -- Profile Metrics
  profile_strength INTEGER NOT NULL DEFAULT 0 CHECK (profile_strength >= 0 AND profile_strength <= 100),
  verification_level TEXT NOT NULL DEFAULT 'basic' CHECK (verification_level IN ('basic', 'verified', 'trusted')),
  
  -- Visibility
  is_public BOOLEAN NOT NULL DEFAULT true,
  
  -- Activity Tracking
  last_active_at TIMESTAMPTZ,
  last_profile_update_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX idx_profiles_slug ON profiles(profile_slug);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_location ON profiles(location_state, location_district);
CREATE INDEX idx_profiles_verification_level ON profiles(verification_level);
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at DESC);
CREATE INDEX idx_profiles_public ON profiles(is_public) WHERE is_public = true;

-- Full-text search index
CREATE INDEX idx_profiles_search ON profiles USING gin(
  to_tsvector('english', 
    full_name || ' ' || 
    COALESCE(headline, '') || ' ' || 
    COALESCE(bio, '') || ' ' ||
    COALESCE(location_city, '')
  )
);

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: REFERENCE DATA TABLES
-- =====================================================

-- Countries
CREATE TABLE IF NOT EXISTS ref_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2
  phone_code TEXT,
  currency TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ref_countries_code ON ref_countries(code);
CREATE INDEX idx_ref_countries_active ON ref_countries(is_active) WHERE is_active = true;

-- States/Provinces
CREATE TABLE IF NOT EXISTS ref_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES ref_countries(id),
  name TEXT NOT NULL,
  code TEXT, -- State code
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(country_id, name)
);

CREATE INDEX idx_ref_states_country ON ref_states(country_id);
CREATE INDEX idx_ref_states_active ON ref_states(is_active) WHERE is_active = true;

-- Business Types
CREATE TABLE IF NOT EXISTS ref_business_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT, -- 'production', 'supply', 'service'
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ref_business_types_slug ON ref_business_types(slug);
CREATE INDEX idx_ref_business_types_category ON ref_business_types(category);
CREATE INDEX idx_ref_business_types_active ON ref_business_types(is_active) WHERE is_active = true;

CREATE TRIGGER update_ref_business_types_updated_at
  BEFORE UPDATE ON ref_business_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Organization Types
CREATE TABLE IF NOT EXISTS ref_organization_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ref_organization_types_slug ON ref_organization_types(slug);
CREATE INDEX idx_ref_organization_types_active ON ref_organization_types(is_active) WHERE is_active = true;

CREATE TRIGGER update_ref_organization_types_updated_at
  BEFORE UPDATE ON ref_organization_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Event Types
CREATE TABLE IF NOT EXISTS ref_event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ref_event_types_slug ON ref_event_types(slug);
CREATE INDEX idx_ref_event_types_active ON ref_event_types(is_active) WHERE is_active = true;

CREATE TRIGGER update_ref_event_types_updated_at
  BEFORE UPDATE ON ref_event_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Job Categories
CREATE TABLE IF NOT EXISTS ref_job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES ref_job_categories(id),
  level INTEGER DEFAULT 0,
  path TEXT, -- 'poultry/production/farm-manager'
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ref_job_categories_slug ON ref_job_categories(slug);
CREATE INDEX idx_ref_job_categories_parent ON ref_job_categories(parent_id);
CREATE INDEX idx_ref_job_categories_path ON ref_job_categories(path);
CREATE INDEX idx_ref_job_categories_active ON ref_job_categories(is_active) WHERE is_active = true;

CREATE TRIGGER update_ref_job_categories_updated_at
  BEFORE UPDATE ON ref_job_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Skills
CREATE TABLE IF NOT EXISTS ref_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT, -- 'technical', 'management', 'soft'
  synonyms TEXT[], -- Alternative names
  related_skills UUID[], -- Array of skill IDs
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ref_skills_slug ON ref_skills(slug);
CREATE INDEX idx_ref_skills_category ON ref_skills(category);
CREATE INDEX idx_ref_skills_usage ON ref_skills(usage_count DESC);
CREATE INDEX idx_ref_skills_active ON ref_skills(is_active) WHERE is_active = true;
CREATE INDEX idx_ref_skills_synonyms ON ref_skills USING gin(synonyms);

CREATE TRIGGER update_ref_skills_updated_at
  BEFORE UPDATE ON ref_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Notification Types
CREATE TABLE IF NOT EXISTS ref_notification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  priority INTEGER DEFAULT 3, -- 1 = high, 5 = low
  template TEXT, -- '{actor} liked your post'
  action_url_pattern TEXT, -- '/posts/{resource_id}'
  is_real_time BOOLEAN DEFAULT true,
  is_email BOOLEAN DEFAULT false,
  is_push BOOLEAN DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ref_notification_types_slug ON ref_notification_types(slug);
CREATE INDEX idx_ref_notification_types_priority ON ref_notification_types(priority);
CREATE INDEX idx_ref_notification_types_active ON ref_notification_types(is_active) WHERE is_active = true;

CREATE TRIGGER update_ref_notification_types_updated_at
  BEFORE UPDATE ON ref_notification_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: SLUG GENERATION FUNCTIONS
-- =====================================================

-- Generate unique profile slug
CREATE OR REPLACE FUNCTION generate_profile_slug(p_full_name TEXT, p_location_city TEXT, p_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug: lowercase, replace spaces with hyphens
  base_slug := lower(regexp_replace(
    p_full_name || '-' || COALESCE(p_location_city, ''),
    '[^a-zA-Z0-9]+', '-', 'g'
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  
  -- Limit length
  base_slug := substring(base_slug, 1, 60);
  
  final_slug := base_slug;
  
  -- Check uniqueness and add counter if needed
  WHILE EXISTS (
    SELECT 1 FROM profiles 
    WHERE profile_slug = final_slug AND id != p_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate unique business slug
CREATE OR REPLACE FUNCTION generate_business_slug(p_business_name TEXT, p_location_city TEXT, p_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(
    p_business_name || '-' || COALESCE(p_location_city, ''),
    '[^a-zA-Z0-9]+', '-', 'g'
  ));
  
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  base_slug := substring(base_slug, 1, 60);
  
  final_slug := base_slug;
  
  WHILE EXISTS (
    SELECT 1 FROM biz_profiles 
    WHERE business_slug = final_slug AND id != p_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate unique organization slug
CREATE OR REPLACE FUNCTION generate_organization_slug(p_org_name TEXT, p_location_city TEXT, p_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(
    p_org_name || '-' || COALESCE(p_location_city, ''),
    '[^a-zA-Z0-9]+', '-', 'g'
  ));
  
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  base_slug := substring(base_slug, 1, 60);
  
  final_slug := base_slug;
  
  WHILE EXISTS (
    SELECT 1 FROM org_profiles 
    WHERE organization_slug = final_slug AND id != p_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE profiles IS 'Core personal profiles (1:1 with auth.users)';
COMMENT ON TABLE ref_countries IS 'Reference: Countries';
COMMENT ON TABLE ref_states IS 'Reference: States/Provinces';
COMMENT ON TABLE ref_business_types IS 'Reference: Business types with categories';
COMMENT ON TABLE ref_organization_types IS 'Reference: Organization types';
COMMENT ON TABLE ref_event_types IS 'Reference: Event types';
COMMENT ON TABLE ref_job_categories IS 'Reference: Hierarchical job categories';
COMMENT ON TABLE ref_skills IS 'Reference: Skills with synonyms and relationships';
COMMENT ON TABLE ref_notification_types IS 'Reference: Notification types with templates';

