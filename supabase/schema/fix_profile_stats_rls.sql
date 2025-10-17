-- =====================================================
-- Fix: Add INSERT policy for profile_stats
-- Issue: Trigger auto_initialize_profile_stats fails due to missing RLS policy
-- Date: 2025-10-17
-- =====================================================

-- Allow users to insert their own profile_stats (triggered automatically)
CREATE POLICY "Users can insert own profile stats"
  ON profile_stats FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Allow users to update their own profile_stats
CREATE POLICY "Users can update own profile stats"
  ON profile_stats FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Similarly for business_stats
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

-- Similarly for organization_stats
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
  RAISE NOTICE '✅ Successfully added INSERT/UPDATE policies for stats tables!';
  RAISE NOTICE '✅ Profile creation should now work correctly';
END $$;

