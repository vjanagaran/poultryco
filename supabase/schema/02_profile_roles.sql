-- =====================================================
-- PoultryCo Database Schema
-- File: 02_profile_roles.sql
-- Description: Multi-role system and role-specific details
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: MULTI-ROLE SYSTEM
-- =====================================================

-- Profile roles (multi-role support)
CREATE TABLE IF NOT EXISTS profile_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Role
  role_type TEXT NOT NULL CHECK (role_type IN (
    'farmer', 'veterinarian', 'supplier', 'consultant', 
    'researcher', 'trader', 'transporter', 'processor', 
    'feed_miller', 'hatchery_operator', 'equipment_dealer', 
    'lab_technician', 'farm_manager', 'quality_controller', 
    'nutritionist', 'breeder', 'educator', 'student', 'other'
  )),
  
  -- Management
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique role per profile
  UNIQUE(profile_id, role_type)
);

-- Indexes
CREATE INDEX idx_profile_roles_profile ON profile_roles(profile_id);
CREATE INDEX idx_profile_roles_type ON profile_roles(role_type);
CREATE INDEX idx_profile_roles_active ON profile_roles(is_active);
CREATE INDEX idx_profile_roles_sort ON profile_roles(profile_id, sort_order);

-- Trigger
CREATE TRIGGER update_profile_roles_updated_at
  BEFORE UPDATE ON profile_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: FARMER DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_farmer_details (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Experience
  years_of_experience INTEGER CHECK (years_of_experience >= 0),
  
  -- Specialization
  farm_specialization TEXT[] NOT NULL DEFAULT '{}' CHECK (
    farm_specialization <@ ARRAY['broiler', 'layer', 'breeder', 'hatchery', 'backyard', 'organic']
  ),
  
  -- Scale
  farm_scale TEXT CHECK (farm_scale IN ('small', 'medium', 'large', 'commercial')),
  
  -- Practices
  farming_type TEXT[] DEFAULT '{}' CHECK (
    farming_type <@ ARRAY['conventional', 'organic', 'free_range', 'cage_free', 'deep_litter', 'battery_cage']
  ),
  
  -- Breeds
  primary_breeds TEXT[] DEFAULT '{}',
  
  -- Certifications
  certifications TEXT[] DEFAULT '{}',
  
  -- Production Metrics
  avg_batch_size INTEGER CHECK (avg_batch_size >= 0),
  batches_per_year INTEGER CHECK (batches_per_year >= 0 AND batches_per_year <= 12),
  own_hatchery BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_farmer_specialization ON profile_farmer_details USING gin(farm_specialization);
CREATE INDEX idx_farmer_scale ON profile_farmer_details(farm_scale);

-- Trigger
CREATE TRIGGER update_profile_farmer_details_updated_at
  BEFORE UPDATE ON profile_farmer_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: VETERINARIAN DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_veterinarian_details (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- License
  license_number TEXT,
  license_issuing_authority TEXT,
  license_state TEXT,
  license_expiry_date DATE,
  
  -- Specialization
  specialization TEXT[] NOT NULL DEFAULT '{}' CHECK (
    specialization <@ ARRAY[
      'poultry_medicine', 'nutrition', 'pathology', 'surgery', 
      'reproduction', 'epidemiology', 'diagnostics', 'preventive_care', 
      'disease_management', 'vaccination', 'biosecurity', 'public_health'
    ]
  ),
  
  -- Experience
  years_of_practice INTEGER CHECK (years_of_practice >= 0),
  
  -- Service Details
  consultation_mode TEXT[] DEFAULT '{}' CHECK (
    consultation_mode <@ ARRAY['on_farm', 'clinic', 'phone', 'video_call', 'emergency']
  ),
  typical_fees_range TEXT,
  farms_served_count INTEGER CHECK (farms_served_count >= 0),
  
  -- Practice
  practice_type TEXT CHECK (practice_type IN ('government', 'private', 'ngo', 'corporate', 'independent')),
  service_areas TEXT[] DEFAULT '{}',
  emergency_available BOOLEAN DEFAULT false,
  emergency_phone TEXT,
  backup_vet_id UUID REFERENCES profiles(id),
  available_hours TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vet_license ON profile_veterinarian_details(license_number);
CREATE INDEX idx_vet_specialization ON profile_veterinarian_details USING gin(specialization);
CREATE INDEX idx_vet_service_areas ON profile_veterinarian_details USING gin(service_areas);
CREATE INDEX idx_vet_emergency ON profile_veterinarian_details(emergency_available);

-- Trigger
CREATE TRIGGER update_profile_veterinarian_details_updated_at
  BEFORE UPDATE ON profile_veterinarian_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: SUPPLIER DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_supplier_details (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Type
  supplier_type TEXT[] NOT NULL DEFAULT '{}' CHECK (
    supplier_type <@ ARRAY[
      'feed', 'medicine', 'equipment', 'chicks', 'supplements', 
      'vaccines', 'disinfectants', 'packaging', 'spare_parts', 'other'
    ]
  ),
  
  -- Experience
  years_in_business INTEGER CHECK (years_in_business >= 0),
  
  -- Service
  service_coverage TEXT[] DEFAULT '{}',
  brands_dealt TEXT[] DEFAULT '{}',
  
  -- Terms
  minimum_order_info TEXT,
  payment_terms_offered TEXT[] DEFAULT '{}' CHECK (
    payment_terms_offered <@ ARRAY['cash', 'credit_7_days', 'credit_15_days', 'credit_30_days', 'credit_45_days', 'advance']
  ),
  
  -- Delivery
  delivery_available BOOLEAN DEFAULT false,
  delivery_time_typical TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_supplier_type ON profile_supplier_details USING gin(supplier_type);
CREATE INDEX idx_supplier_coverage ON profile_supplier_details USING gin(service_coverage);
CREATE INDEX idx_supplier_delivery ON profile_supplier_details(delivery_available);

-- Trigger
CREATE TRIGGER update_profile_supplier_details_updated_at
  BEFORE UPDATE ON profile_supplier_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: CONSULTANT DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_consultant_details (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Expertise
  expertise_areas TEXT[] NOT NULL DEFAULT '{}' CHECK (
    expertise_areas <@ ARRAY[
      'farm_management', 'nutrition', 'disease_control', 'biosecurity',
      'production_optimization', 'quality_assurance', 'financial_planning',
      'business_strategy', 'project_setup', 'technical_training', 'other'
    ]
  ),
  
  -- Experience
  years_of_experience INTEGER CHECK (years_of_experience >= 0),
  
  -- Engagement
  engagement_type TEXT[] DEFAULT '{}' CHECK (
    engagement_type <@ ARRAY['full_time', 'part_time', 'project_based', 'hourly', 'retainer']
  ),
  typical_fee_structure TEXT,
  
  -- Service
  service_mode TEXT[] DEFAULT '{}' CHECK (
    service_mode <@ ARRAY['on_site', 'remote', 'hybrid']
  ),
  geographic_coverage TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_consultant_expertise ON profile_consultant_details USING gin(expertise_areas);
CREATE INDEX idx_consultant_coverage ON profile_consultant_details USING gin(geographic_coverage);

-- Trigger
CREATE TRIGGER update_profile_consultant_details_updated_at
  BEFORE UPDATE ON profile_consultant_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 6: RESEARCHER DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_researcher_details (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Research Focus
  research_areas TEXT[] NOT NULL DEFAULT '{}' CHECK (
    research_areas <@ ARRAY[
      'genetics', 'nutrition', 'disease', 'welfare', 'environment',
      'production_systems', 'product_quality', 'food_safety', 'economics', 'other'
    ]
  ),
  
  -- Academic
  current_institution TEXT,
  department TEXT,
  position TEXT,
  
  -- Metrics
  years_in_research INTEGER CHECK (years_in_research >= 0),
  publications_count INTEGER DEFAULT 0 CHECK (publications_count >= 0),
  
  -- Collaboration
  open_to_collaboration BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_researcher_areas ON profile_researcher_details USING gin(research_areas);
CREATE INDEX idx_researcher_institution ON profile_researcher_details(current_institution);

-- Trigger
CREATE TRIGGER update_profile_researcher_details_updated_at
  BEFORE UPDATE ON profile_researcher_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profile_roles IS 'Multi-role system - users can have unlimited roles with custom sorting';
COMMENT ON COLUMN profile_roles.is_active IS 'Role can be toggled on/off - inactive roles hide details but retain data';
COMMENT ON COLUMN profile_roles.sort_order IS 'User-defined display order (0 = first)';

COMMENT ON TABLE profile_farmer_details IS 'Farmer-specific operational details';
COMMENT ON TABLE profile_veterinarian_details IS 'Veterinarian credentials and practice information';
COMMENT ON TABLE profile_supplier_details IS 'Supplier/dealer business details';
COMMENT ON TABLE profile_consultant_details IS 'Consultant expertise and engagement terms';
COMMENT ON TABLE profile_researcher_details IS 'Academic/research profile information';

-- =====================================================
-- END OF FILE
-- =====================================================

