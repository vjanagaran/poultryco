-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 120_job_core.sql
-- Description: Jobs and opportunities system
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql, 20_biz_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: JOB POSTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Employer (polymorphic: business or organization)
  employer_type TEXT NOT NULL CHECK (employer_type IN ('business', 'organization')),
  employer_id UUID NOT NULL,
  
  -- Posted by
  posted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Job details
  title TEXT NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) <= 5000),
  
  -- Category
  category_id UUID REFERENCES ref_job_categories(id),
  
  -- Type
  job_type TEXT NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'temporary')),
  
  -- Location
  location_type TEXT NOT NULL CHECK (location_type IN ('on_site', 'remote', 'hybrid')),
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'India',
  
  -- Compensation
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  salary_currency TEXT DEFAULT 'INR',
  salary_period TEXT CHECK (salary_period IN ('hourly', 'daily', 'monthly', 'yearly')),
  
  -- Requirements
  experience_min_years INTEGER,
  experience_max_years INTEGER,
  education_level TEXT,
  skills_required TEXT[],
  
  -- Application
  application_deadline TIMESTAMPTZ,
  application_email TEXT,
  application_url TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'filled')),
  published_at TIMESTAMPTZ,
  
  -- Stats (denormalized)
  views_count INTEGER NOT NULL DEFAULT 0,
  applications_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_postings_employer ON job_postings(employer_type, employer_id);
CREATE INDEX idx_job_postings_posted_by ON job_postings(posted_by);
CREATE INDEX idx_job_postings_category ON job_postings(category_id);
CREATE INDEX idx_job_postings_type ON job_postings(job_type);
CREATE INDEX idx_job_postings_location ON job_postings(location_type, location_state, location_city);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_published ON job_postings(published_at DESC) WHERE status = 'published';

-- Full-text search
CREATE INDEX idx_job_postings_search ON job_postings USING gin(
  to_tsvector('english',
    title || ' ' ||
    description
  )
);

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: JOB APPLICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Application
  cover_letter TEXT CHECK (char_length(cover_letter) <= 2000),
  resume_url TEXT,
  
  -- Custom fields
  application_data JSONB,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn')),
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(job_id, applicant_id)
);

CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_applicant ON job_applications(applicant_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_submitted ON job_applications(job_id, status) WHERE status = 'submitted';

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: JOB BOOKMARKS
-- =====================================================

CREATE TABLE IF NOT EXISTS job_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(job_id, profile_id)
);

CREATE INDEX idx_job_bookmarks_job ON job_bookmarks(job_id);
CREATE INDEX idx_job_bookmarks_profile ON job_bookmarks(profile_id, created_at DESC);

-- =====================================================
-- SECTION 4: HELPER FUNCTIONS
-- =====================================================

-- Update job applications count
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE job_postings SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE job_postings SET applications_count = GREATEST(applications_count - 1, 0) WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_job_applications_count
  AFTER INSERT OR DELETE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_applications_count();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE job_postings IS 'Job postings';
COMMENT ON TABLE job_applications IS 'Job applications';
COMMENT ON TABLE job_bookmarks IS 'Bookmarked jobs';

