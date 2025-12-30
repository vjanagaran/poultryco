-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 130_cat_core.sql
-- Description: Product catalog/marketplace system (future phase)
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql, 20_biz_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: PRODUCT CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS cat_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Category details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Hierarchy
  parent_category_id UUID REFERENCES cat_categories(id) ON DELETE SET NULL,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cat_categories_slug ON cat_categories(slug);
CREATE INDEX idx_cat_categories_parent ON cat_categories(parent_category_id);
CREATE INDEX idx_cat_categories_active ON cat_categories(is_active) WHERE is_active = true;

CREATE TRIGGER update_cat_categories_updated_at
  BEFORE UPDATE ON cat_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: PRODUCTS
-- =====================================================

CREATE TABLE IF NOT EXISTS cat_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES biz_profiles(id) ON DELETE CASCADE,
  
  -- Product details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT CHECK (char_length(description) <= 2000),
  
  -- Category
  category_id UUID REFERENCES cat_categories(id),
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  -- Inventory
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  
  -- Media
  images TEXT[],
  
  -- Specifications
  specifications JSONB,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'out_of_stock', 'discontinued')),
  
  -- Stats (denormalized)
  views_count INTEGER NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  rating_avg DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cat_products_seller ON cat_products(seller_id);
CREATE INDEX idx_cat_products_slug ON cat_products(slug);
CREATE INDEX idx_cat_products_category ON cat_products(category_id);
CREATE INDEX idx_cat_products_status ON cat_products(status);
CREATE INDEX idx_cat_products_published ON cat_products(status) WHERE status = 'published';
CREATE INDEX idx_cat_products_rating ON cat_products(rating_avg DESC);

-- Full-text search
CREATE INDEX idx_cat_products_search ON cat_products USING gin(
  to_tsvector('english',
    name || ' ' ||
    COALESCE(description, '')
  )
);

CREATE TRIGGER update_cat_products_updated_at
  BEFORE UPDATE ON cat_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: PRODUCT REVIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS cat_product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES cat_products(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT CHECK (char_length(review_text) <= 1000),
  
  -- Media
  images TEXT[],
  
  -- Verification
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  
  -- Status
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(product_id, reviewer_id)
);

CREATE INDEX idx_cat_product_reviews_product ON cat_product_reviews(product_id);
CREATE INDEX idx_cat_product_reviews_reviewer ON cat_product_reviews(reviewer_id);
CREATE INDEX idx_cat_product_reviews_rating ON cat_product_reviews(rating);
CREATE INDEX idx_cat_product_reviews_approved ON cat_product_reviews(is_approved) WHERE is_approved = true;

CREATE TRIGGER update_cat_product_reviews_updated_at
  BEFORE UPDATE ON cat_product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: ORDERS (Placeholder for future)
-- =====================================================

CREATE TABLE IF NOT EXISTS cat_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Order details
  order_number TEXT UNIQUE NOT NULL,
  
  -- Totals
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  
  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cat_orders_buyer ON cat_orders(buyer_id);
CREATE INDEX idx_cat_orders_number ON cat_orders(order_number);
CREATE INDEX idx_cat_orders_status ON cat_orders(status);
CREATE INDEX idx_cat_orders_payment ON cat_orders(payment_status);

CREATE TRIGGER update_cat_orders_updated_at
  BEFORE UPDATE ON cat_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: ORDER ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS cat_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES cat_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES cat_products(id) ON DELETE RESTRICT,
  
  -- Item details
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  
  -- Snapshot (in case product changes)
  product_snapshot JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cat_order_items_order ON cat_order_items(order_id);
CREATE INDEX idx_cat_order_items_product ON cat_order_items(product_id);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE cat_categories IS 'Product catalog categories';
COMMENT ON TABLE cat_products IS 'Product catalog products';
COMMENT ON TABLE cat_product_reviews IS 'Product reviews and ratings';
COMMENT ON TABLE cat_orders IS 'Product catalog orders';
COMMENT ON TABLE cat_order_items IS 'Order line items';

