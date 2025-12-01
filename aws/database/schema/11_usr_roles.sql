-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 11_usr_roles.sql
-- Description: Role-specific detail tables
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 10_usr_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: FARMER DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_farmer_details (
  profile_role_id UUID PRIMARY KEY REFERENCES usr_profile_roles(id) ON DELETE CASCADE,
  
  -- Farm information
  farm_name TEXT,
  farm_size DECIMAL(10, 2), -- in acres/hectares
  farm_type TEXT CHECK (farm_type IN ('broiler', 'layer', 'breeder', 'mixed')),
  
  -- Capacity
  bird_capacity INTEGER,
  number_of_sheds INTEGER,
  
  -- Experience
  years_farming INTEGER,
  farming_since DATE,
  
  -- Specialization
  specializations TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_farmer_details_farm_type ON usr_farmer_details(farm_type);
CREATE INDEX idx_usr_farmer_details_capacity ON usr_farmer_details(bird_capacity DESC);

CREATE TRIGGER update_usr_farmer_details_updated_at
  BEFORE UPDATE ON usr_farmer_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: VETERINARIAN DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_veterinarian_details (
  profile_role_id UUID PRIMARY KEY REFERENCES usr_profile_roles(id) ON DELETE CASCADE,
  
  -- License information
  license_number TEXT,
  license_state TEXT,
  license_expiry DATE,
  
  -- Practice information
  practice_name TEXT,
  practice_type TEXT CHECK (practice_type IN ('clinic', 'field', 'hospital', 'consultant')),
  years_experience INTEGER,
  
  -- Specializations
  specializations TEXT[], -- 'poultry_diseases', 'nutrition', 'surgery', etc.
  
  -- Service areas
  service_radius INTEGER, -- in kilometers
  available_for_emergency BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_veterinarian_details_license ON usr_veterinarian_details(license_number);
CREATE INDEX idx_usr_veterinarian_details_practice_type ON usr_veterinarian_details(practice_type);
CREATE INDEX idx_usr_veterinarian_details_emergency ON usr_veterinarian_details(available_for_emergency) WHERE available_for_emergency = true;

CREATE TRIGGER update_usr_veterinarian_details_updated_at
  BEFORE UPDATE ON usr_veterinarian_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: SUPPLIER DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_supplier_details (
  profile_role_id UUID PRIMARY KEY REFERENCES usr_profile_roles(id) ON DELETE CASCADE,
  
  -- Supplier information
  supplier_type TEXT CHECK (supplier_type IN ('feed', 'equipment', 'medication', 'chicks', 'other')),
  company_name TEXT,
  
  -- Products/Services
  product_categories TEXT[],
  brands_supplied TEXT[],
  
  -- Service information
  delivery_available BOOLEAN DEFAULT false,
  service_areas TEXT[], -- States/districts
  minimum_order_value DECIMAL(10, 2),
  
  -- Business details
  years_in_business INTEGER,
  gst_number TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_supplier_details_type ON usr_supplier_details(supplier_type);
CREATE INDEX idx_usr_supplier_details_delivery ON usr_supplier_details(delivery_available) WHERE delivery_available = true;

CREATE TRIGGER update_usr_supplier_details_updated_at
  BEFORE UPDATE ON usr_supplier_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: CONSULTANT DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_consultant_details (
  profile_role_id UUID PRIMARY KEY REFERENCES usr_profile_roles(id) ON DELETE CASCADE,
  
  -- Consultant information
  consultant_type TEXT CHECK (consultant_type IN ('nutrition', 'management', 'technical', 'business', 'other')),
  years_experience INTEGER,
  
  -- Specializations
  specializations TEXT[],
  certifications TEXT[],
  
  -- Service information
  hourly_rate DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2),
  available_for_remote BOOLEAN DEFAULT true,
  available_for_onsite BOOLEAN DEFAULT true,
  
  -- Service areas
  service_areas TEXT[],
  languages_spoken TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_consultant_details_type ON usr_consultant_details(consultant_type);
CREATE INDEX idx_usr_consultant_details_remote ON usr_consultant_details(available_for_remote) WHERE available_for_remote = true;

CREATE TRIGGER update_usr_consultant_details_updated_at
  BEFORE UPDATE ON usr_consultant_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: RESEARCHER DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_researcher_details (
  profile_role_id UUID PRIMARY KEY REFERENCES usr_profile_roles(id) ON DELETE CASCADE,
  
  -- Research information
  research_institution TEXT,
  research_areas TEXT[],
  
  -- Academic information
  highest_degree TEXT,
  field_of_study TEXT,
  
  -- Publications
  publications_count INTEGER DEFAULT 0,
  h_index INTEGER,
  
  -- Research interests
  current_projects TEXT[],
  looking_for_collaboration BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_researcher_details_institution ON usr_researcher_details(research_institution);
CREATE INDEX idx_usr_researcher_details_collaboration ON usr_researcher_details(looking_for_collaboration) WHERE looking_for_collaboration = true;

CREATE TRIGGER update_usr_researcher_details_updated_at
  BEFORE UPDATE ON usr_researcher_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 6: NUTRITIONIST DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_nutritionist_details (
  profile_role_id UUID PRIMARY KEY REFERENCES usr_profile_roles(id) ON DELETE CASCADE,
  
  -- Professional information
  license_number TEXT,
  years_experience INTEGER,
  
  -- Specializations
  specializations TEXT[], -- 'broiler_nutrition', 'layer_nutrition', 'feed_formulation', etc.
  
  -- Services
  provides_feed_formulation BOOLEAN DEFAULT true,
  provides_consultation BOOLEAN DEFAULT true,
  provides_training BOOLEAN DEFAULT false,
  
  -- Service areas
  service_areas TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_nutritionist_details_license ON usr_nutritionist_details(license_number);
CREATE INDEX idx_usr_nutritionist_details_formulation ON usr_nutritionist_details(provides_feed_formulation) WHERE provides_feed_formulation = true;

CREATE TRIGGER update_usr_nutritionist_details_updated_at
  BEFORE UPDATE ON usr_nutritionist_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE usr_farmer_details IS 'Farmer-specific profile details';
COMMENT ON TABLE usr_veterinarian_details IS 'Veterinarian-specific profile details';
COMMENT ON TABLE usr_supplier_details IS 'Supplier-specific profile details';
COMMENT ON TABLE usr_consultant_details IS 'Consultant-specific profile details';
COMMENT ON TABLE usr_researcher_details IS 'Researcher-specific profile details';
COMMENT ON TABLE usr_nutritionist_details IS 'Nutritionist-specific profile details';

