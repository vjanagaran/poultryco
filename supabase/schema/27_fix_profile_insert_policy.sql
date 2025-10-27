-- =====================================================
-- PoultryCo Database Fix
-- File: 27_fix_profile_insert_policy.sql
-- Description: Fix RLS policy for profile creation during registration
-- Date: 2025-10-27
-- =====================================================

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a more permissive INSERT policy for new user registration
-- This allows authenticated users to create their profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
  );

-- Also ensure the helper function is using the right auth context
CREATE OR REPLACE FUNCTION auth_uid()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add a more lenient policy for SELECT to allow users to read their own profile immediately
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

COMMENT ON POLICY "Users can insert own profile" ON profiles IS 
  'Allows authenticated users to create their own profile during registration';

COMMENT ON POLICY "Users can view own profile" ON profiles IS 
  'Allows users to always view their own profile regardless of privacy settings';

