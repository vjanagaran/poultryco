-- Add profile_type to profiles table
-- This is needed for new features that expect to differentiate profile types

-- Add profile_type column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'personal' 
CHECK (profile_type IN ('personal', 'organization'));

-- Update existing profiles based on whether they are organizations
UPDATE profiles p
SET profile_type = 'organization'
WHERE EXISTS (
    SELECT 1 FROM organizations o WHERE o.id = p.id
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_type ON profiles(profile_type);

-- Also add display_name and avatar_url if they don't exist
-- (some of our new queries expect these)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS display_name TEXT GENERATED ALWAYS AS (
    COALESCE(full_name, profile_slug)
) STORED;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT GENERATED ALWAYS AS (
    COALESCE(profile_photo_url, '')
) STORED;

-- Create a view that makes it easier to work with all profile types
CREATE OR REPLACE VIEW unified_profiles AS
SELECT 
    p.id,
    p.profile_type,
    p.profile_slug,
    CASE 
        WHEN p.profile_type = 'organization' AND o.name IS NOT NULL THEN o.name
        WHEN bp.business_name IS NOT NULL THEN bp.business_name
        ELSE p.full_name
    END as name,
    CASE
        WHEN p.profile_type = 'organization' THEN 'organization'
        WHEN bp.id IS NOT NULL THEN 'business'
        ELSE 'personal'
    END as entity_type,
    p.profile_photo_url as avatar_url,
    p.location_city,
    p.location_state,
    p.created_at
FROM profiles p
LEFT JOIN organizations o ON o.id = p.id
LEFT JOIN business_profiles bp ON bp.owner_id = p.id;

-- Function to safely get profile type
CREATE OR REPLACE FUNCTION get_profile_type(p_profile_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        (SELECT profile_type FROM profiles WHERE id = p_profile_id),
        'personal'
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Comment for documentation
COMMENT ON COLUMN profiles.profile_type IS 'Type of profile: personal (individual users) or organization (associations/communities)';
