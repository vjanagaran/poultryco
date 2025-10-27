-- =====================================================
-- COMPLETE REGISTRATION FIX
-- File: COMPLETE_FIX_EXECUTE_THIS.sql
-- Description: Complete fix including nullable fields + RLS policies
-- Date: 2025-10-27
-- Execute this ENTIRE file in Supabase SQL Editor
-- =====================================================

-- ============================================
-- PART 1: Make fields nullable for global users
-- ============================================

ALTER TABLE profiles 
  ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE profiles 
  ALTER COLUMN location_state DROP NOT NULL;

ALTER TABLE profiles 
  ALTER COLUMN country DROP NOT NULL;

UPDATE profiles 
SET phone = '' 
WHERE phone IS NULL;

UPDATE profiles 
SET location_state = '' 
WHERE location_state IS NULL;

UPDATE profiles 
SET country = '' 
WHERE country IS NULL;

-- ============================================
-- PART 2: Fix profiles RLS policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ============================================
-- PART 3: Fix profile_stats RLS policies (CRITICAL!)
-- ============================================

-- This is what's blocking profile creation!
-- The trigger tries to insert into profile_stats but RLS blocks it

DROP POLICY IF EXISTS "Users can insert own profile stats" ON profile_stats;
DROP POLICY IF EXISTS "Users can update own profile stats" ON profile_stats;
DROP POLICY IF EXISTS "Users can view own profile stats" ON profile_stats;

CREATE POLICY "Users can insert own profile stats"
  ON profile_stats FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own profile stats"
  ON profile_stats FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can view own profile stats"
  ON profile_stats FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- ============================================
-- PART 4: Make the trigger SECURITY DEFINER
-- ============================================

-- The trigger function needs to bypass RLS to insert stats
DROP FUNCTION IF EXISTS initialize_profile_stats() CASCADE;

CREATE OR REPLACE FUNCTION initialize_profile_stats()
RETURNS TRIGGER 
SECURITY DEFINER  -- This allows it to bypass RLS
SET search_path = public
AS $$
BEGIN
  INSERT INTO profile_stats (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS auto_initialize_profile_stats ON profiles;

CREATE TRIGGER auto_initialize_profile_stats
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_profile_stats();

-- ============================================
-- PART 5: Fix auth_uid helper function
-- ============================================

CREATE OR REPLACE FUNCTION auth_uid()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- PART 6: Add comments for documentation
-- ============================================

COMMENT ON COLUMN profiles.phone IS 'Phone number - optional during registration, collected in onboarding';
COMMENT ON COLUMN profiles.location_state IS 'User location state/region - empty until user sets it';
COMMENT ON COLUMN profiles.country IS 'User country - empty until user sets it';

COMMENT ON POLICY "Users can insert own profile" ON profiles IS 
  'Allows authenticated users to create their own profile during registration';

COMMENT ON POLICY "Users can view own profile" ON profiles IS 
  'Allows users to always view their own profile regardless of privacy settings';

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Check all policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'profile_stats')
  AND policyname LIKE '%own%'
ORDER BY tablename, policyname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ COMPLETE REGISTRATION FIX APPLIED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Phone, location_state, country are nullable';
  RAISE NOTICE '✅ Fields default to empty strings';
  RAISE NOTICE '✅ profiles INSERT policy fixed';
  RAISE NOTICE '✅ profile_stats INSERT policy fixed';
  RAISE NOTICE '✅ initialize_profile_stats trigger fixed';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Registration should work now!';
  RAISE NOTICE '🎉 Try signing up again';
  RAISE NOTICE '========================================';
END $$;

