-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 21_biz_details.sql
-- Description: Business team, products, certifications
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 20_biz_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: TEAM MEMBERS
-- =====================================================

CREATE TABLE IF NOT EXISTS biz_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES biz_profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Role
  role TEXT NOT NULL,
  department TEXT,
  
  -- Permissions
  is_admin BOOLEAN NOT NULL DEFAULT false,
  permissions JSONB, -- {can_edit_profile: true, can_manage_products: true, ...}
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(business_id, profile_id)
);

CREATE INDEX idx_biz_team_members_business ON biz_team_members(business_id);
CREATE INDEX idx_biz_team_members_profile ON biz_team_members(profile_id);
CREATE INDEX idx_biz_team_members_active ON biz_team_members(is_active) WHERE is_active = true;

CREATE TRIGGER update_biz_team_members_updated_at
  BEFORE UPDATE ON biz_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: CONTACT PERSONS
-- =====================================================

CREATE TABLE IF NOT EXISTS biz_contact_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES biz_profiles(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES biz_team_members(id) ON DELETE SET NULL,
  
  -- Contact details
  name TEXT NOT NULL,
  designation TEXT,
  department TEXT,
  
  -- Contact info
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  
  -- Status
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biz_contact_persons_business ON biz_contact_persons(business_id);
CREATE INDEX idx_biz_contact_persons_primary ON biz_contact_persons(business_id, is_primary) WHERE is_primary = true;

CREATE TRIGGER update_biz_contact_persons_updated_at
  BEFORE UPDATE ON biz_contact_persons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: BUSINESS CERTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS biz_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES biz_profiles(id) ON DELETE CASCADE,
  
  -- Certification details
  name TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  certificate_number TEXT,
  
  -- Dates
  issue_date DATE NOT NULL,
  expiry_date DATE,
  does_not_expire BOOLEAN NOT NULL DEFAULT false,
  
  -- Document
  document_url TEXT,
  
  -- Verification
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biz_certifications_business ON biz_certifications(business_id);
CREATE INDEX idx_biz_certifications_verified ON biz_certifications(is_verified) WHERE is_verified = true;
CREATE INDEX idx_biz_certifications_expiry ON biz_certifications(expiry_date) WHERE does_not_expire = false;

CREATE TRIGGER update_biz_certifications_updated_at
  BEFORE UPDATE ON biz_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: FARM DETAILS (For farm businesses)
-- =====================================================

CREATE TABLE IF NOT EXISTS biz_farm_details (
  business_id UUID PRIMARY KEY REFERENCES biz_profiles(id) ON DELETE CASCADE,
  
  -- Farm information
  farm_type TEXT CHECK (farm_type IN ('broiler', 'layer', 'breeder', 'mixed')),
  total_capacity INTEGER,
  number_of_sheds INTEGER,
  farm_size_acres DECIMAL(10, 2),
  
  -- Production
  average_monthly_production INTEGER,
  farming_since DATE,
  
  -- Specialization
  breeds_raised TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_biz_farm_details_updated_at
  BEFORE UPDATE ON biz_farm_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: SUPPLIER DETAILS (For supplier businesses)
-- =====================================================

CREATE TABLE IF NOT EXISTS biz_supplier_details (
  business_id UUID PRIMARY KEY REFERENCES biz_profiles(id) ON DELETE CASCADE,
  
  -- Supplier information
  supplier_type TEXT CHECK (supplier_type IN ('feed', 'equipment', 'medication', 'chicks', 'other')),
  
  -- Products/Services
  product_categories TEXT[],
  brands_supplied TEXT[],
  
  -- Service information
  minimum_order_value DECIMAL(10, 2),
  delivery_time_days INTEGER,
  
  -- Business details
  gst_number TEXT,
  pan_number TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_biz_supplier_details_updated_at
  BEFORE UPDATE ON biz_supplier_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE biz_team_members IS 'Business team members with roles and permissions';
COMMENT ON TABLE biz_contact_persons IS 'Business contact persons for inquiries';
COMMENT ON TABLE biz_certifications IS 'Business certifications and licenses';
COMMENT ON TABLE biz_farm_details IS 'Farm-specific business details';
COMMENT ON TABLE biz_supplier_details IS 'Supplier-specific business details';

