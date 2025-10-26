-- ==================================================================
-- DISCOVERY SYSTEM - INDEXES & FUNCTIONS
-- Version: 1.0
-- Date: October 26, 2025
-- Description: Performance indexes, helper functions for discovery
-- Dependencies: Requires 24_discovery_system_tables.sql
-- ==================================================================

-- ------------------------------------------------------------------
-- 1. PROFILE LOCATION INDEXES
-- ------------------------------------------------------------------

-- Spatial index for "nearby" searches
DROP INDEX IF EXISTS idx_profiles_location_coordinates;
CREATE INDEX idx_profiles_location_coordinates ON profiles USING GIST(location_coordinates);

-- Text search indexes for location
DROP INDEX IF EXISTS idx_profiles_location_city;
DROP INDEX IF EXISTS idx_profiles_location_state;
CREATE INDEX idx_profiles_location_city ON profiles(location_city);
CREATE INDEX idx_profiles_location_state ON profiles(location_state);

-- Function for distance-based profile search
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
-- 2. BUSINESS TYPES INDEXES
-- ------------------------------------------------------------------

DROP INDEX IF EXISTS idx_business_types_parent;
DROP INDEX IF EXISTS idx_business_types_level;
DROP INDEX IF EXISTS idx_business_types_slug;
DROP INDEX IF EXISTS idx_business_types_active;

CREATE INDEX idx_business_types_parent ON business_types(parent_id);
CREATE INDEX idx_business_types_level ON business_types(level);
CREATE INDEX idx_business_types_slug ON business_types(slug);
CREATE INDEX idx_business_types_active ON business_types(is_active) WHERE is_active = true;

-- Helper function to get business type hierarchy
CREATE OR REPLACE FUNCTION get_business_type_path(type_id UUID)
RETURNS TEXT AS $$
DECLARE
  type_path TEXT;
BEGIN
  WITH RECURSIVE type_tree AS (
    SELECT id, name, parent_id, 1 as level
    FROM business_types
    WHERE id = type_id
    
    UNION ALL
    
    SELECT bt.id, bt.name, bt.parent_id, tt.level + 1
    FROM business_types bt
    JOIN type_tree tt ON bt.id = tt.parent_id
  )
  SELECT string_agg(name, ' > ' ORDER BY level DESC)
  INTO type_path
  FROM type_tree;
  
  RETURN type_path;
END;
$$ LANGUAGE plpgsql STABLE;

-- ------------------------------------------------------------------
-- 3. PRODUCT CATEGORIES INDEXES
-- ------------------------------------------------------------------

DROP INDEX IF EXISTS idx_product_categories_parent;
DROP INDEX IF EXISTS idx_product_categories_level;
DROP INDEX IF EXISTS idx_product_categories_slug;
DROP INDEX IF EXISTS idx_product_categories_active;

CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX idx_product_categories_level ON product_categories(level);
CREATE INDEX idx_product_categories_slug ON product_categories(slug);
CREATE INDEX idx_product_categories_active ON product_categories(is_active) WHERE is_active = true;

-- ------------------------------------------------------------------
-- 4. BUSINESS PRODUCTS ENHANCED INDEXES
-- ------------------------------------------------------------------

-- New category-based indexes
DROP INDEX IF EXISTS idx_business_products_primary_category;
DROP INDEX IF EXISTS idx_business_products_bird_types;
DROP INDEX IF EXISTS idx_business_products_age_groups;
DROP INDEX IF EXISTS idx_business_products_certifications;
DROP INDEX IF EXISTS idx_business_products_search_keywords;

CREATE INDEX idx_business_products_primary_category ON business_products(primary_category_id);
CREATE INDEX idx_business_products_bird_types ON business_products USING GIN(bird_types);
CREATE INDEX idx_business_products_age_groups ON business_products USING GIN(age_groups);
CREATE INDEX idx_business_products_certifications ON business_products USING GIN(certifications);
CREATE INDEX idx_business_products_search_keywords ON business_products USING GIN(search_keywords);

-- Helper function to get product category path
CREATE OR REPLACE FUNCTION get_product_category_path(category_id UUID)
RETURNS TEXT AS $$
DECLARE
  cat_path TEXT;
BEGIN
  WITH RECURSIVE cat_tree AS (
    SELECT id, name, parent_id, 1 as level
    FROM product_categories
    WHERE id = category_id
    
    UNION ALL
    
    SELECT pc.id, pc.name, pc.parent_id, ct.level + 1
    FROM product_categories pc
    JOIN cat_tree ct ON pc.id = ct.parent_id
  )
  SELECT string_agg(name, ' > ' ORDER BY level DESC)
  INTO cat_path
  FROM cat_tree;
  
  RETURN cat_path;
END;
$$ LANGUAGE plpgsql STABLE;

-- ------------------------------------------------------------------
-- 5. ORGANIZATION TYPES INDEXES
-- ------------------------------------------------------------------

DROP INDEX IF EXISTS idx_organization_types_slug;
DROP INDEX IF EXISTS idx_organization_types_active;

CREATE INDEX idx_organization_types_slug ON organization_types(slug);
CREATE INDEX idx_organization_types_active ON organization_types(is_active) WHERE is_active = true;

-- ------------------------------------------------------------------
-- 6. EVENT TYPES INDEXES
-- ------------------------------------------------------------------

DROP INDEX IF EXISTS idx_event_types_slug;
DROP INDEX IF EXISTS idx_event_types_active;

CREATE INDEX idx_event_types_slug ON event_types(slug);
CREATE INDEX idx_event_types_active ON event_types(is_active) WHERE is_active = true;

-- Enhanced indexes for organization_events
DROP INDEX IF EXISTS idx_org_events_type;
DROP INDEX IF EXISTS idx_org_events_location_city;
DROP INDEX IF EXISTS idx_org_events_location_state;
DROP INDEX IF EXISTS idx_org_events_location_coordinates;

CREATE INDEX idx_org_events_type ON organization_events(event_type_id);
CREATE INDEX idx_org_events_location_city ON organization_events(location_city);
CREATE INDEX idx_org_events_location_state ON organization_events(location_state);
CREATE INDEX idx_org_events_location_coordinates ON organization_events USING GIST(location_coordinates);

-- Function for nearby events
CREATE OR REPLACE FUNCTION find_nearby_events(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 100000,
  days_ahead INTEGER DEFAULT 90
)
RETURNS TABLE (
  event_id UUID,
  distance_meters DOUBLE PRECISION,
  event_title TEXT,
  event_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as event_id,
    ST_Distance(
      e.location_coordinates,
      ST_MakePoint(user_lng, user_lat)::geography
    ) as distance_meters,
    e.title as event_title,
    e.event_date
  FROM organization_events e
  WHERE e.location_coordinates IS NOT NULL
    AND e.event_date >= NOW()
    AND e.event_date <= NOW() + (days_ahead || ' days')::INTERVAL
    AND ST_DWithin(
      e.location_coordinates,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_meters
    )
  ORDER BY distance_meters, e.event_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- ------------------------------------------------------------------
-- 7. JOB TYPES INDEXES
-- ------------------------------------------------------------------

DROP INDEX IF EXISTS idx_job_types_slug;
DROP INDEX IF EXISTS idx_job_types_active;

CREATE INDEX idx_job_types_slug ON job_types(slug);
CREATE INDEX idx_job_types_active ON job_types(is_active) WHERE is_active = true;

-- Enhanced indexes for business_jobs
DROP INDEX IF EXISTS idx_business_jobs_type;
DROP INDEX IF EXISTS idx_business_jobs_location_city;
DROP INDEX IF EXISTS idx_business_jobs_location_state;
DROP INDEX IF EXISTS idx_business_jobs_location_coordinates;

CREATE INDEX idx_business_jobs_type ON business_jobs(job_type_id);
CREATE INDEX idx_business_jobs_location_city ON business_jobs(location_city);
CREATE INDEX idx_business_jobs_location_state ON business_jobs(location_state);
CREATE INDEX idx_business_jobs_location_coordinates ON business_jobs USING GIST(location_coordinates);

-- Function for nearby jobs
CREATE OR REPLACE FUNCTION find_nearby_jobs(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 100000
)
RETURNS TABLE (
  job_id UUID,
  distance_meters DOUBLE PRECISION,
  job_title TEXT,
  business_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id as job_id,
    ST_Distance(
      j.location_coordinates,
      ST_MakePoint(user_lng, user_lat)::geography
    ) as distance_meters,
    j.job_title,
    bp.business_name
  FROM business_jobs j
  JOIN business_profiles bp ON j.business_profile_id = bp.id
  WHERE j.location_coordinates IS NOT NULL
    AND j.is_active = true
    AND ST_DWithin(
      j.location_coordinates,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_meters
    )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql STABLE;

-- ------------------------------------------------------------------
-- 8. UNIFIED DISCOVERY SEARCH FUNCTION
-- ------------------------------------------------------------------

CREATE OR REPLACE FUNCTION unified_discovery_search(
  search_query TEXT,
  search_types TEXT[] DEFAULT ARRAY['all'],
  user_location_lat DOUBLE PRECISION DEFAULT NULL,
  user_location_lng DOUBLE PRECISION DEFAULT NULL,
  max_distance_km INTEGER DEFAULT 500,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  result_type TEXT,
  result_id UUID,
  result_title TEXT,
  result_description TEXT,
  result_location TEXT,
  distance_km DOUBLE PRECISION,
  result_url TEXT,
  relevance_score REAL
) AS $$
BEGIN
  -- This is a placeholder for a comprehensive search function
  -- Will be enhanced with full-text search and ranking
  RETURN QUERY
  SELECT 
    'member'::TEXT as result_type,
    p.id as result_id,
    p.full_name as result_title,
    p.headline as result_description,
    COALESCE(p.location_city || ', ' || p.location_state, '') as result_location,
    CASE 
      WHEN user_location_lat IS NOT NULL AND p.location_coordinates IS NOT NULL
      THEN ST_Distance(
        p.location_coordinates,
        ST_MakePoint(user_location_lng, user_location_lat)::geography
      ) / 1000.0
      ELSE NULL
    END as distance_km,
    '/me/' || p.profile_slug as result_url,
    ts_rank(
      to_tsvector('english', p.full_name || ' ' || COALESCE(p.headline, '')),
      plainto_tsquery('english', search_query)
    ) as relevance_score
  FROM profiles p
  WHERE 
    (search_query = '' OR 
     to_tsvector('english', p.full_name || ' ' || COALESCE(p.headline, '')) @@ plainto_tsquery('english', search_query))
    AND ('all' = ANY(search_types) OR 'members' = ANY(search_types))
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Discovery System Indexes & Functions Complete!';
  RAISE NOTICE '   - Spatial indexes created for locations';
  RAISE NOTICE '   - Taxonomy indexes optimized';
  RAISE NOTICE '   - Helper functions ready:';
  RAISE NOTICE '     • find_nearby_profiles()';
  RAISE NOTICE '     • find_nearby_events()';
  RAISE NOTICE '     • find_nearby_jobs()';
  RAISE NOTICE '     • get_business_type_path()';
  RAISE NOTICE '     • get_product_category_path()';
  RAISE NOTICE '     • unified_discovery_search()';
  RAISE NOTICE '   - System ready for frontend integration!';
END $$;

