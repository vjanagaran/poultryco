-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 10_usr_core.sql
-- Description: User profile extensions and privacy
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: USER PROFILE ROLES (Multi-role system)
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_profile_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES ref_roles(id),
  
  -- Role status
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(profile_id, role_id)
);

CREATE INDEX idx_usr_profile_roles_profile ON usr_profile_roles(profile_id);
CREATE INDEX idx_usr_profile_roles_role ON usr_profile_roles(role_id);
CREATE INDEX idx_usr_profile_roles_primary ON usr_profile_roles(profile_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_usr_profile_roles_verified ON usr_profile_roles(is_verified) WHERE is_verified = true;

CREATE TRIGGER update_usr_profile_roles_updated_at
  BEFORE UPDATE ON usr_profile_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Reference: Roles table
CREATE TABLE IF NOT EXISTS ref_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  permissions JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ref_roles_slug ON ref_roles(slug);
CREATE INDEX idx_ref_roles_active ON ref_roles(is_active) WHERE is_active = true;

CREATE TRIGGER update_ref_roles_updated_at
  BEFORE UPDATE ON ref_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: PRIVACY SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_privacy_settings (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Profile visibility
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'connections', 'private')),
  
  -- Contact visibility
  show_email TEXT NOT NULL DEFAULT 'connections' CHECK (show_email IN ('public', 'connections', 'private')),
  show_phone TEXT NOT NULL DEFAULT 'connections' CHECK (show_phone IN ('public', 'connections', 'private')),
  show_whatsapp TEXT NOT NULL DEFAULT 'connections' CHECK (show_whatsapp IN ('public', 'connections', 'private')),
  
  -- Activity visibility
  show_connections TEXT NOT NULL DEFAULT 'public' CHECK (show_connections IN ('public', 'connections', 'private')),
  show_followers TEXT NOT NULL DEFAULT 'public' CHECK (show_followers IN ('public', 'connections', 'private')),
  show_activity TEXT NOT NULL DEFAULT 'connections' CHECK (show_activity IN ('public', 'connections', 'private')),
  
  -- Search & discovery
  allow_search_engines BOOLEAN NOT NULL DEFAULT true,
  allow_discovery BOOLEAN NOT NULL DEFAULT true,
  
  -- Messaging
  allow_messages_from TEXT NOT NULL DEFAULT 'everyone' CHECK (allow_messages_from IN ('everyone', 'connections', 'none')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_usr_privacy_settings_updated_at
  BEFORE UPDATE ON usr_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: VERIFICATION SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Verification type
  verification_type TEXT NOT NULL CHECK (verification_type IN (
    'email', 'phone', 'identity', 'business', 'professional', 'address'
  )),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Documents
  document_urls TEXT[],
  notes TEXT,
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_verifications_profile ON usr_verifications(profile_id);
CREATE INDEX idx_usr_verifications_type ON usr_verifications(verification_type);
CREATE INDEX idx_usr_verifications_status ON usr_verifications(status);
CREATE INDEX idx_usr_verifications_pending ON usr_verifications(status, created_at) WHERE status = 'pending';

CREATE TRIGGER update_usr_verifications_updated_at
  BEFORE UPDATE ON usr_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: PROFILE COMPLETENESS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_completeness_checks (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic info (30 points)
  has_photo BOOLEAN NOT NULL DEFAULT false,
  has_headline BOOLEAN NOT NULL DEFAULT false,
  has_bio BOOLEAN NOT NULL DEFAULT false,
  
  -- Professional info (40 points)
  has_experience BOOLEAN NOT NULL DEFAULT false,
  has_education BOOLEAN NOT NULL DEFAULT false,
  has_skills BOOLEAN NOT NULL DEFAULT false,
  
  -- Engagement (30 points)
  has_connections BOOLEAN NOT NULL DEFAULT false,
  has_posts BOOLEAN NOT NULL DEFAULT false,
  has_endorsements BOOLEAN NOT NULL DEFAULT false,
  
  -- Calculated score
  completeness_score INTEGER NOT NULL DEFAULT 0 CHECK (completeness_score >= 0 AND completeness_score <= 100),
  
  -- Timestamps
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_completeness_score ON usr_completeness_checks(completeness_score DESC);

CREATE TRIGGER update_usr_completeness_checks_updated_at
  BEFORE UPDATE ON usr_completeness_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: BADGES & GAMIFICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Badge info
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    'early_adopter', 'verified', 'expert', 'contributor', 
    'mentor', 'top_poster', 'helpful', 'connector'
  )),
  badge_level INTEGER DEFAULT 1 CHECK (badge_level >= 1 AND badge_level <= 3), -- Bronze, Silver, Gold
  
  -- Award details
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  awarded_by UUID REFERENCES profiles(id),
  reason TEXT,
  
  -- Display
  is_displayed BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_usr_badges_profile ON usr_badges(profile_id);
CREATE INDEX idx_usr_badges_type ON usr_badges(badge_type);
CREATE INDEX idx_usr_badges_displayed ON usr_badges(profile_id, display_order) WHERE is_displayed = true;

-- =====================================================
-- SECTION 6: USER PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_preferences (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification preferences
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  
  -- Email frequency
  email_frequency TEXT NOT NULL DEFAULT 'instant' CHECK (email_frequency IN ('instant', 'daily', 'weekly', 'never')),
  
  -- Content preferences
  preferred_language TEXT NOT NULL DEFAULT 'en',
  preferred_timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  
  -- Display preferences
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_usr_preferences_updated_at
  BEFORE UPDATE ON usr_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 7: USER ACTIVITY LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type TEXT NOT NULL, -- 'login', 'profile_update', 'post_created', etc.
  activity_data JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  device_type TEXT, -- 'web', 'mobile', 'tablet'
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_activity_profile ON usr_activity(profile_id, created_at DESC);
CREATE INDEX idx_usr_activity_type ON usr_activity(activity_type);
CREATE INDEX idx_usr_activity_created ON usr_activity(created_at DESC);

-- Partition by month for performance (optional, implement later)
-- CREATE TABLE usr_activity_2025_12 PARTITION OF usr_activity
-- FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- =====================================================
-- SECTION 8: HELPER FUNCTIONS
-- =====================================================

-- Create default privacy settings
CREATE OR REPLACE FUNCTION create_default_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO usr_privacy_settings (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_privacy_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_privacy_settings();

-- Create default preferences
CREATE OR REPLACE FUNCTION create_default_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO usr_preferences (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_preferences();

-- Create default completeness check
CREATE OR REPLACE FUNCTION create_default_completeness_check()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO usr_completeness_checks (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_completeness_check
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_completeness_check();

-- Update verification level based on verifications
CREATE OR REPLACE FUNCTION update_profile_verification_level()
RETURNS TRIGGER AS $$
DECLARE
  verification_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO verification_count
  FROM usr_verifications
  WHERE profile_id = NEW.profile_id
    AND status = 'approved';
  
  UPDATE profiles
  SET verification_level = CASE
    WHEN verification_count >= 3 THEN 'trusted'
    WHEN verification_count >= 1 THEN 'verified'
    ELSE 'basic'
  END
  WHERE id = NEW.profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_profile_verification_level
  AFTER INSERT OR UPDATE ON usr_verifications
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION update_profile_verification_level();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE usr_profile_roles IS 'Multi-role system for user profiles';
COMMENT ON TABLE usr_privacy_settings IS 'Privacy settings for user profiles';
COMMENT ON TABLE usr_verifications IS 'Verification requests and status';
COMMENT ON TABLE usr_completeness_checks IS 'Profile completeness tracking';
COMMENT ON TABLE usr_badges IS 'Gamification badges for users';
COMMENT ON TABLE usr_preferences IS 'User preferences and settings';
COMMENT ON TABLE usr_activity IS 'User activity log for analytics';

