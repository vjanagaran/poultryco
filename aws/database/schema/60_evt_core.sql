-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 60_evt_core.sql
-- Description: Events system
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql, 20_biz_core.sql, 30_org_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS evt_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organizer (polymorphic: individual, business, organization)
  organizer_type TEXT NOT NULL CHECK (organizer_type IN ('individual', 'business', 'organization')),
  organizer_id UUID NOT NULL,
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT CHECK (char_length(description) <= 5000),
  event_type_id UUID REFERENCES ref_event_types(id),
  
  -- Media
  cover_image_url TEXT,
  
  -- Date & Time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  
  -- Location
  location_type TEXT NOT NULL CHECK (location_type IN ('physical', 'virtual', 'hybrid')),
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_state TEXT,
  venue_country TEXT DEFAULT 'India',
  venue_coordinates POINT, -- PostGIS point for lat/lng
  virtual_link TEXT,
  virtual_platform TEXT,
  
  -- Registration
  registration_required BOOLEAN NOT NULL DEFAULT false,
  registration_deadline TIMESTAMPTZ,
  max_attendees INTEGER,
  registration_fee DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  
  -- Visibility
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'members_only')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  
  -- Stats (denormalized)
  attendees_count INTEGER NOT NULL DEFAULT 0,
  interested_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CHECK (end_date > start_date)
);

CREATE INDEX idx_evt_events_organizer ON evt_events(organizer_type, organizer_id);
CREATE INDEX idx_evt_events_type ON evt_events(event_type_id);
CREATE INDEX idx_evt_events_start_date ON evt_events(start_date);
CREATE INDEX idx_evt_events_status ON evt_events(status);
CREATE INDEX idx_evt_events_location ON evt_events(location_type);
CREATE INDEX idx_evt_events_upcoming ON evt_events(start_date) WHERE status = 'published';
CREATE INDEX idx_evt_events_location_state ON evt_events(venue_state, venue_city);

-- Full-text search
CREATE INDEX idx_evt_events_search ON evt_events USING gin(
  to_tsvector('english',
    title || ' ' ||
    COALESCE(description, '') || ' ' ||
    COALESCE(venue_name, '')
  )
);

CREATE TRIGGER update_evt_events_updated_at
  BEFORE UPDATE ON evt_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: EVENT ATTENDEES
-- =====================================================

CREATE TABLE IF NOT EXISTS evt_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES evt_events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- RSVP
  rsvp_status TEXT NOT NULL DEFAULT 'interested' CHECK (rsvp_status IN ('interested', 'going', 'not_going', 'maybe')),
  
  -- Registration
  registration_data JSONB, -- {name, email, phone, custom_fields}
  registration_fee_paid BOOLEAN DEFAULT false,
  payment_id TEXT,
  
  -- Check-in
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(event_id, profile_id)
);

CREATE INDEX idx_evt_attendees_event ON evt_attendees(event_id);
CREATE INDEX idx_evt_attendees_profile ON evt_attendees(profile_id);
CREATE INDEX idx_evt_attendees_rsvp ON evt_attendees(rsvp_status);
CREATE INDEX idx_evt_attendees_going ON evt_attendees(event_id, rsvp_status) WHERE rsvp_status = 'going';
CREATE INDEX idx_evt_attendees_checked_in ON evt_attendees(event_id, checked_in) WHERE checked_in = true;

CREATE TRIGGER update_evt_attendees_updated_at
  BEFORE UPDATE ON evt_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: EVENT CO-HOSTS
-- =====================================================

CREATE TABLE IF NOT EXISTS evt_cohosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES evt_events(id) ON DELETE CASCADE,
  
  -- Co-host (polymorphic)
  cohost_type TEXT NOT NULL CHECK (cohost_type IN ('individual', 'business', 'organization')),
  cohost_id UUID NOT NULL,
  
  -- Permissions
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_manage_attendees BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(event_id, cohost_type, cohost_id)
);

CREATE INDEX idx_evt_cohosts_event ON evt_cohosts(event_id);
CREATE INDEX idx_evt_cohosts_cohost ON evt_cohosts(cohost_type, cohost_id);

CREATE TRIGGER update_evt_cohosts_updated_at
  BEFORE UPDATE ON evt_cohosts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: EVENT SPEAKERS
-- =====================================================

CREATE TABLE IF NOT EXISTS evt_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES evt_events(id) ON DELETE CASCADE,
  
  -- Speaker
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Details (if not a profile)
  name TEXT,
  title TEXT,
  bio TEXT,
  photo_url TEXT,
  
  -- Session
  session_title TEXT,
  session_description TEXT,
  session_start_time TIMESTAMPTZ,
  session_end_time TIMESTAMPTZ,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evt_speakers_event ON evt_speakers(event_id, display_order);
CREATE INDEX idx_evt_speakers_profile ON evt_speakers(profile_id);

CREATE TRIGGER update_evt_speakers_updated_at
  BEFORE UPDATE ON evt_speakers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: EVENT SPONSORS
-- =====================================================

CREATE TABLE IF NOT EXISTS evt_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES evt_events(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES biz_profiles(id) ON DELETE CASCADE,
  
  -- Sponsorship
  tier TEXT CHECK (tier IN ('title', 'platinum', 'gold', 'silver', 'bronze', 'partner')),
  amount DECIMAL(10, 2),
  
  -- Display
  logo_url TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evt_sponsors_event ON evt_sponsors(event_id, display_order);
CREATE INDEX idx_evt_sponsors_business ON evt_sponsors(business_id);

CREATE TRIGGER update_evt_sponsors_updated_at
  BEFORE UPDATE ON evt_sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 6: EVENT UPDATES
-- =====================================================

CREATE TABLE IF NOT EXISTS evt_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES evt_events(id) ON DELETE CASCADE,
  
  -- Update
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Author
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evt_updates_event ON evt_updates(event_id, created_at DESC);

-- =====================================================
-- SECTION 7: HELPER FUNCTIONS
-- =====================================================

-- Update attendees count
CREATE OR REPLACE FUNCTION update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.rsvp_status = 'going' THEN
      UPDATE evt_events SET attendees_count = attendees_count + 1 WHERE id = NEW.event_id;
    ELSIF NEW.rsvp_status = 'interested' THEN
      UPDATE evt_events SET interested_count = interested_count + 1 WHERE id = NEW.event_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.rsvp_status = 'going' AND NEW.rsvp_status != 'going' THEN
      UPDATE evt_events SET attendees_count = GREATEST(attendees_count - 1, 0) WHERE id = NEW.event_id;
    ELSIF OLD.rsvp_status != 'going' AND NEW.rsvp_status = 'going' THEN
      UPDATE evt_events SET attendees_count = attendees_count + 1 WHERE id = NEW.event_id;
    END IF;
    
    IF OLD.rsvp_status = 'interested' AND NEW.rsvp_status != 'interested' THEN
      UPDATE evt_events SET interested_count = GREATEST(interested_count - 1, 0) WHERE id = NEW.event_id;
    ELSIF OLD.rsvp_status != 'interested' AND NEW.rsvp_status = 'interested' THEN
      UPDATE evt_events SET interested_count = interested_count + 1 WHERE id = NEW.event_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.rsvp_status = 'going' THEN
      UPDATE evt_events SET attendees_count = GREATEST(attendees_count - 1, 0) WHERE id = OLD.event_id;
    ELSIF OLD.rsvp_status = 'interested' THEN
      UPDATE evt_events SET interested_count = GREATEST(interested_count - 1, 0) WHERE id = OLD.event_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_event_attendees_count
  AFTER INSERT OR UPDATE OR DELETE ON evt_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_event_attendees_count();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE evt_events IS 'Events (conferences, meetups, webinars, etc.)';
COMMENT ON TABLE evt_attendees IS 'Event attendees with RSVP status';
COMMENT ON TABLE evt_cohosts IS 'Event co-hosts';
COMMENT ON TABLE evt_speakers IS 'Event speakers';
COMMENT ON TABLE evt_sponsors IS 'Event sponsors';
COMMENT ON TABLE evt_updates IS 'Event updates/announcements';

