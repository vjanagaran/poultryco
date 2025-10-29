-- =====================================================
-- Fix connections table RLS policies
-- =====================================================

-- Enable RLS on connections table
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view connections they are part of
CREATE POLICY "Users can view their connections"
  ON connections FOR SELECT
  USING (
    profile_id_1 = auth.uid() OR 
    profile_id_2 = auth.uid()
  );

-- Policy: Users can delete their own connections (withdraw/remove)
CREATE POLICY "Users can delete their connections"
  ON connections FOR DELETE
  USING (
    profile_id_1 = auth.uid() OR 
    profile_id_2 = auth.uid()
  );

-- Note: INSERT/UPDATE will be handled through SECURITY DEFINER functions

-- Update send_connection_request to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION send_connection_request(
  p_requester_id UUID,
  p_target_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_connection_id UUID;
  v_min_id UUID;
  v_max_id UUID;
BEGIN
  -- Security check: requester must be the current user
  IF p_requester_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You can only send requests as yourself';
  END IF;
  
  -- Prevent self-connection
  IF p_requester_id = p_target_id THEN
    RAISE EXCEPTION 'Cannot send connection request to self';
  END IF;
  
  -- Order IDs
  IF p_requester_id < p_target_id THEN
    v_min_id := p_requester_id;
    v_max_id := p_target_id;
  ELSE
    v_min_id := p_target_id;
    v_max_id := p_requester_id;
  END IF;
  
  -- Insert or update
  INSERT INTO connections (profile_id_1, profile_id_2, requested_by, connection_message, status)
  VALUES (v_min_id, v_max_id, p_requester_id, p_message, 'pending')
  ON CONFLICT (profile_id_1, profile_id_2) DO UPDATE
  SET 
    requested_by = p_requester_id,
    connection_message = p_message,
    status = 'pending',
    requested_at = NOW(),
    responded_at = NULL
  RETURNING id INTO v_connection_id;
  
  RETURN v_connection_id;
END;
$$ LANGUAGE plpgsql;

-- Update accept_connection_request to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION accept_connection_request(
  p_connection_id UUID,
  p_acceptor_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_connection RECORD;
BEGIN
  -- Security check: acceptor must be the current user
  IF p_acceptor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You can only accept requests sent to you';
  END IF;
  
  -- Get connection details
  SELECT * INTO v_connection
  FROM connections
  WHERE id = p_connection_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Connection request not found';
  END IF;
  
  -- Check if user is the target of the request
  IF v_connection.requested_by = p_acceptor_id THEN
    RAISE EXCEPTION 'Cannot accept your own connection request';
  END IF;
  
  -- Check if user is part of this connection
  IF v_connection.profile_id_1 != p_acceptor_id AND v_connection.profile_id_2 != p_acceptor_id THEN
    RAISE EXCEPTION 'You are not part of this connection';
  END IF;
  
  -- Accept the connection
  UPDATE connections
  SET 
    status = 'connected',
    responded_at = NOW()
  WHERE id = p_connection_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create simpler accept function that takes requester_profile_id
CREATE OR REPLACE FUNCTION accept_connection_request(
  requester_profile_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_connection_id UUID;
  v_min_id UUID;
  v_max_id UUID;
BEGIN
  -- Security check: current user must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Order IDs to find the connection
  IF requester_profile_id < auth.uid() THEN
    v_min_id := requester_profile_id;
    v_max_id := auth.uid();
  ELSE
    v_min_id := auth.uid();
    v_max_id := requester_profile_id;
  END IF;
  
  -- Accept the connection
  UPDATE connections
  SET 
    status = 'connected',
    responded_at = NOW()
  WHERE profile_id_1 = v_min_id 
    AND profile_id_2 = v_max_id
    AND requested_by = requester_profile_id
    AND status = 'pending'
  RETURNING id INTO v_connection_id;
  
  IF v_connection_id IS NULL THEN
    RAISE EXCEPTION 'Connection request not found or already processed';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create reject function
CREATE OR REPLACE FUNCTION reject_connection_request(
  requester_profile_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_min_id UUID;
  v_max_id UUID;
BEGIN
  -- Security check: current user must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Order IDs to find the connection
  IF requester_profile_id < auth.uid() THEN
    v_min_id := requester_profile_id;
    v_max_id := auth.uid();
  ELSE
    v_min_id := auth.uid();
    v_max_id := requester_profile_id;
  END IF;
  
  -- Delete the pending request
  DELETE FROM connections
  WHERE profile_id_1 = v_min_id 
    AND profile_id_2 = v_max_id
    AND requested_by = requester_profile_id
    AND status = 'pending';
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view follows they are part of
CREATE POLICY "Users can view follows"
  ON follows FOR SELECT
  USING (
    follower_id = auth.uid() OR 
    following_id = auth.uid()
  );

-- Policy: Users can create follows as themselves
CREATE POLICY "Users can create follows"
  ON follows FOR INSERT
  WITH CHECK (
    follower_id = auth.uid()
  );

-- Policy: Users can delete their own follows
CREATE POLICY "Users can delete their follows"
  ON follows FOR DELETE
  USING (
    follower_id = auth.uid()
  );

