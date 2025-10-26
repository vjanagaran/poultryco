-- =====================================================
-- PoultryCo Database Schema
-- File: 16_social_posts_rls.sql
-- Description: RLS policies for posts, comments, likes, shares
-- Version: 1.0
-- Date: 2025-10-25
-- Dependencies: 15_social_posts_system.sql
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL SOCIAL TABLES
-- =====================================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POSTS RLS POLICIES
-- =====================================================

-- Public posts: viewable by everyone
CREATE POLICY "Public posts are viewable by everyone"
  ON posts FOR SELECT
  USING (
    NOT is_hidden AND 
    visibility = 'public'
  );

-- Connection-only posts: viewable by connections
CREATE POLICY "Connection posts viewable by connections"
  ON posts FOR SELECT
  USING (
    NOT is_hidden AND
    visibility = 'connections' AND (
      author_id = auth_uid() OR
      are_connected(author_id, auth_uid())
    )
  );

-- Private posts: viewable by author only
CREATE POLICY "Private posts viewable by author"
  ON posts FOR SELECT
  USING (
    visibility = 'private' AND
    author_id = auth_uid()
  );

-- Users can create posts
CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  WITH CHECK (auth_uid() IS NOT NULL AND author_id = auth_uid());

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (author_id = auth_uid())
  WITH CHECK (author_id = auth_uid());

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (author_id = auth_uid());

-- =====================================================
-- POST LIKES RLS POLICIES
-- =====================================================

-- Users can view likes on posts they can see
CREATE POLICY "View likes on visible posts"
  ON post_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_likes.post_id
        AND NOT posts.is_hidden
        AND (
          posts.visibility = 'public'
          OR posts.author_id = auth_uid()
          OR (posts.visibility = 'connections' AND are_connected(posts.author_id, auth_uid()))
        )
    )
  );

-- Users can like posts
CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (
    auth_uid() IS NOT NULL AND
    user_id = auth_uid() AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_likes.post_id
        AND NOT posts.is_hidden
        AND (
          posts.visibility = 'public'
          OR posts.author_id = auth_uid()
          OR (posts.visibility = 'connections' AND are_connected(posts.author_id, auth_uid()))
        )
    )
  );

-- Users can unlike their own likes
CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  USING (user_id = auth_uid());

-- =====================================================
-- POST COMMENTS RLS POLICIES
-- =====================================================

-- Users can view comments on posts they can see
CREATE POLICY "View comments on visible posts"
  ON post_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_comments.post_id
        AND NOT posts.is_hidden
        AND (
          posts.visibility = 'public'
          OR posts.author_id = auth_uid()
          OR (posts.visibility = 'connections' AND are_connected(posts.author_id, auth_uid()))
        )
    )
  );

-- Users can comment on posts they can see
CREATE POLICY "Users can comment on visible posts"
  ON post_comments FOR INSERT
  WITH CHECK (
    auth_uid() IS NOT NULL AND
    author_id = auth_uid() AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_comments.post_id
        AND NOT posts.is_hidden
        AND (
          posts.visibility = 'public'
          OR posts.author_id = auth_uid()
          OR (posts.visibility = 'connections' AND are_connected(posts.author_id, auth_uid()))
        )
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE
  USING (author_id = auth_uid())
  WITH CHECK (author_id = auth_uid());

-- Users can delete their own comments, or post author can delete any comment
CREATE POLICY "Users can delete own comments or post author can delete"
  ON post_comments FOR DELETE
  USING (
    author_id = auth_uid() OR
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_comments.post_id AND posts.author_id = auth_uid()
    )
  );

-- =====================================================
-- COMMENT LIKES RLS POLICIES
-- =====================================================

-- Users can view comment likes
CREATE POLICY "View comment likes"
  ON post_comment_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM post_comments pc
      JOIN posts p ON p.id = pc.post_id
      WHERE pc.id = post_comment_likes.comment_id
        AND NOT p.is_hidden
        AND (
          p.visibility = 'public'
          OR p.author_id = auth_uid()
          OR (p.visibility = 'connections' AND are_connected(p.author_id, auth_uid()))
        )
    )
  );

-- Users can like comments
CREATE POLICY "Users can like comments"
  ON post_comment_likes FOR INSERT
  WITH CHECK (auth_uid() IS NOT NULL AND user_id = auth_uid());

-- Users can unlike their own comment likes
CREATE POLICY "Users can unlike comments"
  ON post_comment_likes FOR DELETE
  USING (user_id = auth_uid());

-- =====================================================
-- POST SHARES RLS POLICIES
-- =====================================================

-- Users can view shares on posts they can see
CREATE POLICY "View shares on visible posts"
  ON post_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_shares.post_id
        AND NOT posts.is_hidden
        AND (
          posts.visibility = 'public'
          OR posts.author_id = auth_uid()
          OR (posts.visibility = 'connections' AND are_connected(posts.author_id, auth_uid()))
        )
    )
  );

-- Users can share posts
CREATE POLICY "Users can share posts"
  ON post_shares FOR INSERT
  WITH CHECK (
    auth_uid() IS NOT NULL AND
    shared_by = auth_uid() AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_shares.post_id
        AND NOT posts.is_hidden
        AND (
          posts.visibility = 'public'
          OR posts.author_id = auth_uid()
          OR (posts.visibility = 'connections' AND are_connected(posts.author_id, auth_uid()))
        )
    )
  );

-- Users can delete their own shares
CREATE POLICY "Users can delete own shares"
  ON post_shares FOR DELETE
  USING (shared_by = auth_uid());

-- =====================================================
-- POST VIEWS RLS POLICIES
-- =====================================================

-- Users can create post views
CREATE POLICY "Users can record post views"
  ON post_views FOR INSERT
  WITH CHECK (
    (viewer_id IS NULL OR viewer_id = auth_uid()) AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_views.post_id
        AND NOT posts.is_hidden
        AND (
          posts.visibility = 'public'
          OR posts.author_id = auth_uid()
          OR (posts.visibility = 'connections' AND are_connected(posts.author_id, auth_uid()))
        )
    )
  );

-- Post authors can view their post views
CREATE POLICY "Post authors can view their post views"
  ON post_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_views.post_id AND posts.author_id = auth_uid()
    )
  );

-- =====================================================
-- POST TAGS RLS POLICIES
-- =====================================================

-- Everyone can view tags
CREATE POLICY "Tags are viewable by everyone"
  ON post_tags FOR SELECT
  USING (true);

-- Authenticated users can create tags
CREATE POLICY "Authenticated users can create tags"
  ON post_tags FOR INSERT
  WITH CHECK (auth_uid() IS NOT NULL);

-- Junction table: viewable by everyone
CREATE POLICY "Post tags junction viewable by everyone"
  ON posts_tags FOR SELECT
  USING (true);

-- Post authors can manage their post tags
CREATE POLICY "Post authors can manage post tags"
  ON posts_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = posts_tags.post_id AND posts.author_id = auth_uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = posts_tags.post_id AND posts.author_id = auth_uid()
    )
  );

-- =====================================================
-- POST REPORTS RLS POLICIES
-- =====================================================

-- Users can create reports
CREATE POLICY "Users can report posts"
  ON post_reports FOR INSERT
  WITH CHECK (
    auth_uid() IS NOT NULL AND
    reported_by = auth_uid() AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_reports.post_id
        AND NOT posts.is_hidden
    )
  );

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON post_reports FOR SELECT
  USING (reported_by = auth_uid());

-- Moderators can view all reports (add admin role check later)
-- CREATE POLICY "Moderators can view all reports"
--   ON post_reports FOR SELECT
--   USING (is_admin(auth_uid()));

-- =====================================================
-- POST BOOKMARKS RLS POLICIES
-- =====================================================

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON post_bookmarks FOR SELECT
  USING (user_id = auth_uid());

-- Users can bookmark posts they can see
CREATE POLICY "Users can bookmark visible posts"
  ON post_bookmarks FOR INSERT
  WITH CHECK (
    auth_uid() IS NOT NULL AND
    user_id = auth_uid() AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_bookmarks.post_id
        AND NOT posts.is_hidden
        AND (
          posts.visibility = 'public'
          OR posts.author_id = auth_uid()
          OR (posts.visibility = 'connections' AND are_connected(posts.author_id, auth_uid()))
        )
    )
  );

-- Users can update their own bookmarks
CREATE POLICY "Users can update own bookmarks"
  ON post_bookmarks FOR UPDATE
  USING (user_id = auth_uid())
  WITH CHECK (user_id = auth_uid());

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON post_bookmarks FOR DELETE
  USING (user_id = auth_uid());

-- =====================================================
-- ENABLE REALTIME FOR SOCIAL FEATURES
-- =====================================================

-- Enable realtime subscriptions for posts
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE post_comment_likes;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Public posts are viewable by everyone" ON posts IS 
  'Anyone can view public, non-hidden posts';

COMMENT ON POLICY "Connection posts viewable by connections" ON posts IS 
  'Connections-only posts are visible to author and their connections';

COMMENT ON POLICY "Private posts viewable by author" ON posts IS 
  'Private posts are only visible to the author';

COMMENT ON POLICY "View likes on visible posts" ON post_likes IS 
  'Users can see likes on any post they have permission to view';

COMMENT ON POLICY "Users can comment on visible posts" ON post_comments IS 
  'Users can comment on any post they have permission to view';

COMMENT ON POLICY "Users can delete own comments or post author can delete" ON post_comments IS 
  'Comment authors and post authors can delete comments';

-- =====================================================
-- END OF FILE
-- =====================================================

