-- =====================================================
-- Fix Business Profiles Contact RLS
-- File: FIX_BUSINESS_CONTACT_RLS.sql
-- Description: Fix RLS for business_profiles_contact table
-- Date: 2025-10-27
-- =====================================================

-- Drop all existing policies on business_profiles_contact
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'business_profiles_contact'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON business_profiles_contact', pol.policyname);
    END LOOP;
END $$;

-- Create simple, permissive policies for business_profiles_contact
CREATE POLICY "business_contact_select_all"
  ON business_profiles_contact
  FOR SELECT
  TO authenticated, anon
  USING (true);  -- Everyone can view business contact info

CREATE POLICY "business_contact_insert_own"
  ON business_profiles_contact
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_profiles_contact.business_profile_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

CREATE POLICY "business_contact_update_own"
  ON business_profiles_contact
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_profiles_contact.business_profile_id
      AND business_profiles.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_profiles_contact.business_profile_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

CREATE POLICY "business_contact_delete_own"
  ON business_profiles_contact
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_profiles_contact.business_profile_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- Fix business_stats RLS as well (related table)
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'business_stats'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON business_stats', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "business_stats_select_all"
  ON business_stats
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "business_stats_insert_own"
  ON business_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_stats.business_profile_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

CREATE POLICY "business_stats_update_own"
  ON business_stats
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_stats.business_profile_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- Verification
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('business_profiles_contact', 'business_stats')
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ BUSINESS CONTACT RLS FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ business_profiles_contact policies created';
  RAISE NOTICE '✅ business_stats policies created';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Business creation should work now!';
  RAISE NOTICE '========================================';
END $$;

