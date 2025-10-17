-- =====================================================
-- PoultryCo Database Schema
-- File: 07_memberships_events.sql
-- Description: Polymorphic membership system and event management
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: ORGANIZATION MEMBERS (POLYMORPHIC)
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Polymorphic Member (can be personal OR business profile)
  member_type TEXT NOT NULL CHECK (member_type IN ('personal', 'business')),
  member_id UUID NOT NULL, -- References profiles.id OR business_profiles.id
  
  -- Membership
  membership_tier_id UUID REFERENCES organization_membership_tiers(id),
  membership_number TEXT,
  
  -- Status
  membership_status TEXT NOT NULL DEFAULT 'pending' CHECK (membership_status IN (
    'pending', 'active', 'inactive', 'suspended', 'expired', 'cancelled'
  )),
  
  -- Dates
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  renewal_date DATE,
  expiry_date DATE,
  
  -- Source
  invitation_source TEXT CHECK (invitation_source IN ('direct', 'bulk_invite', 'self_signup', 'referral')),
  invited_by UUID REFERENCES profiles(id),
  
  -- Badge Display
  show_badge_on_profile BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique membership per organization
  UNIQUE(organization_id, member_type, member_id)
);

-- Indexes
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_type_id ON organization_members(member_type, member_id);
CREATE INDEX idx_org_members_status ON organization_members(membership_status);
CREATE INDEX idx_org_members_tier ON organization_members(membership_tier_id);
CREATE INDEX idx_org_members_joined ON organization_members(joined_date DESC);
CREATE INDEX idx_org_members_expiry ON organization_members(expiry_date);

-- Trigger
CREATE TRIGGER update_organization_members_updated_at
  BEFORE UPDATE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to validate polymorphic member_id
CREATE OR REPLACE FUNCTION validate_member_exists()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_type = 'personal' THEN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.member_id) THEN
      RAISE EXCEPTION 'Personal profile with id % does not exist', NEW.member_id;
    END IF;
  ELSIF NEW.member_type = 'business' THEN
    IF NOT EXISTS (SELECT 1 FROM business_profiles WHERE id = NEW.member_id) THEN
      RAISE EXCEPTION 'Business profile with id % does not exist', NEW.member_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate member
CREATE TRIGGER validate_organization_member
  BEFORE INSERT OR UPDATE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION validate_member_exists();

-- =====================================================
-- SECTION 2: MEMBERSHIP APPLICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Applicant (polymorphic)
  applicant_type TEXT NOT NULL CHECK (applicant_type IN ('personal', 'business')),
  applicant_id UUID NOT NULL,
  
  -- Application
  requested_tier_id UUID REFERENCES organization_membership_tiers(id),
  application_message TEXT,
  
  -- Status
  application_status TEXT NOT NULL DEFAULT 'pending' CHECK (application_status IN (
    'pending', 'approved', 'rejected', 'withdrawn'
  )),
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_membership_applications_org ON organization_membership_applications(organization_id);
CREATE INDEX idx_membership_applications_applicant ON organization_membership_applications(applicant_type, applicant_id);
CREATE INDEX idx_membership_applications_status ON organization_membership_applications(application_status);
CREATE INDEX idx_membership_applications_applied ON organization_membership_applications(applied_at DESC);

-- Trigger
CREATE TRIGGER update_organization_membership_applications_updated_at
  BEFORE UPDATE ON organization_membership_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: BULK MEMBER INVITATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_member_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Invitation
  invite_type TEXT NOT NULL CHECK (invite_type IN ('personal', 'business')),
  
  -- For Existing Users
  invited_profile_id UUID REFERENCES profiles(id),
  invited_business_id UUID REFERENCES business_profiles(id),
  
  -- For New Users (CSV bulk upload)
  invitee_name TEXT,
  invitee_email TEXT,
  invitee_phone TEXT,
  
  -- Details
  suggested_tier_id UUID REFERENCES organization_membership_tiers(id),
  invitation_message TEXT,
  
  -- Status
  invitation_status TEXT NOT NULL DEFAULT 'sent' CHECK (invitation_status IN (
    'sent', 'delivered', 'viewed', 'accepted', 'declined', 'expired'
  )),
  
  -- Tokens
  invitation_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Response
  responded_at TIMESTAMPTZ,
  decline_reason TEXT,
  
  -- Metadata
  invited_by UUID NOT NULL REFERENCES profiles(id),
  invitation_batch_id UUID, -- For grouping bulk invites
  
  -- Timestamps
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Either existing user OR new user info required
  CONSTRAINT invitation_target_check CHECK (
    (invited_profile_id IS NOT NULL OR invited_business_id IS NOT NULL) OR
    (invitee_email IS NOT NULL AND invitee_name IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_member_invitations_org ON organization_member_invitations(organization_id);
CREATE INDEX idx_member_invitations_profile ON organization_member_invitations(invited_profile_id);
CREATE INDEX idx_member_invitations_business ON organization_member_invitations(invited_business_id);
CREATE INDEX idx_member_invitations_email ON organization_member_invitations(invitee_email);
CREATE INDEX idx_member_invitations_status ON organization_member_invitations(invitation_status);
CREATE INDEX idx_member_invitations_token ON organization_member_invitations(invitation_token);
CREATE INDEX idx_member_invitations_batch ON organization_member_invitations(invitation_batch_id);
CREATE INDEX idx_member_invitations_expires ON organization_member_invitations(expires_at);

-- Trigger
CREATE TRIGGER update_organization_member_invitations_updated_at
  BEFORE UPDATE ON organization_member_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 4: EVENTS (PTSE)
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Event Info
  event_name TEXT NOT NULL,
  event_tagline TEXT,
  event_description TEXT NOT NULL,
  
  -- Type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'conference', 'seminar', 'workshop', 'webinar', 
    'expo', 'summit', 'meeting', 'training', 'other'
  )),
  event_format TEXT NOT NULL CHECK (event_format IN ('in_person', 'virtual', 'hybrid')),
  
  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  
  -- Location
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_state TEXT,
  venue_country TEXT DEFAULT 'India',
  
  -- Virtual
  virtual_platform TEXT,
  virtual_meeting_link TEXT,
  
  -- Registration
  registration_required BOOLEAN NOT NULL DEFAULT true,
  registration_start_date DATE,
  registration_end_date DATE,
  max_attendees INTEGER,
  registration_fee DECIMAL(10, 2),
  is_free BOOLEAN NOT NULL DEFAULT true,
  
  -- Access
  is_public BOOLEAN NOT NULL DEFAULT true,
  members_only BOOLEAN NOT NULL DEFAULT false,
  
  -- Media
  event_banner_url TEXT,
  event_brochure_url TEXT,
  
  -- Status
  event_status TEXT NOT NULL DEFAULT 'draft' CHECK (event_status IN (
    'draft', 'published', 'registration_open', 'registration_closed', 
    'ongoing', 'completed', 'cancelled'
  )),
  
  -- Stats
  view_count INTEGER NOT NULL DEFAULT 0,
  registration_count INTEGER NOT NULL DEFAULT 0,
  
  -- Management
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_event_dates CHECK (end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_events_org ON organization_events(organization_id);
CREATE INDEX idx_events_type ON organization_events(event_type);
CREATE INDEX idx_events_format ON organization_events(event_format);
CREATE INDEX idx_events_status ON organization_events(event_status);
CREATE INDEX idx_events_dates ON organization_events(start_date, end_date);
CREATE INDEX idx_events_location ON organization_events(venue_city, venue_state);
CREATE INDEX idx_events_public ON organization_events(is_public);
CREATE INDEX idx_events_created ON organization_events(created_at DESC);

-- Full-text search
CREATE INDEX idx_events_search ON organization_events USING gin(
  to_tsvector('english', 
    event_name || ' ' || 
    COALESCE(event_tagline, '') || ' ' ||
    event_description
  )
);

-- Trigger
CREATE TRIGGER update_organization_events_updated_at
  BEFORE UPDATE ON organization_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: EVENT REGISTRATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES organization_events(id) ON DELETE CASCADE,
  
  -- Attendee (must be a PoultryCo user)
  attendee_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Registration
  registration_type TEXT NOT NULL CHECK (registration_type IN (
    'regular', 'speaker', 'exhibitor', 'sponsor', 'vip', 'complimentary'
  )),
  
  -- Status
  registration_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (registration_status IN (
    'pending', 'confirmed', 'waitlist', 'cancelled', 'attended', 'no_show'
  )),
  
  -- Payment (if applicable)
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  payment_amount DECIMAL(10, 2),
  payment_reference TEXT,
  
  -- Check-in
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  check_in_method TEXT CHECK (check_in_method IN ('qr_code', 'manual', 'self')),
  
  -- QR Code
  qr_code_url TEXT,
  
  -- Certificate
  certificate_issued BOOLEAN NOT NULL DEFAULT false,
  certificate_url TEXT,
  certificate_issued_at TIMESTAMPTZ,
  
  -- Timestamps
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One registration per user per event
  UNIQUE(event_id, attendee_profile_id)
);

-- Indexes
CREATE INDEX idx_event_registrations_event ON organization_event_registrations(event_id);
CREATE INDEX idx_event_registrations_attendee ON organization_event_registrations(attendee_profile_id);
CREATE INDEX idx_event_registrations_type ON organization_event_registrations(registration_type);
CREATE INDEX idx_event_registrations_status ON organization_event_registrations(registration_status);
CREATE INDEX idx_event_registrations_checkin ON organization_event_registrations(checked_in);
CREATE INDEX idx_event_registrations_registered ON organization_event_registrations(registered_at DESC);

-- Trigger
CREATE TRIGGER update_organization_event_registrations_updated_at
  BEFORE UPDATE ON organization_event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE organization_members IS 'Polymorphic membership - both personal and business profiles can be members';
COMMENT ON COLUMN organization_members.member_type IS 'personal = profiles.id, business = business_profiles.id';
COMMENT ON COLUMN organization_members.invitation_source IS 'Tracks how member joined (viral growth metric)';

COMMENT ON TABLE organization_membership_applications IS 'Membership applications for approval workflow';
COMMENT ON TABLE organization_member_invitations IS 'Bulk invitation system for viral growth';
COMMENT ON COLUMN organization_member_invitations.invitation_batch_id IS 'Groups bulk CSV uploads together';

COMMENT ON TABLE organization_events IS 'Complete event management system (PTSE-ready)';
COMMENT ON TABLE organization_event_registrations IS 'Event registrations with QR code check-in and certificates';

-- =====================================================
-- END OF FILE
-- =====================================================

