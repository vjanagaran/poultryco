-- =====================================================
-- PoultryCo Database Schema
-- File: 04_business_details.sql
-- Description: Business locations, team, contacts, farm/supplier details
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: BUSINESS LOCATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Type
  location_type TEXT NOT NULL CHECK (location_type IN (
    'headquarters', 'branch', 'warehouse', 'farm', 
    'factory', 'office', 'retail', 'distribution_center'
  )),
  
  -- Address
  location_name TEXT,
  address TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  city TEXT,
  pincode TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  
  -- Contact
  phone TEXT,
  email TEXT,
  
  -- Coordinates (for map display)
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
CREATE INDEX idx_business_locations_business ON business_locations(business_profile_id);
CREATE INDEX idx_business_locations_type ON business_locations(location_type);
CREATE INDEX idx_business_locations_state ON business_locations(state);
CREATE INDEX idx_business_locations_primary ON business_locations(is_primary);
CREATE INDEX idx_business_locations_coords ON business_locations(latitude, longitude);

-- Trigger
CREATE TRIGGER update_business_locations_updated_at
  BEFORE UPDATE ON business_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: SERVICE AREAS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Geography
  coverage_type TEXT NOT NULL CHECK (coverage_type IN ('state', 'district', 'city', 'pincode', 'national')),
  state TEXT,
  district TEXT,
  city TEXT,
  pincode TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique coverage area per business
  UNIQUE(business_profile_id, coverage_type, state, district, city, pincode)
);

-- Indexes
CREATE INDEX idx_service_areas_business ON business_service_areas(business_profile_id);
CREATE INDEX idx_service_areas_type ON business_service_areas(coverage_type);
CREATE INDEX idx_service_areas_state ON business_service_areas(state);

-- =====================================================
-- SECTION 3: TEAM MEMBERS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Role
  role_title TEXT NOT NULL,
  department TEXT,
  
  -- Employment
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'advisor')),
  join_date DATE,
  
  -- Permissions
  is_admin BOOLEAN NOT NULL DEFAULT false,
  can_post_updates BOOLEAN NOT NULL DEFAULT false,
  can_manage_products BOOLEAN NOT NULL DEFAULT false,
  can_manage_jobs BOOLEAN NOT NULL DEFAULT false,
  can_view_analytics BOOLEAN NOT NULL DEFAULT false,
  
  -- Display
  show_on_page BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One profile per business
  UNIQUE(business_profile_id, profile_id)
);

-- Indexes
CREATE INDEX idx_team_members_business ON business_team_members(business_profile_id);
CREATE INDEX idx_team_members_profile ON business_team_members(profile_id);
CREATE INDEX idx_team_members_admin ON business_team_members(is_admin);
CREATE INDEX idx_team_members_display ON business_team_members(show_on_page, sort_order);

-- Trigger
CREATE TRIGGER update_business_team_members_updated_at
  BEFORE UPDATE ON business_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: BUSINESS CONTACT PERSONS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_contact_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Contact Type
  contact_type TEXT NOT NULL CHECK (contact_type IN (
    'sales', 'technical', 'admin', 'customer_service', 'orders', 'hr', 'support'
  )),
  
  -- Details
  designation TEXT,
  department TEXT,
  
  -- Primary Contact
  is_primary BOOLEAN NOT NULL DEFAULT false,
  
  -- Contact Info
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  
  -- Availability
  available_hours TEXT,
  languages TEXT[] DEFAULT '{}',
  
  -- Display
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contact person must be team member
  CONSTRAINT contact_must_be_team_member 
    FOREIGN KEY (business_profile_id, profile_id) 
    REFERENCES business_team_members(business_profile_id, profile_id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_contact_persons_business ON business_contact_persons(business_profile_id);
CREATE INDEX idx_contact_persons_profile ON business_contact_persons(profile_id);
CREATE INDEX idx_contact_persons_type ON business_contact_persons(contact_type);
CREATE INDEX idx_contact_persons_primary ON business_contact_persons(is_primary);

-- Trigger
CREATE TRIGGER update_business_contact_persons_updated_at
  BEFORE UPDATE ON business_contact_persons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: FARM-SPECIFIC DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_farm_details (
  business_profile_id UUID PRIMARY KEY REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Classification
  farm_type TEXT[] NOT NULL DEFAULT '{}' CHECK (
    farm_type <@ ARRAY['broiler', 'layer', 'breeder', 'hatchery', 'integrated', 'organic', 'free_range']
  ),
  
  -- Capacity
  total_capacity INTEGER CHECK (total_capacity >= 0),
  number_of_sheds INTEGER CHECK (number_of_sheds >= 0),
  
  -- Operations
  farming_system TEXT CHECK (farming_system IN (
    'conventional', 'organic', 'free_range', 'cage_free', 'deep_litter', 'battery_cage', 'semi_intensive'
  )),
  
  -- Production
  avg_birds_per_batch INTEGER CHECK (avg_birds_per_batch >= 0),
  batches_per_year INTEGER CHECK (batches_per_year >= 0 AND batches_per_year <= 12),
  
  -- Breeds
  breeds_raised TEXT[] DEFAULT '{}',
  
  -- Certifications
  organic_certified BOOLEAN DEFAULT false,
  halal_certified BOOLEAN DEFAULT false,
  animal_welfare_certified BOOLEAN DEFAULT false,
  fssai_certified BOOLEAN DEFAULT false,
  
  -- Infrastructure
  has_biosecurity_system BOOLEAN DEFAULT false,
  has_climate_control BOOLEAN DEFAULT false,
  has_automated_feeding BOOLEAN DEFAULT false,
  has_waste_management BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_farm_details_type ON business_farm_details USING gin(farm_type);
CREATE INDEX idx_farm_details_capacity ON business_farm_details(total_capacity);

-- Trigger
CREATE TRIGGER update_business_farm_details_updated_at
  BEFORE UPDATE ON business_farm_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 6: SUPPLIER-SPECIFIC DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_supplier_details (
  business_profile_id UUID PRIMARY KEY REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Supply Type
  supply_categories TEXT[] NOT NULL DEFAULT '{}' CHECK (
    supply_categories <@ ARRAY[
      'feed', 'medicine', 'vaccines', 'equipment', 'chicks', 'supplements',
      'disinfectants', 'packaging', 'spare_parts', 'lab_supplies', 'other'
    ]
  ),
  
  -- Brands
  authorized_brands TEXT[] DEFAULT '{}',
  own_brands TEXT[] DEFAULT '{}',
  
  -- Service
  minimum_order_value DECIMAL(10, 2),
  minimum_order_quantity TEXT,
  bulk_discount_available BOOLEAN DEFAULT false,
  
  -- Delivery
  home_delivery_available BOOLEAN DEFAULT false,
  delivery_time_days INTEGER,
  delivery_charges_info TEXT,
  free_delivery_above_amount DECIMAL(10, 2),
  
  -- Payment
  payment_terms TEXT[] DEFAULT '{}',
  credit_period_days INTEGER,
  
  -- Support
  technical_support_available BOOLEAN DEFAULT false,
  after_sales_service BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_supplier_details_categories ON business_supplier_details USING gin(supply_categories);
CREATE INDEX idx_supplier_details_delivery ON business_supplier_details(home_delivery_available);

-- Trigger
CREATE TRIGGER update_business_supplier_details_updated_at
  BEFORE UPDATE ON business_supplier_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 7: BUSINESS CERTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Certificate
  certification_name TEXT NOT NULL,
  certification_type TEXT CHECK (certification_type IN (
    'quality', 'safety', 'organic', 'halal', 'environmental', 
    'biosecurity', 'iso', 'gmp', 'haccp', 'fssai', 'other'
  )),
  issuing_authority TEXT NOT NULL,
  
  -- Validity
  issue_date DATE NOT NULL,
  expiry_date DATE,
  does_not_expire BOOLEAN NOT NULL DEFAULT false,
  
  -- Verification
  certificate_number TEXT,
  certificate_file_url TEXT,
  
  -- Display
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_business_certifications_business ON business_certifications(business_profile_id);
CREATE INDEX idx_business_certifications_type ON business_certifications(certification_type);
CREATE INDEX idx_business_certifications_expiry ON business_certifications(expiry_date);

-- Trigger
CREATE TRIGGER update_business_certifications_updated_at
  BEFORE UPDATE ON business_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE business_locations IS 'Multiple locations for businesses (HQ, branches, warehouses, etc.)';
COMMENT ON TABLE business_service_areas IS 'Geographic coverage for business services';
COMMENT ON TABLE business_team_members IS 'Team members with roles and permissions';
COMMENT ON TABLE business_contact_persons IS 'Multiple contact persons for different inquiries (all must be verified PoultryCo users)';
COMMENT ON TABLE business_farm_details IS 'Farm-specific operational details';
COMMENT ON TABLE business_supplier_details IS 'Supplier/dealer business terms and services';
COMMENT ON TABLE business_certifications IS 'Business certifications with expiry tracking';

COMMENT ON COLUMN business_contact_persons.profile_id IS 'Contact person MUST be a PoultryCo user and team member';

-- =====================================================
-- END OF FILE
-- =====================================================

