-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 13_usr_skills.sql
-- Description: Skills and endorsements system
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql, 10_usr_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: PROFILE SKILLS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_profile_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES ref_skills(id) ON DELETE RESTRICT,
  
  -- Proficiency
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  
  -- Endorsements count (denormalized for performance)
  endorsements_count INTEGER NOT NULL DEFAULT 0,
  
  -- Display
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(profile_id, skill_id)
);

CREATE INDEX idx_usr_profile_skills_profile ON usr_profile_skills(profile_id, display_order);
CREATE INDEX idx_usr_profile_skills_skill ON usr_profile_skills(skill_id);
CREATE INDEX idx_usr_profile_skills_featured ON usr_profile_skills(profile_id, is_featured) WHERE is_featured = true;
CREATE INDEX idx_usr_profile_skills_endorsements ON usr_profile_skills(endorsements_count DESC);

CREATE TRIGGER update_usr_profile_skills_updated_at
  BEFORE UPDATE ON usr_profile_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: SKILL ENDORSEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_skill_id UUID NOT NULL REFERENCES usr_profile_skills(id) ON DELETE CASCADE,
  endorser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Endorsement details
  endorsement_text TEXT CHECK (char_length(endorsement_text) <= 500),
  
  -- Relationship context
  relationship TEXT CHECK (relationship IN ('colleague', 'manager', 'client', 'mentor', 'other')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(profile_skill_id, endorser_id)
);

CREATE INDEX idx_usr_skill_endorsements_profile_skill ON usr_skill_endorsements(profile_skill_id);
CREATE INDEX idx_usr_skill_endorsements_endorser ON usr_skill_endorsements(endorser_id);
CREATE INDEX idx_usr_skill_endorsements_created ON usr_skill_endorsements(created_at DESC);

-- =====================================================
-- SECTION 3: SKILL RECOMMENDATIONS (LinkedIn-style)
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_skill_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Recommendation
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  
  -- Relationship
  relationship TEXT NOT NULL CHECK (relationship IN ('colleague', 'manager', 'client', 'mentor', 'student', 'other')),
  position_at_time TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  
  -- Display
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  UNIQUE(profile_id, recommender_id)
);

CREATE INDEX idx_usr_skill_recommendations_profile ON usr_skill_recommendations(profile_id, display_order);
CREATE INDEX idx_usr_skill_recommendations_recommender ON usr_skill_recommendations(recommender_id);
CREATE INDEX idx_usr_skill_recommendations_status ON usr_skill_recommendations(status);
CREATE INDEX idx_usr_skill_recommendations_featured ON usr_skill_recommendations(profile_id, is_featured) WHERE is_featured = true;

CREATE TRIGGER update_usr_skill_recommendations_updated_at
  BEFORE UPDATE ON usr_skill_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: SKILL ASSESSMENTS (Future feature)
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_skill_id UUID NOT NULL REFERENCES usr_profile_skills(id) ON DELETE CASCADE,
  
  -- Assessment details
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'practical', 'project', 'certification')),
  assessment_provider TEXT,
  
  -- Score
  score INTEGER CHECK (score >= 0 AND score <= 100),
  percentile INTEGER CHECK (percentile >= 0 AND percentile <= 100),
  
  -- Badge/Certificate
  badge_url TEXT,
  certificate_url TEXT,
  
  -- Timestamps
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_usr_skill_assessments_profile_skill ON usr_skill_assessments(profile_skill_id);
CREATE INDEX idx_usr_skill_assessments_score ON usr_skill_assessments(score DESC);
CREATE INDEX idx_usr_skill_assessments_completed ON usr_skill_assessments(completed_at DESC);

-- =====================================================
-- SECTION 5: HELPER FUNCTIONS
-- =====================================================

-- Find or create skill
CREATE OR REPLACE FUNCTION find_or_create_skill(p_skill_name TEXT)
RETURNS UUID AS $$
DECLARE
  skill_id UUID;
  skill_slug TEXT;
BEGIN
  -- Try to find existing skill (case-insensitive)
  SELECT id INTO skill_id
  FROM ref_skills
  WHERE LOWER(name) = LOWER(p_skill_name)
  LIMIT 1;
  
  IF skill_id IS NOT NULL THEN
    -- Increment usage count
    UPDATE ref_skills
    SET usage_count = usage_count + 1
    WHERE id = skill_id;
    
    RETURN skill_id;
  END IF;
  
  -- Create new skill
  skill_slug := lower(regexp_replace(p_skill_name, '[^a-zA-Z0-9]+', '-', 'g'));
  skill_slug := regexp_replace(skill_slug, '^-+|-+$', '', 'g');
  
  INSERT INTO ref_skills (name, slug, usage_count)
  VALUES (p_skill_name, skill_slug, 1)
  RETURNING id INTO skill_id;
  
  RETURN skill_id;
END;
$$ LANGUAGE plpgsql;

-- Update endorsements count
CREATE OR REPLACE FUNCTION update_skill_endorsements_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE usr_profile_skills
    SET endorsements_count = endorsements_count + 1
    WHERE id = NEW.profile_skill_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE usr_profile_skills
    SET endorsements_count = GREATEST(endorsements_count - 1, 0)
    WHERE id = OLD.profile_skill_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_skill_endorsements_count
  AFTER INSERT OR DELETE ON usr_skill_endorsements
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_endorsements_count();

-- Update profile completeness when skills change
CREATE OR REPLACE FUNCTION update_skills_completeness()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE usr_completeness_checks
  SET 
    has_skills = EXISTS (SELECT 1 FROM usr_profile_skills WHERE profile_id = NEW.profile_id),
    has_endorsements = EXISTS (
      SELECT 1 FROM usr_skill_endorsements e
      JOIN usr_profile_skills ps ON e.profile_skill_id = ps.id
      WHERE ps.profile_id = NEW.profile_id
    ),
    last_calculated_at = NOW()
  WHERE profile_id = NEW.profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_skills_completeness
  AFTER INSERT OR DELETE ON usr_profile_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_skills_completeness();

-- Get top skills for a profile
CREATE OR REPLACE FUNCTION get_top_skills(p_profile_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  skill_name TEXT,
  endorsements_count INTEGER,
  proficiency_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name,
    ps.endorsements_count,
    ps.proficiency_level
  FROM usr_profile_skills ps
  JOIN ref_skills s ON ps.skill_id = s.id
  WHERE ps.profile_id = p_profile_id
  ORDER BY ps.is_featured DESC, ps.endorsements_count DESC, ps.display_order
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE usr_profile_skills IS 'Skills associated with user profiles';
COMMENT ON TABLE usr_skill_endorsements IS 'Skill endorsements from other users';
COMMENT ON TABLE usr_skill_recommendations IS 'LinkedIn-style recommendations';
COMMENT ON TABLE usr_skill_assessments IS 'Skill assessment results and certifications';
COMMENT ON FUNCTION find_or_create_skill IS 'Find existing skill or create new one';
COMMENT ON FUNCTION get_top_skills IS 'Get top skills for a profile by endorsements';

