-- =====================================================
-- PoultryCo Database Schema
-- File: 10_network_connections.sql
-- Description: Connections and follow system
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: CONNECTIONS (MUTUAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Connection between two profiles (alphabetically ordered to prevent duplicates)
  profile_id_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'connected', 'blocked'
  )),
  
  -- Request tracking
  requested_by UUID NOT NULL REFERENCES profiles(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Response tracking
  responded_at TIMESTAMPTZ,
  
  -- Message (optional)
  connection_message TEXT CHECK (char_length(connection_message) <= 300),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure profile_id_1 < profile_id_2 (alphabetical ordering)
  CONSTRAINT ordered_profile_ids CHECK (profile_id_1 < profile_id_2),
  
  -- Unique connection
  UNIQUE(profile_id_1, profile_id_2)
);

-- Indexes
CREATE INDEX idx_connections_profile_1 ON connections(profile_id_1);
CREATE INDEX idx_connections_profile_2 ON connections(profile_id_2);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_requested_by ON connections(requested_by);
CREATE INDEX idx_connections_requested_at ON connections(requested_at DESC);

-- Trigger
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure correct ordering
CREATE OR REPLACE FUNCTION ensure_connection_ordering()
RETURNS TRIGGER AS $$
BEGIN
  -- Swap if not in correct order
  IF NEW.profile_id_1 > NEW.profile_id_2 THEN
    DECLARE
      temp UUID;
    BEGIN
      temp := NEW.profile_id_1;
      NEW.profile_id_1 := NEW.profile_id_2;
      NEW.profile_id_2 := temp;
    END;
  END IF;
  
  -- Prevent self-connection
  IF NEW.profile_id_1 = NEW.profile_id_2 THEN
    RAISE EXCEPTION 'Cannot create connection with self';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce ordering
CREATE TRIGGER enforce_connection_ordering
  BEFORE INSERT OR UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION ensure_connection_ordering();

-- Function to get connection status between two users
CREATE OR REPLACE FUNCTION get_connection_status(
  p_profile_id_1 UUID,
  p_profile_id_2 UUID
)
RETURNS TEXT AS $$
DECLARE
  v_status TEXT;
  v_min_id UUID;
  v_max_id UUID;
BEGIN
  -- Order IDs
  IF p_profile_id_1 < p_profile_id_2 THEN
    v_min_id := p_profile_id_1;
    v_max_id := p_profile_id_2;
  ELSE
    v_min_id := p_profile_id_2;
    v_max_id := p_profile_id_1;
  END IF;
  
  -- Get status
  SELECT status INTO v_status
  FROM connections
  WHERE profile_id_1 = v_min_id AND profile_id_2 = v_max_id;
  
  RETURN COALESCE(v_status, 'none');
END;
$$ LANGUAGE plpgsql;

-- Function to send connection request
CREATE OR REPLACE FUNCTION send_connection_request(
  p_requester_id UUID,
  p_target_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_connection_id UUID;
  v_min_id UUID;
  v_max_id UUID;
BEGIN
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

-- Function to accept connection request
CREATE OR REPLACE FUNCTION accept_connection_request(
  p_connection_id UUID,
  p_acceptor_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_connection RECORD;
BEGIN
  -- Get connection
  SELECT * INTO v_connection FROM connections WHERE id = p_connection_id;
  
  IF v_connection IS NULL THEN
    RAISE EXCEPTION 'Connection not found';
  END IF;
  
  -- Verify acceptor is the target (not the requester)
  IF v_connection.requested_by = p_acceptor_id THEN
    RAISE EXCEPTION 'Cannot accept own connection request';
  END IF;
  
  -- Verify acceptor is part of the connection
  IF v_connection.profile_id_1 != p_acceptor_id AND v_connection.profile_id_2 != p_acceptor_id THEN
    RAISE EXCEPTION 'Not authorized to accept this connection';
  END IF;
  
  -- Update connection
  UPDATE connections
  SET 
    status = 'connected',
    responded_at = NOW()
  WHERE id = p_connection_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 2: FOLLOWS (ONE-WAY)
-- =====================================================

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Follower -> Following
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Type (can follow personal profiles, businesses, or organizations)
  following_type TEXT NOT NULL CHECK (following_type IN ('profile', 'business', 'organization')),
  
  -- Notifications
  notify_on_post BOOLEAN NOT NULL DEFAULT true,
  notify_on_update BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamp
  followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique follow
  UNIQUE(follower_id, following_type, following_id),
  
  -- Prevent self-follow
  CONSTRAINT no_self_follow CHECK (follower_id != following_id OR following_type != 'profile')
);

-- Indexes
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_type, following_id);
CREATE INDEX idx_follows_followed_at ON follows(followed_at DESC);

-- =====================================================
-- SECTION 3: CONNECTION SUGGESTIONS
-- =====================================================

-- Table to store suggested connections (can be computed periodically)
CREATE TABLE IF NOT EXISTS connection_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  suggested_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reason
  suggestion_reason TEXT NOT NULL CHECK (suggestion_reason IN (
    'mutual_connections', 'same_location', 'same_role', 
    'same_organization', 'similar_skills', 'system_recommendation'
  )),
  
  -- Score
  relevance_score DECIMAL(3, 2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'connected')),
  
  -- Timestamps
  suggested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  
  -- Unique suggestion
  UNIQUE(profile_id, suggested_profile_id)
);

-- Indexes
CREATE INDEX idx_suggestions_profile ON connection_suggestions(profile_id);
CREATE INDEX idx_suggestions_status ON connection_suggestions(status);
CREATE INDEX idx_suggestions_score ON connection_suggestions(relevance_score DESC);
CREATE INDEX idx_suggestions_suggested_at ON connection_suggestions(suggested_at DESC);

-- =====================================================
-- SECTION 4: BLOCKED USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reason (optional)
  block_reason TEXT,
  
  -- Timestamp
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique block
  UNIQUE(blocker_id, blocked_id),
  
  -- Prevent self-block
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Indexes
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE connections IS 'Mutual connections between users (LinkedIn-style). IDs are alphabetically ordered to prevent duplicates.';
COMMENT ON COLUMN connections.profile_id_1 IS 'Always the smaller UUID (alphabetically)';
COMMENT ON COLUMN connections.profile_id_2 IS 'Always the larger UUID (alphabetically)';
COMMENT ON COLUMN connections.requested_by IS 'Who initiated the connection request';

COMMENT ON TABLE follows IS 'One-way follow system (can follow profiles, businesses, organizations)';
COMMENT ON TABLE connection_suggestions IS 'Suggested connections based on network, location, skills, etc.';
COMMENT ON TABLE blocked_users IS 'Blocked users list';

COMMENT ON FUNCTION get_connection_status IS 'Returns connection status between two users: none, pending, connected, blocked';
COMMENT ON FUNCTION send_connection_request IS 'Sends or updates a connection request';
COMMENT ON FUNCTION accept_connection_request IS 'Accepts a pending connection request';

-- =====================================================
-- END OF FILE
-- =====================================================

