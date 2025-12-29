-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 90_anl_core.sql
-- Description: Analytics and tracking system
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: PROFILE VIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS anl_profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Viewed profile (polymorphic)
  viewed_type TEXT NOT NULL CHECK (viewed_type IN ('individual', 'business', 'organization')),
  viewed_id UUID NOT NULL,
  
  -- Viewer
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Session
  session_id TEXT,
  
  -- Metadata
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anl_profile_views_viewed ON anl_profile_views(viewed_type, viewed_id);
CREATE INDEX idx_anl_profile_views_viewer ON anl_profile_views(viewer_id);
CREATE INDEX idx_anl_profile_views_created ON anl_profile_views(created_at DESC);

-- =====================================================
-- SECTION 2: SEARCH QUERIES
-- =====================================================

CREATE TABLE IF NOT EXISTS anl_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Query
  query_text TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('people', 'businesses', 'organizations', 'posts', 'events', 'resources', 'all')),
  
  -- Results
  results_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  filters JSONB,
  session_id TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anl_search_queries_profile ON anl_search_queries(profile_id);
CREATE INDEX idx_anl_search_queries_type ON anl_search_queries(search_type);
CREATE INDEX idx_anl_search_queries_created ON anl_search_queries(created_at DESC);
CREATE INDEX idx_anl_search_queries_text ON anl_search_queries USING gin(to_tsvector('english', query_text));

-- =====================================================
-- SECTION 3: USER ACTIVITY LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS anl_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Activity
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'login', 'logout',
    'profile_update', 'profile_view',
    'post_create', 'post_like', 'post_comment', 'post_share',
    'connection_request', 'connection_accept',
    'message_send',
    'event_create', 'event_rsvp',
    'resource_view', 'resource_like',
    'search',
    'other'
  )),
  
  -- Target (optional)
  target_type TEXT,
  target_id UUID,
  
  -- Metadata
  metadata JSONB,
  
  -- Session
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anl_activity_log_profile ON anl_activity_log(profile_id, created_at DESC);
CREATE INDEX idx_anl_activity_log_type ON anl_activity_log(activity_type);
CREATE INDEX idx_anl_activity_log_target ON anl_activity_log(target_type, target_id);
CREATE INDEX idx_anl_activity_log_created ON anl_activity_log(created_at DESC);

-- Partition by month for performance
-- CREATE TABLE anl_activity_log_y2025m12 PARTITION OF anl_activity_log
--   FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- =====================================================
-- SECTION 4: ENGAGEMENT METRICS (Aggregated)
-- =====================================================

CREATE TABLE IF NOT EXISTS anl_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity (polymorphic)
  entity_type TEXT NOT NULL CHECK (entity_type IN ('individual', 'business', 'organization', 'post', 'event', 'resource')),
  entity_id UUID NOT NULL,
  
  -- Date
  metric_date DATE NOT NULL,
  
  -- Metrics
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  
  -- Engagement rate
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(entity_type, entity_id, metric_date)
);

CREATE INDEX idx_anl_engagement_metrics_entity ON anl_engagement_metrics(entity_type, entity_id);
CREATE INDEX idx_anl_engagement_metrics_date ON anl_engagement_metrics(metric_date DESC);
CREATE INDEX idx_anl_engagement_metrics_rate ON anl_engagement_metrics(engagement_rate DESC);

CREATE TRIGGER update_anl_engagement_metrics_updated_at
  BEFORE UPDATE ON anl_engagement_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: PLATFORM METRICS (Daily Aggregates)
-- =====================================================

CREATE TABLE IF NOT EXISTS anl_platform_metrics (
  metric_date DATE PRIMARY KEY,
  
  -- Users
  total_users INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  new_users INTEGER NOT NULL DEFAULT 0,
  
  -- Profiles
  total_profiles INTEGER NOT NULL DEFAULT 0,
  total_businesses INTEGER NOT NULL DEFAULT 0,
  total_organizations INTEGER NOT NULL DEFAULT 0,
  
  -- Content
  total_posts INTEGER NOT NULL DEFAULT 0,
  new_posts INTEGER NOT NULL DEFAULT 0,
  total_events INTEGER NOT NULL DEFAULT 0,
  new_events INTEGER NOT NULL DEFAULT 0,
  total_resources INTEGER NOT NULL DEFAULT 0,
  new_resources INTEGER NOT NULL DEFAULT 0,
  
  -- Engagement
  total_connections INTEGER NOT NULL DEFAULT 0,
  new_connections INTEGER NOT NULL DEFAULT 0,
  total_messages INTEGER NOT NULL DEFAULT 0,
  new_messages INTEGER NOT NULL DEFAULT 0,
  
  -- Activity
  total_logins INTEGER NOT NULL DEFAULT 0,
  total_searches INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anl_platform_metrics_date ON anl_platform_metrics(metric_date DESC);

CREATE TRIGGER update_anl_platform_metrics_updated_at
  BEFORE UPDATE ON anl_platform_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 6: REFERRAL TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS anl_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referrer
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Referred user
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Referral code
  referral_code TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  
  -- Reward
  reward_type TEXT,
  reward_amount DECIMAL(10, 2),
  
  -- Timestamps
  referred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ
);

CREATE INDEX idx_anl_referrals_referrer ON anl_referrals(referrer_id);
CREATE INDEX idx_anl_referrals_referred ON anl_referrals(referred_id);
CREATE INDEX idx_anl_referrals_code ON anl_referrals(referral_code);
CREATE INDEX idx_anl_referrals_status ON anl_referrals(status);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE anl_profile_views IS 'Profile view tracking';
COMMENT ON TABLE anl_search_queries IS 'Search query tracking';
COMMENT ON TABLE anl_activity_log IS 'User activity log';
COMMENT ON TABLE anl_engagement_metrics IS 'Aggregated engagement metrics';
COMMENT ON TABLE anl_platform_metrics IS 'Daily platform-wide metrics';
COMMENT ON TABLE anl_referrals IS 'Referral tracking';

