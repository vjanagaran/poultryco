-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 41_soc_connections.sql
-- Description: Social connections and follows
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: CONNECTIONS (Mutual)
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  
  -- Request details
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Response
  responded_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure profile_id_1 < profile_id_2 for uniqueness
  CHECK (profile_id_1 < profile_id_2),
  UNIQUE(profile_id_1, profile_id_2)
);

CREATE INDEX idx_soc_connections_profile1 ON soc_connections(profile_id_1);
CREATE INDEX idx_soc_connections_profile2 ON soc_connections(profile_id_2);
CREATE INDEX idx_soc_connections_status ON soc_connections(status);
CREATE INDEX idx_soc_connections_requested_by ON soc_connections(requested_by);
CREATE INDEX idx_soc_connections_pending ON soc_connections(profile_id_1, status) WHERE status = 'pending';
CREATE INDEX idx_soc_connections_accepted ON soc_connections(status) WHERE status = 'accepted';

CREATE TRIGGER update_soc_connections_updated_at
  BEFORE UPDATE ON soc_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: FOLLOWS (Asymmetric)
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Follower (polymorphic: individual, business, organization)
  follower_type TEXT NOT NULL CHECK (follower_type IN ('individual', 'business', 'organization')),
  follower_id UUID NOT NULL,
  
  -- Following (polymorphic: individual, business, organization)
  following_type TEXT NOT NULL CHECK (following_type IN ('individual', 'business', 'organization')),
  following_id UUID NOT NULL,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(follower_type, follower_id, following_type, following_id)
);

CREATE INDEX idx_soc_follows_follower ON soc_follows(follower_type, follower_id);
CREATE INDEX idx_soc_follows_following ON soc_follows(following_type, following_id);
CREATE INDEX idx_soc_follows_created ON soc_follows(created_at DESC);

-- =====================================================
-- SECTION 3: BLOCKS
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reason
  reason TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_soc_blocks_blocker ON soc_blocks(blocker_id);
CREATE INDEX idx_soc_blocks_blocked ON soc_blocks(blocked_id);

-- =====================================================
-- SECTION 4: CONNECTION SUGGESTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS soc_connection_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  suggested_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Suggestion reason
  reason TEXT CHECK (reason IN ('mutual_connections', 'same_location', 'same_role', 'same_business_type', 'algorithm')),
  score DECIMAL(3, 2) DEFAULT 0.5, -- 0.0 to 1.0
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(profile_id, suggested_profile_id)
);

CREATE INDEX idx_soc_connection_suggestions_profile ON soc_connection_suggestions(profile_id, score DESC);
CREATE INDEX idx_soc_connection_suggestions_status ON soc_connection_suggestions(status);
CREATE INDEX idx_soc_connection_suggestions_pending ON soc_connection_suggestions(profile_id, status) WHERE status = 'pending';

CREATE TRIGGER update_soc_connection_suggestions_updated_at
  BEFORE UPDATE ON soc_connection_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: HELPER FUNCTIONS
-- =====================================================

-- Update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update follower's following_count
    IF NEW.follower_type = 'individual' THEN
      UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    ELSIF NEW.follower_type = 'business' THEN
      UPDATE biz_profiles SET followers_count = followers_count + 1 WHERE id = NEW.follower_id;
    ELSIF NEW.follower_type = 'organization' THEN
      UPDATE org_profiles SET followers_count = followers_count + 1 WHERE id = NEW.follower_id;
    END IF;
    
    -- Update following's followers_count
    IF NEW.following_type = 'individual' THEN
      UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    ELSIF NEW.following_type = 'business' THEN
      UPDATE biz_profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    ELSIF NEW.following_type = 'organization' THEN
      UPDATE org_profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Update follower's following_count
    IF OLD.follower_type = 'individual' THEN
      UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    ELSIF OLD.follower_type = 'business' THEN
      UPDATE biz_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.follower_id;
    ELSIF OLD.follower_type = 'organization' THEN
      UPDATE org_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.follower_id;
    END IF;
    
    -- Update following's followers_count
    IF OLD.following_type = 'individual' THEN
      UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    ELSIF OLD.following_type = 'business' THEN
      UPDATE biz_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    ELSIF OLD.following_type = 'organization' THEN
      UPDATE org_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_follow_counts
  AFTER INSERT OR DELETE ON soc_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Update connection count
CREATE OR REPLACE FUNCTION update_connection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET connections_count = connections_count + 1 WHERE id = NEW.profile_id_1;
    UPDATE profiles SET connections_count = connections_count + 1 WHERE id = NEW.profile_id_2;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET connections_count = connections_count + 1 WHERE id = NEW.profile_id_1;
    UPDATE profiles SET connections_count = connections_count + 1 WHERE id = NEW.profile_id_2;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE profiles SET connections_count = GREATEST(connections_count - 1, 0) WHERE id = OLD.profile_id_1;
    UPDATE profiles SET connections_count = GREATEST(connections_count - 1, 0) WHERE id = OLD.profile_id_2;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_connection_count
  AFTER INSERT OR UPDATE OR DELETE ON soc_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_connection_count();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE soc_connections IS 'Mutual connections between profiles';
COMMENT ON TABLE soc_follows IS 'Asymmetric follows (any entity can follow any entity)';
COMMENT ON TABLE soc_blocks IS 'Blocked profiles';
COMMENT ON TABLE soc_connection_suggestions IS 'Connection suggestions for users';

