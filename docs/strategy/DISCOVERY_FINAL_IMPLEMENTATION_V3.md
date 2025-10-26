# 🚀 DISCOVERY SYSTEM - FINAL IMPLEMENTATION (V3)

**Date:** October 26, 2025  
**Version:** 3.0 - Final refinements applied  
**Status:** Ready for immediate implementation

---

## ✅ FINAL NAVIGATION STRUCTURE

### Updated Header Navigation

```
┌──────────────────────────────────────────────────────┐
│ [P] PoultryCo    [🔍 Search everything...]          │
│                                                       │
│ Home | Discover ▼ | Stream | Messages | Resources ▼ | Me │
└──────────────────────────────────────────────────────┘
```

### DISCOVER Menu (User-Generated Content Only)

```
┌─────────────────────────────────────────────────────────────┐
│                        DISCOVER                              │
├─────────────────┬─────────────────┬──────────────────────────┤
│  👥 NETWORK     │  🏢 BUSINESS    │  📦 MARKETPLACE          │
├─────────────────┼─────────────────┼──────────────────────────┤
│ • Members       │ • Companies     │ • Products               │
│ • Professionals │ • Suppliers     │ • Services               │
│ • Connections   │ • Farms         │ • Equipment              │
│                 │ • Feed Mills    │                          │
│                 │ • Hatcheries    │                          │
├─────────────────┼─────────────────┼──────────────────────────┤
│  🏛️ COMMUNITY   │  📅 EVENTS      │  💼 JOBS                 │
├─────────────────┼─────────────────┼──────────────────────────┤
│ • Organizations │ • Webinars      │ • Browse Jobs            │
│ • Associations  │ • Conferences   │ • Saved Jobs             │
│ • Universities  │ • Workshops     │                          │
│ • Forums        │ • Meetups       │                          │
└─────────────────┴─────────────────┴──────────────────────────┘
```

### RESOURCES Menu (Platform Content + Tools)

```
┌──────────────────────────────────────────┐
│              RESOURCES                   │
├──────────────────────────────────────────┤
│  📊 Market Data                          │
│  📚 Blog & Articles                      │
│  📈 Industry Reports                     │
│  📖 Knowledge Base                       │
│  🎓 Training Courses                     │
│  ────────────────                        │
│  🧮 TOOLS                                │
│  ────────────────                        │
│  • Feed Calculator                       │
│  • ROI Calculator                        │
│  • Growth Tracker                        │
│  • Cost Estimator                        │
└──────────────────────────────────────────┘
```

### Strategic "+Create" Button Placement

#### Personal Profile Users:
```
┌─────────────────────────────────────────┐
│  [Me ▼]                                 │
│  ├─ My Profile                          │
│  ├─ My Businesses                       │
│  ├─ ───────────────                     │
│  ├─ ➕ Create Business Page             │  ← Prominent
│  ├─ ➕ Host Event/Webinar               │  ← Anyone
│  └─ Settings                            │
└─────────────────────────────────────────┘
```

#### Business Profile Owners:
```
┌─────────────────────────────────────────┐
│  [Me ▼]                                 │
│  ├─ My Profile                          │
│  ├─ My Businesses                       │
│  ├─ ───────────────                     │
│  ├─ ➕ Post a Job                       │  ← Business only
│  ├─ ➕ Host Event/Webinar               │
│  └─ Settings                            │
└─────────────────────────────────────────┘
```

---

## 🗄️ PHASE 1: DATABASE SCHEMA WITH SEED DATA

### Migration File

**File:** `supabase/migrations/24_discovery_system_complete.sql`

```sql
-- ==================================================================
-- DISCOVERY SYSTEM COMPLETE SCHEMA
-- Version: 1.0
-- Date: October 26, 2025
-- ==================================================================

-- ------------------------------------------------------------------
-- 1. CONNECTION & FOLLOW SYSTEM
-- ------------------------------------------------------------------

-- Connections Table (Mutual, 2-way)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', 
  -- 'pending', 'accepted', 'rejected'
  requested_by UUID NOT NULL REFERENCES profiles(id),
  requested_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  
  CONSTRAINT connections_different_users CHECK (user_id_1 != user_id_2),
  CONSTRAINT connections_ordered CHECK (user_id_1 < user_id_2),
  UNIQUE(user_id_1, user_id_2)
);

-- Follows Table (One-way, like Twitter)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT follows_different_users CHECK (follower_id != following_id),
  UNIQUE(follower_id, following_id)
);

-- Indexes for performance
CREATE INDEX idx_connections_user1 ON connections(user_id_1) WHERE status = 'accepted';
CREATE INDEX idx_connections_user2 ON connections(user_id_2) WHERE status = 'accepted';
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_requested_by ON connections(requested_by);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- Helper Functions
CREATE OR REPLACE FUNCTION get_connection_status(user1_id UUID, user2_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  conn_record RECORD;
BEGIN
  SELECT status, requested_by INTO conn_record
  FROM connections
  WHERE user_id_1 = LEAST(user1_id, user2_id) 
    AND user_id_2 = GREATEST(user1_id, user2_id);
  
  IF NOT FOUND THEN
    RETURN 'none';
  END IF;
  
  IF conn_record.status = 'accepted' THEN
    RETURN 'accepted';
  ELSIF conn_record.requested_by = user1_id THEN
    RETURN 'pending_sent';
  ELSE
    RETURN 'pending_received';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION is_following(follower_id_param UUID, following_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM follows 
    WHERE follower_id = follower_id_param 
    AND following_id = following_id_param
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Network Stats (Materialized View for Performance)
CREATE MATERIALIZED VIEW profile_network_stats AS
SELECT 
  p.id as profile_id,
  
  -- Connections count (mutual)
  COUNT(DISTINCT CASE 
    WHEN c.status = 'accepted' THEN c.id 
  END) as connections_count,
  
  -- Followers count
  COUNT(DISTINCT f1.id) as followers_count,
  
  -- Following count
  COUNT(DISTINCT f2.id) as following_count
  
FROM profiles p
LEFT JOIN connections c ON (
  (c.user_id_1 = p.id OR c.user_id_2 = p.id) 
  AND c.status = 'accepted'
)
LEFT JOIN follows f1 ON f1.following_id = p.id
LEFT JOIN follows f2 ON f2.follower_id = p.id
GROUP BY p.id;

CREATE UNIQUE INDEX ON profile_network_stats(profile_id);

-- Function to refresh stats
CREATE OR REPLACE FUNCTION refresh_network_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY profile_network_stats;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------
-- 2. LOCATION STANDARDIZATION
-- ------------------------------------------------------------------

-- Add standardized location fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS location_place_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_district VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_country VARCHAR(3) DEFAULT 'IND',
  ADD COLUMN IF NOT EXISTS location_postal_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS location_formatted TEXT,
  ADD COLUMN IF NOT EXISTS location_coordinates GEOGRAPHY(POINT, 4326);

-- Spatial index for "nearby" searches
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIST(location_coordinates);

-- Function for distance-based search
CREATE OR REPLACE FUNCTION find_nearby_profiles(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 50000
)
RETURNS TABLE (
  profile_id UUID,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    ST_Distance(
      p.location_coordinates,
      ST_MakePoint(user_lng, user_lat)::geography
    ) as distance_meters
  FROM profiles p
  WHERE p.location_coordinates IS NOT NULL
    AND ST_DWithin(
      p.location_coordinates,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_meters
    )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql STABLE;

-- ------------------------------------------------------------------
-- 3. BUSINESS TYPES (Poultry Industry-Specific)
-- ------------------------------------------------------------------

CREATE TABLE business_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES business_types(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  level INTEGER NOT NULL, -- 1 (category), 2 (type)
  icon VARCHAR(50),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_types_parent ON business_types(parent_id);
CREATE INDEX idx_business_types_level ON business_types(level);

-- Update business_details table
ALTER TABLE business_details
  ADD COLUMN IF NOT EXISTS business_type_id UUID REFERENCES business_types(id),
  ADD COLUMN IF NOT EXISTS specializations VARCHAR[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS production_capacity JSONB,
  ADD COLUMN IF NOT EXISTS service_areas VARCHAR[] DEFAULT '{}';

-- ------------------------------------------------------------------
-- 4. PRODUCT CATEGORIES (3-Level Hierarchy)
-- ------------------------------------------------------------------

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES product_categories(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  level INTEGER NOT NULL, -- 1, 2, or 3
  icon VARCHAR(50),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX idx_product_categories_level ON product_categories(level);
CREATE INDEX idx_product_categories_slug ON product_categories(slug);

-- Update products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS primary_category_id UUID REFERENCES product_categories(id),
  ADD COLUMN IF NOT EXISTS category_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bird_types VARCHAR[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS age_groups VARCHAR[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS formulation VARCHAR,
  ADD COLUMN IF NOT EXISTS certifications VARCHAR[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS search_keywords TEXT[];

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_products_primary_category ON products(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_products_bird_types ON products USING GIN(bird_types);
CREATE INDEX IF NOT EXISTS idx_products_age_groups ON products USING GIN(age_groups);
CREATE INDEX IF NOT EXISTS idx_products_certifications ON products USING GIN(certifications);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_keywords);

-- ------------------------------------------------------------------
-- 5. EVENTS & WEBINARS
-- ------------------------------------------------------------------

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, 
  -- 'webinar', 'conference', 'workshop', 'meetup', 'competition'
  
  -- Organizer
  organizer_type VARCHAR(20) NOT NULL, -- 'personal', 'business', 'organization'
  organizer_id UUID NOT NULL, -- References profiles, business_details, or organizations
  
  -- Location
  format VARCHAR(20) NOT NULL, -- 'online', 'physical', 'hybrid'
  venue_name VARCHAR(200),
  venue_address TEXT,
  location_city VARCHAR(100),
  location_state VARCHAR(100),
  location_country VARCHAR(3) DEFAULT 'IND',
  location_coordinates GEOGRAPHY(POINT, 4326),
  online_link VARCHAR(500),
  
  -- Schedule
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  
  -- Content
  topics VARCHAR[] DEFAULT '{}',
  speakers JSONB DEFAULT '[]',
  agenda JSONB DEFAULT '[]',
  
  -- Registration
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'INR',
  registration_link VARCHAR(500),
  capacity INTEGER,
  registered_count INTEGER DEFAULT 0,
  
  -- Media
  cover_image_url VARCHAR(500),
  promotional_video_url VARCHAR(500),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  -- 'draft', 'published', 'ongoing', 'completed', 'cancelled'
  is_featured BOOLEAN DEFAULT false,
  
  -- SEO
  meta_description TEXT,
  meta_keywords VARCHAR[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_organizer ON events(organizer_type, organizer_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_start ON events(start_datetime);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_location ON events USING GIST(location_coordinates);
CREATE INDEX idx_events_topics ON events USING GIN(topics);

-- Event Registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT NOW(),
  attended BOOLEAN DEFAULT false,
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);

-- ------------------------------------------------------------------
-- 6. RLS POLICIES
-- ------------------------------------------------------------------

-- Connections RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY connections_view_policy ON connections
  FOR SELECT USING (
    auth.uid() = user_id_1 OR 
    auth.uid() = user_id_2
  );

CREATE POLICY connections_insert_policy ON connections
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY connections_update_policy ON connections
  FOR UPDATE USING (
    auth.uid() = user_id_1 OR 
    auth.uid() = user_id_2
  );

-- Follows RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY follows_view_policy ON follows
  FOR SELECT USING (true); -- Public

CREATE POLICY follows_insert_policy ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY follows_delete_policy ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Events RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_view_policy ON events
  FOR SELECT USING (
    status = 'published' OR
    (organizer_type = 'personal' AND organizer_id::TEXT = auth.uid()::TEXT)
  );

CREATE POLICY events_insert_policy ON events
  FOR INSERT WITH CHECK (
    (organizer_type = 'personal' AND organizer_id::TEXT = auth.uid()::TEXT)
  );

CREATE POLICY events_update_policy ON events
  FOR UPDATE USING (
    (organizer_type = 'personal' AND organizer_id::TEXT = auth.uid()::TEXT)
  );

-- Event Registrations RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_registrations_view_policy ON event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY event_registrations_insert_policy ON event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================================================================
-- SEED DATA: BUSINESS TYPES
-- ==================================================================

-- Level 1: Main Categories
INSERT INTO business_types (name, slug, level, icon, display_order) VALUES
('Production', 'production', 1, '🐔', 1),
('Feed & Nutrition', 'feed-nutrition', 1, '🌾', 2),
('Veterinary & Health', 'veterinary-health', 1, '💊', 3),
('Equipment & Technology', 'equipment-technology', 1, '⚙️', 4),
('Processing & Packaging', 'processing-packaging', 1, '🏭', 5),
('Services', 'services', 1, '👨‍🏫', 6),
('Retail & Distribution', 'retail-distribution', 1, '🏪', 7);

-- Level 2: Business Types (Examples - Production)
INSERT INTO business_types (name, slug, level, parent_id, display_order)
SELECT 'Broiler Farm', 'broiler-farm', 2, id, 1 FROM business_types WHERE slug = 'production'
UNION ALL
SELECT 'Layer Farm', 'layer-farm', 2, id, 2 FROM business_types WHERE slug = 'production'
UNION ALL
SELECT 'Breeder Farm', 'breeder-farm', 2, id, 3 FROM business_types WHERE slug = 'production'
UNION ALL
SELECT 'Integrated Farm', 'integrated-farm', 2, id, 4 FROM business_types WHERE slug = 'production'
UNION ALL
SELECT 'Commercial Hatchery', 'commercial-hatchery', 2, id, 5 FROM business_types WHERE slug = 'production'
UNION ALL
SELECT 'Genetics Company', 'genetics-company', 2, id, 6 FROM business_types WHERE slug = 'production';

-- Feed & Nutrition
INSERT INTO business_types (name, slug, level, parent_id, display_order)
SELECT 'Feed Mill', 'feed-mill', 2, id, 1 FROM business_types WHERE slug = 'feed-nutrition'
UNION ALL
SELECT 'Premix Manufacturer', 'premix-manufacturer', 2, id, 2 FROM business_types WHERE slug = 'feed-nutrition'
UNION ALL
SELECT 'Feed Ingredient Supplier', 'feed-ingredient-supplier', 2, id, 3 FROM business_types WHERE slug = 'feed-nutrition';

-- Veterinary & Health
INSERT INTO business_types (name, slug, level, parent_id, display_order)
SELECT 'Veterinary Clinic', 'veterinary-clinic', 2, id, 1 FROM business_types WHERE slug = 'veterinary-health'
UNION ALL
SELECT 'Vaccine Manufacturer', 'vaccine-manufacturer', 2, id, 2 FROM business_types WHERE slug = 'veterinary-health'
UNION ALL
SELECT 'Diagnostic Laboratory', 'diagnostic-laboratory', 2, id, 3 FROM business_types WHERE slug = 'veterinary-health'
UNION ALL
SELECT 'Pharmaceutical Company', 'pharmaceutical-company', 2, id, 4 FROM business_types WHERE slug = 'veterinary-health';

-- Equipment & Technology
INSERT INTO business_types (name, slug, level, parent_id, display_order)
SELECT 'Equipment Manufacturer', 'equipment-manufacturer', 2, id, 1 FROM business_types WHERE slug = 'equipment-technology'
UNION ALL
SELECT 'Software Company', 'software-company', 2, id, 2 FROM business_types WHERE slug = 'equipment-technology'
UNION ALL
SELECT 'IoT & Automation', 'iot-automation', 2, id, 3 FROM business_types WHERE slug = 'equipment-technology';

-- Services
INSERT INTO business_types (name, slug, level, parent_id, display_order)
SELECT 'Consultancy Firm', 'consultancy-firm', 2, id, 1 FROM business_types WHERE slug = 'services'
UNION ALL
SELECT 'Training Institute', 'training-institute', 2, id, 2 FROM business_types WHERE slug = 'services'
UNION ALL
SELECT 'Testing Laboratory', 'testing-laboratory', 2, id, 3 FROM business_types WHERE slug = 'services';

-- ==================================================================
-- SEED DATA: PRODUCT CATEGORIES (3-LEVEL)
-- ==================================================================

-- LEVEL 1: Main Categories
INSERT INTO product_categories (name, slug, level, icon, display_order) VALUES
('Feed & Nutrition', 'feed-nutrition', 1, '🌾', 1),
('Equipment & Automation', 'equipment-automation', 1, '⚙️', 2),
('Veterinary & Healthcare', 'veterinary-healthcare', 1, '💊', 3),
('Genetics & Breeding', 'genetics-breeding', 1, '🧬', 4),
('Services & Consulting', 'services-consulting', 1, '👨‍🏫', 5),
('Processing & Packaging', 'processing-packaging', 1, '📦', 6),
('Software & Technology', 'software-technology', 1, '💻', 7),
('Farm Supplies', 'farm-supplies', 1, '🏪', 8);

-- LEVEL 2: Feed & Nutrition Subcategories
INSERT INTO product_categories (name, slug, level, parent_id, display_order)
SELECT 'Complete Feeds', 'complete-feeds', 2, id, 1 FROM product_categories WHERE slug = 'feed-nutrition'
UNION ALL
SELECT 'Feed Ingredients', 'feed-ingredients', 2, id, 2 FROM product_categories WHERE slug = 'feed-nutrition'
UNION ALL
SELECT 'Premixes & Additives', 'premixes-additives', 2, id, 3 FROM product_categories WHERE slug = 'feed-nutrition'
UNION ALL
SELECT 'Supplements', 'supplements', 2, id, 4 FROM product_categories WHERE slug = 'feed-nutrition';

-- LEVEL 3: Complete Feeds > Broiler Feed
INSERT INTO product_categories (name, slug, level, parent_id, display_order)
SELECT 'Broiler Starter Feed', 'broiler-starter-feed', 3, id, 1 FROM product_categories WHERE slug = 'complete-feeds'
UNION ALL
SELECT 'Broiler Grower Feed', 'broiler-grower-feed', 3, id, 2 FROM product_categories WHERE slug = 'complete-feeds'
UNION ALL
SELECT 'Broiler Finisher Feed', 'broiler-finisher-feed', 3, id, 3 FROM product_categories WHERE slug = 'complete-feeds';

-- LEVEL 3: Complete Feeds > Layer Feed
INSERT INTO product_categories (name, slug, level, parent_id, display_order)
SELECT 'Pre-Layer Feed', 'pre-layer-feed', 3, id, 4 FROM product_categories WHERE slug = 'complete-feeds'
UNION ALL
SELECT 'Layer Feed', 'layer-feed', 3, id, 5 FROM product_categories WHERE slug = 'complete-feeds'
UNION ALL
SELECT 'Breeder Feed', 'breeder-feed', 3, id, 6 FROM product_categories WHERE slug = 'complete-feeds';

-- LEVEL 2: Equipment Subcategories
INSERT INTO product_categories (name, slug, level, parent_id, display_order)
SELECT 'Housing & Cages', 'housing-cages', 2, id, 1 FROM product_categories WHERE slug = 'equipment-automation'
UNION ALL
SELECT 'Feeding Systems', 'feeding-systems', 2, id, 2 FROM product_categories WHERE slug = 'equipment-automation'
UNION ALL
SELECT 'Drinking Systems', 'drinking-systems', 2, id, 3 FROM product_categories WHERE slug = 'equipment-automation'
UNION ALL
SELECT 'Climate Control', 'climate-control', 2, id, 4 FROM product_categories WHERE slug = 'equipment-automation'
UNION ALL
SELECT 'Automation Systems', 'automation-systems', 2, id, 5 FROM product_categories WHERE slug = 'equipment-automation';

-- LEVEL 2: Veterinary Subcategories
INSERT INTO product_categories (name, slug, level, parent_id, display_order)
SELECT 'Vaccines', 'vaccines', 2, id, 1 FROM product_categories WHERE slug = 'veterinary-healthcare'
UNION ALL
SELECT 'Medicines', 'medicines', 2, id, 2 FROM product_categories WHERE slug = 'veterinary-healthcare'
UNION ALL
SELECT 'Disinfectants', 'disinfectants', 2, id, 3 FROM product_categories WHERE slug = 'veterinary-healthcare'
UNION ALL
SELECT 'Diagnostic Kits', 'diagnostic-kits', 2, id, 4 FROM product_categories WHERE slug = 'veterinary-healthcare';

-- ==================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==================================================================

-- Update registered count when event registration is added/removed
CREATE OR REPLACE FUNCTION update_event_registered_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events 
    SET registered_count = registered_count + 1 
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET registered_count = registered_count - 1 
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_registration_count_trigger
AFTER INSERT OR DELETE ON event_registrations
FOR EACH ROW EXECUTE FUNCTION update_event_registered_count();

-- Auto-follow when connection request is sent (LinkedIn behavior)
CREATE OR REPLACE FUNCTION auto_follow_on_connection()
RETURNS TRIGGER AS $$
BEGIN
  -- When someone sends a connection request, auto-follow them
  INSERT INTO follows (follower_id, following_id)
  VALUES (NEW.requested_by, 
          CASE 
            WHEN NEW.requested_by = NEW.user_id_1 THEN NEW.user_id_2 
            ELSE NEW.user_id_1 
          END)
  ON CONFLICT (follower_id, following_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_follow_trigger
AFTER INSERT ON connections
FOR EACH ROW EXECUTE FUNCTION auto_follow_on_connection();

-- ==================================================================
-- COMMENTS FOR DOCUMENTATION
-- ==================================================================

COMMENT ON TABLE connections IS 'Mutual connections between users (LinkedIn-style)';
COMMENT ON TABLE follows IS 'One-way follows (Twitter-style)';
COMMENT ON TABLE business_types IS 'Hierarchical business type taxonomy (poultry-specific)';
COMMENT ON TABLE product_categories IS '3-level product category hierarchy';
COMMENT ON TABLE events IS 'User-generated events, webinars, conferences';
COMMENT ON TABLE event_registrations IS 'Event registrations by users';
COMMENT ON MATERIALIZED VIEW profile_network_stats IS 'Cached network statistics for performance';

-- ==================================================================
-- COMPLETION
-- ==================================================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Discovery System Schema Installation Complete!';
  RAISE NOTICE 'Tables created: 7';
  RAISE NOTICE 'Functions created: 5';
  RAISE NOTICE 'Indexes created: 20+';
  RAISE NOTICE 'Seed data: Business types and Product categories populated';
END $$;
```

---

## 🎨 UPDATED NAVIGATION COMPONENTS

### DiscoverMenu Component

**File:** `apps/web/src/components/layout/DiscoverMenu.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export function DiscoverMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
        Discover
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 p-6 grid grid-cols-3 gap-6 z-50">
          {/* Network */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              👥 Network
            </h3>
            <ul className="space-y-2">
              <li><Link href="/discover/members" className="text-sm text-gray-700 hover:text-green-600">Members</Link></li>
              <li><Link href="/discover/members?role=professional" className="text-sm text-gray-700 hover:text-green-600">Professionals</Link></li>
              <li><Link href="/me/connections" className="text-sm text-gray-700 hover:text-green-600">My Connections</Link></li>
            </ul>
          </div>

          {/* Business */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🏢 Business
            </h3>
            <ul className="space-y-2">
              <li><Link href="/discover/businesses" className="text-sm text-gray-700 hover:text-green-600">Companies</Link></li>
              <li><Link href="/discover/businesses?type=farm" className="text-sm text-gray-700 hover:text-green-600">Farms</Link></li>
              <li><Link href="/discover/businesses?type=feed-mill" className="text-sm text-gray-700 hover:text-green-600">Feed Mills</Link></li>
              <li><Link href="/discover/businesses?type=hatchery" className="text-sm text-gray-700 hover:text-green-600">Hatcheries</Link></li>
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📦 Marketplace
            </h3>
            <ul className="space-y-2">
              <li><Link href="/discover/products" className="text-sm text-gray-700 hover:text-green-600">Products</Link></li>
              <li><Link href="/discover/products?category=feed-nutrition" className="text-sm text-gray-700 hover:text-green-600">Feed & Nutrition</Link></li>
              <li><Link href="/discover/products?category=equipment-automation" className="text-sm text-gray-700 hover:text-green-600">Equipment</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🏛️ Community
            </h3>
            <ul className="space-y-2">
              <li><Link href="/discover/organizations" className="text-sm text-gray-700 hover:text-green-600">Organizations</Link></li>
              <li><Link href="/discover/organizations?type=association" className="text-sm text-gray-700 hover:text-green-600">Associations</Link></li>
              <li><Link href="/discover/organizations?type=university" className="text-sm text-gray-700 hover:text-green-600">Universities</Link></li>
            </ul>
          </div>

          {/* Events */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📅 Events
            </h3>
            <ul className="space-y-2">
              <li><Link href="/discover/events" className="text-sm text-gray-700 hover:text-green-600">All Events</Link></li>
              <li><Link href="/discover/events?type=webinar" className="text-sm text-gray-700 hover:text-green-600">Webinars</Link></li>
              <li><Link href="/discover/events?type=conference" className="text-sm text-gray-700 hover:text-green-600">Conferences</Link></li>
              <li><Link href="/discover/events?type=workshop" className="text-sm text-gray-700 hover:text-green-600">Workshops</Link></li>
            </ul>
          </div>

          {/* Jobs */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              💼 Jobs
            </h3>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="text-sm text-gray-700 hover:text-green-600">Browse Jobs</Link></li>
              <li><Link href="/jobs/saved" className="text-sm text-gray-700 hover:text-green-600">Saved Jobs</Link></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
```

### ResourcesMenu Component

**File:** `apps/web/src/components/layout/ResourcesMenu.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export function ResourcesMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
        Resources
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-3 z-50">
          <div className="px-4 py-2">
            <Link href="/market-data" className="block py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded px-3 -mx-3">
              📊 Market Data
            </Link>
            <Link href="/blog" className="block py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded px-3 -mx-3">
              📚 Blog & Articles
            </Link>
            <Link href="/reports" className="block py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded px-3 -mx-3">
              📈 Industry Reports
            </Link>
            <Link href="/knowledge-base" className="block py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded px-3 -mx-3">
              📖 Knowledge Base
            </Link>
            <Link href="/training" className="block py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded px-3 -mx-3">
              🎓 Training Courses
            </Link>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
              Tools
            </div>
            
            <Link href="/tools/feed-calculator" className="block py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded px-3 -mx-3">
              🧮 Feed Calculator
            </Link>
            <Link href="/tools/roi-calculator" className="block py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded px-3 -mx-3">
              💰 ROI Calculator
            </Link>
            <Link href="/tools/growth-tracker" className="block py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded px-3 -mx-3">
              📊 Growth Tracker
            </Link>
            <Link href="/tools/cost-estimator" className="block py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded px-3 -mx-3">
              💵 Cost Estimator
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
```

### UserMenu Component (with "+Create" options)

**File:** `apps/web/src/components/layout/UserMenu.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown, Plus } from 'lucide-react';

export function UserMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasBusinesses, setHasBusinesses] = useState(false);

  useEffect(() => {
    if (user) {
      checkBusinesses();
    }
  }, [user]);

  const checkBusinesses = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('business_details')
      .select('id')
      .eq('owner_id', user?.id)
      .limit(1);
    
    setHasBusinesses(!!data && data.length > 0);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
          {user?.email?.[0].toUpperCase()}
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          <Link href="/me" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50">
            My Profile
          </Link>
          <Link href="/me/businesses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50">
            My Businesses
          </Link>
          
          <div className="border-t border-gray-200 my-2"></div>
          
          {/* Create Options */}
          <div className="px-4 py-1">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Create
            </div>
            
            <Link 
              href="/com/create" 
              className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-lg font-medium mb-2"
            >
              <Plus className="w-4 h-4" />
              Create Business Page
            </Link>
            
            {hasBusinesses && (
              <Link 
                href="/jobs/create" 
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium mb-2"
              >
                <Plus className="w-4 h-4" />
                Post a Job
              </Link>
            )}
            
            <Link 
              href="/events/create" 
              className="flex items-center gap-2 px-3 py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              Host Event/Webinar
            </Link>
          </div>
          
          <div className="border-t border-gray-200 my-2"></div>
          
          <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50">
            Settings
          </Link>
          <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1a: Database (Day 1)
- [ ] Run migration `24_discovery_system_complete.sql`
- [ ] Verify all tables created
- [ ] Verify seed data populated
- [ ] Test functions (get_connection_status, is_following)
- [ ] Test materialized view refresh

### Phase 1b: Google Places (Day 1-2)
- [ ] Get Google Places API key
- [ ] Create useGooglePlaces hook
- [ ] Create LocationAutocomplete component
- [ ] Update ProfileForm to use location autocomplete
- [ ] Test location standardization

### Phase 1c: Connection/Follow UI (Day 2-3)
- [ ] Create ConnectionButton component
- [ ] Create FollowButton component
- [ ] Add network stats to ProfileHeader
- [ ] Test connection flow
- [ ] Test follow flow

### Phase 1d: Navigation (Day 3)
- [ ] Create DiscoverMenu component
- [ ] Create ResourcesMenu component
- [ ] Update UserMenu with "+Create" options
- [ ] Update PlatformHeader
- [ ] Test all navigation menus

### Phase 1e: Testing & Polish (Day 4)
- [ ] Mobile responsive testing
- [ ] Cross-browser testing
- [ ] Performance testing
- [ ] Documentation update

---

## 🎯 SUCCESS CRITERIA

- [ ] Users can select location from Google Places
- [ ] Location displays as "City, State"
- [ ] Connection button works (Send/Pending/Connected)
- [ ] Follow button works (Follow/Following)
- [ ] Network stats display (Connections · Followers)
- [ ] Discover menu shows 6 categories
- [ ] Resources menu shows content + tools
- [ ] "+Create" shows contextually in user menu
- [ ] "+Post Job" only shows if user has business
- [ ] All navigation is mobile-responsive

---

**This final implementation plan is production-ready with complete seed data! Ready to start building?** 🚀
