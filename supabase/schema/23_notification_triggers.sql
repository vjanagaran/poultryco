-- =====================================================
-- PoultryCo Database Schema - Notification Triggers
-- File: 23_notification_triggers.sql
-- Description: Automatic notification creation triggers for all system events
-- Version: 1.0
-- Date: 2025-10-26
-- Dependencies: 18_notifications_system.sql, 15_social_posts_system.sql, 17_messaging_system.sql, 10_network_connections.sql
-- =====================================================

-- =====================================================
-- SECTION 1: POST LIKE NOTIFICATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
  v_post RECORD;
  v_sender RECORD;
BEGIN
  -- Get post details
  SELECT * INTO v_post FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if user likes their own post
  IF v_post.author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get sender details
  SELECT * INTO v_sender FROM profiles WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM create_notification(
    v_post.author_id,              -- recipient
    NEW.user_id,                    -- sender
    'post_like',                    -- type
    'post',                         -- entity_type
    NEW.post_id,                    -- entity_id
    v_sender.full_name || ' liked your post',  -- title
    LEFT(v_post.content, 100),      -- content preview
    '/stream?post=' || NEW.post_id, -- action_url
    'normal'                        -- priority
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_notify_post_like ON post_likes;
CREATE TRIGGER trigger_notify_post_like
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_like();

-- =====================================================
-- SECTION 2: POST COMMENT NOTIFICATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post RECORD;
  v_sender RECORD;
  v_parent_author_id UUID;
BEGIN
  -- Get post details
  SELECT * INTO v_post FROM posts WHERE id = NEW.post_id;
  
  -- Get sender details
  SELECT * INTO v_sender FROM profiles WHERE id = NEW.author_id;
  
  -- Notify post author (if not commenting on own post)
  IF v_post.author_id != NEW.author_id THEN
    PERFORM create_notification(
      v_post.author_id,                     -- recipient
      NEW.author_id,                         -- sender
      'post_comment',                        -- type
      'comment',                             -- entity_type
      NEW.id,                                -- entity_id
      v_sender.full_name || ' commented on your post',  -- title
      LEFT(NEW.content, 100),                -- content preview
      '/stream?post=' || NEW.post_id || '#comment-' || NEW.id,  -- action_url
      'normal'                               -- priority
    );
  END IF;
  
  -- If it's a reply, notify the parent comment author
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_author_id
    FROM post_comments
    WHERE id = NEW.parent_comment_id;
    
    -- Don't notify if replying to self
    IF v_parent_author_id != NEW.author_id AND v_parent_author_id != v_post.author_id THEN
      PERFORM create_notification(
        v_parent_author_id,                    -- recipient
        NEW.author_id,                         -- sender
        'comment_reply',                       -- type
        'comment',                             -- entity_type
        NEW.id,                                -- entity_id
        v_sender.full_name || ' replied to your comment',  -- title
        LEFT(NEW.content, 100),                -- content preview
        '/stream?post=' || NEW.post_id || '#comment-' || NEW.id,  -- action_url
        'normal'                               -- priority
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_notify_post_comment ON post_comments;
CREATE TRIGGER trigger_notify_post_comment
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_comment();

-- =====================================================
-- SECTION 3: COMMENT LIKE NOTIFICATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION notify_comment_like()
RETURNS TRIGGER AS $$
DECLARE
  v_comment RECORD;
  v_sender RECORD;
BEGIN
  -- Get comment details
  SELECT * INTO v_comment FROM post_comments WHERE id = NEW.comment_id;
  
  -- Don't notify if user likes their own comment
  IF v_comment.author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get sender details
  SELECT * INTO v_sender FROM profiles WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM create_notification(
    v_comment.author_id,            -- recipient
    NEW.user_id,                    -- sender
    'comment_like',                 -- type
    'comment',                      -- entity_type
    NEW.comment_id,                 -- entity_id
    v_sender.full_name || ' liked your comment',  -- title
    LEFT(v_comment.content, 100),   -- content preview
    '/stream?post=' || v_comment.post_id || '#comment-' || NEW.comment_id,  -- action_url
    'normal'                        -- priority
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_notify_comment_like ON post_comment_likes;
CREATE TRIGGER trigger_notify_comment_like
  AFTER INSERT ON post_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_like();

-- =====================================================
-- SECTION 4: POST SHARE NOTIFICATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION notify_post_share()
RETURNS TRIGGER AS $$
DECLARE
  v_post RECORD;
  v_sender RECORD;
BEGIN
  -- Get post details
  SELECT * INTO v_post FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if user shares their own post
  IF v_post.author_id = NEW.shared_by THEN
    RETURN NEW;
  END IF;
  
  -- Get sender details
  SELECT * INTO v_sender FROM profiles WHERE id = NEW.shared_by;
  
  -- Create notification
  PERFORM create_notification(
    v_post.author_id,               -- recipient
    NEW.shared_by,                  -- sender
    'post_share',                   -- type
    'post',                         -- entity_type
    NEW.post_id,                    -- entity_id
    v_sender.full_name || ' shared your post',  -- title
    COALESCE(NEW.share_comment, LEFT(v_post.content, 100)),  -- content preview
    '/stream?post=' || NEW.post_id, -- action_url
    'normal'                        -- priority
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_notify_post_share ON post_shares;
CREATE TRIGGER trigger_notify_post_share
  AFTER INSERT ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_share();

-- =====================================================
-- SECTION 5: POST MENTION NOTIFICATIONS
-- =====================================================

-- Note: Mentions are detected in application code and notifications created there
-- This is because we need to parse the content to find @mentions

-- =====================================================
-- SECTION 6: CONNECTION REQUEST NOTIFICATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER AS $$
DECLARE
  v_sender RECORD;
BEGIN
  -- Only notify on new connection requests
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;
  
  -- Get sender details
  SELECT * INTO v_sender FROM profiles WHERE id = NEW.requester_id;
  
  -- Create notification
  PERFORM create_notification(
    NEW.recipient_id,               -- recipient
    NEW.requester_id,               -- sender
    'connection_request',           -- type
    'connection',                   -- entity_type
    NEW.id,                         -- entity_id
    v_sender.full_name || ' sent you a connection request',  -- title
    COALESCE(v_sender.headline, 'View profile'),  -- content preview
    '/me/' || v_sender.profile_slug, -- action_url
    'normal'                        -- priority
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_notify_connection_request ON connections;
CREATE TRIGGER trigger_notify_connection_request
  AFTER INSERT ON connections
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_connection_request();

-- =====================================================
-- SECTION 7: CONNECTION ACCEPTED NOTIFICATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION notify_connection_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_accepter RECORD;
BEGIN
  -- Only notify when status changes to accepted
  IF OLD.status = 'accepted' OR NEW.status != 'accepted' THEN
    RETURN NEW;
  END IF;
  
  -- Get accepter details (recipient of the original request)
  SELECT * INTO v_accepter FROM profiles WHERE id = NEW.recipient_id;
  
  -- Notify the requester that their request was accepted
  PERFORM create_notification(
    NEW.requester_id,               -- recipient (original requester)
    NEW.recipient_id,               -- sender (who accepted)
    'connection_accepted',          -- type
    'connection',                   -- entity_type
    NEW.id,                         -- entity_id
    v_accepter.full_name || ' accepted your connection request',  -- title
    'You are now connected',        -- content preview
    '/me/' || v_accepter.profile_slug, -- action_url
    'normal'                        -- priority
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_notify_connection_accepted ON connections;
CREATE TRIGGER trigger_notify_connection_accepted
  AFTER UPDATE ON connections
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'accepted')
  EXECUTE FUNCTION notify_connection_accepted();

-- =====================================================
-- SECTION 8: NEW MESSAGE NOTIFICATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_sender RECORD;
  v_conversation RECORD;
  v_participant RECORD;
  v_content_preview TEXT;
BEGIN
  -- Get sender details
  SELECT * INTO v_sender FROM profiles WHERE id = NEW.sender_id;
  
  -- Get conversation details
  SELECT * INTO v_conversation FROM conversations WHERE id = NEW.conversation_id;
  
  -- Prepare content preview
  IF NEW.message_type = 'text' THEN
    v_content_preview := LEFT(NEW.content, 100);
  ELSIF NEW.message_type = 'image' THEN
    v_content_preview := '📷 Image';
  ELSIF NEW.message_type = 'video' THEN
    v_content_preview := '🎥 Video';
  ELSIF NEW.message_type = 'document' THEN
    v_content_preview := '📄 Document';
  ELSIF NEW.message_type = 'audio' THEN
    v_content_preview := '🎤 Audio';
  ELSE
    v_content_preview := 'New message';
  END IF;
  
  -- Notify all participants except the sender
  FOR v_participant IN
    SELECT user_id
    FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id
      AND user_id != NEW.sender_id
  LOOP
    PERFORM create_notification(
      v_participant.user_id,        -- recipient
      NEW.sender_id,                -- sender
      'message_new',                -- type
      'message',                    -- entity_type
      NEW.id,                       -- entity_id
      CASE
        WHEN v_conversation.is_group THEN v_conversation.group_name || ': ' || v_sender.full_name
        ELSE v_sender.full_name
      END,                          -- title
      v_content_preview,            -- content preview
      '/messages?conversation=' || NEW.conversation_id,  -- action_url
      'high'                        -- priority (messages are high priority)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (NEW.message_type != 'system')  -- Don't notify for system messages
  EXECUTE FUNCTION notify_new_message();

-- =====================================================
-- SECTION 9: PROFILE VIEW NOTIFICATIONS (OPTIONAL)
-- =====================================================

-- Note: Profile views can generate too many notifications
-- This is typically tracked but not notified unless it's a premium feature
-- Keeping this here for future implementation

-- =====================================================
-- SECTION 10: BATCH CLEANUP FUNCTION
-- =====================================================

-- Function to clean up old read notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Delete read notifications older than 30 days
  DELETE FROM notifications
  WHERE is_read = true
    AND read_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Delete expired notifications
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION notify_post_like IS 'Creates notification when someone likes a post';
COMMENT ON FUNCTION notify_post_comment IS 'Creates notification when someone comments on a post or replies to a comment';
COMMENT ON FUNCTION notify_comment_like IS 'Creates notification when someone likes a comment';
COMMENT ON FUNCTION notify_post_share IS 'Creates notification when someone shares a post';
COMMENT ON FUNCTION notify_connection_request IS 'Creates notification when someone sends a connection request';
COMMENT ON FUNCTION notify_connection_accepted IS 'Creates notification when a connection request is accepted';
COMMENT ON FUNCTION notify_new_message IS 'Creates notification when a new message is sent';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Cleans up old read notifications (run periodically via cron)';

-- =====================================================
-- END OF FILE
-- =====================================================

