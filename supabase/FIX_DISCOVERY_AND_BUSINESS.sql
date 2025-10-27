-- =====================================================
-- Fix Discovery and Business Profile Issues
-- File: FIX_DISCOVERY_AND_BUSINESS.sql
-- Description: Fix member listing and business profile creation
-- Date: 2025-10-27
-- =====================================================

-- ============================================
-- PART 1: Add missing columns if needed
-- ============================================

-- Add is_active column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        COMMENT ON COLUMN profiles.is_active IS 'Whether the profile is active/visible';
    END IF;
END $$;

-- ============================================
-- PART 2: Fix business_profiles RLS policies
-- ============================================

-- Drop all existing policies on business_profiles
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'business_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON business_profiles', pol.policyname);
    END LOOP;
END $$;

-- Create simple, permissive policies for business_profiles
CREATE POLICY "business_profiles_select_all"
  ON business_profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);  -- Everyone can view business profiles

CREATE POLICY "business_profiles_insert_own"
  ON business_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "business_profiles_update_own"
  ON business_profiles
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "business_profiles_delete_own"
  ON business_profiles
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================
-- PART 3: Create RPC function for business creation (optional)
-- ============================================

-- Similar to profile creation, create a SECURITY DEFINER function for business
DROP FUNCTION IF EXISTS create_business_profile(UUID, TEXT, TEXT, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION create_business_profile(
  p_owner_id UUID,
  p_business_name TEXT,
  p_business_slug TEXT,
  p_business_type_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_id UUID;
  v_result JSON;
BEGIN
  -- Insert business profile
  INSERT INTO business_profiles (
    owner_id,
    business_name,
    business_slug,
    business_type_id,
    is_verified
  )
  VALUES (
    p_owner_id,
    p_business_name,
    p_business_slug,
    p_business_type_id,
    false
  )
  RETURNING id INTO v_business_id;
  
  -- Return success
  v_result := json_build_object(
    'success', true,
    'business_id', v_business_id,
    'message', 'Business profile created successfully'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    v_result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION create_business_profile(UUID, TEXT, TEXT, UUID) TO authenticated;

-- ============================================
-- PART 4: Update all existing profiles to be active
-- ============================================

UPDATE profiles 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check profiles have is_active column
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'is_active';

-- Check business_profiles policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'business_profiles'
ORDER BY policyname;

-- Count active profiles
SELECT COUNT(*) as active_profiles_count
FROM profiles
WHERE is_active = true;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DISCOVERY & BUSINESS FIX APPLIED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ is_active column added to profiles';
  RAISE NOTICE '✅ All existing profiles set to active';
  RAISE NOTICE '✅ business_profiles RLS policies fixed';
  RAISE NOTICE '✅ create_business_profile() function created';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Member listing should work now!';
  RAISE NOTICE '🎉 Business creation should work now!';
  RAISE NOTICE '========================================';
END $$;

