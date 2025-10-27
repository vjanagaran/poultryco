-- =====================================================
-- Fix Connection Request Notification Trigger
-- =====================================================

-- Drop the old trigger function first
DROP FUNCTION IF EXISTS notify_connection_request() CASCADE;

-- Create the corrected function
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
  
  -- Create notification
  PERFORM create_notification(
    v_recipient_id,                 -- recipient
    NEW.requested_by,               -- sender
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

-- Re-create the trigger
CREATE TRIGGER trigger_notify_connection_request
  AFTER INSERT ON connections
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_connection_request();

-- Fix the connection accepted notification as well
DROP FUNCTION IF EXISTS notify_connection_accepted() CASCADE;

CREATE OR REPLACE FUNCTION notify_connection_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_accepter RECORD;
  v_requester_id UUID;
  v_accepter_id UUID;
BEGIN
  -- Only notify when status changes to connected (not accepted)
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
  
  -- Notify the requester that their request was accepted
  PERFORM create_notification(
    v_requester_id,                 -- recipient (original requester)
    v_accepter_id,                  -- sender (who accepted)
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

-- Re-create the trigger
CREATE TRIGGER trigger_notify_connection_accepted
  AFTER UPDATE ON connections
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'connected')
  EXECUTE FUNCTION notify_connection_accepted();
