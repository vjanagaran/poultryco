-- =====================================================
-- Fix: Add all missing RLS policies
-- Issue: Multiple tables missing INSERT/UPDATE policies
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- 1. PROFILE STATS
-- =====================================================

CREATE POLICY "Users can insert own profile stats"
  ON profile_stats FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own profile stats"
  ON profile_stats FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- =====================================================
-- 2. PROFILE COMPLETENESS CHECKS
-- =====================================================

CREATE POLICY "Users can insert own completeness checks"
  ON profile_completeness_checks FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own completeness checks"
  ON profile_completeness_checks FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can view own completeness checks"
  ON profile_completeness_checks FOR SELECT
  USING (profile_id = auth.uid());

-- =====================================================
-- 3. PROFILE ROLES
-- =====================================================

CREATE POLICY "Users can insert own roles"
  ON profile_roles FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own roles"
  ON profile_roles FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own roles"
  ON profile_roles FOR DELETE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can view own roles"
  ON profile_roles FOR SELECT
  USING (profile_id = auth.uid());

-- =====================================================
-- 4. PROFILE EDUCATION
-- =====================================================

CREATE POLICY "Users can insert own education"
  ON profile_education FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own education"
  ON profile_education FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own education"
  ON profile_education FOR DELETE
  USING (profile_id = auth.uid());

-- =====================================================
-- 5. PROFILE SKILLS
-- =====================================================

CREATE POLICY "Users can insert own skills"
  ON profile_skills FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own skills"
  ON profile_skills FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own skills"
  ON profile_skills FOR DELETE
  USING (profile_id = auth.uid());

-- =====================================================
-- 6. BUSINESS STATS
-- =====================================================

CREATE POLICY "Users can insert own business stats"
  ON business_stats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_stats.business_profile_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own business stats"
  ON business_stats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_stats.business_profile_id
      AND business_profiles.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_stats.business_profile_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- =====================================================
-- 7. ORGANIZATION STATS
-- =====================================================

CREATE POLICY "Org admins can insert org stats"
  ON organization_stats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_stats.organization_id
      AND organizations.creator_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can update org stats"
  ON organization_stats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_stats.organization_id
      AND organizations.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_stats.organization_id
      AND organizations.creator_id = auth.uid()
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully added all missing RLS policies!';
  RAISE NOTICE '✅ Profile creation should now work correctly';
END $$;

