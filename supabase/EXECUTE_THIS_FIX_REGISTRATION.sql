-- =====================================================
-- PoultryCo Database Complete Fix
-- File: EXECUTE_THIS_FIX_REGISTRATION.sql
-- Description: Complete fix for registration profile creation
-- Date: 2025-10-27
-- Instructions: Copy and execute this entire file in Supabase SQL Editor
-- =====================================================

-- ============================================
-- STEP 1: Make fields nullable for global users
-- ============================================

-- Make phone field nullable
ALTER TABLE profiles 
  ALTER COLUMN phone DROP NOT NULL;

-- Make location fields more flexible
ALTER TABLE profiles 
  ALTER COLUMN location_state DROP NOT NULL;

-- Change default country to Global
ALTER TABLE profiles 
  ALTER COLUMN country SET DEFAULT 'Global';

-- Update any existing records with NULL values
UPDATE profiles 
SET phone = '' 
WHERE phone IS NULL;

UPDATE profiles 
SET location_state = 'Global' 
WHERE location_state IS NULL OR location_state = '';

UPDATE profiles 
SET country = 'Global' 
WHERE country IS NULL OR country = '';

-- ============================================
-- STEP 2: Fix RLS policies for profile creation
-- ============================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new INSERT policy with explicit TO clause
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
  );

-- Drop and recreate the auth_uid helper function with STABLE
DROP FUNCTION IF EXISTS auth_uid() CASCADE;

CREATE OR REPLACE FUNCTION auth_uid()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add policy for users to view their own profile immediately
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ============================================
-- STEP 3: Add documentation
-- ============================================

COMMENT ON COLUMN profiles.phone IS 'Phone number - optional during registration, collected in onboarding';
COMMENT ON COLUMN profiles.location_state IS 'User location state/region - defaults to Global for international users';
COMMENT ON COLUMN profiles.country IS 'User country - defaults to Global for flexible location';

COMMENT ON POLICY "Users can insert own profile" ON profiles IS 
  'Allows authenticated users to create their own profile during registration';

COMMENT ON POLICY "Users can view own profile" ON profiles IS 
  'Allows users to always view their own profile regardless of privacy settings';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that policies are set correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND policyname IN ('Users can insert own profile', 'Users can view own profile')
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database migration completed successfully!';
  RAISE NOTICE '✅ Phone and location fields are now optional';
  RAISE NOTICE '✅ RLS policies updated for profile creation';
  RAISE NOTICE '✅ Registration should now work!';
END $$;

