-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 12_usr_professional.sql
-- Description: Professional experience, education, certifications
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 10_usr_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: WORK EXPERIENCE
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Company/Organization
  company_name TEXT NOT NULL,
  company_type TEXT, -- 'farm', 'feed_mill', 'hatchery', 'supplier', etc.
  
  -- Position
  title TEXT NOT NULL,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'freelance', 'internship')),
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  
  -- Location
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'India',
  
  -- Description
  description TEXT CHECK (char_length(description) <= 2000),
  key_achievements TEXT[], -- Array of achievements
  
  -- Skills used
  skills_used TEXT[],
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_experiences_profile ON usr_experiences(profile_id, display_order);
CREATE INDEX idx_usr_experiences_current ON usr_experiences(profile_id, is_current) WHERE is_current = true;
CREATE INDEX idx_usr_experiences_company ON usr_experiences(company_name);
CREATE INDEX idx_usr_experiences_dates ON usr_experiences(start_date DESC, end_date DESC);

CREATE TRIGGER update_usr_experiences_updated_at
  BEFORE UPDATE ON usr_experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: EDUCATION
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Institution
  institution_name TEXT NOT NULL,
  institution_type TEXT CHECK (institution_type IN ('university', 'college', 'institute', 'school', 'online')),
  
  -- Degree
  degree TEXT NOT NULL, -- 'B.V.Sc', 'M.V.Sc', 'Ph.D', 'Diploma', etc.
  field_of_study TEXT,
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  
  -- Grade
  grade TEXT, -- 'First Class', 'CGPA 8.5', etc.
  
  -- Location
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'India',
  
  -- Description
  description TEXT CHECK (char_length(description) <= 1000),
  activities TEXT[], -- Extra-curricular activities
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_education_profile ON usr_education(profile_id, display_order);
CREATE INDEX idx_usr_education_current ON usr_education(profile_id, is_current) WHERE is_current = true;
CREATE INDEX idx_usr_education_institution ON usr_education(institution_name);
CREATE INDEX idx_usr_education_degree ON usr_education(degree);
CREATE INDEX idx_usr_education_dates ON usr_education(start_date DESC, end_date DESC);

CREATE TRIGGER update_usr_education_updated_at
  BEFORE UPDATE ON usr_education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: CERTIFICATIONS & LICENSES
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Certification details
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  
  -- Credential
  credential_id TEXT,
  credential_url TEXT,
  
  -- Dates
  issue_date DATE NOT NULL,
  expiry_date DATE,
  does_not_expire BOOLEAN NOT NULL DEFAULT false,
  
  -- Document
  document_url TEXT,
  
  -- Verification
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_certifications_profile ON usr_certifications(profile_id, display_order);
CREATE INDEX idx_usr_certifications_verified ON usr_certifications(is_verified) WHERE is_verified = true;
CREATE INDEX idx_usr_certifications_expiry ON usr_certifications(expiry_date) WHERE expiry_date IS NOT NULL AND does_not_expire = false;
CREATE INDEX idx_usr_certifications_issuer ON usr_certifications(issuing_organization);

CREATE TRIGGER update_usr_certifications_updated_at
  BEFORE UPDATE ON usr_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: PUBLICATIONS (For Researchers)
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Publication details
  title TEXT NOT NULL,
  publication_type TEXT CHECK (publication_type IN ('journal', 'conference', 'book', 'chapter', 'thesis', 'patent')),
  
  -- Publication info
  journal_name TEXT,
  publisher TEXT,
  publication_date DATE,
  
  -- Identifiers
  doi TEXT,
  isbn TEXT,
  url TEXT,
  
  -- Authors
  authors TEXT[], -- Array of author names
  is_primary_author BOOLEAN NOT NULL DEFAULT false,
  
  -- Description
  abstract TEXT CHECK (char_length(abstract) <= 2000),
  keywords TEXT[],
  
  -- Metrics
  citation_count INTEGER DEFAULT 0,
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_publications_profile ON usr_publications(profile_id, display_order);
CREATE INDEX idx_usr_publications_type ON usr_publications(publication_type);
CREATE INDEX idx_usr_publications_date ON usr_publications(publication_date DESC);
CREATE INDEX idx_usr_publications_primary ON usr_publications(profile_id, is_primary_author) WHERE is_primary_author = true;
CREATE INDEX idx_usr_publications_citations ON usr_publications(citation_count DESC);

CREATE TRIGGER update_usr_publications_updated_at
  BEFORE UPDATE ON usr_publications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: AWARDS & HONORS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Award details
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  
  -- Date
  issue_date DATE NOT NULL,
  
  -- Description
  description TEXT CHECK (char_length(description) <= 1000),
  
  -- Document
  document_url TEXT,
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_awards_profile ON usr_awards(profile_id, display_order);
CREATE INDEX idx_usr_awards_date ON usr_awards(issue_date DESC);

CREATE TRIGGER update_usr_awards_updated_at
  BEFORE UPDATE ON usr_awards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 6: LANGUAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Language
  language TEXT NOT NULL,
  
  -- Proficiency
  proficiency TEXT NOT NULL CHECK (proficiency IN ('elementary', 'limited_working', 'professional_working', 'full_professional', 'native')),
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(profile_id, language)
);

CREATE INDEX idx_usr_languages_profile ON usr_languages(profile_id, display_order);

-- =====================================================
-- SECTION 7: HELPER FUNCTIONS
-- =====================================================

-- Calculate total years of experience
CREATE OR REPLACE FUNCTION calculate_total_experience(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_months INTEGER;
BEGIN
  SELECT SUM(
    EXTRACT(YEAR FROM AGE(COALESCE(end_date, CURRENT_DATE), start_date)) * 12 +
    EXTRACT(MONTH FROM AGE(COALESCE(end_date, CURRENT_DATE), start_date))
  )::INTEGER
  INTO total_months
  FROM usr_experiences
  WHERE profile_id = p_profile_id;
  
  RETURN COALESCE(total_months / 12, 0);
END;
$$ LANGUAGE plpgsql;

-- Update profile completeness when professional info changes
CREATE OR REPLACE FUNCTION update_professional_completeness()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE usr_completeness_checks
  SET 
    has_experience = EXISTS (SELECT 1 FROM usr_experiences WHERE profile_id = NEW.profile_id),
    has_education = EXISTS (SELECT 1 FROM usr_education WHERE profile_id = NEW.profile_id),
    last_calculated_at = NOW()
  WHERE profile_id = NEW.profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_professional_completeness_experience
  AFTER INSERT OR DELETE ON usr_experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_completeness();

CREATE TRIGGER trg_update_professional_completeness_education
  AFTER INSERT OR DELETE ON usr_education
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_completeness();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE usr_experiences IS 'Work experience history';
COMMENT ON TABLE usr_education IS 'Educational background';
COMMENT ON TABLE usr_certifications IS 'Professional certifications and licenses';
COMMENT ON TABLE usr_publications IS 'Research publications (for researchers)';
COMMENT ON TABLE usr_awards IS 'Awards and honors received';
COMMENT ON TABLE usr_languages IS 'Languages spoken with proficiency levels';

