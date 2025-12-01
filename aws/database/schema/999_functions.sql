-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 999_functions.sql
-- Description: Comprehensive PostgreSQL functions and views
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: All previous schema files
-- =====================================================

-- =====================================================
-- SECTION 1: SLUG GENERATION FUNCTIONS
-- =====================================================

-- Generate unique slug for profiles
CREATE OR REPLACE FUNCTION generate_unique_slug(base_text TEXT, table_name TEXT, column_name TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
  final_slug TEXT;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  slug := lower(regexp_replace(base_text, '[^a-zA-Z0-9]+', '-', 'g'));
  slug := trim(both '-' from slug);
  
  final_slug := slug;
  
  -- Check for uniqueness and append counter if needed
  LOOP
    EXECUTE format('SELECT 1 FROM %I WHERE %I = $1', table_name, column_name)
    USING final_slug;
    
    IF NOT FOUND THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 2: PROFILE STRENGTH CALCULATION
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_profile_strength(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  strength INTEGER := 0;
  profile_rec RECORD;
BEGIN
  SELECT * INTO profile_rec FROM profiles WHERE id = p_profile_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Basic info (40 points)
  IF profile_rec.full_name IS NOT NULL AND length(profile_rec.full_name) > 0 THEN
    strength := strength + 5;
  END IF;
  
  IF profile_rec.profile_photo_url IS NOT NULL THEN
    strength := strength + 10;
  END IF;
  
  IF profile_rec.headline IS NOT NULL AND length(profile_rec.headline) > 0 THEN
    strength := strength + 10;
  END IF;
  
  IF profile_rec.bio IS NOT NULL AND length(profile_rec.bio) > 50 THEN
    strength := strength + 10;
  END IF;
  
  IF profile_rec.phone IS NOT NULL THEN
    strength := strength + 5;
  END IF;
  
  -- Roles (10 points)
  IF EXISTS (SELECT 1 FROM usr_profile_roles WHERE profile_id = p_profile_id) THEN
    strength := strength + 10;
  END IF;
  
  -- Professional info (20 points)
  IF EXISTS (SELECT 1 FROM usr_experiences WHERE profile_id = p_profile_id) THEN
    strength := strength + 10;
  END IF;
  
  IF EXISTS (SELECT 1 FROM usr_education WHERE profile_id = p_profile_id) THEN
    strength := strength + 10;
  END IF;
  
  -- Skills (10 points)
  IF EXISTS (SELECT 1 FROM usr_profile_skills WHERE profile_id = p_profile_id LIMIT 3) THEN
    strength := strength + 10;
  END IF;
  
  -- Connections (10 points)
  IF profile_rec.connections_count >= 10 THEN
    strength := strength + 10;
  ELSIF profile_rec.connections_count >= 5 THEN
    strength := strength + 5;
  END IF;
  
  -- Verification (10 points)
  IF profile_rec.verification_level = 'trusted' THEN
    strength := strength + 10;
  ELSIF profile_rec.verification_level = 'verified' THEN
    strength := strength + 5;
  END IF;
  
  RETURN LEAST(strength, 100);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 3: FEED GENERATION FUNCTIONS
-- =====================================================

-- Get personalized feed for a user
CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_profile_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  author_type TEXT,
  author_id UUID,
  content TEXT,
  post_type TEXT,
  created_at TIMESTAMPTZ,
  likes_count INTEGER,
  comments_count INTEGER,
  relevance_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id,
    sp.author_type,
    sp.author_id,
    sp.content,
    sp.post_type,
    sp.created_at,
    sp.likes_count,
    sp.comments_count,
    -- Simple relevance scoring
    CASE
      -- Own posts
      WHEN sp.author_type = 'individual' AND sp.author_id = p_profile_id THEN 1.0
      -- Posts from connections
      WHEN sp.author_type = 'individual' AND EXISTS (
        SELECT 1 FROM soc_connections sc
        WHERE sc.status = 'accepted'
        AND ((sc.profile_id_1 = p_profile_id AND sc.profile_id_2 = sp.author_id)
          OR (sc.profile_id_2 = p_profile_id AND sc.profile_id_1 = sp.author_id))
      ) THEN 0.9
      -- Posts from followed entities
      WHEN EXISTS (
        SELECT 1 FROM soc_follows sf
        WHERE sf.follower_type = 'individual'
        AND sf.follower_id = p_profile_id
        AND sf.following_type = sp.author_type
        AND sf.following_id = sp.author_id
      ) THEN 0.8
      -- Public posts
      ELSE 0.5
    END AS relevance_score
  FROM soc_posts sp
  WHERE sp.is_deleted = false
    AND sp.visibility = 'public'
    AND sp.created_at > NOW() - INTERVAL '30 days'
  ORDER BY relevance_score DESC, sp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 4: SEARCH FUNCTIONS
-- =====================================================

-- Search profiles
CREATE OR REPLACE FUNCTION search_profiles(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  profile_slug TEXT,
  headline TEXT,
  profile_photo_url TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.profile_slug,
    p.headline,
    p.profile_photo_url,
    ts_rank(
      to_tsvector('english', p.full_name || ' ' || COALESCE(p.headline, '') || ' ' || COALESCE(p.bio, '')),
      plainto_tsquery('english', p_query)
    ) AS rank
  FROM profiles p
  WHERE to_tsvector('english', p.full_name || ' ' || COALESCE(p.headline, '') || ' ' || COALESCE(p.bio, ''))
    @@ plainto_tsquery('english', p_query)
    AND p.is_public = true
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 5: RECOMMENDATION FUNCTIONS
-- =====================================================

-- Get connection recommendations
CREATE OR REPLACE FUNCTION get_connection_recommendations(
  p_profile_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  recommended_profile_id UUID,
  full_name TEXT,
  profile_slug TEXT,
  headline TEXT,
  profile_photo_url TEXT,
  mutual_connections_count INTEGER,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH my_connections AS (
    SELECT
      CASE
        WHEN profile_id_1 = p_profile_id THEN profile_id_2
        ELSE profile_id_1
      END AS connection_id
    FROM soc_connections
    WHERE status = 'accepted'
      AND (profile_id_1 = p_profile_id OR profile_id_2 = p_profile_id)
  ),
  second_degree AS (
    SELECT
      CASE
        WHEN sc.profile_id_1 = mc.connection_id THEN sc.profile_id_2
        ELSE sc.profile_id_1
      END AS profile_id,
      COUNT(*) AS mutual_count
    FROM my_connections mc
    JOIN soc_connections sc ON (sc.profile_id_1 = mc.connection_id OR sc.profile_id_2 = mc.connection_id)
    WHERE sc.status = 'accepted'
      AND CASE
        WHEN sc.profile_id_1 = mc.connection_id THEN sc.profile_id_2
        ELSE sc.profile_id_1
      END != p_profile_id
      AND CASE
        WHEN sc.profile_id_1 = mc.connection_id THEN sc.profile_id_2
        ELSE sc.profile_id_1
      END NOT IN (SELECT connection_id FROM my_connections)
    GROUP BY profile_id
  )
  SELECT
    p.id,
    p.full_name,
    p.profile_slug,
    p.headline,
    p.profile_photo_url,
    sd.mutual_count::INTEGER,
    CASE
      WHEN sd.mutual_count >= 5 THEN 'Many mutual connections'
      WHEN sd.mutual_count >= 2 THEN 'Mutual connections'
      ELSE 'Suggested for you'
    END AS reason
  FROM second_degree sd
  JOIN profiles p ON p.id = sd.profile_id
  WHERE p.is_public = true
  ORDER BY sd.mutual_count DESC, p.profile_strength DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 6: ANALYTICS FUNCTIONS
-- =====================================================

-- Get user engagement stats
CREATE OR REPLACE FUNCTION get_user_engagement_stats(
  p_profile_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  posts_count INTEGER,
  comments_count INTEGER,
  likes_given INTEGER,
  profile_views INTEGER,
  connections_made INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM soc_posts WHERE author_type = 'individual' AND author_id = p_profile_id AND created_at > NOW() - (p_days || ' days')::INTERVAL),
    (SELECT COUNT(*)::INTEGER FROM soc_post_comments WHERE profile_id = p_profile_id AND created_at > NOW() - (p_days || ' days')::INTERVAL),
    (SELECT COUNT(*)::INTEGER FROM soc_post_likes WHERE profile_id = p_profile_id AND created_at > NOW() - (p_days || ' days')::INTERVAL),
    (SELECT COUNT(*)::INTEGER FROM anl_profile_views WHERE viewed_type = 'individual' AND viewed_id = p_profile_id AND created_at > NOW() - (p_days || ' days')::INTERVAL),
    (SELECT COUNT(*)::INTEGER FROM soc_connections WHERE (profile_id_1 = p_profile_id OR profile_id_2 = p_profile_id) AND status = 'accepted' AND responded_at > NOW() - (p_days || ' days')::INTERVAL);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 7: NOTIFICATION HELPER FUNCTIONS
-- =====================================================

-- Create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_recipient_id UUID,
  p_actor_type TEXT,
  p_actor_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_action_type TEXT DEFAULT NULL,
  p_action_id UUID DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO ntf_notifications (
    recipient_id,
    actor_type,
    actor_id,
    title,
    message,
    action_type,
    action_id,
    priority
  ) VALUES (
    p_recipient_id,
    p_actor_type,
    p_actor_id,
    p_title,
    p_message,
    p_action_type,
    p_action_id,
    p_priority
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 8: MATERIALIZED VIEWS
-- =====================================================

-- Popular posts view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_popular_posts AS
SELECT
  sp.id,
  sp.author_type,
  sp.author_id,
  sp.content,
  sp.post_type,
  sp.created_at,
  sp.likes_count,
  sp.comments_count,
  sp.shares_count,
  sp.views_count,
  (sp.likes_count * 2 + sp.comments_count * 3 + sp.shares_count * 5) AS engagement_score
FROM soc_posts sp
WHERE sp.is_deleted = false
  AND sp.visibility = 'public'
  AND sp.created_at > NOW() - INTERVAL '7 days'
ORDER BY engagement_score DESC
LIMIT 100;

CREATE UNIQUE INDEX ON mv_popular_posts (id);
CREATE INDEX ON mv_popular_posts (engagement_score DESC);

-- Trending resources view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_trending_resources AS
SELECT
  rr.id,
  rr.title,
  rr.slug,
  rr.description,
  rr.resource_type,
  rr.featured_image_url,
  rr.views_count,
  rr.likes_count,
  rr.bookmarks_count,
  (rr.views_count * 0.5 + rr.likes_count * 2 + rr.bookmarks_count * 3) AS trending_score
FROM res_resources rr
WHERE rr.status = 'published'
  AND rr.published_at > NOW() - INTERVAL '30 days'
ORDER BY trending_score DESC
LIMIT 50;

CREATE UNIQUE INDEX ON mv_trending_resources (id);
CREATE INDEX ON mv_trending_resources (trending_score DESC);

-- Active users view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_active_users AS
SELECT
  p.id,
  p.full_name,
  p.profile_slug,
  p.profile_photo_url,
  p.verification_level,
  COUNT(DISTINCT sp.id) AS posts_count,
  COUNT(DISTINCT spc.id) AS comments_count,
  p.connections_count,
  p.followers_count
FROM profiles p
LEFT JOIN soc_posts sp ON sp.author_type = 'individual' AND sp.author_id = p.id AND sp.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN soc_post_comments spc ON spc.profile_id = p.id AND spc.created_at > NOW() - INTERVAL '30 days'
WHERE p.is_public = true
  AND p.last_active_at > NOW() - INTERVAL '7 days'
GROUP BY p.id
ORDER BY posts_count DESC, comments_count DESC
LIMIT 100;

CREATE UNIQUE INDEX ON mv_active_users (id);

-- =====================================================
-- SECTION 9: REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popular_posts;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trending_resources;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_active_users;
  REFRESH MATERIALIZED VIEW CONCURRENTLY nec_monthly_averages;
  REFRESH MATERIALIZED VIEW CONCURRENTLY nec_yoy_comparison;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 10: CLEANUP FUNCTIONS
-- =====================================================

-- Clean old activity logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM anl_activity_log
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Clean old profile views (keep last 180 days)
CREATE OR REPLACE FUNCTION cleanup_old_profile_views()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM anl_profile_views
  WHERE created_at < NOW() - INTERVAL '180 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 11: VALIDATION FUNCTIONS
-- =====================================================

-- Validate phone number (Indian format)
CREATE OR REPLACE FUNCTION is_valid_indian_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN phone ~ '^\+91[6-9][0-9]{9}$' OR phone ~ '^[6-9][0-9]{9}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate email
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON FUNCTION generate_unique_slug IS 'Generate unique slug for any table';
COMMENT ON FUNCTION calculate_profile_strength IS 'Calculate profile completion percentage';
COMMENT ON FUNCTION get_personalized_feed IS 'Get personalized post feed for user';
COMMENT ON FUNCTION search_profiles IS 'Full-text search for profiles';
COMMENT ON FUNCTION get_connection_recommendations IS 'Get connection recommendations based on mutual connections';
COMMENT ON FUNCTION get_user_engagement_stats IS 'Get user engagement statistics';
COMMENT ON FUNCTION create_notification IS 'Create a new notification';
COMMENT ON FUNCTION refresh_all_materialized_views IS 'Refresh all materialized views';
COMMENT ON FUNCTION cleanup_old_activity_logs IS 'Clean up old activity logs';
COMMENT ON FUNCTION cleanup_old_profile_views IS 'Clean up old profile views';

