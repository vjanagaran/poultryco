-- =====================================================
-- PoultryCo Database Schema
-- File: 45_oauth_profile_creation.sql
-- Description: Auto-create profiles for OAuth signups
-- Date: 2025-10-31
-- =====================================================

-- =====================================================
-- RPC FUNCTION: Create profile for user
-- Used by email registration and OAuth fallback
-- =====================================================

-- Drop old function signatures first to avoid conflicts
DROP FUNCTION IF EXISTS create_profile_for_user(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_profile_for_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN);

CREATE OR REPLACE FUNCTION create_profile_for_user(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_slug TEXT,
  p_profile_photo_url TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT '',
  p_phone_verified BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_profile_strength INTEGER;
BEGIN
  -- Calculate initial profile strength
  v_profile_strength := 25; -- Base
  IF p_full_name IS NOT NULL AND length(p_full_name) > 0 THEN
    v_profile_strength := v_profile_strength + 15;
  END IF;
  IF p_profile_photo_url IS NOT NULL THEN
    v_profile_strength := v_profile_strength + 20;
  END IF;
  IF p_phone IS NOT NULL AND length(p_phone) > 0 THEN
    v_profile_strength := v_profile_strength + 10;
  END IF;

  -- Insert profile (skip if already exists)
  INSERT INTO profiles (
    id,
    full_name,
    profile_slug,
    email,
    email_verified,
    phone,
    phone_verified,
    profile_photo_url,
    location_state,
    location_district,
    location_city,
    country,
    profile_strength,
    is_public,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_full_name,
    p_slug,
    p_email,
    true, -- Email verified via OAuth
    COALESCE(p_phone, ''),
    COALESCE(p_phone_verified, false),
    p_profile_photo_url,
    'Unknown', -- Will be updated during onboarding
    NULL,
    NULL,
    'India',
    v_profile_strength,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Skip if profile already exists

  -- Create profile stats entry (skip if already exists)
  -- Note: There's an auto-trigger that creates this, but we ensure it exists
  INSERT INTO profile_stats (profile_id)
  VALUES (p_user_id)
  ON CONFLICT (profile_id) DO NOTHING; -- Skip if stats already exist

  -- Return success
  v_result := json_build_object(
    'success', true,
    'profile_id', p_user_id,
    'profile_strength', v_profile_strength,
    'message', 'Profile created successfully'
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error details
  v_result := json_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- WEBHOOK FUNCTION: Handle new user signup
-- This approach works without needing owner permissions
-- Called by Supabase Auth webhook
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_signup(user_data JSONB)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_full_name TEXT;
  v_email TEXT;
  v_base_slug TEXT;
  v_slug TEXT;
  v_counter INTEGER := 1;
  v_existing_slug TEXT;
  v_result JSON;
BEGIN
  -- Extract user data
  v_user_id := (user_data->>'id')::UUID;
  v_email := user_data->>'email';
  
  -- Get full name from metadata
  v_full_name := COALESCE(
    user_data->'user_metadata'->>'full_name',
    user_data->'user_metadata'->>'name',
    split_part(v_email, '@', 1)
  );

  -- Generate base slug from name
  v_base_slug := lower(
    regexp_replace(
      regexp_replace(v_full_name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
  v_base_slug := trim(both '-' from v_base_slug);
  
  -- Ensure slug is not empty
  IF v_base_slug = '' OR v_base_slug IS NULL THEN
    v_base_slug := 'user-' || substring(v_user_id::text, 1, 8);
  END IF;

  -- Make slug unique
  v_slug := v_base_slug;
  LOOP
    SELECT profile_slug INTO v_existing_slug
    FROM profiles
    WHERE profile_slug = v_slug;
    
    EXIT WHEN v_existing_slug IS NULL;
    
    v_slug := v_base_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  END LOOP;

  -- Create profile only if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN
    INSERT INTO profiles (
      id,
      full_name,
      profile_slug,
      email,
      email_verified,
      phone,
      phone_verified,
      location_state,
      country,
      profile_strength,
      is_public,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_full_name,
      v_slug,
      v_email,
      COALESCE((user_data->>'email_confirmed_at') IS NOT NULL, false),
      COALESCE(user_data->>'phone', ''),
      COALESCE((user_data->>'phone_confirmed_at') IS NOT NULL, false),
      'Unknown',
      'India',
      25,
      true,
      NOW(),
      NOW()
    );

    -- Create profile stats (trigger handles this automatically, but ensure it exists)
    INSERT INTO profile_stats (profile_id)
    VALUES (v_user_id)
    ON CONFLICT (profile_id) DO NOTHING;

    v_result := json_build_object(
      'success', true,
      'profile_id', v_user_id,
      'message', 'Profile created successfully'
    );
  ELSE
    v_result := json_build_object(
      'success', true,
      'profile_id', v_user_id,
      'message', 'Profile already exists'
    );
  END IF;

  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  v_result := json_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Allow authenticated users to call the RPC function
GRANT EXECUTE ON FUNCTION create_profile_for_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_signup(JSONB) TO anon, authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION create_profile_for_user IS 
  'Creates a profile for a user during registration (email or OAuth). Called from application code.';

COMMENT ON FUNCTION public.handle_new_user_signup IS 
  'Handles new user signup from auth callback. Creates profile automatically for OAuth users.';

-- =====================================================
-- INSTRUCTIONS FOR SETUP
-- =====================================================

/*
NOTE: Database triggers on auth.users require supabase_auth_admin role.
Instead, we use two approaches:

APPROACH 1 (Recommended): Application-level callback
- The auth callback route checks for profile existence
- Calls create_profile_for_user() if profile is missing
- This is already implemented in apps/web/src/app/auth/callback/route.ts

APPROACH 2 (Optional): Supabase Auth Webhook
If you want fully automatic profile creation without relying on the callback:
1. Go to Supabase Dashboard → Authentication → Hooks
2. Enable "Send user signup event" hook
3. Set webhook URL to call handle_new_user_signup()
4. Configure webhook secret

For now, APPROACH 1 (callback-based) is sufficient and already implemented.
*/

