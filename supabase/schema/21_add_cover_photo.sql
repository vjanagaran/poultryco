-- =====================================================
-- ADD COVER PHOTO COLUMN TO PROFILES
-- =====================================================
-- This migration adds support for cover photos in user profiles
-- Date: 2025-10-25
-- =====================================================

-- Add cover_photo_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'cover_photo_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cover_photo_url TEXT;
    COMMENT ON COLUMN profiles.cover_photo_url IS 'URL to user cover photo in cdn-poultryco bucket';
  END IF;
END $$;

-- Update existing profiles to have placeholder cover photos (optional)
-- You can skip this if you want covers to be added manually by users
-- UPDATE profiles SET cover_photo_url = NULL WHERE cover_photo_url IS NULL;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Cover photo column added successfully!';
END $$;

