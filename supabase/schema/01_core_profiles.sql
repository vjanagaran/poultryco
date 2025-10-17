-- =====================================================
-- PoultryCo Database Schema
-- File: 01_core_profiles.sql
-- Description: Core profile tables (Personal, Business, Organization)
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: PERSONAL PROFILES
-- =====================================================

-- Main personal profile table (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  full_name TEXT NOT NULL,
  profile_slug TEXT UNIQUE NOT NULL,
  profile_photo_url TEXT,
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

-- Full-text search index
CREATE INDEX idx_profiles_search ON profiles USING gin(
  to_tsvector('english', 
    full_name || ' ' || 
    COALESCE(headline, '') || ' ' || 
    COALESCE(bio, '') || ' ' ||
    COALESCE(location_city, '')
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique profile slug
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
  
  -- Limit to 60 characters
  base_slug := substring(base_slug, 1, 60);
  
  final_slug := base_slug;
  
  -- Check uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM profiles WHERE profile_slug = final_slug AND id != p_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 2: BUSINESS PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  business_name TEXT NOT NULL,
  business_slug TEXT UNIQUE NOT NULL,
  display_name TEXT,
  logo_url TEXT,
  cover_photo_url TEXT,
  tagline TEXT CHECK (char_length(tagline) <= 150),
  about TEXT CHECK (char_length(about) <= 500),
  
  -- Business Classification
  business_type TEXT NOT NULL CHECK (business_type IN (
    'farm', 'feed_mill', 'hatchery', 'processing_plant', 
    'medicine_company', 'equipment_supplier', 'chick_supplier', 
    'service_provider', 'laboratory', 'logistics', 
    'retail', 'distributor', 'integrator', 'other'
  )),
  industry_category TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  founded_year INTEGER CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  
  -- Online Presence
  website_url TEXT,
  
  -- Ownership
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Verification
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for business_profiles
CREATE INDEX idx_business_profiles_slug ON business_profiles(business_slug);
CREATE INDEX idx_business_profiles_owner ON business_profiles(owner_id);
CREATE INDEX idx_business_profiles_type ON business_profiles(business_type);
CREATE INDEX idx_business_profiles_verified ON business_profiles(is_verified);

-- Full-text search index
CREATE INDEX idx_business_profiles_search ON business_profiles USING gin(
  to_tsvector('english', 
    business_name || ' ' || 
    COALESCE(display_name, '') || ' ' ||
    COALESCE(about, '')
  )
);

-- Trigger for business_profiles
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique business slug
CREATE OR REPLACE FUNCTION generate_business_slug(p_business_name TEXT, p_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(p_business_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  base_slug := substring(base_slug, 1, 60);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM business_profiles WHERE business_slug = final_slug AND id != p_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Business contact information
CREATE TABLE IF NOT EXISTS business_profiles_contact (
  business_profile_id UUID PRIMARY KEY REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Headquarters
  headquarters_address TEXT,
  headquarters_state TEXT,
  headquarters_city TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  
  -- Contact
  phone TEXT,
  email TEXT,
  whatsapp_business TEXT,
  
  -- Legal (Private - only visible to owner/admins)
  registration_number TEXT,
  tax_id TEXT,
  pan_number TEXT,
  fssai_license TEXT,
  trade_license TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for business_profiles_contact
CREATE TRIGGER update_business_profiles_contact_updated_at
  BEFORE UPDATE ON business_profiles_contact
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: ORGANIZATION PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  organization_name TEXT NOT NULL,
  organization_slug TEXT UNIQUE NOT NULL,
  short_name TEXT,
  logo_url TEXT,
  cover_photo_url TEXT,
  tagline TEXT CHECK (char_length(tagline) <= 150),
  about TEXT NOT NULL CHECK (char_length(about) <= 1000),
  
  -- Classification
  organization_type TEXT NOT NULL CHECK (organization_type IN (
    'association', 'federation', 'council', 'forum', 
    'society', 'institution', 'cooperative', 
    'chamber', 'network', 'community'
  )),
  industry_focus TEXT[],
  geographic_scope TEXT NOT NULL CHECK (geographic_scope IN (
    'local', 'state', 'regional', 'national', 'international', 'global'
  )),
  
  -- Details
  founded_year INTEGER CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  registration_number TEXT,
  website_url TEXT,
  
  -- Management
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Verification
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for organizations
CREATE INDEX idx_organizations_slug ON organizations(organization_slug);
CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_organizations_scope ON organizations(geographic_scope);
CREATE INDEX idx_organizations_creator ON organizations(creator_id);
CREATE INDEX idx_organizations_verified ON organizations(is_verified);

-- Full-text search index
CREATE INDEX idx_organizations_search ON organizations USING gin(
  to_tsvector('english', 
    organization_name || ' ' || 
    COALESCE(short_name, '') || ' ' ||
    about
  )
);

-- Trigger for organizations
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique organization slug
CREATE OR REPLACE FUNCTION generate_organization_slug(p_org_name TEXT, p_short_name TEXT, p_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Prefer short name if available
  IF p_short_name IS NOT NULL AND p_short_name != '' THEN
    base_slug := lower(p_short_name);
  ELSE
    base_slug := lower(regexp_replace(p_org_name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  base_slug := substring(base_slug, 1, 60);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM organizations WHERE organization_slug = final_slug AND id != p_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Organization contact information
CREATE TABLE IF NOT EXISTS organizations_contact (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Headquarters
  headquarters_address TEXT,
  headquarters_state TEXT,
  headquarters_city TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  
  -- Contact
  phone TEXT,
  email TEXT,
  whatsapp_number TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for organizations_contact
CREATE TRIGGER update_organizations_contact_updated_at
  BEFORE UPDATE ON organizations_contact
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profiles IS 'Personal profiles for individual users (1:1 with auth.users)';
COMMENT ON TABLE business_profiles IS 'Commercial business entities (farms, suppliers, etc.)';
COMMENT ON TABLE organizations IS 'Member-based organizations (associations, federations, councils)';

COMMENT ON COLUMN profiles.profile_slug IS 'Unique URL-friendly identifier for SEO';
COMMENT ON COLUMN profiles.verification_level IS 'Trust level: basic (phone+email), verified (+ID), trusted (+credentials)';
COMMENT ON COLUMN profiles.profile_strength IS 'Percentage of profile completion (0-100)';

COMMENT ON COLUMN business_profiles.business_slug IS 'Unique URL-friendly identifier for SEO';
COMMENT ON COLUMN organizations.organization_slug IS 'Unique URL-friendly identifier for SEO';

-- =====================================================
-- END OF FILE
-- =====================================================

