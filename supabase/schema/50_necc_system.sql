-- =====================================================
-- PoultryCo Database Schema
-- File: 50_necc_system.sql
-- Description: NECC egg price data, zones, annotations, and predictions
-- Version: 1.0
-- Date: 2025-01-17
-- Dependencies: 01_core_profiles.sql, 51_shared_engagement_system.sql
-- =====================================================
-- Note: Engagement system (likes, comments, shares) is in 51_shared_engagement_system.sql

-- =====================================================
-- SECTION 1: NECC ZONES
-- =====================================================

CREATE TABLE IF NOT EXISTS necc_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zone Information
  name TEXT NOT NULL UNIQUE, -- 'Namakkal', 'Mumbai', 'Hyderabad', etc.
  slug TEXT NOT NULL UNIQUE, -- 'namakkal', 'mumbai', 'hyderabad'
  description TEXT,
  
  -- Zone Type
  zone_type TEXT NOT NULL CHECK (zone_type IN ('production_center', 'consumption_center')),
  zone_code TEXT, -- Optional zone code if available
  
  -- Location
  state TEXT,
  district TEXT,
  city TEXT,
  
  -- Metadata
  sorting INTEGER DEFAULT 0,
  status BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for necc_zones
CREATE INDEX idx_necc_zones_name ON necc_zones(name);
CREATE INDEX idx_necc_zones_slug ON necc_zones(slug);
CREATE INDEX idx_necc_zones_type ON necc_zones(zone_type);
CREATE INDEX idx_necc_zones_status ON necc_zones(status) WHERE status = true;

-- Trigger for necc_zones
CREATE TRIGGER update_necc_zones_updated_at
  BEFORE UPDATE ON necc_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: NECC PRICES
-- =====================================================

CREATE TABLE IF NOT EXISTS necc_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zone
  zone_id UUID NOT NULL REFERENCES necc_zones(id) ON DELETE RESTRICT,
  
  -- Date
  date DATE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
  
  -- Prices
  suggested_price INTEGER, -- NECC suggested price (per 100 eggs)
  prevailing_price INTEGER, -- Prevailing market price (per 100 eggs)
  
  -- Data Source
  source TEXT NOT NULL DEFAULT 'scraped' CHECK (source IN ('scraped', 'manual', 'imported')),
  mode TEXT CHECK (mode IN ('CRON', 'MANUAL')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one price per zone per date per type
  UNIQUE(zone_id, date)
);

-- Indexes for necc_prices
CREATE INDEX idx_necc_prices_zone_date ON necc_prices(zone_id, date DESC);
CREATE INDEX idx_necc_prices_date ON necc_prices(date DESC);
CREATE INDEX idx_necc_prices_year_month ON necc_prices(year, month);
CREATE INDEX idx_necc_prices_zone_year_month ON necc_prices(zone_id, year, month);
CREATE INDEX idx_necc_prices_source ON necc_prices(source);

-- Trigger for necc_prices
CREATE TRIGGER update_necc_prices_updated_at
  BEFORE UPDATE ON necc_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get previous day price for a zone
CREATE OR REPLACE FUNCTION get_previous_day_price(
  p_zone_id UUID,
  p_date DATE
)
RETURNS TABLE (
  id UUID,
  date DATE,
  suggested_price INTEGER,
  prevailing_price INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    np.id,
    np.date,
    np.suggested_price,
    np.prevailing_price
  FROM necc_prices np
  WHERE np.zone_id = p_zone_id
    AND np.date < p_date
    AND (np.suggested_price IS NOT NULL OR np.prevailing_price IS NOT NULL)
  ORDER BY np.date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 3: NECC SCRAPER LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS necc_scraper_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Scrape Information
  scrape_date DATE NOT NULL,
  scrape_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'partial')),
  
  -- Zone (if specific zone failed)
  zone_id UUID REFERENCES necc_zones(id) ON DELETE SET NULL,
  
  -- Error Information
  error_message TEXT,
  error_details JSONB,
  
  -- Statistics
  zones_scraped INTEGER DEFAULT 0,
  zones_successful INTEGER DEFAULT 0,
  zones_failed INTEGER DEFAULT 0,
  prices_inserted INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for necc_scraper_logs
CREATE INDEX idx_necc_scraper_logs_date ON necc_scraper_logs(scrape_date DESC);
CREATE INDEX idx_necc_scraper_logs_status ON necc_scraper_logs(status);
CREATE INDEX idx_necc_scraper_logs_zone ON necc_scraper_logs(zone_id) WHERE zone_id IS NOT NULL;
CREATE INDEX idx_necc_scraper_logs_created_at ON necc_scraper_logs(created_at DESC);

-- =====================================================
-- SECTION 4: NECC ANNOTATIONS (Phase 2)
-- =====================================================

CREATE TABLE IF NOT EXISTS necc_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Expert
  expert_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Price Reference (optional - can be general annotation)
  price_id UUID REFERENCES necc_prices(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES necc_zones(id) ON DELETE SET NULL,
  date DATE, -- Specific date if annotation is date-specific
  
  -- Annotation Type
  annotation_type TEXT NOT NULL CHECK (annotation_type IN (
    'spike', 'trend', 'anomaly', 'prediction', 'general'
  )),
  
  -- Content
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for necc_annotations
CREATE INDEX idx_necc_annotations_expert ON necc_annotations(expert_id);
CREATE INDEX idx_necc_annotations_price ON necc_annotations(price_id) WHERE price_id IS NOT NULL;
CREATE INDEX idx_necc_annotations_zone_date ON necc_annotations(zone_id, date) WHERE zone_id IS NOT NULL AND date IS NOT NULL;
CREATE INDEX idx_necc_annotations_type ON necc_annotations(annotation_type);
CREATE INDEX idx_necc_annotations_created_at ON necc_annotations(created_at DESC);

-- Trigger for necc_annotations
CREATE TRIGGER update_necc_annotations_updated_at
  BEFORE UPDATE ON necc_annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: NECC ANNOTATION METADATA (Phase 2)
-- =====================================================

CREATE TABLE IF NOT EXISTS necc_annotation_metadata (
  annotation_id UUID PRIMARY KEY REFERENCES necc_annotations(id) ON DELETE CASCADE,
  
  -- Engagement Metrics (NECC-specific)
  helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  
  -- Verification
  expert_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for necc_annotation_metadata
CREATE TRIGGER update_necc_annotation_metadata_updated_at
  BEFORE UPDATE ON necc_annotation_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 6: NECC AI PREDICTIONS (Phase 3)
-- =====================================================

CREATE TABLE IF NOT EXISTS necc_ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zone
  zone_id UUID NOT NULL REFERENCES necc_zones(id) ON DELETE RESTRICT,
  
  -- Prediction Dates
  prediction_date DATE NOT NULL, -- When prediction was made
  forecast_date DATE NOT NULL, -- Date being predicted
  
  -- Prediction
  predicted_price INTEGER NOT NULL, -- Predicted price (per 100 eggs)
  confidence DECIMAL(5, 2) CHECK (confidence >= 0 AND confidence <= 100), -- 0-100%
  
  -- Model Information
  model_version TEXT,
  model_type TEXT CHECK (model_type IN ('openai', 'anthropic', 'custom')),
  
  -- Assumptions & Factors
  assumptions JSONB DEFAULT '{}',
  factors_considered TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for necc_ai_predictions
CREATE INDEX idx_necc_ai_predictions_zone ON necc_ai_predictions(zone_id);
CREATE INDEX idx_necc_ai_predictions_prediction_date ON necc_ai_predictions(prediction_date DESC);
CREATE INDEX idx_necc_ai_predictions_forecast_date ON necc_ai_predictions(forecast_date);
CREATE INDEX idx_necc_ai_predictions_zone_forecast ON necc_ai_predictions(zone_id, forecast_date);

-- =====================================================
-- SECTION 7: RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE necc_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE necc_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE necc_scraper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE necc_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE necc_annotation_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE necc_ai_predictions ENABLE ROW LEVEL SECURITY;

-- NECC Zones: Everyone can view
CREATE POLICY "NECC zones viewable by everyone"
  ON necc_zones FOR SELECT
  USING (true);

-- NECC Prices: Everyone can view
CREATE POLICY "NECC prices viewable by everyone"
  ON necc_prices FOR SELECT
  USING (true);

-- NECC Scraper Logs: Admin only (via service role)
-- No RLS policy needed - accessed via service role only

-- NECC Annotations: Everyone can view, experts can create
CREATE POLICY "NECC annotations viewable by everyone"
  ON necc_annotations FOR SELECT
  USING (true);

CREATE POLICY "Experts can create annotations"
  ON necc_annotations FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND expert_id = auth.uid()
    -- Add expert qualification check here if needed
  );

CREATE POLICY "Experts can update own annotations"
  ON necc_annotations FOR UPDATE
  USING (auth.uid() = expert_id)
  WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can delete own annotations"
  ON necc_annotations FOR DELETE
  USING (auth.uid() = expert_id);

-- NECC Annotation Metadata: Everyone can view
CREATE POLICY "NECC annotation metadata viewable by everyone"
  ON necc_annotation_metadata FOR SELECT
  USING (true);

-- NECC AI Predictions: Everyone can view
CREATE POLICY "NECC AI predictions viewable by everyone"
  ON necc_ai_predictions FOR SELECT
  USING (true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE necc_zones IS 'NECC production and consumption zones';
COMMENT ON TABLE necc_prices IS 'Daily NECC egg prices by zone and date';
COMMENT ON TABLE necc_scraper_logs IS 'Scraper execution logs and error tracking';
COMMENT ON TABLE necc_annotations IS 'Expert annotations on price data (Phase 2)';
COMMENT ON TABLE necc_annotation_metadata IS 'NECC-specific metadata for annotations (helpful, views)';
COMMENT ON TABLE necc_ai_predictions IS 'AI-generated price predictions (Phase 3)';

COMMENT ON FUNCTION get_previous_day_price IS 'Get previous day price for a zone (used for missing data display)';

-- =====================================================
-- END OF FILE
-- =====================================================

