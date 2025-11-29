-- =====================================================
-- PoultryCo Database Schema
-- File: 59_fix_skills_rls.sql
-- Description: Fix RLS policies for skills table
-- Version: 1.0
-- Date: 2025-11-29
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved skills" ON skills;
DROP POLICY IF EXISTS "Anyone can add new skills" ON skills;
DROP POLICY IF EXISTS "Authenticated users can view approved skills" ON skills;
DROP POLICY IF EXISTS "Authenticated users can add skills" ON skills;
DROP POLICY IF EXISTS "Authenticated users can create skills" ON skills;

-- =====================================================
-- SKILLS TABLE RLS POLICIES
-- =====================================================

-- 1. SELECT: Everyone can view all skills (needed for skill lookup and suggestions)
CREATE POLICY "Everyone can view skills"
  ON skills FOR SELECT
  TO public
  USING (true);

-- 2. INSERT: Authenticated users can add new skills
CREATE POLICY "Authenticated users can insert skills"
  ON skills FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- 3. UPDATE: Only admins or creators can update skills (optional, for future)
-- We'll skip this for now since skills are auto-approved

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  v_policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'skills';
  
  RAISE NOTICE '✅ Skills RLS policies fixed';
  RAISE NOTICE '   - Total policies: %', v_policy_count;
  
  IF v_policy_count >= 2 THEN
    RAISE NOTICE '✅ Skills table is now accessible for authenticated users';
  ELSE
    RAISE WARNING '⚠️  Expected at least 2 policies for skills table';
  END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Everyone can view skills" ON skills IS 'All users can view skills for skill suggestions and lookups';
COMMENT ON POLICY "Authenticated users can insert skills" ON skills IS 'Authenticated users can add new skills via find_or_create_skill function';

-- =====================================================
-- END OF FILE
-- =====================================================

