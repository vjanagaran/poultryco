-- =====================================================
-- Supabase Storage Setup for Profile Photos
-- File: 20_storage_buckets_and_policies.sql
-- Description: Create storage buckets and RLS policies
-- Version: 1.0
-- Date: 2025-10-25
-- =====================================================

-- =====================================================
-- CREATE OR UPDATE STORAGE BUCKET
-- =====================================================

-- Update existing cdn-poultryco bucket or create if doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cdn-poultryco',
  'cdn-poultryco',
  true,  -- Public bucket
  10485760,  -- 10MB limit (can be adjusted per path via policies)
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif',
    'video/mp4', 'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Path structure within 'cdn-poultryco' bucket:
-- /profiles/<uid>/avatar.webp
-- /profiles/<uid>/cover.webp
-- /business/<business_id>/logo.webp
-- /business/<business_id>/cover.webp
-- /blog/<post_id>/<filename>.webp
-- /posts/<post_id>/<filename>.webp
-- /messages/<conversation_id>/<filename>
-- /tools/<filename>
-- /ebooks/<filename>
-- /landing/<filename>
-- /verification/<uid>/<timestamp>_<filename>

-- =====================================================
-- STORAGE RLS POLICIES (CDN-POULTRYCO BUCKET)
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "CDN content viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Business admins can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Business admins can update media" ON storage.objects;
DROP POLICY IF EXISTS "Business admins can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own verification documents" ON storage.objects;

-- Policy: Anyone can view all public CDN content
CREATE POLICY "CDN content viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'cdn-poultryco');

-- ========== PROFILE PHOTOS (/profiles/*) ==========

-- Policy: Users can upload to their own profile folder
CREATE POLICY "Users can upload own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'profiles' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy: Users can update their own profile photos
CREATE POLICY "Users can update own profile photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'profiles' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy: Users can delete their own profile photos
CREATE POLICY "Users can delete own profile photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'profiles' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- ========== BUSINESS MEDIA (/business/*) ==========

-- Policy: Business owners/admins can upload
CREATE POLICY "Business admins can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'business' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM business_profiles
    WHERE id::text = (storage.foldername(name))[2]
      AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_team_members
          WHERE business_profile_id = business_profiles.id
            AND profile_id = auth.uid()
            AND is_admin = true
        )
      )
  )
);

-- Policy: Business owners/admins can update
CREATE POLICY "Business admins can update media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'business' AND
  EXISTS (
    SELECT 1 FROM business_profiles
    WHERE id::text = (storage.foldername(name))[2]
      AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_team_members
          WHERE business_profile_id = business_profiles.id
            AND profile_id = auth.uid()
            AND is_admin = true
        )
      )
  )
);

-- Policy: Business owners/admins can delete
CREATE POLICY "Business admins can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'business' AND
  EXISTS (
    SELECT 1 FROM business_profiles
    WHERE id::text = (storage.foldername(name))[2]
      AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_team_members
          WHERE business_profile_id = business_profiles.id
            AND profile_id = auth.uid()
            AND is_admin = true
        )
      )
  )
);

-- ========== BLOG IMAGES (/blog/*) ==========

-- Policy: Authenticated users can upload blog images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'blog' AND
  auth.uid() IS NOT NULL
);

-- ========== POST MEDIA (/posts/*) ==========

-- Policy: Users can upload media for their posts
CREATE POLICY "Users can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'posts' AND
  auth.uid() IS NOT NULL
);

-- Policy: Users can delete their own post media
CREATE POLICY "Users can delete own post media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'posts' AND
  EXISTS (
    SELECT 1 FROM posts
    WHERE id::text = (storage.foldername(name))[2]
      AND author_id = auth.uid()
  )
);

-- ========== VERIFICATION DOCUMENTS (/verification/*) ==========

-- Policy: Users can upload verification documents (private path logic in app)
CREATE POLICY "Users can upload verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'verification' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy: Users can delete their own verification documents
CREATE POLICY "Users can delete own verification documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'verification' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get profile photo URL
CREATE OR REPLACE FUNCTION get_profile_photo_url(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_base_url TEXT;
BEGIN
  -- Get Supabase storage public URL for cdn-poultryco bucket
  SELECT 
    CONCAT(
      current_setting('app.settings.supabase_url', true),
      '/storage/v1/object/public/cdn-poultryco/profiles/',
      p_user_id::text,
      '/avatar.webp'
    )
  INTO v_base_url;
  
  RETURN v_base_url;
END;
$$ LANGUAGE plpgsql;

-- Function to get business logo URL
CREATE OR REPLACE FUNCTION get_business_logo_url(p_business_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_base_url TEXT;
BEGIN
  SELECT 
    CONCAT(
      current_setting('app.settings.supabase_url', true),
      '/storage/v1/object/public/cdn-poultryco/business/',
      p_business_id::text,
      '/logo.webp'
    )
  INTO v_base_url;
  
  RETURN v_base_url;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

-- Note: Cannot add comments to storage.objects policies as they're system-owned
-- Policy documentation:
--   "CDN content viewable by everyone" - All CDN content is public and viewable by anyone
--   "Users can upload own profile photos" - Users can only upload photos to /profiles/<user_id>/*

COMMENT ON FUNCTION get_profile_photo_url IS 
  'Returns the full public URL for a user profile photo from cdn-poultryco bucket';

COMMENT ON FUNCTION get_business_logo_url IS 
  'Returns the full public URL for a business logo from cdn-poultryco bucket';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify bucket exists or was created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'cdn-poultryco') THEN
    RAISE EXCEPTION 'cdn-poultryco bucket not found or created';
  END IF;
  
  RAISE NOTICE 'CDN storage bucket (cdn-poultryco) configured successfully!';
  RAISE NOTICE 'Path structure:';
  RAISE NOTICE '  /profiles/<uid>/avatar.webp';
  RAISE NOTICE '  /profiles/<uid>/cover.webp';
  RAISE NOTICE '  /business/<business_id>/logo.webp';
  RAISE NOTICE '  /business/<business_id>/cover.webp';
  RAISE NOTICE '  /blog/<post_id>/<filename>.webp';
  RAISE NOTICE '  /posts/<post_id>/<filename>.webp';
  RAISE NOTICE '  /messages/<conversation_id>/<filename>';
  RAISE NOTICE '  /verification/<uid>/<timestamp>_<filename>';
END $$;

-- =====================================================
-- END OF FILE
-- =====================================================

