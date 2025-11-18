-- =====================================================
-- PoultryCo Database Schema
-- File: 51_shared_engagement_system.sql
-- Description: Shared engagement system (likes, comments, shares) across all modules
-- Version: 1.0
-- Date: 2025-01-17
-- Dependencies: 01_core_profiles.sql, 15_social_posts_system.sql
-- =====================================================

-- =====================================================
-- SECTION 1: ENTITY TYPES
-- =====================================================
-- Centralized entity type definitions with descriptions

CREATE TABLE IF NOT EXISTS entity_types (
  type TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  module TEXT, -- 'necc', 'posts', 'breed_standards', 'native_birds', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_entity_types_module ON entity_types(module);

-- Trigger
CREATE TRIGGER update_entity_types_updated_at
  BEFORE UPDATE ON entity_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial entity types
INSERT INTO entity_types (type, description, module) VALUES
  -- Posts module
  ('post', 'Social media posts (updates, problems, articles, photos)', 'posts'),
  ('post_comment', 'Comments on posts', 'posts'),
  
  -- NECC module
  ('necc_annotation', 'Expert annotations on NECC price data', 'necc'),
  ('necc_prediction', 'Price predictions (AI or expert)', 'necc'),
  ('necc_blog_post', 'Blog posts about NECC data and trends', 'necc'),
  
  -- Future modules
  ('breed_standard', 'Breed standard documentation', 'breed_standards'),
  ('native_bird', 'Native bird information', 'native_birds'),
  ('medication', 'Medication information', 'medications'),
  ('organic_alternative', 'Organic alternatives information', 'organic_alternatives'),
  ('global_data', 'Global poultry data', 'global_data')
ON CONFLICT (type) DO NOTHING;

-- =====================================================
-- SECTION 2: ENTITY LIKES
-- =====================================================
-- Unified likes/reactions system for all entity types

CREATE TABLE IF NOT EXISTS entity_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity reference (polymorphic)
  entity_type TEXT NOT NULL REFERENCES entity_types(type) ON DELETE RESTRICT,
  entity_id UUID NOT NULL,
  
  -- User
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reaction type (for posts: like, helpful, insightful)
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN (
    'like', 'helpful', 'insightful', 'love', 'agree'
  )),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One reaction per user per entity
  UNIQUE(entity_type, entity_id, user_id)
);

-- Indexes
CREATE INDEX idx_entity_likes_entity ON entity_likes(entity_type, entity_id);
CREATE INDEX idx_entity_likes_user ON entity_likes(user_id);
CREATE INDEX idx_entity_likes_created_at ON entity_likes(created_at DESC);
CREATE INDEX idx_entity_likes_reaction_type ON entity_likes(reaction_type);

-- =====================================================
-- SECTION 3: ENTITY COMMENTS
-- =====================================================
-- Unified comments system for all entity types

CREATE TABLE IF NOT EXISTS entity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity reference (polymorphic)
  entity_type TEXT NOT NULL REFERENCES entity_types(type) ON DELETE RESTRICT,
  entity_id UUID NOT NULL,
  
  -- User
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  
  -- Nested comments (replies)
  parent_id UUID REFERENCES entity_comments(id) ON DELETE CASCADE,
  
  -- Engagement (for post comments - likes count)
  likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  
  -- Metadata
  edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_author_reply BOOLEAN DEFAULT false, -- For posts: true if comment author = post author
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_entity_comments_entity ON entity_comments(entity_type, entity_id);
CREATE INDEX idx_entity_comments_user ON entity_comments(user_id);
CREATE INDEX idx_entity_comments_parent ON entity_comments(parent_id);
CREATE INDEX idx_entity_comments_created_at ON entity_comments(created_at DESC);

-- Trigger
CREATE TRIGGER update_entity_comments_updated_at
  BEFORE UPDATE ON entity_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: ENTITY SHARES
-- =====================================================
-- Unified shares system for all entity types

CREATE TABLE IF NOT EXISTS entity_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity reference (polymorphic)
  entity_type TEXT NOT NULL REFERENCES entity_types(type) ON DELETE RESTRICT,
  entity_id UUID NOT NULL,
  
  -- User
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Share details
  platform TEXT CHECK (platform IN (
    'whatsapp', 'twitter', 'linkedin', 'facebook', 'email', 'sms', 'other'
  )),
  share_comment TEXT CHECK (char_length(share_comment) <= 500), -- Optional comment when sharing
  share_type TEXT NOT NULL DEFAULT 'repost' CHECK (share_type IN (
    'repost', 'external'
  )),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_entity_shares_entity ON entity_shares(entity_type, entity_id);
CREATE INDEX idx_entity_shares_user ON entity_shares(user_id);
CREATE INDEX idx_entity_shares_created_at ON entity_shares(created_at DESC);
CREATE INDEX idx_entity_shares_platform ON entity_shares(platform);

-- =====================================================
-- SECTION 5: TRIGGERS FOR POSTS ENGAGEMENT COUNTS
-- =====================================================
-- These triggers update posts.likes_count, posts.comments_count, posts.shares_count

-- Function to increment post likes_count
CREATE OR REPLACE FUNCTION increment_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entity_type = 'post' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.entity_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post likes_count
CREATE OR REPLACE FUNCTION decrement_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.entity_type = 'post' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.entity_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for post likes
CREATE TRIGGER entity_like_insert_trigger
  AFTER INSERT ON entity_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_likes_count();

CREATE TRIGGER entity_like_delete_trigger
  AFTER DELETE ON entity_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_likes_count();

-- Function to increment post comments_count
CREATE OR REPLACE FUNCTION increment_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entity_type = 'post' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.entity_id;
    
    -- Set is_author_reply flag for post comments
    NEW.is_author_reply := EXISTS(
      SELECT 1 FROM posts WHERE id = NEW.entity_id AND author_id = NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post comments_count
CREATE OR REPLACE FUNCTION decrement_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.entity_type = 'post' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.entity_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for post comments
CREATE TRIGGER entity_comment_insert_trigger
  BEFORE INSERT ON entity_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_comments_count();

CREATE TRIGGER entity_comment_delete_trigger
  AFTER DELETE ON entity_comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_comments_count();

-- Function to increment post shares_count
CREATE OR REPLACE FUNCTION increment_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entity_type = 'post' THEN
    UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.entity_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post shares_count
CREATE OR REPLACE FUNCTION decrement_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.entity_type = 'post' THEN
    UPDATE posts SET shares_count = shares_count - 1 WHERE id = OLD.entity_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for post shares
CREATE TRIGGER entity_share_insert_trigger
  AFTER INSERT ON entity_shares
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_shares_count();

CREATE TRIGGER entity_share_delete_trigger
  AFTER DELETE ON entity_shares
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_shares_count();

-- Function to increment comment likes_count (for post_comment entity type)
CREATE OR REPLACE FUNCTION increment_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entity_type = 'post_comment' THEN
    UPDATE entity_comments SET likes_count = likes_count + 1 WHERE id = NEW.entity_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comment likes_count
CREATE OR REPLACE FUNCTION decrement_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.entity_type = 'post_comment' THEN
    UPDATE entity_comments SET likes_count = likes_count - 1 WHERE id = OLD.entity_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for comment likes (when liking a comment)
CREATE TRIGGER entity_comment_like_insert_trigger
  AFTER INSERT ON entity_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_comment_likes_count();

CREATE TRIGGER entity_comment_like_delete_trigger
  AFTER DELETE ON entity_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_comment_likes_count();

-- =====================================================
-- SECTION 6: RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE entity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_shares ENABLE ROW LEVEL SECURITY;

-- Entity Types: Everyone can view
CREATE POLICY "Entity types viewable by everyone"
  ON entity_types FOR SELECT
  USING (true);

-- Entity Likes: Everyone can view, authenticated users can like
CREATE POLICY "Entity likes viewable by everyone"
  ON entity_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like entities"
  ON entity_likes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can unlike their own likes"
  ON entity_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Entity Comments: Everyone can view, authenticated users can comment
CREATE POLICY "Entity comments viewable by everyone"
  ON entity_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON entity_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON entity_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON entity_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Entity Shares: Everyone can view, authenticated users can share
CREATE POLICY "Entity shares viewable by everyone"
  ON entity_shares FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can share entities"
  ON entity_shares FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- =====================================================
-- SECTION 7: DROP OLD POST ENGAGEMENT TABLES
-- =====================================================
-- Remove old module-specific engagement tables in favor of unified system

-- Drop old triggers first (if they exist on old tables)
-- Note: New triggers are created in Section 5 and use CREATE OR REPLACE functions
DROP TRIGGER IF EXISTS post_like_insert_trigger ON post_likes;
DROP TRIGGER IF EXISTS post_like_delete_trigger ON post_likes;
DROP TRIGGER IF EXISTS post_comment_insert_trigger ON post_comments;
DROP TRIGGER IF EXISTS post_comment_delete_trigger ON post_comments;
DROP TRIGGER IF EXISTS comment_like_insert_trigger ON post_comment_likes;
DROP TRIGGER IF EXISTS comment_like_delete_trigger ON post_comment_likes;

-- Note: Functions are NOT dropped because:
-- 1. They are replaced with CREATE OR REPLACE in Section 5
-- 2. New triggers in Section 5 depend on these functions
-- 3. The functions work for both old and new system (check entity_type)

-- Drop old tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS post_comment_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_shares CASCADE;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE entity_types IS 'Centralized entity type definitions for engagement system';
COMMENT ON TABLE entity_likes IS 'Unified likes/reactions system across all modules';
COMMENT ON TABLE entity_comments IS 'Unified comments system across all modules';
COMMENT ON TABLE entity_shares IS 'Unified shares system across all modules';

COMMENT ON COLUMN entity_likes.reaction_type IS 'Type of reaction: like, helpful, insightful, etc.';
COMMENT ON COLUMN entity_comments.is_author_reply IS 'True if comment author is the entity author (for posts)';
COMMENT ON COLUMN entity_shares.share_comment IS 'Optional comment when sharing (for posts)';

-- =====================================================
-- END OF FILE
-- =====================================================

