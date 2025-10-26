-- =====================================================
-- PoultryCo Database Schema
-- File: 18_notifications_system.sql
-- Description: Notifications and preferences
-- Version: 1.0
-- Date: 2025-10-25
-- Dependencies: 01_core_profiles.sql, 15_social_posts_system.sql
-- =====================================================

-- =====================================================
-- SECTION 1: NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Sender (can be null for system notifications)
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Type
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'post_like', 'post_comment', 'post_share', 'post_mention',
    'comment_like', 'comment_reply',
    'connection_request', 'connection_accepted',
    'message_new', 'message_mention',
    'follow_new',
    'profile_view',
    'endorsement_received',
    'job_application', 'job_match',
    'event_invitation', 'event_reminder',
    'system_announcement', 'system_update',
    'badge_earned', 'milestone_reached',
    'other'
  )),
  
  -- Entity reference (polymorphic)
  entity_type TEXT CHECK (entity_type IN (
    'post', 'comment', 'message', 'connection', 'profile', 
    'job', 'event', 'product', 'organization', 'other'
  )),
  entity_id UUID,
  
  -- Content
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT CHECK (char_length(content) <= 500),
  
  -- Action link
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Priority
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Delivery
  delivered_via TEXT[] DEFAULT '{}' CHECK (
    delivered_via <@ ARRAY['in_app', 'email', 'push', 'sms', 'whatsapp']
  ),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_sender ON notifications(sender_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id, is_read, created_at DESC) WHERE NOT is_read;
CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);

-- =====================================================
-- SECTION 2: NOTIFICATION PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Email notifications
  email_post_likes BOOLEAN NOT NULL DEFAULT true,
  email_post_comments BOOLEAN NOT NULL DEFAULT true,
  email_post_mentions BOOLEAN NOT NULL DEFAULT true,
  email_connection_requests BOOLEAN NOT NULL DEFAULT true,
  email_messages BOOLEAN NOT NULL DEFAULT true,
  email_weekly_digest BOOLEAN NOT NULL DEFAULT true,
  email_marketing BOOLEAN NOT NULL DEFAULT false,
  
  -- Push notifications
  push_post_likes BOOLEAN NOT NULL DEFAULT false,
  push_post_comments BOOLEAN NOT NULL DEFAULT true,
  push_post_mentions BOOLEAN NOT NULL DEFAULT true,
  push_connection_requests BOOLEAN NOT NULL DEFAULT true,
  push_messages BOOLEAN NOT NULL DEFAULT true,
  push_events BOOLEAN NOT NULL DEFAULT true,
  
  -- In-app notifications
  in_app_post_likes BOOLEAN NOT NULL DEFAULT true,
  in_app_post_comments BOOLEAN NOT NULL DEFAULT true,
  in_app_connection_requests BOOLEAN NOT NULL DEFAULT true,
  in_app_messages BOOLEAN NOT NULL DEFAULT true,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  -- Digest
  digest_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (digest_frequency IN ('daily', 'weekly', 'monthly', 'never')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: NOTIFICATION TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  
  -- Content
  title_template TEXT NOT NULL,
  content_template TEXT NOT NULL,
  
  -- Variables used in templates (for documentation)
  variables JSONB,
  
  -- Type mapping
  notification_type TEXT NOT NULL,
  
  -- Active/Inactive
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: HELPER FUNCTIONS
-- =====================================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_recipient_id UUID,
  p_sender_id UUID,
  p_notification_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_prefs RECORD;
  v_delivered_via TEXT[] := '{}';
BEGIN
  -- Get user preferences
  SELECT * INTO v_prefs
  FROM notification_preferences
  WHERE user_id = p_recipient_id;
  
  -- Default preferences if not set
  IF v_prefs IS NULL THEN
    v_delivered_via := ARRAY['in_app'];
  ELSE
    -- Determine delivery channels based on preferences
    v_delivered_via := ARRAY['in_app']; -- Always deliver in-app
    
    -- Add other channels based on type and preferences
    IF p_notification_type = 'message_new' AND v_prefs.push_messages THEN
      v_delivered_via := array_append(v_delivered_via, 'push');
    END IF;
    
    -- Add more conditions as needed
  END IF;
  
  -- Create notification
  INSERT INTO notifications (
    recipient_id, sender_id, notification_type,
    entity_type, entity_id,
    title, content, action_url, priority,
    delivered_via
  )
  VALUES (
    p_recipient_id, p_sender_id, p_notification_type,
    p_entity_type, p_entity_id,
    p_title, p_content, p_action_url, p_priority,
    v_delivered_via
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all unread notifications as read
    UPDATE notifications
    SET is_read = true, read_at = NOW()
    WHERE recipient_id = p_user_id AND NOT is_read;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications
    SET is_read = true, read_at = NOW()
    WHERE id = ANY(p_notification_ids) AND recipient_id = p_user_id AND NOT is_read;
  END IF;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notifications_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE recipient_id = p_user_id
    AND NOT is_read
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ENABLE RLS ON NOTIFICATION TABLES
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR NOTIFICATIONS
-- =====================================================

-- Notifications: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth_uid());

-- Notifications: System can create notifications (via service role)
-- Users can't directly create notifications (use trigger functions instead)

-- Notifications: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (recipient_id = auth_uid())
  WITH CHECK (recipient_id = auth_uid());

-- Notification preferences: Users can view and manage their own preferences
CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences FOR ALL
  USING (user_id = auth_uid())
  WITH CHECK (user_id = auth_uid());

-- Notification templates: Everyone can view active templates
CREATE POLICY "Active templates viewable by everyone"
  ON notification_templates FOR SELECT
  USING (is_active = true);

-- =====================================================
-- ENABLE REALTIME FOR NOTIFICATIONS
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE notifications IS 'User notifications for various events';
COMMENT ON COLUMN notifications.entity_type IS 'Type of entity this notification refers to';
COMMENT ON COLUMN notifications.entity_id IS 'ID of the referenced entity';
COMMENT ON COLUMN notifications.delivered_via IS 'Channels this notification was delivered through';

COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery';
COMMENT ON TABLE notification_templates IS 'Templates for generating notifications';

COMMENT ON FUNCTION create_notification IS 'Creates a new notification with proper delivery channels';
COMMENT ON FUNCTION mark_notifications_as_read IS 'Marks notifications as read, returns count updated';
COMMENT ON FUNCTION get_unread_notifications_count IS 'Gets count of unread notifications for a user';

-- =====================================================
-- END OF FILE
-- =====================================================

