-- =====================================================
-- PoultryCo Database Schema
-- File: 58_add_endorsements_count_column.sql
-- Description: Add endorsements_count column to profile_skills table
-- Version: 1.0
-- Date: 2025-11-27
-- =====================================================

-- Add endorsements_count column to profile_skills if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profile_skills' 
    AND column_name = 'endorsements_count'
  ) THEN
    ALTER TABLE profile_skills 
    ADD COLUMN endorsements_count INTEGER NOT NULL DEFAULT 0;
    
    RAISE NOTICE '✅ Added endorsements_count column to profile_skills';
  ELSE
    RAISE NOTICE 'ℹ️  endorsements_count column already exists';
  END IF;
END $$;

-- Create index for endorsements_count
CREATE INDEX IF NOT EXISTS idx_profile_skills_endorsements 
  ON profile_skills(endorsements_count DESC);

-- Create function to update endorsements count
CREATE OR REPLACE FUNCTION update_skill_endorsements_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profile_skills
    SET endorsements_count = endorsements_count + 1
    WHERE id = NEW.profile_skill_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profile_skills
    SET endorsements_count = GREATEST(0, endorsements_count - 1)
    WHERE id = OLD.profile_skill_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_endorsements_count_trigger ON skill_endorsements;

CREATE TRIGGER update_endorsements_count_trigger
  AFTER INSERT OR DELETE ON skill_endorsements
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_endorsements_count();

-- Backfill existing endorsements count
UPDATE profile_skills ps
SET endorsements_count = (
  SELECT COUNT(*)
  FROM skill_endorsements se
  WHERE se.profile_skill_id = ps.id
);

-- Verification
DO $$
DECLARE
  v_total_skills INTEGER;
  v_skills_with_endorsements INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_skills FROM profile_skills;
  SELECT COUNT(*) INTO v_skills_with_endorsements 
  FROM profile_skills 
  WHERE endorsements_count > 0;
  
  RAISE NOTICE '✅ Endorsements count column added and backfilled';
  RAISE NOTICE '   - Total skills: %', v_total_skills;
  RAISE NOTICE '   - Skills with endorsements: %', v_skills_with_endorsements;
END $$;

-- Comments
COMMENT ON COLUMN profile_skills.endorsements_count IS 'Cached count of endorsements for this skill (updated by trigger)';

-- =====================================================
-- END OF FILE
-- =====================================================

