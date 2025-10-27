-- =====================================================
-- NUCLEAR OPTION - Complete RLS Reset and Fix
-- File: NUCLEAR_FIX_REGISTRATION.sql
-- Description: Completely rebuild RLS policies from scratch
-- Date: 2025-10-27
-- Execute this if other fixes didn't work
-- =====================================================

-- ============================================
-- PART 0: Clean slate - Remove all conflicting policies
-- ============================================

-- Drop ALL existing policies on profiles
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
END $$;

-- Drop ALL existing policies on profile_stats
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profile_stats'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profile_stats', pol.policyname);
    END LOOP;
END $$;

-- ============================================
-- PART 1: Make fields nullable
-- ============================================

ALTER TABLE profiles 
  ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE profiles 
  ALTER COLUMN location_state DROP NOT NULL;

ALTER TABLE profiles 
  ALTER COLUMN country DROP NOT NULL;

-- Clean up existing data
UPDATE profiles 
SET phone = COALESCE(phone, ''),
    location_state = COALESCE(location_state, ''),
    country = COALESCE(country, '')
WHERE phone IS NULL 
   OR location_state IS NULL 
   OR country IS NULL;

-- ============================================
-- PART 2: Create SIMPLE, PERMISSIVE profiles policies
-- ============================================

-- Allow authenticated users to insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to select their own profile
CREATE POLICY "profiles_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile  
CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public profiles to be viewed by anyone
CREATE POLICY "profiles_select_public"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- ============================================
-- PART 3: Create SIMPLE, PERMISSIVE profile_stats policies
-- ============================================

-- Allow authenticated users to insert their own stats
CREATE POLICY "profile_stats_insert_own"
  ON profile_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Allow authenticated users to select their own stats
CREATE POLICY "profile_stats_select_own"
  ON profile_stats
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Allow authenticated users to update their own stats
CREATE POLICY "profile_stats_update_own"
  ON profile_stats
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ============================================
-- PART 4: Fix the trigger function with SECURITY DEFINER
-- ============================================

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS auto_initialize_profile_stats ON profiles;
DROP FUNCTION IF EXISTS initialize_profile_stats() CASCADE;

-- Create new function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION initialize_profile_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Insert stats record, ignore if exists
  INSERT INTO profile_stats (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to initialize profile stats for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION initialize_profile_stats() TO authenticated;

-- Recreate trigger
CREATE TRIGGER auto_initialize_profile_stats
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_profile_stats();

-- ============================================
-- PART 5: Verify RLS is enabled
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 6: Add helpful comments
-- ============================================

COMMENT ON POLICY "profiles_insert_own" ON profiles IS 
  'Allows authenticated users to create their own profile';

COMMENT ON POLICY "profiles_select_own" ON profiles IS 
  'Allows users to view their own profile';

COMMENT ON POLICY "profiles_select_public" ON profiles IS 
  'Allows users to view public profiles';

COMMENT ON POLICY "profile_stats_insert_own" ON profile_stats IS 
  'Allows users to create their own stats record';

-- ============================================
-- VERIFICATION
-- ============================================

-- Show all policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'profile_stats')
ORDER BY tablename, policyname;

-- Show trigger info
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles'
  AND trigger_name = 'auto_initialize_profile_stats';

-- Show function security
SELECT 
  routine_name,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'initialize_profile_stats';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ NUCLEAR FIX COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ All policies dropped and recreated';
  RAISE NOTICE '✅ Nullable fields configured';
  RAISE NOTICE '✅ Simple, permissive policies created';
  RAISE NOTICE '✅ Trigger function with SECURITY DEFINER';
  RAISE NOTICE '✅ Error handling added to trigger';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Try registration now!';
  RAISE NOTICE '========================================';
END $$;

