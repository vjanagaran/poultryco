-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 70_ntf_core.sql
-- Description: Notifications system
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS ntf_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification type
  notification_type_id UUID REFERENCES ref_notification_types(id),
  
  -- Actor (who triggered the notification)
  actor_type TEXT CHECK (actor_type IN ('individual', 'business', 'organization', 'system')),
  actor_id UUID,
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Action/Link
  action_type TEXT, -- 'post', 'comment', 'connection', 'event', 'message', etc.
  action_id UUID,
  action_url TEXT,
  
  -- Metadata
  metadata JSONB, -- Additional context
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Priority
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Delivery
  delivered_push BOOLEAN NOT NULL DEFAULT false,
  delivered_email BOOLEAN NOT NULL DEFAULT false,
  delivered_sms BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ntf_notifications_recipient ON ntf_notifications(recipient_id, created_at DESC);
CREATE INDEX idx_ntf_notifications_type ON ntf_notifications(notification_type_id);
CREATE INDEX idx_ntf_notifications_actor ON ntf_notifications(actor_type, actor_id);
CREATE INDEX idx_ntf_notifications_unread ON ntf_notifications(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX idx_ntf_notifications_priority ON ntf_notifications(priority, created_at DESC);

-- =====================================================
-- SECTION 2: NOTIFICATION PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS ntf_preferences (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Global settings
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Notification types (JSONB for flexibility)
  preferences JSONB NOT NULL DEFAULT '{
    "connections": {"push": true, "email": true, "sms": false},
    "messages": {"push": true, "email": true, "sms": false},
    "posts": {"push": true, "email": false, "sms": false},
    "comments": {"push": true, "email": false, "sms": false},
    "likes": {"push": true, "email": false, "sms": false},
    "events": {"push": true, "email": true, "sms": false},
    "resources": {"push": true, "email": true, "sms": false},
    "system": {"push": true, "email": true, "sms": false}
  }'::jsonb,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  -- Digest
  daily_digest_enabled BOOLEAN NOT NULL DEFAULT false,
  weekly_digest_enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_ntf_preferences_updated_at
  BEFORE UPDATE ON ntf_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: NOTIFICATION QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS ntf_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES ntf_notifications(id) ON DELETE CASCADE,
  
  -- Delivery method
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('push', 'email', 'sms')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  
  -- Attempts
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  
  -- Error
  error_message TEXT,
  
  -- Timestamps
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ntf_queue_notification ON ntf_queue(notification_id);
CREATE INDEX idx_ntf_queue_status ON ntf_queue(status);
CREATE INDEX idx_ntf_queue_pending ON ntf_queue(status, scheduled_at) WHERE status = 'pending';

-- =====================================================
-- SECTION 4: NOTIFICATION TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS ntf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template details
  name TEXT NOT NULL UNIQUE,
  notification_type_id UUID REFERENCES ref_notification_types(id),
  
  -- Content (with variables)
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  
  -- Email (if applicable)
  email_subject_template TEXT,
  email_body_template TEXT,
  
  -- SMS (if applicable)
  sms_template TEXT,
  
  -- Variables
  variables TEXT[], -- ['actor_name', 'post_title', etc.]
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ntf_templates_name ON ntf_templates(name);
CREATE INDEX idx_ntf_templates_type ON ntf_templates(notification_type_id);
CREATE INDEX idx_ntf_templates_active ON ntf_templates(is_active) WHERE is_active = true;

CREATE TRIGGER update_ntf_templates_updated_at
  BEFORE UPDATE ON ntf_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: HELPER FUNCTIONS
-- =====================================================

-- Create default notification preferences
CREATE OR REPLACE FUNCTION create_default_ntf_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ntf_preferences (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_ntf_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_ntf_preferences();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE ntf_notifications IS 'User notifications';
COMMENT ON TABLE ntf_preferences IS 'User notification preferences';
COMMENT ON TABLE ntf_queue IS 'Notification delivery queue';
COMMENT ON TABLE ntf_templates IS 'Notification templates';

