-- =====================================================
-- PoultryCo Database Schema
-- File: 05_business_products_jobs.sql
-- Description: Product catalog and job postings
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- SECTION 1: PRODUCTS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Product Info
  product_name TEXT NOT NULL,
  product_code TEXT,
  
  -- Category
  product_category TEXT NOT NULL CHECK (product_category IN (
    'feed', 'medicine', 'vaccine', 'supplement', 'equipment', 
    'chicks', 'eggs', 'meat', 'disinfectant', 'packaging', 
    'spare_parts', 'lab_supplies', 'other'
  )),
  product_subcategory TEXT,
  
  -- Description
  short_description TEXT CHECK (char_length(short_description) <= 200),
  full_description TEXT,
  
  -- Specifications
  specifications JSONB DEFAULT '{}'::jsonb,
  
  -- Pricing
  show_price BOOLEAN NOT NULL DEFAULT false,
  price DECIMAL(10, 2),
  price_unit TEXT, -- per kg, per bag, per piece, etc.
  mrp DECIMAL(10, 2),
  
  -- Availability
  is_available BOOLEAN NOT NULL DEFAULT true,
  minimum_order_quantity INTEGER,
  moq_unit TEXT,
  
  -- Images
  featured_image_url TEXT,
  
  -- Display
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Stats (denormalized for performance)
  view_count INTEGER NOT NULL DEFAULT 0,
  inquiry_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_business ON business_products(business_profile_id);
CREATE INDEX idx_products_category ON business_products(product_category);
CREATE INDEX idx_products_available ON business_products(is_available);
CREATE INDEX idx_products_published ON business_products(is_published);
CREATE INDEX idx_products_created ON business_products(created_at DESC);

-- Full-text search
CREATE INDEX idx_products_search ON business_products USING gin(
  to_tsvector('english', 
    product_name || ' ' || 
    COALESCE(short_description, '') || ' ' ||
    COALESCE(full_description, '')
  )
);

-- Trigger
CREATE TRIGGER update_business_products_updated_at
  BEFORE UPDATE ON business_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Product images (multiple per product)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES business_products(id) ON DELETE CASCADE,
  
  -- Image
  image_url TEXT NOT NULL,
  alt_text TEXT,
  
  -- Display
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(is_primary);
CREATE INDEX idx_product_images_sort ON product_images(product_id, sort_order);

-- Product reviews (from connections only)
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES business_products(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_text TEXT CHECK (char_length(review_text) <= 500),
  
  -- Purchase verification (optional)
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  
  -- Moderation
  is_approved BOOLEAN NOT NULL DEFAULT false,
  moderation_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One review per product per user
  UNIQUE(product_id, reviewer_id)
);

-- Indexes
CREATE INDEX idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_reviewer ON product_reviews(reviewer_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_product_reviews_approved ON product_reviews(is_approved);
CREATE INDEX idx_product_reviews_created ON product_reviews(created_at DESC);

-- Trigger
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: JOB POSTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Job Info
  job_title TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN (
    'full_time', 'part_time', 'contract', 'internship', 'seasonal'
  )),
  
  -- Category (poultry-specific)
  job_category TEXT NOT NULL CHECK (job_category IN (
    'farm_management', 'veterinary', 'technical', 'sales', 'production',
    'quality_control', 'maintenance', 'administration', 'warehouse',
    'delivery', 'supervisor', 'worker', 'manager', 'other'
  )),
  
  -- Location
  work_location_type TEXT NOT NULL CHECK (work_location_type IN ('on_site', 'remote', 'hybrid')),
  job_location_state TEXT,
  job_location_city TEXT,
  
  -- Description
  job_description TEXT NOT NULL,
  responsibilities TEXT,
  requirements TEXT,
  
  -- Experience & Education
  experience_required TEXT CHECK (experience_required IN (
    'fresher', '0-1_years', '1-3_years', '3-5_years', '5-10_years', '10+_years'
  )),
  education_required TEXT,
  
  -- Compensation
  show_salary BOOLEAN NOT NULL DEFAULT false,
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  salary_period TEXT CHECK (salary_period IN ('monthly', 'annual')),
  
  -- Benefits
  benefits TEXT[],
  
  -- Application
  application_type TEXT NOT NULL CHECK (application_type IN ('internal', 'external', 'email')),
  application_url TEXT,
  application_email TEXT,
  application_instructions TEXT,
  
  -- Openings
  number_of_openings INTEGER DEFAULT 1 CHECK (number_of_openings > 0),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at DATE,
  
  -- Stats
  view_count INTEGER NOT NULL DEFAULT 0,
  application_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jobs_business ON business_jobs(business_profile_id);
CREATE INDEX idx_jobs_category ON business_jobs(job_category);
CREATE INDEX idx_jobs_type ON business_jobs(job_type);
CREATE INDEX idx_jobs_active ON business_jobs(is_active);
CREATE INDEX idx_jobs_location ON business_jobs(job_location_state, job_location_city);
CREATE INDEX idx_jobs_posted ON business_jobs(posted_at DESC);
CREATE INDEX idx_jobs_expires ON business_jobs(expires_at);

-- Full-text search
CREATE INDEX idx_jobs_search ON business_jobs USING gin(
  to_tsvector('english', 
    job_title || ' ' || 
    job_description || ' ' ||
    COALESCE(responsibilities, '') || ' ' ||
    COALESCE(requirements, '')
  )
);

-- Trigger
CREATE TRIGGER update_business_jobs_updated_at
  BEFORE UPDATE ON business_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: JOB CATEGORIES MASTER
-- =====================================================

-- Job categories can be managed dynamically
CREATE TABLE IF NOT EXISTS job_categories_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT UNIQUE NOT NULL,
  category_description TEXT,
  parent_category_id UUID REFERENCES job_categories_master(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_job_categories_parent ON job_categories_master(parent_category_id);
CREATE INDEX idx_job_categories_active ON job_categories_master(is_active);

-- Insert default categories
INSERT INTO job_categories_master (category_name, category_description, sort_order) VALUES
  ('Farm Management', 'Farm managers, supervisors, coordinators', 1),
  ('Veterinary', 'Veterinarians, animal health workers', 2),
  ('Technical', 'Technical officers, specialists', 3),
  ('Sales & Marketing', 'Sales representatives, marketing executives', 4),
  ('Production', 'Production workers, hatchery operators', 5),
  ('Quality Control', 'QC officers, lab technicians', 6),
  ('Maintenance', 'Equipment maintenance, electricians', 7),
  ('Administration', 'Admin staff, HR, accounts', 8),
  ('Warehouse & Logistics', 'Warehouse managers, delivery staff', 9),
  ('Other', 'Other positions', 10)
ON CONFLICT (category_name) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE business_products IS 'Product catalog with optional pricing and availability';
COMMENT ON COLUMN business_products.show_price IS 'Toggle to control price visibility per product';
COMMENT ON TABLE product_images IS 'Multiple images per product with sort order';
COMMENT ON TABLE product_reviews IS 'Product reviews from connections with rating system';

COMMENT ON TABLE business_jobs IS 'Job postings with external application support';
COMMENT ON COLUMN business_jobs.application_type IS 'internal = apply on PoultryCo, external = redirect to URL, email = send to email';
COMMENT ON TABLE job_categories_master IS 'Poultry-specific job categories (can be extended)';

-- =====================================================
-- END OF FILE
-- =====================================================

