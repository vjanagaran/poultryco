-- =====================================================
-- PoultryCo Database Schema
-- File: 57_fix_professional_info_rls.sql
-- Description: Fix RLS policies for profile_experience, profile_education, and profile_skills
-- Version: 1.0
-- Date: 2025-11-27
-- =====================================================

-- =====================================================
-- SECTION 1: DROP OLD POLICIES
-- =====================================================

-- Drop old broad policies for profile_experience
DROP POLICY IF EXISTS "Users can manage own experience" ON profile_experience;
DROP POLICY IF EXISTS "Experience viewable by public/connections" ON profile_experience;

-- Drop old broad policies for profile_education
DROP POLICY IF EXISTS "Users can manage own education" ON profile_education;
DROP POLICY IF EXISTS "Education viewable by public/connections" ON profile_education;

-- Drop old broad policies for profile_skills
DROP POLICY IF EXISTS "Users can manage own skills" ON profile_skills;
DROP POLICY IF EXISTS "Profile skills viewable by public/connections" ON profile_skills;

-- =====================================================
-- SECTION 2: PROFILE_EXPERIENCE RLS POLICIES
-- =====================================================

-- 1. SELECT: Users can view own experience OR view public/connected profiles
CREATE POLICY "Users can view own experience"
  ON profile_experience FOR SELECT
  TO public
  USING (
    profile_id = auth.uid() OR
    is_profile_public(profile_id) OR
    are_connected(profile_id, auth.uid())
  );

-- 2. INSERT: Users can insert own experience only
CREATE POLICY "Users can insert own experience"
  ON profile_experience FOR INSERT
  TO public
  WITH CHECK (
    profile_id = auth.uid()
  );

-- 3. UPDATE: Users can update own experience only
CREATE POLICY "Users can update own experience"
  ON profile_experience FOR UPDATE
  TO public
  USING (
    profile_id = auth.uid()
  )
  WITH CHECK (
    profile_id = auth.uid()
  );

-- 4. DELETE: Users can delete own experience only
CREATE POLICY "Users can delete own experience"
  ON profile_experience FOR DELETE
  TO public
  USING (
    profile_id = auth.uid()
  );

-- =====================================================
-- SECTION 3: PROFILE_EDUCATION RLS POLICIES
-- =====================================================

-- 1. SELECT: Users can view own education OR view public/connected profiles
CREATE POLICY "Users can view own education"
  ON profile_education FOR SELECT
  TO public
  USING (
    profile_id = auth.uid() OR
    is_profile_public(profile_id) OR
    are_connected(profile_id, auth.uid())
  );

-- 2. INSERT: Users can insert own education only
CREATE POLICY "Users can insert own education"
  ON profile_education FOR INSERT
  TO public
  WITH CHECK (
    profile_id = auth.uid()
  );

-- 3. UPDATE: Users can update own education only
CREATE POLICY "Users can update own education"
  ON profile_education FOR UPDATE
  TO public
  USING (
    profile_id = auth.uid()
  )
  WITH CHECK (
    profile_id = auth.uid()
  );

-- 4. DELETE: Users can delete own education only
CREATE POLICY "Users can delete own education"
  ON profile_education FOR DELETE
  TO public
  USING (
    profile_id = auth.uid()
  );

-- =====================================================
-- SECTION 4: PROFILE_SKILLS RLS POLICIES
-- =====================================================

-- 1. SELECT: Users can view own skills OR view public/connected profiles
CREATE POLICY "Users can view own skills"
  ON profile_skills FOR SELECT
  TO public
  USING (
    profile_id = auth.uid() OR
    is_profile_public(profile_id) OR
    are_connected(profile_id, auth.uid())
  );

-- 2. INSERT: Users can insert own skills only
CREATE POLICY "Users can insert own skills"
  ON profile_skills FOR INSERT
  TO public
  WITH CHECK (
    profile_id = auth.uid()
  );

-- 3. UPDATE: Users can update own skills only
CREATE POLICY "Users can update own skills"
  ON profile_skills FOR UPDATE
  TO public
  USING (
    profile_id = auth.uid()
  )
  WITH CHECK (
    profile_id = auth.uid()
  );

-- 4. DELETE: Users can delete own skills only
CREATE POLICY "Users can delete own skills"
  ON profile_skills FOR DELETE
  TO public
  USING (
    profile_id = auth.uid()
  );

-- =====================================================
-- SECTION 5: PROFILE_CERTIFICATIONS RLS POLICIES
-- =====================================================

-- Drop old policy
DROP POLICY IF EXISTS "Users can manage own certifications" ON profile_certifications;
DROP POLICY IF EXISTS "Certifications viewable by public/connections" ON profile_certifications;

-- 1. SELECT: Users can view own certifications OR view public/connected profiles
CREATE POLICY "Users can view own certifications"
  ON profile_certifications FOR SELECT
  TO public
  USING (
    profile_id = auth.uid() OR
    is_profile_public(profile_id) OR
    are_connected(profile_id, auth.uid())
  );

-- 2. INSERT: Users can insert own certifications only
CREATE POLICY "Users can insert own certifications"
  ON profile_certifications FOR INSERT
  TO public
  WITH CHECK (
    profile_id = auth.uid()
  );

-- 3. UPDATE: Users can update own certifications only
CREATE POLICY "Users can update own certifications"
  ON profile_certifications FOR UPDATE
  TO public
  USING (
    profile_id = auth.uid()
  )
  WITH CHECK (
    profile_id = auth.uid()
  );

-- 4. DELETE: Users can delete own certifications only
CREATE POLICY "Users can delete own certifications"
  ON profile_certifications FOR DELETE
  TO public
  USING (
    profile_id = auth.uid()
  );

-- =====================================================
-- SECTION 6: VERIFICATION
-- =====================================================

-- Verify policies are created
DO $$
DECLARE
  v_experience_count INTEGER;
  v_education_count INTEGER;
  v_skills_count INTEGER;
  v_certifications_count INTEGER;
BEGIN
  -- Count policies for profile_experience
  SELECT COUNT(*) INTO v_experience_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'profile_experience';
  
  -- Count policies for profile_education
  SELECT COUNT(*) INTO v_education_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'profile_education';
  
  -- Count policies for profile_skills
  SELECT COUNT(*) INTO v_skills_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'profile_skills';
  
  -- Count policies for profile_certifications
  SELECT COUNT(*) INTO v_certifications_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'profile_certifications';
  
  RAISE NOTICE '✅ RLS Policies Fixed:';
  RAISE NOTICE '   - profile_experience: % policies', v_experience_count;
  RAISE NOTICE '   - profile_education: % policies', v_education_count;
  RAISE NOTICE '   - profile_skills: % policies', v_skills_count;
  RAISE NOTICE '   - profile_certifications: % policies', v_certifications_count;
  
  IF v_experience_count >= 4 AND v_education_count >= 4 AND v_skills_count >= 4 AND v_certifications_count >= 4 THEN
    RAISE NOTICE '✅ All policies created successfully!';
  ELSE
    RAISE WARNING '⚠️  Some policies may be missing. Expected at least 4 policies per table.';
  END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Users can view own experience" ON profile_experience IS 'Users can view their own experience or public/connected profiles';
COMMENT ON POLICY "Users can insert own experience" ON profile_experience IS 'Users can only insert experience for their own profile';
COMMENT ON POLICY "Users can update own experience" ON profile_experience IS 'Users can only update their own experience';
COMMENT ON POLICY "Users can delete own experience" ON profile_experience IS 'Users can only delete their own experience';

COMMENT ON POLICY "Users can view own education" ON profile_education IS 'Users can view their own education or public/connected profiles';
COMMENT ON POLICY "Users can insert own education" ON profile_education IS 'Users can only insert education for their own profile';
COMMENT ON POLICY "Users can update own education" ON profile_education IS 'Users can only update their own education';
COMMENT ON POLICY "Users can delete own education" ON profile_education IS 'Users can only delete their own education';

COMMENT ON POLICY "Users can view own skills" ON profile_skills IS 'Users can view their own skills or public/connected profiles';
COMMENT ON POLICY "Users can insert own skills" ON profile_skills IS 'Users can only insert skills for their own profile';
COMMENT ON POLICY "Users can update own skills" ON profile_skills IS 'Users can only update their own skills';
COMMENT ON POLICY "Users can delete own skills" ON profile_skills IS 'Users can only delete their own skills';

COMMENT ON POLICY "Users can view own certifications" ON profile_certifications IS 'Users can view their own certifications or public/connected profiles';
COMMENT ON POLICY "Users can insert own certifications" ON profile_certifications IS 'Users can only insert certifications for their own profile';
COMMENT ON POLICY "Users can update own certifications" ON profile_certifications IS 'Users can only update their own certifications';
COMMENT ON POLICY "Users can delete own certifications" ON profile_certifications IS 'Users can only delete their own certifications';

-- =====================================================
-- END OF FILE
-- =====================================================

