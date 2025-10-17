-- =====================================================
-- PoultryCo Database Schema
-- File: 03_professional_info.sql
-- Description: Experience, Education, Certifications, Skills
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: WORK EXPERIENCE
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Position
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN (
    'full_time', 'part_time', 'self_employed', 'contract', 'internship', 'seasonal'
  )),
  
  -- Location
  location TEXT,
  
  -- Duration
  is_current BOOLEAN NOT NULL DEFAULT false,
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Description
  description TEXT CHECK (char_length(description) <= 300),
  key_achievements TEXT[] DEFAULT '{}',
  
  -- Display
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validation: end_date must be after start_date
  CONSTRAINT valid_date_range CHECK (
    (is_current = true AND end_date IS NULL) OR
    (is_current = false AND end_date IS NOT NULL AND end_date >= start_date)
  )
);

-- Indexes
CREATE INDEX idx_experience_profile ON profile_experience(profile_id);
CREATE INDEX idx_experience_current ON profile_experience(is_current);
CREATE INDEX idx_experience_sort ON profile_experience(profile_id, sort_order);
CREATE INDEX idx_experience_dates ON profile_experience(start_date DESC, end_date DESC);

-- Trigger
CREATE TRIGGER update_profile_experience_updated_at
  BEFORE UPDATE ON profile_experience
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: EDUCATION
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Institution
  institution_name TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  
  -- Duration
  start_year INTEGER CHECK (start_year >= 1950 AND start_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 10),
  end_year INTEGER CHECK (end_year >= 1950 AND end_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 10),
  is_ongoing BOOLEAN NOT NULL DEFAULT false,
  
  -- Details
  grade TEXT,
  activities TEXT,
  description TEXT CHECK (char_length(description) <= 300),
  
  -- Display
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_year_range CHECK (
    (is_ongoing = true) OR
    (is_ongoing = false AND end_year >= start_year)
  )
);

-- Indexes
CREATE INDEX idx_education_profile ON profile_education(profile_id);
CREATE INDEX idx_education_sort ON profile_education(profile_id, sort_order);
CREATE INDEX idx_education_years ON profile_education(end_year DESC, start_year DESC);

-- Trigger
CREATE TRIGGER update_profile_education_updated_at
  BEFORE UPDATE ON profile_education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: CERTIFICATIONS & LICENSES
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Certificate
  certification_name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  does_not_expire BOOLEAN NOT NULL DEFAULT false,
  
  -- Verification
  credential_id TEXT,
  credential_url TEXT,
  
  -- File
  certificate_file_url TEXT,
  
  -- Display
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_expiry CHECK (
    (does_not_expire = true AND expiry_date IS NULL) OR
    (does_not_expire = false AND expiry_date IS NOT NULL AND expiry_date >= issue_date)
  )
);

-- Indexes
CREATE INDEX idx_certifications_profile ON profile_certifications(profile_id);
CREATE INDEX idx_certifications_sort ON profile_certifications(profile_id, sort_order);
CREATE INDEX idx_certifications_expiry ON profile_certifications(expiry_date);

-- Trigger
CREATE TRIGGER update_profile_certifications_updated_at
  BEFORE UPDATE ON profile_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: SKILLS SYSTEM
-- =====================================================

-- Global skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Skill
  skill_name TEXT UNIQUE NOT NULL,
  skill_category TEXT CHECK (skill_category IN (
    'technical', 'management', 'operational', 'analytical', 
    'communication', 'safety', 'compliance', 'software', 'other'
  )),
  
  -- Description
  description TEXT,
  
  -- Related Skills (for suggestions)
  related_skills TEXT[] DEFAULT '{}',
  skill_synonyms TEXT[] DEFAULT '{}',
  
  -- Metrics
  usage_count INTEGER NOT NULL DEFAULT 0,
  
  -- Moderation
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_skills_name ON skills(skill_name);
CREATE INDEX idx_skills_category ON skills(skill_category);
CREATE INDEX idx_skills_usage ON skills(usage_count DESC);
CREATE INDEX idx_skills_approved ON skills(is_approved);
CREATE INDEX idx_skills_synonyms ON skills USING gin(skill_synonyms);

-- Full-text search on skills
CREATE INDEX idx_skills_search ON skills USING gin(
  to_tsvector('english', skill_name || ' ' || COALESCE(description, ''))
);

-- Trigger
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User skills (junction table)
CREATE TABLE IF NOT EXISTS profile_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  
  -- Proficiency
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience INTEGER CHECK (years_of_experience >= 0),
  
  -- Display
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One skill per profile
  UNIQUE(profile_id, skill_id)
);

-- Indexes
CREATE INDEX idx_profile_skills_profile ON profile_skills(profile_id);
CREATE INDEX idx_profile_skills_skill ON profile_skills(skill_id);
CREATE INDEX idx_profile_skills_sort ON profile_skills(profile_id, sort_order);

-- Skill endorsements
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_skill_id UUID NOT NULL REFERENCES profile_skills(id) ON DELETE CASCADE,
  endorsed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Optional message
  endorsement_message TEXT CHECK (char_length(endorsement_message) <= 200),
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One endorsement per skill per endorser
  UNIQUE(profile_skill_id, endorsed_by)
);

-- Indexes
CREATE INDEX idx_skill_endorsements_profile_skill ON skill_endorsements(profile_skill_id);
CREATE INDEX idx_skill_endorsements_endorser ON skill_endorsements(endorsed_by);
CREATE INDEX idx_skill_endorsements_created ON skill_endorsements(created_at DESC);

-- Function to increment skill usage count
CREATE OR REPLACE FUNCTION increment_skill_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE skills
  SET usage_count = usage_count + 1
  WHERE id = NEW.skill_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment usage when skill is added to profile
CREATE TRIGGER increment_skill_usage_on_add
  AFTER INSERT ON profile_skills
  FOR EACH ROW
  EXECUTE FUNCTION increment_skill_usage();

-- Function to find or create skill (prevents duplicates)
CREATE OR REPLACE FUNCTION find_or_create_skill(
  p_skill_name TEXT,
  p_category TEXT DEFAULT 'other',
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_skill_id UUID;
  normalized_name TEXT;
BEGIN
  -- Normalize skill name (lowercase, trim)
  normalized_name := lower(trim(p_skill_name));
  
  -- Try to find existing skill
  SELECT id INTO v_skill_id
  FROM skills
  WHERE lower(skill_name) = normalized_name
     OR normalized_name = ANY(skill_synonyms);
  
  -- If not found, create new skill
  IF v_skill_id IS NULL THEN
    INSERT INTO skills (skill_name, skill_category, created_by, is_approved)
    VALUES (p_skill_name, p_category, p_created_by, CASE WHEN p_created_by IS NOT NULL THEN false ELSE true END)
    RETURNING id INTO v_skill_id;
  END IF;
  
  RETURN v_skill_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profile_experience IS 'Work experience with achievements array for measurable results';
COMMENT ON COLUMN profile_experience.key_achievements IS 'Array of measurable achievements (e.g., "Reduced FCR from 1.8 to 1.65")';

COMMENT ON TABLE profile_education IS 'Educational qualifications';
COMMENT ON TABLE profile_certifications IS 'Professional certifications and licenses with expiry tracking';

COMMENT ON TABLE skills IS 'Global skills catalog with synonyms and related skills for auto-suggest';
COMMENT ON COLUMN skills.skill_synonyms IS 'Alternate names for the skill (used for auto-merging)';
COMMENT ON COLUMN skills.related_skills IS 'Related skills for suggestions';
COMMENT ON COLUMN skills.usage_count IS 'Number of users with this skill (popularity metric)';

COMMENT ON TABLE profile_skills IS 'User skills junction table';
COMMENT ON TABLE skill_endorsements IS 'Skill endorsements from connections (LinkedIn-style)';

-- =====================================================
-- END OF FILE
-- =====================================================

