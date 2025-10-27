-- =====================================================
-- PoultryCo Database Schema Update
-- File: 26_make_profiles_global.sql
-- Description: Make platform global-ready by relaxing location/phone constraints
-- Date: 2025-10-27
-- =====================================================

-- Make phone field nullable (will be collected during onboarding)
ALTER TABLE profiles 
  ALTER COLUMN phone DROP NOT NULL;

-- Make location fields more flexible for global users
ALTER TABLE profiles 
  ALTER COLUMN location_state DROP NOT NULL;

ALTER TABLE profiles 
  ALTER COLUMN country SET DEFAULT 'Global';

-- Update any existing records that might be empty
UPDATE profiles 
SET phone = '' 
WHERE phone IS NULL;

UPDATE profiles 
SET location_state = 'Global' 
WHERE location_state IS NULL OR location_state = '';

UPDATE profiles 
SET country = 'Global' 
WHERE country IS NULL OR country = '';

-- Add comment for documentation
COMMENT ON COLUMN profiles.phone IS 'Phone number - optional during registration, collected in onboarding';
COMMENT ON COLUMN profiles.location_state IS 'User location state/region - defaults to Global for international users';
COMMENT ON COLUMN profiles.country IS 'User country - defaults to Global for flexible location';

