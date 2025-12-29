-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 40_soc_posts.sql
-- Description: Social posts system (stream, content)
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql, 20_biz_core.sql, 30_org_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: POSTS
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Author (polymorphic: individual, business, or organization)
  author_type TEXT NOT NULL CHECK (author_type IN ('individual', 'business', 'organization')),
  author_id UUID NOT NULL,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  post_type TEXT NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'poll', 'article', 'shared')),
  
  -- Media
  media_urls TEXT[],
  media_metadata JSONB, -- {width, height, duration, thumbnail, etc.}
  
  -- Poll (if post_type = 'poll')
  poll_options JSONB, -- [{option: "...", votes: 0}, ...]
  poll_ends_at TIMESTAMPTZ,
  
  -- Shared post (if post_type = 'shared')
  shared_post_id UUID REFERENCES soc_posts(id) ON DELETE SET NULL,
  
  -- Visibility
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
  
  -- Engagement (denormalized)
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  
  -- Moderation
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_soc_posts_author ON soc_posts(author_type, author_id);
CREATE INDEX idx_soc_posts_type ON soc_posts(post_type);
CREATE INDEX idx_soc_posts_visibility ON soc_posts(visibility);
CREATE INDEX idx_soc_posts_created ON soc_posts(created_at DESC);
CREATE INDEX idx_soc_posts_engagement ON soc_posts(likes_count DESC, comments_count DESC);
CREATE INDEX idx_soc_posts_shared ON soc_posts(shared_post_id) WHERE shared_post_id IS NOT NULL;
CREATE INDEX idx_soc_posts_active ON soc_posts(is_deleted) WHERE is_deleted = false;

-- Full-text search
CREATE INDEX idx_soc_posts_search ON soc_posts USING gin(to_tsvector('english', content));

CREATE TRIGGER update_soc_posts_updated_at
  BEFORE UPDATE ON soc_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: POST LIKES
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES soc_posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id, profile_id)
);

CREATE INDEX idx_soc_post_likes_post ON soc_post_likes(post_id);
CREATE INDEX idx_soc_post_likes_profile ON soc_post_likes(profile_id);
CREATE INDEX idx_soc_post_likes_created ON soc_post_likes(created_at DESC);

-- =====================================================
-- SECTION 3: POST COMMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES soc_posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Comment content
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  
  -- Threading
  parent_comment_id UUID REFERENCES soc_post_comments(id) ON DELETE CASCADE,
  
  -- Engagement
  likes_count INTEGER NOT NULL DEFAULT 0,
  
  -- Moderation
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_soc_post_comments_post ON soc_post_comments(post_id, created_at DESC);
CREATE INDEX idx_soc_post_comments_profile ON soc_post_comments(profile_id);
CREATE INDEX idx_soc_post_comments_parent ON soc_post_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_soc_post_comments_active ON soc_post_comments(is_deleted) WHERE is_deleted = false;

CREATE TRIGGER update_soc_post_comments_updated_at
  BEFORE UPDATE ON soc_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: COMMENT LIKES
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES soc_post_comments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(comment_id, profile_id)
);

CREATE INDEX idx_soc_comment_likes_comment ON soc_comment_likes(comment_id);
CREATE INDEX idx_soc_comment_likes_profile ON soc_comment_likes(profile_id);

-- =====================================================
-- SECTION 5: POST BOOKMARKS
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES soc_posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Collection
  collection_name TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id, profile_id)
);

CREATE INDEX idx_soc_post_bookmarks_post ON soc_post_bookmarks(post_id);
CREATE INDEX idx_soc_post_bookmarks_profile ON soc_post_bookmarks(profile_id, created_at DESC);
CREATE INDEX idx_soc_post_bookmarks_collection ON soc_post_bookmarks(profile_id, collection_name);

-- =====================================================
-- SECTION 6: POST REPORTS
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES soc_posts(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Report details
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')),
  description TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_soc_post_reports_post ON soc_post_reports(post_id);
CREATE INDEX idx_soc_post_reports_reported_by ON soc_post_reports(reported_by);
CREATE INDEX idx_soc_post_reports_status ON soc_post_reports(status);
CREATE INDEX idx_soc_post_reports_pending ON soc_post_reports(status) WHERE status = 'pending';

-- =====================================================
-- SECTION 7: POLL VOTES
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES soc_posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Vote
  option_index INTEGER NOT NULL,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id, profile_id)
);

CREATE INDEX idx_soc_poll_votes_post ON soc_poll_votes(post_id);
CREATE INDEX idx_soc_poll_votes_profile ON soc_poll_votes(profile_id);

-- =====================================================
-- SECTION 8: HELPER FUNCTIONS
-- =====================================================

-- Update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE soc_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE soc_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_post_likes_count
  AFTER INSERT OR DELETE ON soc_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Update post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE soc_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE soc_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_post_comments_count
  AFTER INSERT OR DELETE ON soc_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE soc_post_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE soc_post_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_comment_likes_count
  AFTER INSERT OR DELETE ON soc_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- Update post shares count
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.shared_post_id IS NOT NULL THEN
    UPDATE soc_posts SET shares_count = shares_count + 1 WHERE id = NEW.shared_post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.shared_post_id IS NOT NULL THEN
    UPDATE soc_posts SET shares_count = GREATEST(shares_count - 1, 0) WHERE id = OLD.shared_post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_post_shares_count
  AFTER INSERT OR DELETE ON soc_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_shares_count();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE soc_posts IS 'Social posts (stream content)';
COMMENT ON TABLE soc_post_likes IS 'Post likes';
COMMENT ON TABLE soc_post_comments IS 'Post comments with threading';
COMMENT ON TABLE soc_comment_likes IS 'Comment likes';
COMMENT ON TABLE soc_post_bookmarks IS 'Post bookmarks/saved posts';
COMMENT ON TABLE soc_post_reports IS 'Post reports for moderation';
COMMENT ON TABLE soc_poll_votes IS 'Poll votes';

