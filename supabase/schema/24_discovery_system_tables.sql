-- ==================================================================
-- DISCOVERY SYSTEM - TABLES & SEED DATA
-- Version: 1.0
-- Date: October 26, 2025
-- Description: Enhanced discovery with standardized locations, 
--              business/product taxonomies, and events
-- Note: connections & follows tables already exist in 10_network_connections.sql
-- ==================================================================

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ------------------------------------------------------------------
-- 1. LOCATION STANDARDIZATION FOR PROFILES
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

-- ------------------------------------------------------------------
-- 2. BUSINESS TYPES (Poultry Industry-Specific Taxonomy)
-- ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS business_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES business_types(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  level INTEGER NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update business_profiles table with new fields
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS business_type_id UUID REFERENCES business_types(id),
  ADD COLUMN IF NOT EXISTS specializations VARCHAR[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS production_capacity JSONB,
  ADD COLUMN IF NOT EXISTS service_areas VARCHAR[] DEFAULT '{}';

-- ------------------------------------------------------------------
-- 3. PRODUCT CATEGORIES (3-Level Hierarchy)
-- ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES product_categories(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  level INTEGER NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update business_products table with new categorization
ALTER TABLE business_products
  ADD COLUMN IF NOT EXISTS primary_category_id UUID REFERENCES product_categories(id),
  ADD COLUMN IF NOT EXISTS category_path UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bird_types VARCHAR[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS age_groups VARCHAR[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS formulation VARCHAR(100),
  ADD COLUMN IF NOT EXISTS certifications VARCHAR[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS search_keywords TEXT[];

-- ------------------------------------------------------------------
-- 4. ORGANIZATION TYPES (Community/Association Categories)
-- ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organization_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update organizations table
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS organization_type_id UUID REFERENCES organization_types(id);

-- ------------------------------------------------------------------
-- 5. EVENT TYPES (Webinar, Conference, Workshop, etc.)
-- ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update organization_events table with standardized location
ALTER TABLE organization_events
  ADD COLUMN IF NOT EXISTS event_type_id UUID REFERENCES event_types(id),
  ADD COLUMN IF NOT EXISTS location_place_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_country VARCHAR(3) DEFAULT 'IND',
  ADD COLUMN IF NOT EXISTS location_coordinates GEOGRAPHY(POINT, 4326);

-- ------------------------------------------------------------------
-- 6. JOB TYPES (Full-time, Contract, Internship, etc.)
-- ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS job_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update business_jobs table
ALTER TABLE business_jobs
  ADD COLUMN IF NOT EXISTS job_type_id UUID REFERENCES job_types(id),
  ADD COLUMN IF NOT EXISTS location_place_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_country VARCHAR(3) DEFAULT 'IND',
  ADD COLUMN IF NOT EXISTS location_coordinates GEOGRAPHY(POINT, 4326);

-- ------------------------------------------------------------------
-- 7. SEED DATA - BUSINESS TYPES
-- ------------------------------------------------------------------

-- Level 1 - Main Categories
INSERT INTO business_types (name, slug, level, icon, display_order) VALUES
('Production', 'production', 1, '🐔', 1),
('Feed & Nutrition', 'feed-nutrition', 1, '🌾', 2),
('Veterinary & Health', 'veterinary-health', 1, '💊', 3),
('Equipment & Technology', 'equipment-technology', 1, '⚙️', 4),
('Processing & Packaging', 'processing-packaging', 1, '🏭', 5),
('Services & Consulting', 'services-consulting', 1, '👨‍🏫', 6),
('Retail & Distribution', 'retail-distribution', 1, '🏪', 7)
ON CONFLICT (slug) DO NOTHING;

-- Level 2 - Production Types
INSERT INTO business_types (name, slug, level, parent_id, display_order)
SELECT 'Broiler Farm', 'broiler-farm', 2, id, 1 FROM business_types WHERE slug = 'production'
UNION ALL SELECT 'Layer Farm', 'layer-farm', 2, id, 2 FROM business_types WHERE slug = 'production'
UNION ALL SELECT 'Breeder Farm', 'breeder-farm', 2, id, 3 FROM business_types WHERE slug = 'production'
UNION ALL SELECT 'Integrated Farm', 'integrated-farm', 2, id, 4 FROM business_types WHERE slug = 'production'
UNION ALL SELECT 'Commercial Hatchery', 'commercial-hatchery', 2, id, 5 FROM business_types WHERE slug = 'production'
UNION ALL SELECT 'Genetics Company', 'genetics-company', 2, id, 6 FROM business_types WHERE slug = 'production'
ON CONFLICT (slug) DO NOTHING;

-- Level 2 - Feed & Nutrition Types
INSERT INTO business_types (name, slug, level, parent_id, display_order)
SELECT 'Feed Mill', 'feed-mill', 2, id, 1 FROM business_types WHERE slug = 'feed-nutrition'
UNION ALL SELECT 'Premix Manufacturer', 'premix-manufacturer', 2, id, 2 FROM business_types WHERE slug = 'feed-nutrition'
UNION ALL SELECT 'Feed Ingredient Supplier', 'feed-ingredient-supplier', 2, id, 3 FROM business_types WHERE slug = 'feed-nutrition'
ON CONFLICT (slug) DO NOTHING;

-- Level 2 - Veterinary & Health Types
INSERT INTO business_types (name, slug, level, parent_id, display_order)
SELECT 'Veterinary Clinic', 'veterinary-clinic', 2, id, 1 FROM business_types WHERE slug = 'veterinary-health'
UNION ALL SELECT 'Vaccine Manufacturer', 'vaccine-manufacturer', 2, id, 2 FROM business_types WHERE slug = 'veterinary-health'
UNION ALL SELECT 'Diagnostic Laboratory', 'diagnostic-laboratory', 2, id, 3 FROM business_types WHERE slug = 'veterinary-health'
UNION ALL SELECT 'Pharmaceutical Company', 'pharmaceutical-company', 2, id, 4 FROM business_types WHERE slug = 'veterinary-health'
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------------
-- 8. SEED DATA - PRODUCT CATEGORIES
-- ------------------------------------------------------------------

-- Level 1 - Main Categories
INSERT INTO product_categories (name, slug, level, icon, display_order) VALUES
('Feed & Nutrition', 'feed-nutrition-cat', 1, '🌾', 1),
('Equipment & Automation', 'equipment-automation-cat', 1, '⚙️', 2),
('Veterinary & Healthcare', 'veterinary-healthcare-cat', 1, '💊', 3),
('Genetics & Breeding', 'genetics-breeding-cat', 1, '🧬', 4),
('Services & Consulting', 'services-consulting-cat', 1, '👨‍🏫', 5),
('Processing & Packaging', 'processing-packaging-cat', 1, '📦', 6),
('Software & Technology', 'software-technology-cat', 1, '💻', 7),
('Farm Supplies', 'farm-supplies-cat', 1, '🏪', 8)
ON CONFLICT (slug) DO NOTHING;

-- Level 2 - Feed Subcategories
INSERT INTO product_categories (name, slug, level, parent_id, display_order)
SELECT 'Complete Feeds', 'complete-feeds', 2, id, 1 FROM product_categories WHERE slug = 'feed-nutrition-cat'
UNION ALL SELECT 'Feed Ingredients', 'feed-ingredients', 2, id, 2 FROM product_categories WHERE slug = 'feed-nutrition-cat'
UNION ALL SELECT 'Premixes & Additives', 'premixes-additives', 2, id, 3 FROM product_categories WHERE slug = 'feed-nutrition-cat'
UNION ALL SELECT 'Supplements', 'supplements', 2, id, 4 FROM product_categories WHERE slug = 'feed-nutrition-cat'
ON CONFLICT (slug) DO NOTHING;

-- Level 3 - Complete Feed Types
INSERT INTO product_categories (name, slug, level, parent_id, display_order)
SELECT 'Broiler Starter Feed', 'broiler-starter-feed', 3, id, 1 FROM product_categories WHERE slug = 'complete-feeds'
UNION ALL SELECT 'Broiler Grower Feed', 'broiler-grower-feed', 3, id, 2 FROM product_categories WHERE slug = 'complete-feeds'
UNION ALL SELECT 'Broiler Finisher Feed', 'broiler-finisher-feed', 3, id, 3 FROM product_categories WHERE slug = 'complete-feeds'
UNION ALL SELECT 'Pre-Layer Feed', 'pre-layer-feed', 3, id, 4 FROM product_categories WHERE slug = 'complete-feeds'
UNION ALL SELECT 'Layer Feed', 'layer-feed', 3, id, 5 FROM product_categories WHERE slug = 'complete-feeds'
UNION ALL SELECT 'Breeder Feed', 'breeder-feed', 3, id, 6 FROM product_categories WHERE slug = 'complete-feeds'
ON CONFLICT (slug) DO NOTHING;

-- Level 2 - Equipment Subcategories
INSERT INTO product_categories (name, slug, level, parent_id, display_order)
SELECT 'Housing & Cages', 'housing-cages', 2, id, 1 FROM product_categories WHERE slug = 'equipment-automation-cat'
UNION ALL SELECT 'Feeding Systems', 'feeding-systems', 2, id, 2 FROM product_categories WHERE slug = 'equipment-automation-cat'
UNION ALL SELECT 'Drinking Systems', 'drinking-systems', 2, id, 3 FROM product_categories WHERE slug = 'equipment-automation-cat'
UNION ALL SELECT 'Climate Control', 'climate-control', 2, id, 4 FROM product_categories WHERE slug = 'equipment-automation-cat'
UNION ALL SELECT 'Automation Systems', 'automation-systems', 2, id, 5 FROM product_categories WHERE slug = 'equipment-automation-cat'
ON CONFLICT (slug) DO NOTHING;

-- Level 2 - Veterinary Subcategories
INSERT INTO product_categories (name, slug, level, parent_id, display_order)
SELECT 'Vaccines', 'vaccines', 2, id, 1 FROM product_categories WHERE slug = 'veterinary-healthcare-cat'
UNION ALL SELECT 'Medicines', 'medicines', 2, id, 2 FROM product_categories WHERE slug = 'veterinary-healthcare-cat'
UNION ALL SELECT 'Disinfectants', 'disinfectants', 2, id, 3 FROM product_categories WHERE slug = 'veterinary-healthcare-cat'
UNION ALL SELECT 'Diagnostic Kits', 'diagnostic-kits', 2, id, 4 FROM product_categories WHERE slug = 'veterinary-healthcare-cat'
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------------
-- 9. SEED DATA - ORGANIZATION TYPES
-- ------------------------------------------------------------------

INSERT INTO organization_types (name, slug, description, icon, display_order) VALUES
('Industry Association', 'industry-association', 'Trade associations and industry bodies', '🏢', 1),
('Professional Society', 'professional-society', 'Professional communities and societies', '👥', 2),
('Farmers Cooperative', 'farmers-cooperative', 'Cooperative societies and farmer groups', '🤝', 3),
('Research Institute', 'research-institute', 'Research and academic institutions', '🔬', 4),
('Government Agency', 'government-agency', 'Government departments and agencies', '🏛️', 5),
('NGO', 'ngo', 'Non-governmental organizations', '🌍', 6),
('Business Network', 'business-network', 'Business networking groups', '🔗', 7)
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------------
-- 10. SEED DATA - EVENT TYPES
-- ------------------------------------------------------------------

INSERT INTO event_types (name, slug, description, icon, display_order) VALUES
('Conference', 'conference', 'Multi-day conferences and summits', '🎤', 1),
('Webinar', 'webinar', 'Online webinars and virtual sessions', '💻', 2),
('Workshop', 'workshop', 'Hands-on training workshops', '🛠️', 3),
('Seminar', 'seminar', 'Educational seminars', '📚', 4),
('Trade Show', 'trade-show', 'Exhibitions and trade shows', '🏪', 5),
('Farm Visit', 'farm-visit', 'Farm tours and visits', '🚜', 6),
('Networking Event', 'networking-event', 'Networking meetups', '🤝', 7)
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------------
-- 11. SEED DATA - JOB TYPES
-- ------------------------------------------------------------------

INSERT INTO job_types (name, slug, description, icon, display_order) VALUES
('Full-time', 'full-time', 'Permanent full-time positions', '💼', 1),
('Part-time', 'part-time', 'Part-time positions', '⏰', 2),
('Contract', 'contract', 'Fixed-term contract roles', '📝', 3),
('Internship', 'internship', 'Internship opportunities', '🎓', 4),
('Freelance', 'freelance', 'Freelance/project-based work', '💻', 5),
('Consultant', 'consultant', 'Consulting positions', '👔', 6)
ON CONFLICT (slug) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Discovery System Tables & Seed Data Complete!';
  RAISE NOTICE '   - Location fields added to profiles';
  RAISE NOTICE '   - Business types taxonomy (7 categories, 13 types)';
  RAISE NOTICE '   - Product categories (8 L1, 14 L2, 6 L3)';
  RAISE NOTICE '   - Organization types (7 types)';
  RAISE NOTICE '   - Event types (7 types)';
  RAISE NOTICE '   - Job types (6 types)';
  RAISE NOTICE '   - All seed data populated';
  RAISE NOTICE '   - Ready for indexes (run 25_discovery_system_indexes.sql next)';
END $$;

