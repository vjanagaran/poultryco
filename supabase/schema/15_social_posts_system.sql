-- =====================================================
-- PoultryCo Database Schema
-- File: 13_social_posts_system.sql
-- Description: Posts, likes, comments, shares - Social stream features
-- Version: 1.0
-- Date: 2025-10-25
-- Dependencies: 01_core_profiles.sql, 10_network_connections.sql
-- =====================================================

-- =====================================================
-- SECTION 1: POSTS
-- =====================================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Author (from profiles)
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  
  -- Type
  post_type TEXT NOT NULL DEFAULT 'update' CHECK (post_type IN (
    'update', 'problem', 'article', 'photo', 'poll', 'question'
  )),
  
  -- Media
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'mixed')),
  
  -- Visibility
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN (
    'public', 'connections', 'private'
  )),
  
  -- Problem-specific fields (for post_type = 'problem')
  problem_category TEXT CHECK (problem_category IN (
    'disease', 'mortality', 'feed', 'production', 'equipment', 
    'management', 'market', 'legal', 'other'
  )),
  problem_urgency TEXT CHECK (problem_urgency IN ('low', 'medium', 'high', 'critical')),
  problem_resolved BOOLEAN DEFAULT false,
  problem_resolved_at TIMESTAMPTZ,
  
  -- Article-specific fields (for post_type = 'article')
  article_title TEXT CHECK (char_length(article_title) <= 200),
  article_cover_image TEXT,
  article_reading_time_minutes INTEGER CHECK (article_reading_time_minutes > 0),
  
  -- Engagement tracking
  likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
  shares_count INTEGER NOT NULL DEFAULT 0 CHECK (shares_count >= 0),
  views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  
  -- Metadata
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  
  -- Moderation
  is_reported BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for posts
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_problem_category ON posts(problem_category) WHERE post_type = 'problem';
CREATE INDEX idx_posts_problem_urgency ON posts(problem_urgency) WHERE post_type = 'problem';
CREATE INDEX idx_posts_problem_unresolved ON posts(problem_resolved) WHERE post_type = 'problem' AND NOT problem_resolved;
CREATE INDEX idx_posts_pinned ON posts(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE is_featured = true;

-- Full-text search for posts
CREATE INDEX idx_posts_search ON posts USING gin(
  to_tsvector('english', 
    content || ' ' || 
    COALESCE(article_title, '')
  )
);

-- Trigger for posts
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: POST LIKES
-- =====================================================

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reaction type (future: can add love, helpful, etc.)
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN (
    'like', 'helpful', 'insightful'
  )),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One reaction per user per post
  UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
CREATE INDEX idx_post_likes_created_at ON post_likes(created_at DESC);

-- Function to increment likes_count
CREATE OR REPLACE FUNCTION increment_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes_count
CREATE OR REPLACE FUNCTION decrement_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER post_like_insert_trigger
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_likes_count();

CREATE TRIGGER post_like_delete_trigger
  AFTER DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_likes_count();

-- =====================================================
-- SECTION 3: POST COMMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  
  -- Nested comments (replies)
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  
  -- Engagement
  likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  
  -- Metadata
  edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_author_reply BOOLEAN DEFAULT false, -- Auto-set if author_id = post.author_id
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_author ON post_comments(author_id);
CREATE INDEX idx_post_comments_parent ON post_comments(parent_comment_id);
CREATE INDEX idx_post_comments_created_at ON post_comments(created_at);

-- Trigger
CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment comments_count
CREATE OR REPLACE FUNCTION increment_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  
  -- Set is_author_reply flag
  NEW.is_author_reply := EXISTS(
    SELECT 1 FROM posts WHERE id = NEW.post_id AND author_id = NEW.author_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comments_count
CREATE OR REPLACE FUNCTION decrement_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER post_comment_insert_trigger
  BEFORE INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_comments_count();

CREATE TRIGGER post_comment_delete_trigger
  AFTER DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_comments_count();

-- =====================================================
-- SECTION 4: COMMENT LIKES
-- =====================================================

CREATE TABLE IF NOT EXISTS post_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One like per user per comment
  UNIQUE(comment_id, user_id)
);

-- Indexes
CREATE INDEX idx_comment_likes_comment ON post_comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON post_comment_likes(user_id);

-- Triggers for comment likes count
CREATE OR REPLACE FUNCTION increment_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE post_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE post_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_like_insert_trigger
  AFTER INSERT ON post_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_comment_likes_count();

CREATE TRIGGER comment_like_delete_trigger
  AFTER DELETE ON post_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_comment_likes_count();

-- =====================================================
-- SECTION 5: POST SHARES
-- =====================================================

CREATE TABLE IF NOT EXISTS post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Optional comment when sharing
  share_comment TEXT CHECK (char_length(share_comment) <= 500),
  
  -- Share target (future: can track where it was shared)
  share_type TEXT NOT NULL DEFAULT 'repost' CHECK (share_type IN (
    'repost', 'external'
  )),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One share per user per post
  UNIQUE(post_id, shared_by)
);

-- Indexes
CREATE INDEX idx_post_shares_post ON post_shares(post_id);
CREATE INDEX idx_post_shares_user ON post_shares(shared_by);
CREATE INDEX idx_post_shares_created_at ON post_shares(created_at DESC);

-- Triggers for shares count
CREATE OR REPLACE FUNCTION increment_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET shares_count = shares_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_share_insert_trigger
  AFTER INSERT ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_shares_count();

CREATE TRIGGER post_share_delete_trigger
  AFTER DELETE ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_shares_count();

-- =====================================================
-- SECTION 6: POST VIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Can be null for anonymous
  
  -- Tracking
  view_duration_seconds INTEGER,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_post_views_post ON post_views(post_id);
CREATE INDEX idx_post_views_viewer ON post_views(viewer_id);
CREATE INDEX idx_post_views_created_at ON post_views(created_at DESC);

-- =====================================================
-- SECTION 7: POST TAGS (HASHTAGS)
-- =====================================================

CREATE TABLE IF NOT EXISTS post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name TEXT NOT NULL UNIQUE,
  tag_slug TEXT NOT NULL UNIQUE,
  
  -- Stats
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_post_tags_name ON post_tags(tag_name);
CREATE INDEX idx_post_tags_slug ON post_tags(tag_slug);
CREATE INDEX idx_post_tags_usage_count ON post_tags(usage_count DESC);

-- Junction table for post <-> tags
CREATE TABLE IF NOT EXISTS posts_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES post_tags(id) ON DELETE CASCADE,
  
  PRIMARY KEY (post_id, tag_id)
);

-- Indexes
CREATE INDEX idx_posts_tags_post ON posts_tags(post_id);
CREATE INDEX idx_posts_tags_tag ON posts_tags(tag_id);

-- =====================================================
-- SECTION 8: POST REPORTS (MODERATION)
-- =====================================================

CREATE TABLE IF NOT EXISTS post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Report details
  report_reason TEXT NOT NULL CHECK (report_reason IN (
    'spam', 'harassment', 'misinformation', 'inappropriate', 'scam', 'other'
  )),
  report_description TEXT CHECK (char_length(report_description) <= 500),
  
  -- Moderation
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'resolved', 'dismissed'
  )),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  moderator_notes TEXT,
  
  -- Action taken
  action_taken TEXT CHECK (action_taken IN (
    'none', 'warning_issued', 'post_hidden', 'post_deleted', 'user_warned', 'user_suspended'
  )),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One report per user per post
  UNIQUE(post_id, reported_by)
);

-- Indexes
CREATE INDEX idx_post_reports_post ON post_reports(post_id);
CREATE INDEX idx_post_reports_reporter ON post_reports(reported_by);
CREATE INDEX idx_post_reports_status ON post_reports(status);
CREATE INDEX idx_post_reports_created_at ON post_reports(created_at DESC);

-- =====================================================
-- SECTION 9: BOOKMARKS (SAVED POSTS)
-- =====================================================

CREATE TABLE IF NOT EXISTS post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Organization
  collection_name TEXT DEFAULT 'default',
  notes TEXT CHECK (char_length(notes) <= 500),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One bookmark per user per post
  UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX idx_post_bookmarks_user ON post_bookmarks(user_id);
CREATE INDEX idx_post_bookmarks_post ON post_bookmarks(post_id);
CREATE INDEX idx_post_bookmarks_collection ON post_bookmarks(user_id, collection_name);
CREATE INDEX idx_post_bookmarks_created_at ON post_bookmarks(created_at DESC);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE posts IS 'User posts - updates, problems, articles, photos';
COMMENT ON COLUMN posts.visibility IS 'public = everyone, connections = only connections, private = only author';
COMMENT ON COLUMN posts.post_type IS 'Type of post - update, problem, article, photo, poll, question';
COMMENT ON COLUMN posts.problem_resolved IS 'For problem posts - has the problem been solved?';

COMMENT ON TABLE post_likes IS 'Post likes/reactions';
COMMENT ON TABLE post_comments IS 'Post comments with nested reply support';
COMMENT ON COLUMN post_comments.is_author_reply IS 'True if comment author is the post author';
COMMENT ON TABLE post_shares IS 'Post shares/reposts';
COMMENT ON TABLE post_views IS 'Post view tracking';
COMMENT ON TABLE post_tags IS 'Hashtags for post categorization';
COMMENT ON TABLE post_reports IS 'User reports for content moderation';
COMMENT ON TABLE post_bookmarks IS 'Saved posts for later reading';

-- =====================================================
-- END OF FILE
-- =====================================================

