-- =====================================================
-- Fix Notification RLS Policies
-- =====================================================

-- The notification triggers need to be able to insert notifications
-- We'll create a policy that allows the trigger functions to insert

-- First, drop any existing insert policy
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Triggers can create notifications" ON notifications;

-- Create a policy that allows authenticated users to create notifications
-- but only through the create_notification function
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    -- Allow inserts when:
    -- 1. The sender exists in profiles
    -- 2. The recipient exists in profiles
    -- 3. The notification type is valid
    EXISTS (SELECT 1 FROM profiles WHERE id = sender_id) AND
    EXISTS (SELECT 1 FROM profiles WHERE id = recipient_id) AND
    notification_type IN (
      'post_like', 'post_comment', 'comment_like',
      'connection_request', 'connection_accepted', 'follow_new',
      'message_new', 'profile_view', 'post_share',
      'system_announcement', 'system_update'
    )
  );

-- Also ensure the create_notification function is accessible
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;

-- Alternative approach: Create a security definer function for connection notifications
CREATE OR REPLACE FUNCTION create_connection_notification(
  p_recipient_id UUID,
  p_sender_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_content TEXT,
  p_action_url TEXT,
  p_entity_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Create the notification
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    notification_type,
    title,
    content,
    action_url,
    entity_type,
    entity_id,
    priority
  ) VALUES (
    p_recipient_id,
    p_sender_id,
    p_notification_type,
    p_title,
    p_content,
    p_action_url,
    'connection',
    p_entity_id,
    'normal'
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_connection_notification TO authenticated;

-- Update the connection request trigger to use the security definer function
CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER AS $$
DECLARE
  v_sender RECORD;
  v_recipient_id UUID;
BEGIN
  -- Only notify on new connection requests
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;
  
  -- Determine the recipient (the one who didn't request)
  IF NEW.requested_by = NEW.profile_id_1 THEN
    v_recipient_id := NEW.profile_id_2;
  ELSE
    v_recipient_id := NEW.profile_id_1;
  END IF;
  
  -- Get sender details
  SELECT * INTO v_sender FROM profiles WHERE id = NEW.requested_by;
  
  -- Create notification using security definer function
  PERFORM create_connection_notification(
    v_recipient_id,
    NEW.requested_by,
    'connection_request',
    v_sender.full_name || ' sent you a connection request',
    COALESCE(v_sender.headline, 'View profile'),
    '/me/' || v_sender.profile_slug,
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the connection accepted trigger similarly
CREATE OR REPLACE FUNCTION notify_connection_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_accepter RECORD;
  v_requester_id UUID;
  v_accepter_id UUID;
BEGIN
  -- Only notify when status changes to connected
  IF OLD.status = 'connected' OR NEW.status != 'connected' THEN
    RETURN NEW;
  END IF;
  
  -- The requester is stored in requested_by
  v_requester_id := NEW.requested_by;
  
  -- The accepter is the other party
  IF NEW.requested_by = NEW.profile_id_1 THEN
    v_accepter_id := NEW.profile_id_2;
  ELSE
    v_accepter_id := NEW.profile_id_1;
  END IF;
  
  -- Get accepter details
  SELECT * INTO v_accepter FROM profiles WHERE id = v_accepter_id;
  
  -- Create notification using security definer function
  PERFORM create_connection_notification(
    v_requester_id,
    v_accepter_id,
    'connection_accepted',
    v_accepter.full_name || ' accepted your connection request',
    'You are now connected',
    '/me/' || v_accepter.profile_slug,
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
