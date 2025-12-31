-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 73_mkt_persona.sql
-- Description: Marketing module - Persona Mapping (ICP Definition)
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 70_mkt_common.sql
-- =====================================================

-- =====================================================
-- SECTION 1: PERSONA CONTACTS
-- =====================================================

-- Persona Contacts (ICP Definition)
CREATE TABLE IF NOT EXISTS mkt_persona_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact Identity
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT,
  profile_pic_url TEXT,
  
  -- Persona Attributes (Segments + Regions + Other Attributes = ICP)
  primary_segment_id UUID REFERENCES mkt_segments(id),
  secondary_segments UUID[],
  
  -- Geographic Attributes
  region TEXT,
  state TEXT,
  district TEXT,
  city TEXT,
  
  -- Persona Type
  persona_type TEXT CHECK (persona_type IN ('farmer', 'veterinarian', 'fpo', 'association', 'nutritionist', 'student', 'feed_mill', 'hatchery', 'consultant', 'researcher', 'equipment_supplier', 'other')),
  
  -- Additional Attributes (JSONB for flexibility)
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Engagement Score
  engagement_score INTEGER NOT NULL DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  
  -- Metadata
  source TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_persona_contacts_phone ON mkt_persona_contacts(phone_number);
CREATE INDEX idx_mkt_persona_contacts_segment ON mkt_persona_contacts(primary_segment_id);
CREATE INDEX idx_mkt_persona_contacts_type ON mkt_persona_contacts(persona_type);
CREATE INDEX idx_mkt_persona_contacts_region ON mkt_persona_contacts(region, state);
CREATE INDEX idx_mkt_persona_contacts_engagement ON mkt_persona_contacts(engagement_score DESC);

-- Trigger
CREATE TRIGGER update_mkt_persona_contacts_updated_at
  BEFORE UPDATE ON mkt_persona_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_persona_contacts IS 'Persona mapping: Segments + Regions + Attributes = ICP (Ideal Customer Profile)';
COMMENT ON COLUMN mkt_persona_contacts.attributes IS 'Additional persona attributes stored as JSONB for flexibility';

-- =====================================================
-- SECTION 2: PERSONA SCORES (Confidence Scoring)
-- =====================================================

-- Persona Confidence Scores
CREATE TABLE IF NOT EXISTS mkt_persona_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  contact_id UUID NOT NULL REFERENCES mkt_persona_contacts(id) ON DELETE CASCADE,
  
  -- Confidence Calculation
  confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
  
  -- Calculation Details
  matching_groups_count INTEGER NOT NULL DEFAULT 0,
  total_groups_count INTEGER NOT NULL DEFAULT 0,
  calculation_method TEXT,
  calculation_metadata JSONB,
  
  -- Review Status
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Timestamps
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_persona_scores_contact ON mkt_persona_scores(contact_id);
CREATE INDEX idx_mkt_persona_scores_confidence ON mkt_persona_scores(confidence_score DESC);
CREATE INDEX idx_mkt_persona_scores_level ON mkt_persona_scores(confidence_level);
CREATE INDEX idx_mkt_persona_scores_approved ON mkt_persona_scores(is_approved) WHERE is_approved = true;

-- Trigger
CREATE TRIGGER update_mkt_persona_scores_updated_at
  BEFORE UPDATE ON mkt_persona_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_persona_scores IS 'Persona confidence scores for semi-automated campaign approval';
COMMENT ON COLUMN mkt_persona_scores.confidence_score IS 'Calculated confidence: (matching_groups / total_groups) × 100';

-- =====================================================
-- SECTION 3: PERSONA ATTRIBUTES (Extended Attributes)
-- =====================================================

-- Persona Attributes (Extended Attributes for ICP Definition)
CREATE TABLE IF NOT EXISTS mkt_persona_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  contact_id UUID NOT NULL REFERENCES mkt_persona_contacts(id) ON DELETE CASCADE,
  
  -- Attribute Type
  attribute_type TEXT NOT NULL,
  attribute_name TEXT NOT NULL,
  attribute_value TEXT,
  
  -- Source
  source TEXT,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_persona_attributes_contact ON mkt_persona_attributes(contact_id);
CREATE INDEX idx_mkt_persona_attributes_type ON mkt_persona_attributes(attribute_type);
CREATE INDEX idx_mkt_persona_attributes_name ON mkt_persona_attributes(attribute_name);

-- Trigger
CREATE TRIGGER update_mkt_persona_attributes_updated_at
  BEFORE UPDATE ON mkt_persona_attributes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_persona_attributes IS 'Extended persona attributes for detailed ICP definition';

