-- =====================================================
-- PoultryCo Database Schema
-- File: 11_stats_metrics.sql
-- Description: Statistics and metrics (denormalized for performance)
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: PROFILE STATS
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_stats (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Network
  connections_count INTEGER NOT NULL DEFAULT 0 CHECK (connections_count >= 0),
  followers_count INTEGER NOT NULL DEFAULT 0 CHECK (followers_count >= 0),
  following_count INTEGER NOT NULL DEFAULT 0 CHECK (following_count >= 0),
  
  -- Content
  posts_count INTEGER NOT NULL DEFAULT 0 CHECK (posts_count >= 0),
  comments_count INTEGER NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
  
  -- Engagement
  profile_views_count INTEGER NOT NULL DEFAULT 0 CHECK (profile_views_count >= 0),
  profile_views_this_month INTEGER NOT NULL DEFAULT 0 CHECK (profile_views_this_month >= 0),
  
  -- Skills
  skills_count INTEGER NOT NULL DEFAULT 0 CHECK (skills_count >= 0),
  endorsements_received_count INTEGER NOT NULL DEFAULT 0 CHECK (endorsements_received_count >= 0),
  endorsements_given_count INTEGER NOT NULL DEFAULT 0 CHECK (endorsements_given_count >= 0),
  
  -- Organizations
  organization_memberships_count INTEGER NOT NULL DEFAULT 0 CHECK (organization_memberships_count >= 0),
  
  -- Events
  events_attended_count INTEGER NOT NULL DEFAULT 0 CHECK (events_attended_count >= 0),
  
  -- Timestamp
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_profile_stats_updated_at
  BEFORE UPDATE ON profile_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize profile stats
CREATE OR REPLACE FUNCTION initialize_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_stats (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-initialize stats
CREATE TRIGGER auto_initialize_profile_stats
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_profile_stats();

-- =====================================================
-- SECTION 2: BUSINESS STATS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_stats (
  business_profile_id UUID PRIMARY KEY REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Network
  followers_count INTEGER NOT NULL DEFAULT 0 CHECK (followers_count >= 0),
  team_members_count INTEGER NOT NULL DEFAULT 0 CHECK (team_members_count >= 0),
  
  -- Content
  posts_count INTEGER NOT NULL DEFAULT 0 CHECK (posts_count >= 0),
  
  -- Products
  products_count INTEGER NOT NULL DEFAULT 0 CHECK (products_count >= 0),
  products_views_count INTEGER NOT NULL DEFAULT 0 CHECK (products_views_count >= 0),
  product_inquiries_count INTEGER NOT NULL DEFAULT 0 CHECK (product_inquiries_count >= 0),
  product_reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (product_reviews_count >= 0),
  average_product_rating DECIMAL(2, 1) CHECK (average_product_rating >= 0 AND average_product_rating <= 5),
  
  -- Jobs
  active_jobs_count INTEGER NOT NULL DEFAULT 0 CHECK (active_jobs_count >= 0),
  total_jobs_posted INTEGER NOT NULL DEFAULT 0 CHECK (total_jobs_posted >= 0),
  job_applications_count INTEGER NOT NULL DEFAULT 0 CHECK (job_applications_count >= 0),
  
  -- Engagement
  profile_views_count INTEGER NOT NULL DEFAULT 0 CHECK (profile_views_count >= 0),
  profile_views_this_month INTEGER NOT NULL DEFAULT 0 CHECK (profile_views_this_month >= 0),
  
  -- Timestamp
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_business_stats_updated_at
  BEFORE UPDATE ON business_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize business stats
CREATE OR REPLACE FUNCTION initialize_business_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO business_stats (business_profile_id)
  VALUES (NEW.id)
  ON CONFLICT (business_profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-initialize stats
CREATE TRIGGER auto_initialize_business_stats
  AFTER INSERT ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_business_stats();

-- =====================================================
-- SECTION 3: ORGANIZATION STATS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_stats (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Members
  total_members_count INTEGER NOT NULL DEFAULT 0 CHECK (total_members_count >= 0),
  personal_members_count INTEGER NOT NULL DEFAULT 0 CHECK (personal_members_count >= 0),
  business_members_count INTEGER NOT NULL DEFAULT 0 CHECK (business_members_count >= 0),
  active_members_count INTEGER NOT NULL DEFAULT 0 CHECK (active_members_count >= 0),
  
  -- Membership by Tier
  members_by_tier JSONB DEFAULT '{}'::jsonb,
  
  -- Events
  total_events_count INTEGER NOT NULL DEFAULT 0 CHECK (total_events_count >= 0),
  upcoming_events_count INTEGER NOT NULL DEFAULT 0 CHECK (upcoming_events_count >= 0),
  completed_events_count INTEGER NOT NULL DEFAULT 0 CHECK (completed_events_count >= 0),
  total_event_registrations INTEGER NOT NULL DEFAULT 0 CHECK (total_event_registrations >= 0),
  
  -- Content
  posts_count INTEGER NOT NULL DEFAULT 0 CHECK (posts_count >= 0),
  resources_count INTEGER NOT NULL DEFAULT 0 CHECK (resources_count >= 0),
  announcements_count INTEGER NOT NULL DEFAULT 0 CHECK (announcements_count >= 0),
  
  -- Engagement
  profile_views_count INTEGER NOT NULL DEFAULT 0 CHECK (profile_views_count >= 0),
  profile_views_this_month INTEGER NOT NULL DEFAULT 0 CHECK (profile_views_this_month >= 0),
  followers_count INTEGER NOT NULL DEFAULT 0 CHECK (followers_count >= 0),
  
  -- Timestamp
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_organization_stats_updated_at
  BEFORE UPDATE ON organization_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize organization stats
CREATE OR REPLACE FUNCTION initialize_organization_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO organization_stats (organization_id)
  VALUES (NEW.id)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-initialize stats
CREATE TRIGGER auto_initialize_organization_stats
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION initialize_organization_stats();

-- =====================================================
-- SECTION 4: HELPER FUNCTIONS TO UPDATE STATS
-- =====================================================

-- Refresh profile stats
CREATE OR REPLACE FUNCTION refresh_profile_stats(p_profile_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profile_stats SET
    connections_count = (
      SELECT COUNT(*) FROM connections 
      WHERE (profile_id_1 = p_profile_id OR profile_id_2 = p_profile_id) 
      AND status = 'connected'
    ),
    followers_count = (
      SELECT COUNT(*) FROM follows 
      WHERE following_type = 'profile' AND following_id = p_profile_id
    ),
    following_count = (
      SELECT COUNT(*) FROM follows 
      WHERE follower_id = p_profile_id
    ),
    skills_count = (
      SELECT COUNT(*) FROM profile_skills WHERE profile_id = p_profile_id
    ),
    endorsements_received_count = (
      SELECT COUNT(*) FROM skill_endorsements se
      JOIN profile_skills ps ON se.profile_skill_id = ps.id
      WHERE ps.profile_id = p_profile_id
    ),
    endorsements_given_count = (
      SELECT COUNT(*) FROM skill_endorsements WHERE endorsed_by = p_profile_id
    ),
    organization_memberships_count = (
      SELECT COUNT(*) FROM organization_members 
      WHERE member_type = 'personal' AND member_id = p_profile_id AND membership_status = 'active'
    ),
    events_attended_count = (
      SELECT COUNT(*) FROM organization_event_registrations 
      WHERE attendee_profile_id = p_profile_id AND registration_status IN ('confirmed', 'attended')
    ),
    last_updated_at = NOW()
  WHERE profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Refresh business stats
CREATE OR REPLACE FUNCTION refresh_business_stats(p_business_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE business_stats SET
    followers_count = (
      SELECT COUNT(*) FROM follows 
      WHERE following_type = 'business' AND following_id = p_business_id
    ),
    team_members_count = (
      SELECT COUNT(*) FROM business_team_members WHERE business_profile_id = p_business_id
    ),
    products_count = (
      SELECT COUNT(*) FROM business_products 
      WHERE business_profile_id = p_business_id AND is_published = true
    ),
    product_reviews_count = (
      SELECT COUNT(*) FROM product_reviews pr
      JOIN business_products bp ON pr.product_id = bp.id
      WHERE bp.business_profile_id = p_business_id AND pr.is_approved = true
    ),
    average_product_rating = (
      SELECT AVG(pr.rating)::DECIMAL(2,1) FROM product_reviews pr
      JOIN business_products bp ON pr.product_id = bp.id
      WHERE bp.business_profile_id = p_business_id AND pr.is_approved = true
    ),
    active_jobs_count = (
      SELECT COUNT(*) FROM business_jobs 
      WHERE business_profile_id = p_business_id AND is_active = true
    ),
    last_updated_at = NOW()
  WHERE business_profile_id = p_business_id;
END;
$$ LANGUAGE plpgsql;

-- Refresh organization stats
CREATE OR REPLACE FUNCTION refresh_organization_stats(p_org_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE organization_stats SET
    total_members_count = (
      SELECT COUNT(*) FROM organization_members 
      WHERE organization_id = p_org_id AND membership_status = 'active'
    ),
    personal_members_count = (
      SELECT COUNT(*) FROM organization_members 
      WHERE organization_id = p_org_id AND member_type = 'personal' AND membership_status = 'active'
    ),
    business_members_count = (
      SELECT COUNT(*) FROM organization_members 
      WHERE organization_id = p_org_id AND member_type = 'business' AND membership_status = 'active'
    ),
    total_events_count = (
      SELECT COUNT(*) FROM organization_events WHERE organization_id = p_org_id
    ),
    upcoming_events_count = (
      SELECT COUNT(*) FROM organization_events 
      WHERE organization_id = p_org_id 
      AND start_date >= CURRENT_DATE 
      AND event_status IN ('published', 'registration_open')
    ),
    completed_events_count = (
      SELECT COUNT(*) FROM organization_events 
      WHERE organization_id = p_org_id AND event_status = 'completed'
    ),
    followers_count = (
      SELECT COUNT(*) FROM follows 
      WHERE following_type = 'organization' AND following_id = p_org_id
    ),
    last_updated_at = NOW()
  WHERE organization_id = p_org_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profile_stats IS 'Denormalized statistics for profiles (updated via triggers and periodic jobs)';
COMMENT ON TABLE business_stats IS 'Denormalized statistics for business profiles';
COMMENT ON TABLE organization_stats IS 'Denormalized statistics for organizations';

COMMENT ON FUNCTION refresh_profile_stats IS 'Recalculates all statistics for a profile';
COMMENT ON FUNCTION refresh_business_stats IS 'Recalculates all statistics for a business';
COMMENT ON FUNCTION refresh_organization_stats IS 'Recalculates all statistics for an organization';

-- =====================================================
-- END OF FILE
-- =====================================================

