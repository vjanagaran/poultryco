-- =====================================================
-- PoultryCo Database Schema
-- File: 09_privacy_verification_gamification.sql
-- Description: Privacy settings, verification system, gamification
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: PROFILE PRIVACY SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_privacy_settings (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Contact Visibility
  phone_visible_to TEXT NOT NULL DEFAULT 'connections' CHECK (phone_visible_to IN ('public', 'connections', 'nobody')),
  email_visible_to TEXT NOT NULL DEFAULT 'connections' CHECK (email_visible_to IN ('public', 'connections', 'nobody')),
  whatsapp_visible_to TEXT NOT NULL DEFAULT 'connections' CHECK (whatsapp_visible_to IN ('public', 'connections', 'nobody')),
  
  -- Profile Visibility
  show_in_search BOOLEAN NOT NULL DEFAULT true,
  show_to_non_members BOOLEAN NOT NULL DEFAULT true,
  show_connections_list BOOLEAN NOT NULL DEFAULT true,
  show_endorsements BOOLEAN NOT NULL DEFAULT true,
  
  -- Communication
  allow_connection_requests BOOLEAN NOT NULL DEFAULT true,
  allow_message_requests BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_profile_privacy_settings_updated_at
  BEFORE UPDATE ON profile_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create default privacy settings for new profiles
CREATE OR REPLACE FUNCTION create_default_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_privacy_settings (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create privacy settings
CREATE TRIGGER auto_create_privacy_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_privacy_settings();

-- =====================================================
-- SECTION 2: PROFILE VERIFICATION SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Verification Type
  verification_type TEXT NOT NULL CHECK (verification_type IN (
    'phone', 'email', 'government_id', 'vet_license', 
    'business_registration', 'address', 'photo_id', 
    'educational_certificate', 'professional_license'
  )),
  
  -- Status
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'verified', 'rejected', 'expired'
  )),
  
  -- Document
  document_url TEXT,
  document_number TEXT,
  
  -- Review
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Rejection
  rejection_reason TEXT,
  
  -- Admin Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_verifications_profile ON profile_verifications(profile_id);
CREATE INDEX idx_verifications_type ON profile_verifications(verification_type);
CREATE INDEX idx_verifications_status ON profile_verifications(verification_status);
CREATE INDEX idx_verifications_expires ON profile_verifications(expires_at);
CREATE INDEX idx_verifications_created ON profile_verifications(created_at DESC);

-- Trigger
CREATE TRIGGER update_profile_verifications_updated_at
  BEFORE UPDATE ON profile_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update profile verification level
CREATE OR REPLACE FUNCTION update_profile_verification_level()
RETURNS TRIGGER AS $$
DECLARE
  has_phone BOOLEAN;
  has_email BOOLEAN;
  has_gov_id BOOLEAN;
  has_professional BOOLEAN;
  new_level TEXT;
BEGIN
  -- Check verifications for this profile
  SELECT 
    EXISTS(SELECT 1 FROM profile_verifications WHERE profile_id = NEW.profile_id AND verification_type = 'phone' AND verification_status = 'verified'),
    EXISTS(SELECT 1 FROM profile_verifications WHERE profile_id = NEW.profile_id AND verification_type = 'email' AND verification_status = 'verified'),
    EXISTS(SELECT 1 FROM profile_verifications WHERE profile_id = NEW.profile_id AND verification_type = 'government_id' AND verification_status = 'verified'),
    EXISTS(SELECT 1 FROM profile_verifications WHERE profile_id = NEW.profile_id AND verification_type IN ('vet_license', 'business_registration', 'professional_license') AND verification_status = 'verified')
  INTO has_phone, has_email, has_gov_id, has_professional;
  
  -- Determine verification level
  IF has_phone AND has_email AND has_gov_id AND has_professional THEN
    new_level := 'trusted';
  ELSIF has_phone AND has_email AND has_gov_id THEN
    new_level := 'verified';
  ELSE
    new_level := 'basic';
  END IF;
  
  -- Update profile
  UPDATE profiles
  SET verification_level = new_level
  WHERE id = NEW.profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update verification level when verification changes
CREATE TRIGGER update_verification_level_on_change
  AFTER INSERT OR UPDATE ON profile_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_verification_level();

-- =====================================================
-- SECTION 3: PROFILE COMPLETENESS TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_completeness_checks (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Info (40%)
  has_profile_photo BOOLEAN NOT NULL DEFAULT false,
  has_headline BOOLEAN NOT NULL DEFAULT false,
  has_bio BOOLEAN NOT NULL DEFAULT false,
  has_location BOOLEAN NOT NULL DEFAULT false,
  has_phone_verified BOOLEAN NOT NULL DEFAULT false,
  has_email_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- Professional Info (40%)
  has_roles BOOLEAN NOT NULL DEFAULT false,
  has_experience BOOLEAN NOT NULL DEFAULT false,
  has_education BOOLEAN NOT NULL DEFAULT false,
  has_skills BOOLEAN NOT NULL DEFAULT false, -- At least 3 skills
  
  -- Network & Engagement (20%)
  has_connections BOOLEAN NOT NULL DEFAULT false, -- At least 5 connections
  has_organization_membership BOOLEAN NOT NULL DEFAULT false,
  has_endorsements BOOLEAN NOT NULL DEFAULT false,
  
  -- Calculated Strength
  profile_strength INTEGER NOT NULL DEFAULT 0 CHECK (profile_strength >= 0 AND profile_strength <= 100),
  
  -- Timestamp
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to calculate profile strength
CREATE OR REPLACE FUNCTION calculate_profile_strength(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  checks RECORD;
  strength INTEGER := 0;
BEGIN
  -- Get all checks
  SELECT * INTO checks FROM profile_completeness_checks WHERE profile_id = p_profile_id;
  
  IF checks IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Basic Info (40%)
  IF checks.has_profile_photo THEN strength := strength + 10; END IF;
  IF checks.has_headline THEN strength := strength + 5; END IF;
  IF checks.has_bio THEN strength := strength + 10; END IF;
  IF checks.has_location THEN strength := strength + 5; END IF;
  IF checks.has_phone_verified THEN strength := strength + 5; END IF;
  IF checks.has_email_verified THEN strength := strength + 5; END IF;
  
  -- Professional Info (40%)
  IF checks.has_roles THEN strength := strength + 10; END IF;
  IF checks.has_experience THEN strength := strength + 10; END IF;
  IF checks.has_education THEN strength := strength + 10; END IF;
  IF checks.has_skills THEN strength := strength + 10; END IF;
  
  -- Network & Engagement (20%)
  IF checks.has_connections THEN strength := strength + 10; END IF;
  IF checks.has_organization_membership THEN strength := strength + 5; END IF;
  IF checks.has_endorsements THEN strength := strength + 5; END IF;
  
  RETURN LEAST(strength, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update profile completeness
CREATE OR REPLACE FUNCTION update_profile_completeness(p_profile_id UUID)
RETURNS VOID AS $$
DECLARE
  v_strength INTEGER;
BEGIN
  -- Insert or update checks
  INSERT INTO profile_completeness_checks (profile_id)
  VALUES (p_profile_id)
  ON CONFLICT (profile_id) DO UPDATE SET last_calculated_at = NOW();
  
  -- Update individual checks
  UPDATE profile_completeness_checks SET
    has_profile_photo = EXISTS(SELECT 1 FROM profiles WHERE id = p_profile_id AND profile_photo_url IS NOT NULL),
    has_headline = EXISTS(SELECT 1 FROM profiles WHERE id = p_profile_id AND headline IS NOT NULL AND headline != ''),
    has_bio = EXISTS(SELECT 1 FROM profiles WHERE id = p_profile_id AND bio IS NOT NULL AND bio != ''),
    has_location = EXISTS(SELECT 1 FROM profiles WHERE id = p_profile_id AND location_state IS NOT NULL),
    has_phone_verified = EXISTS(SELECT 1 FROM profiles WHERE id = p_profile_id AND phone_verified = true),
    has_email_verified = EXISTS(SELECT 1 FROM profiles WHERE id = p_profile_id AND email_verified = true),
    has_roles = EXISTS(SELECT 1 FROM profile_roles WHERE profile_id = p_profile_id),
    has_experience = EXISTS(SELECT 1 FROM profile_experience WHERE profile_id = p_profile_id),
    has_education = EXISTS(SELECT 1 FROM profile_education WHERE profile_id = p_profile_id),
    has_skills = (SELECT COUNT(*) FROM profile_skills WHERE profile_id = p_profile_id) >= 3,
    has_connections = (SELECT COUNT(*) FROM connections WHERE (profile_id_1 = p_profile_id OR profile_id_2 = p_profile_id) AND status = 'connected') >= 5,
    has_organization_membership = EXISTS(SELECT 1 FROM organization_members WHERE member_type = 'personal' AND member_id = p_profile_id AND membership_status = 'active'),
    has_endorsements = EXISTS(SELECT 1 FROM skill_endorsements se JOIN profile_skills ps ON se.profile_skill_id = ps.id WHERE ps.profile_id = p_profile_id),
    last_calculated_at = NOW()
  WHERE profile_id = p_profile_id;
  
  -- Calculate strength
  v_strength := calculate_profile_strength(p_profile_id);
  
  -- Update completeness table
  UPDATE profile_completeness_checks
  SET profile_strength = v_strength
  WHERE profile_id = p_profile_id;
  
  -- Update profiles table
  UPDATE profiles
  SET profile_strength = v_strength
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 4: PROFILE BADGES & ACHIEVEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Badge
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    -- Community Badges
    'early_adopter', 'founding_member', 'active_contributor', 
    'helpful_expert', 'community_leader',
    -- Profile Badges
    'profile_complete', 'verified_professional', 'trusted_member',
    -- Network Badges
    'well_connected', 'super_connector', 'organization_member', 'multi_organization',
    -- Role Badges
    'certified_vet', 'experienced_farmer', 'industry_expert',
    -- Engagement Badges
    'question_master', 'answer_champion', 'skill_endorser', 'event_attendee'
  )),
  
  badge_level TEXT CHECK (badge_level IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- Status
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = permanent
  
  -- Display
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Unique badge per profile
  UNIQUE(profile_id, badge_type)
);

-- Indexes
CREATE INDEX idx_badges_profile ON profile_badges(profile_id);
CREATE INDEX idx_badges_type ON profile_badges(badge_type);
CREATE INDEX idx_badges_visible ON profile_badges(is_visible);
CREATE INDEX idx_badges_earned ON profile_badges(earned_at DESC);

-- Function to award badge
CREATE OR REPLACE FUNCTION award_badge(
  p_profile_id UUID,
  p_badge_type TEXT,
  p_badge_level TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profile_badges (profile_id, badge_type, badge_level)
  VALUES (p_profile_id, p_badge_type, p_badge_level)
  ON CONFLICT (profile_id, badge_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award automatic badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_profile_id UUID)
RETURNS VOID AS $$
DECLARE
  v_profile_strength INTEGER;
  v_connections_count INTEGER;
  v_org_memberships_count INTEGER;
  v_verification_level TEXT;
BEGIN
  -- Get profile data
  SELECT profile_strength, verification_level INTO v_profile_strength, v_verification_level
  FROM profiles WHERE id = p_profile_id;
  
  -- Get counts
  SELECT COUNT(*) INTO v_connections_count
  FROM connections
  WHERE (profile_id_1 = p_profile_id OR profile_id_2 = p_profile_id) AND status = 'connected';
  
  SELECT COUNT(*) INTO v_org_memberships_count
  FROM organization_members
  WHERE member_type = 'personal' AND member_id = p_profile_id AND membership_status = 'active';
  
  -- Award profile badges
  IF v_profile_strength >= 100 THEN
    PERFORM award_badge(p_profile_id, 'profile_complete');
  END IF;
  
  IF v_verification_level = 'trusted' THEN
    PERFORM award_badge(p_profile_id, 'verified_professional');
    PERFORM award_badge(p_profile_id, 'trusted_member');
  END IF;
  
  -- Award network badges
  IF v_connections_count >= 50 THEN
    PERFORM award_badge(p_profile_id, 'well_connected');
  END IF;
  
  IF v_connections_count >= 200 THEN
    PERFORM award_badge(p_profile_id, 'super_connector');
  END IF;
  
  IF v_org_memberships_count >= 1 THEN
    PERFORM award_badge(p_profile_id, 'organization_member');
  END IF;
  
  IF v_org_memberships_count >= 3 THEN
    PERFORM award_badge(p_profile_id, 'multi_organization');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profile_privacy_settings IS 'Granular privacy controls for profile information visibility';
COMMENT ON TABLE profile_verifications IS 'Multi-level verification system with document upload and admin review';
COMMENT ON TABLE profile_completeness_checks IS 'Gamification tracking for profile completion with detailed checklist';
COMMENT ON TABLE profile_badges IS 'Achievement badges for engagement and milestones';

COMMENT ON FUNCTION update_profile_completeness IS 'Recalculates all completeness checks and profile strength score';
COMMENT ON FUNCTION award_badge IS 'Awards a badge to a profile (idempotent - no duplicates)';
COMMENT ON FUNCTION check_and_award_badges IS 'Automatically checks and awards applicable badges';

-- =====================================================
-- END OF FILE
-- =====================================================

