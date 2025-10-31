-- =====================================================
-- PoultryCo Database Schema
-- File: 46_update_existing_oauth_profiles.sql
-- Description: Update existing OAuth profiles with photos from auth metadata
-- Date: 2025-10-31
-- Usage: Run this ONCE to fix existing users who signed up before photo capture was implemented
-- =====================================================

-- =====================================================
-- UPDATE EXISTING PROFILES WITH OAUTH PHOTOS
-- =====================================================

-- This updates profiles that:
-- 1. Don't have a profile photo
-- 2. Have user metadata with a photo URL
-- 3. Signed up via Google or LinkedIn OAuth

DO $$
DECLARE
  v_user RECORD;
  v_photo_url TEXT;
  v_updated_count INTEGER := 0;
BEGIN
  -- Loop through all users with OAuth metadata but no profile photo
  FOR v_user IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data,
      p.profile_photo_url,
      p.profile_strength
    FROM auth.users au
    INNER JOIN profiles p ON p.id = au.id
    WHERE p.profile_photo_url IS NULL
      AND (
        au.raw_user_meta_data->>'picture' IS NOT NULL 
        OR au.raw_user_meta_data->>'avatar_url' IS NOT NULL
      )
  LOOP
    -- Extract photo URL from metadata
    v_photo_url := COALESCE(
      v_user.raw_user_meta_data->>'picture',
      v_user.raw_user_meta_data->>'avatar_url'
    );

    -- Update profile with photo
    IF v_photo_url IS NOT NULL THEN
      UPDATE profiles
      SET 
        profile_photo_url = v_photo_url,
        profile_strength = LEAST(v_user.profile_strength + 20, 100), -- Add 20 points for photo
        updated_at = NOW()
      WHERE id = v_user.id;

      v_updated_count := v_updated_count + 1;
      
      RAISE NOTICE 'Updated profile % (%) with photo: %', 
        v_user.email, v_user.id, v_photo_url;
    END IF;
  END LOOP;

  RAISE NOTICE 'Total profiles updated: %', v_updated_count;
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this to see which profiles were updated
SELECT 
  au.id,
  au.email,
  p.full_name,
  p.profile_photo_url,
  p.profile_strength,
  au.raw_user_meta_data->>'picture' as google_picture,
  au.raw_user_meta_data->>'avatar_url' as linkedin_avatar,
  p.created_at
FROM auth.users au
INNER JOIN profiles p ON p.id = au.id
WHERE p.profile_photo_url IS NOT NULL
ORDER BY p.created_at DESC;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user_signup IS 
  'One-time script to backfill OAuth profile photos for existing users';

