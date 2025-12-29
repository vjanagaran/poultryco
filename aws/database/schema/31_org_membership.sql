-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 31_org_membership.sql
-- Description: Organization membership system
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 30_org_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: MEMBERSHIP TIERS
-- =====================================================

CREATE TABLE IF NOT EXISTS org_membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
  
  -- Tier details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  annual_fee DECIMAL(10, 2),
  currency TEXT DEFAULT 'INR',
  
  -- Benefits
  benefits TEXT[],
  
  -- Limits
  max_members INTEGER,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_membership_tiers_organization ON org_membership_tiers(organization_id, display_order);
CREATE INDEX idx_org_membership_tiers_active ON org_membership_tiers(is_active) WHERE is_active = true;

CREATE TRIGGER update_org_membership_tiers_updated_at
  BEFORE UPDATE ON org_membership_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: ORGANIZATION MEMBERS
-- =====================================================

CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
  
  -- Member (polymorphic)
  member_type TEXT NOT NULL CHECK (member_type IN ('individual', 'business')),
  member_id UUID NOT NULL, -- profile_id or business_id
  
  -- Membership
  tier_id UUID REFERENCES org_membership_tiers(id),
  membership_number TEXT,
  
  -- Role
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired')),
  
  -- Dates
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, member_type, member_id)
);

CREATE INDEX idx_org_members_organization ON org_members(organization_id);
CREATE INDEX idx_org_members_member ON org_members(member_type, member_id);
CREATE INDEX idx_org_members_tier ON org_members(tier_id);
CREATE INDEX idx_org_members_status ON org_members(status);
CREATE INDEX idx_org_members_active ON org_members(organization_id, status) WHERE status = 'active';

CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: MEMBERSHIP APPLICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS org_membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
  
  -- Applicant (polymorphic)
  applicant_type TEXT NOT NULL CHECK (applicant_type IN ('individual', 'business')),
  applicant_id UUID NOT NULL,
  
  -- Application
  tier_id UUID REFERENCES org_membership_tiers(id),
  application_message TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_membership_applications_organization ON org_membership_applications(organization_id);
CREATE INDEX idx_org_membership_applications_applicant ON org_membership_applications(applicant_type, applicant_id);
CREATE INDEX idx_org_membership_applications_status ON org_membership_applications(status);
CREATE INDEX idx_org_membership_applications_pending ON org_membership_applications(organization_id, status) WHERE status = 'pending';

CREATE TRIGGER update_org_membership_applications_updated_at
  BEFORE UPDATE ON org_membership_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: MEMBER INVITATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS org_member_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
  
  -- Inviter
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Invitee
  invitee_email TEXT,
  invitee_phone TEXT,
  invitee_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Invitation
  tier_id UUID REFERENCES org_membership_tiers(id),
  invitation_message TEXT,
  invitation_token TEXT UNIQUE NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  
  -- Dates
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_member_invitations_organization ON org_member_invitations(organization_id);
CREATE INDEX idx_org_member_invitations_invited_by ON org_member_invitations(invited_by);
CREATE INDEX idx_org_member_invitations_invitee ON org_member_invitations(invitee_profile_id);
CREATE INDEX idx_org_member_invitations_token ON org_member_invitations(invitation_token);
CREATE INDEX idx_org_member_invitations_status ON org_member_invitations(status);

CREATE TRIGGER update_org_member_invitations_updated_at
  BEFORE UPDATE ON org_member_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: MEMBERSHIP HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS org_membership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES org_members(id) ON DELETE CASCADE,
  
  -- Event
  event_type TEXT NOT NULL CHECK (event_type IN ('joined', 'renewed', 'upgraded', 'downgraded', 'suspended', 'expired', 'left')),
  
  -- Details
  old_tier_id UUID REFERENCES org_membership_tiers(id),
  new_tier_id UUID REFERENCES org_membership_tiers(id),
  notes TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_membership_history_organization ON org_membership_history(organization_id);
CREATE INDEX idx_org_membership_history_member ON org_membership_history(member_id);
CREATE INDEX idx_org_membership_history_event ON org_membership_history(event_type);
CREATE INDEX idx_org_membership_history_created ON org_membership_history(created_at DESC);

-- =====================================================
-- SECTION 6: HELPER FUNCTIONS
-- =====================================================

-- Update member count when member added/removed
CREATE OR REPLACE FUNCTION update_org_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE org_stats
    SET 
      members_count = members_count + 1,
      individual_members_count = individual_members_count + CASE WHEN NEW.member_type = 'individual' THEN 1 ELSE 0 END,
      business_members_count = business_members_count + CASE WHEN NEW.member_type = 'business' THEN 1 ELSE 0 END,
      last_updated_at = NOW()
    WHERE organization_id = NEW.organization_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE org_stats
    SET 
      members_count = GREATEST(members_count - 1, 0),
      individual_members_count = GREATEST(individual_members_count - CASE WHEN OLD.member_type = 'individual' THEN 1 ELSE 0 END, 0),
      business_members_count = GREATEST(business_members_count - CASE WHEN OLD.member_type = 'business' THEN 1 ELSE 0 END, 0),
      last_updated_at = NOW()
    WHERE organization_id = OLD.organization_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_org_member_count
  AFTER INSERT OR DELETE ON org_members
  FOR EACH ROW
  EXECUTE FUNCTION update_org_member_count();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE org_membership_tiers IS 'Organization membership tiers with pricing';
COMMENT ON TABLE org_members IS 'Organization members (individuals and businesses)';
COMMENT ON TABLE org_membership_applications IS 'Membership applications';
COMMENT ON TABLE org_member_invitations IS 'Member invitations';
COMMENT ON TABLE org_membership_history IS 'Membership event history';

