-- =====================================================
-- DIAGNOSTIC QUERY - Run this to see current state
-- File: DIAGNOSTIC_CHECK.sql
-- =====================================================

-- 1. Check if phone/location_state/country are nullable
SELECT 
  column_name,
  is_nullable,
  column_default,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('phone', 'location_state', 'country')
ORDER BY column_name;

-- 2. Check all RLS policies on profiles table
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
ORDER BY policyname;

-- 3. Check all RLS policies on profile_stats table
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
WHERE tablename = 'profile_stats'
ORDER BY policyname;

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'profile_stats');

-- 5. Check the trigger function definition
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'initialize_profile_stats';

-- 6. Check triggers on profiles table
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

