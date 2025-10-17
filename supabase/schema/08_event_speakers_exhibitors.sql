-- =====================================================
-- PoultryCo Database Schema
-- File: 08_event_speakers_exhibitors.sql
-- Description: Event speakers and exhibitors (PTSE features)
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: EVENT SPEAKERS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_event_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES organization_events(id) ON DELETE CASCADE,
  
  -- Speaker (must be a PoultryCo user)
  speaker_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Speaking Role
  speaker_type TEXT NOT NULL CHECK (speaker_type IN (
    'keynote', 'plenary', 'panelist', 'presenter', 
    'moderator', 'facilitator', 'trainer', 'guest'
  )),
  
  -- Session Details
  session_title TEXT,
  session_description TEXT,
  session_date DATE,
  session_time TIME,
  session_duration_minutes INTEGER CHECK (session_duration_minutes > 0),
  session_location TEXT, -- Room/Hall name
  
  -- Status
  confirmation_status TEXT NOT NULL DEFAULT 'invited' CHECK (confirmation_status IN (
    'invited', 'confirmed', 'tentative', 'declined', 'cancelled'
  )),
  
  -- Display
  show_on_event_page BOOLEAN NOT NULL DEFAULT true,
  featured_speaker BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Custom Bio (override profile bio for this event)
  custom_bio TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_speakers_event ON organization_event_speakers(event_id);
CREATE INDEX idx_event_speakers_profile ON organization_event_speakers(speaker_profile_id);
CREATE INDEX idx_event_speakers_type ON organization_event_speakers(speaker_type);
CREATE INDEX idx_event_speakers_status ON organization_event_speakers(confirmation_status);
CREATE INDEX idx_event_speakers_featured ON organization_event_speakers(featured_speaker);
CREATE INDEX idx_event_speakers_session_date ON organization_event_speakers(session_date, session_time);

-- Trigger
CREATE TRIGGER update_organization_event_speakers_updated_at
  BEFORE UPDATE ON organization_event_speakers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: EVENT EXHIBITORS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_event_exhibitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES organization_events(id) ON DELETE CASCADE,
  
  -- Exhibitor (must be a business profile)
  exhibitor_business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Booth Details
  booth_number TEXT,
  booth_size TEXT CHECK (booth_size IN ('small', 'medium', 'large', 'custom')),
  booth_location TEXT, -- Hall/Zone
  
  -- Package
  exhibitor_tier TEXT CHECK (exhibitor_tier IN (
    'platinum', 'gold', 'silver', 'bronze', 'standard', 'startup'
  )),
  
  -- Payment
  booth_fee DECIMAL(10, 2),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'partial', 'completed', 'refunded'
  )),
  payment_reference TEXT,
  
  -- Status
  confirmation_status TEXT NOT NULL DEFAULT 'pending' CHECK (confirmation_status IN (
    'pending', 'confirmed', 'waitlist', 'cancelled'
  )),
  
  -- Display
  show_on_event_page BOOLEAN NOT NULL DEFAULT true,
  featured_exhibitor BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Custom Description (for this event)
  custom_description TEXT,
  
  -- Products to Showcase
  showcase_products UUID[], -- Array of product IDs from business_products
  
  -- Contact Person (from business team)
  primary_contact_id UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One exhibitor per business per event
  UNIQUE(event_id, exhibitor_business_id)
);

-- Indexes
CREATE INDEX idx_event_exhibitors_event ON organization_event_exhibitors(event_id);
CREATE INDEX idx_event_exhibitors_business ON organization_event_exhibitors(exhibitor_business_id);
CREATE INDEX idx_event_exhibitors_tier ON organization_event_exhibitors(exhibitor_tier);
CREATE INDEX idx_event_exhibitors_status ON organization_event_exhibitors(confirmation_status);
CREATE INDEX idx_event_exhibitors_payment ON organization_event_exhibitors(payment_status);
CREATE INDEX idx_event_exhibitors_featured ON organization_event_exhibitors(featured_exhibitor);

-- Trigger
CREATE TRIGGER update_organization_event_exhibitors_updated_at
  BEFORE UPDATE ON organization_event_exhibitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: EVENT SPONSORS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_event_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES organization_events(id) ON DELETE CASCADE,
  
  -- Sponsor (business profile)
  sponsor_business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Sponsorship Level
  sponsorship_tier TEXT NOT NULL CHECK (sponsorship_tier IN (
    'title', 'platinum', 'gold', 'silver', 'bronze', 'associate', 'partner'
  )),
  
  -- Package
  sponsorship_amount DECIMAL(10, 2),
  
  -- Benefits
  benefits_received TEXT[],
  
  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'partial', 'completed', 'refunded'
  )),
  payment_reference TEXT,
  
  -- Display
  show_on_event_page BOOLEAN NOT NULL DEFAULT true,
  logo_on_materials BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Custom Description
  custom_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One sponsorship per business per event
  UNIQUE(event_id, sponsor_business_id)
);

-- Indexes
CREATE INDEX idx_event_sponsors_event ON organization_event_sponsors(event_id);
CREATE INDEX idx_event_sponsors_business ON organization_event_sponsors(sponsor_business_id);
CREATE INDEX idx_event_sponsors_tier ON organization_event_sponsors(sponsorship_tier);
CREATE INDEX idx_event_sponsors_payment ON organization_event_sponsors(payment_status);

-- Trigger
CREATE TRIGGER update_organization_event_sponsors_updated_at
  BEFORE UPDATE ON organization_event_sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: EVENT AGENDA/SCHEDULE
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_event_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES organization_events(id) ON DELETE CASCADE,
  
  -- Session
  session_title TEXT NOT NULL,
  session_description TEXT,
  
  -- Type
  session_type TEXT NOT NULL CHECK (session_type IN (
    'keynote', 'panel', 'presentation', 'workshop', 
    'break', 'lunch', 'networking', 'demo', 'qa', 'other'
  )),
  
  -- Schedule
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Location
  session_location TEXT, -- Room/Hall
  
  -- Virtual
  virtual_room_link TEXT,
  
  -- Speakers (array of speaker IDs)
  speaker_ids UUID[],
  
  -- Capacity
  max_participants INTEGER,
  registration_required BOOLEAN NOT NULL DEFAULT false,
  
  -- Display
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_session_times CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_event_agenda_event ON organization_event_agenda(event_id);
CREATE INDEX idx_event_agenda_type ON organization_event_agenda(session_type);
CREATE INDEX idx_event_agenda_schedule ON organization_event_agenda(session_date, start_time);
CREATE INDEX idx_event_agenda_published ON organization_event_agenda(is_published);

-- Trigger
CREATE TRIGGER update_organization_event_agenda_updated_at
  BEFORE UPDATE ON organization_event_agenda
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: EVENT RESOURCES/MATERIALS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_event_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES organization_events(id) ON DELETE CASCADE,
  
  -- Resource
  resource_title TEXT NOT NULL,
  resource_description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'presentation', 'document', 'video', 'photo', 
    'certificate', 'badge', 'brochure', 'other'
  )),
  
  -- File
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  
  -- Access
  access_level TEXT NOT NULL CHECK (access_level IN (
    'public', 'registered_only', 'attended_only', 'speakers_only'
  )),
  
  -- Association
  associated_session_id UUID REFERENCES organization_event_agenda(id),
  uploaded_by UUID REFERENCES profiles(id),
  
  -- Stats
  download_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_resources_event ON organization_event_resources(event_id);
CREATE INDEX idx_event_resources_type ON organization_event_resources(resource_type);
CREATE INDEX idx_event_resources_access ON organization_event_resources(access_level);
CREATE INDEX idx_event_resources_session ON organization_event_resources(associated_session_id);
CREATE INDEX idx_event_resources_uploaded ON organization_event_resources(uploaded_at DESC);

-- =====================================================
-- SECTION 6: EVENT FEEDBACK
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_event_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES organization_events(id) ON DELETE CASCADE,
  attendee_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Overall Rating
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Specific Ratings
  content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
  speakers_rating INTEGER CHECK (speakers_rating >= 1 AND speakers_rating <= 5),
  organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
  venue_rating INTEGER CHECK (venue_rating >= 1 AND venue_rating <= 5),
  
  -- Comments
  what_went_well TEXT,
  what_to_improve TEXT,
  additional_comments TEXT,
  
  -- Recommendation
  would_recommend BOOLEAN,
  would_attend_again BOOLEAN,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One feedback per attendee per event
  UNIQUE(event_id, attendee_profile_id)
);

-- Indexes
CREATE INDEX idx_event_feedback_event ON organization_event_feedback(event_id);
CREATE INDEX idx_event_feedback_attendee ON organization_event_feedback(attendee_profile_id);
CREATE INDEX idx_event_feedback_rating ON organization_event_feedback(overall_rating);
CREATE INDEX idx_event_feedback_submitted ON organization_event_feedback(submitted_at DESC);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE organization_event_speakers IS 'Event speakers with session details (all must be PoultryCo users)';
COMMENT ON TABLE organization_event_exhibitors IS 'Event exhibitors with booth details (all must be business profiles)';
COMMENT ON TABLE organization_event_sponsors IS 'Event sponsors with sponsorship tiers';
COMMENT ON TABLE organization_event_agenda IS 'Complete event schedule with sessions';
COMMENT ON TABLE organization_event_resources IS 'Event materials and documents';
COMMENT ON TABLE organization_event_feedback IS 'Post-event feedback from attendees';

COMMENT ON COLUMN organization_event_speakers.custom_bio IS 'Override profile bio for event-specific intro';
COMMENT ON COLUMN organization_event_exhibitors.showcase_products IS 'Array of product IDs to showcase at event';

-- =====================================================
-- END OF FILE
-- =====================================================

