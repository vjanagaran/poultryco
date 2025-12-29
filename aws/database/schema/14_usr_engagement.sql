-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 14_usr_engagement.sql
-- Description: User statistics and metrics
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 10_usr_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: PROFILE STATISTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_stats (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Network stats
  connections_count INTEGER NOT NULL DEFAULT 0,
  followers_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  
  -- Content stats
  posts_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  likes_given_count INTEGER NOT NULL DEFAULT 0,
  likes_received_count INTEGER NOT NULL DEFAULT 0,
  
  -- Engagement stats
  profile_views_count INTEGER NOT NULL DEFAULT 0,
  search_appearances_count INTEGER NOT NULL DEFAULT 0,
  
  -- Professional stats
  endorsements_received_count INTEGER NOT NULL DEFAULT 0,
  recommendations_received_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_stats_connections ON usr_stats(connections_count DESC);
CREATE INDEX idx_usr_stats_followers ON usr_stats(followers_count DESC);
CREATE INDEX idx_usr_stats_posts ON usr_stats(posts_count DESC);
CREATE INDEX idx_usr_stats_engagement ON usr_stats(likes_received_count DESC);

-- =====================================================
-- SECTION 2: PROFILE VIEWS TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- View context
  view_source TEXT, -- 'search', 'discovery', 'post', 'direct', etc.
  referrer_url TEXT,
  
  -- Viewer info (for anonymous views)
  viewer_ip INET,
  viewer_user_agent TEXT,
  
  -- Timestamp
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_profile_views_profile ON usr_profile_views(profile_id, viewed_at DESC);
CREATE INDEX idx_usr_profile_views_viewer ON usr_profile_views(viewer_id, viewed_at DESC);
CREATE INDEX idx_usr_profile_views_date ON usr_profile_views(viewed_at DESC);

-- Partition by month for performance (implement later)
-- CREATE TABLE usr_profile_views_2025_12 PARTITION OF usr_profile_views
-- FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- =====================================================
-- SECTION 3: SEARCH ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_search_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Search details
  search_query TEXT,
  search_filters JSONB,
  
  -- Position
  search_position INTEGER,
  
  -- Action taken
  was_clicked BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamp
  appeared_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usr_search_appearances_profile ON usr_search_appearances(profile_id, appeared_at DESC);
CREATE INDEX idx_usr_search_appearances_clicked ON usr_search_appearances(was_clicked, appeared_at DESC) WHERE was_clicked = true;
CREATE INDEX idx_usr_search_appearances_date ON usr_search_appearances(appeared_at DESC);

-- =====================================================
-- SECTION 4: ENGAGEMENT ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_engagement_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Date
  date DATE NOT NULL,
  
  -- Daily metrics
  profile_views INTEGER NOT NULL DEFAULT 0,
  search_appearances INTEGER NOT NULL DEFAULT 0,
  post_impressions INTEGER NOT NULL DEFAULT 0,
  post_engagements INTEGER NOT NULL DEFAULT 0,
  
  -- Network growth
  new_connections INTEGER NOT NULL DEFAULT 0,
  new_followers INTEGER NOT NULL DEFAULT 0,
  
  -- Content activity
  posts_created INTEGER NOT NULL DEFAULT 0,
  comments_made INTEGER NOT NULL DEFAULT 0,
  
  UNIQUE(profile_id, date)
);

CREATE INDEX idx_usr_engagement_analytics_profile_date ON usr_engagement_analytics(profile_id, date DESC);
CREATE INDEX idx_usr_engagement_analytics_date ON usr_engagement_analytics(date DESC);

-- =====================================================
-- SECTION 5: LEADERBOARDS (Future feature)
-- =====================================================

CREATE TABLE IF NOT EXISTS usr_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Leaderboard type
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN (
    'top_contributors', 'top_experts', 'most_helpful', 'most_connected', 'rising_stars'
  )),
  
  -- Period
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Rankings
  rankings JSONB NOT NULL, -- Array of {profile_id, score, rank}
  
  -- Timestamps
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(leaderboard_type, period, period_start)
);

CREATE INDEX idx_usr_leaderboards_type_period ON usr_leaderboards(leaderboard_type, period, period_start DESC);

-- =====================================================
-- SECTION 6: HELPER FUNCTIONS
-- =====================================================

-- Refresh profile stats
CREATE OR REPLACE FUNCTION refresh_usr_stats(p_profile_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO usr_stats (profile_id)
  VALUES (p_profile_id)
  ON CONFLICT (profile_id) DO UPDATE SET
    connections_count = (
      SELECT COUNT(*) FROM soc_connections 
      WHERE (user_id = p_profile_id OR connected_user_id = p_profile_id) 
        AND status = 'accepted'
    ),
    followers_count = (
      SELECT COUNT(*) FROM soc_follows WHERE followed_id = p_profile_id
    ),
    following_count = (
      SELECT COUNT(*) FROM soc_follows WHERE follower_id = p_profile_id
    ),
    posts_count = (
      SELECT COUNT(*) FROM soc_posts WHERE author_id = p_profile_id
    ),
    profile_views_count = (
      SELECT COUNT(*) FROM usr_profile_views WHERE profile_id = p_profile_id
    ),
    endorsements_received_count = (
      SELECT COUNT(*) 
      FROM usr_skill_endorsements e
      JOIN usr_profile_skills ps ON e.profile_skill_id = ps.id
      WHERE ps.profile_id = p_profile_id
    ),
    last_updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Track profile view
CREATE OR REPLACE FUNCTION track_profile_view(
  p_profile_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_view_source TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert view record
  INSERT INTO usr_profile_views (profile_id, viewer_id, view_source)
  VALUES (p_profile_id, p_viewer_id, p_view_source);
  
  -- Update stats
  UPDATE usr_stats
  SET 
    profile_views_count = profile_views_count + 1,
    last_updated_at = NOW()
  WHERE profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Get profile analytics summary
CREATE OR REPLACE FUNCTION get_profile_analytics(
  p_profile_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_views INTEGER,
  total_searches INTEGER,
  new_connections INTEGER,
  new_followers INTEGER,
  posts_created INTEGER,
  avg_daily_views DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(profile_views), 0)::INTEGER,
    COALESCE(SUM(search_appearances), 0)::INTEGER,
    COALESCE(SUM(new_connections), 0)::INTEGER,
    COALESCE(SUM(new_followers), 0)::INTEGER,
    COALESCE(SUM(posts_created), 0)::INTEGER,
    COALESCE(AVG(profile_views), 0)::DECIMAL
  FROM usr_engagement_analytics
  WHERE profile_id = p_profile_id
    AND date >= CURRENT_DATE - p_days;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE usr_stats IS 'Aggregated statistics for user profiles';
COMMENT ON TABLE usr_profile_views IS 'Profile view tracking';
COMMENT ON TABLE usr_search_appearances IS 'Search result appearance tracking';
COMMENT ON TABLE usr_engagement_analytics IS 'Daily engagement metrics';
COMMENT ON TABLE usr_leaderboards IS 'Leaderboard rankings by category and period';
COMMENT ON FUNCTION refresh_usr_stats IS 'Recalculate all statistics for a profile';
COMMENT ON FUNCTION track_profile_view IS 'Track a profile view event';
COMMENT ON FUNCTION get_profile_analytics IS 'Get analytics summary for a profile';

