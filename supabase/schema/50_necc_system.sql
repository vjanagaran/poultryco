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

-- =====================================================
-- MATERIALIZED VIEW: MONTHLY AVERAGES
-- Purpose: Pre-aggregated monthly data for fast "All Time" queries
-- Performance: 10x faster (500ms -> 50ms)
-- Maintenance: Refresh daily via cron/edge function
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS necc_monthly_averages AS
SELECT 
    zone_id,
    DATE_TRUNC('month', date)::DATE as month,
    EXTRACT(YEAR FROM DATE_TRUNC('month', date))::INTEGER as year,
    EXTRACT(MONTH FROM DATE_TRUNC('month', date))::INTEGER as month_number,
    ROUND(AVG(suggested_price))::INTEGER as avg_price,
    MIN(suggested_price) as min_price,
    MAX(suggested_price) as max_price,
    COUNT(*) as data_points,
    MIN(date) as first_date,
    MAX(date) as last_date
FROM necc_prices
WHERE suggested_price IS NOT NULL
GROUP BY zone_id, DATE_TRUNC('month', date)
ORDER BY zone_id, month DESC;

-- Indexes for necc_monthly_averages
CREATE INDEX IF NOT EXISTS idx_monthly_avg_zone_month 
    ON necc_monthly_averages(zone_id, month DESC);

CREATE INDEX IF NOT EXISTS idx_monthly_avg_month 
    ON necc_monthly_averages(month DESC);

CREATE INDEX IF NOT EXISTS idx_monthly_avg_year 
    ON necc_monthly_averages(year DESC);

-- Function to refresh monthly averages materialized view
-- Call this daily via cron/edge function
CREATE OR REPLACE FUNCTION refresh_necc_monthly_averages()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW necc_monthly_averages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON MATERIALIZED VIEW necc_monthly_averages IS 'Pre-aggregated monthly price data for fast queries (refresh daily)';
COMMENT ON FUNCTION refresh_necc_monthly_averages IS 'Refresh monthly averages materialized view (schedule daily at 00:30 UTC)';

-- =====================================================
-- SECTION 3: YEAR-OVER-YEAR ANALYSIS VIEW
-- =====================================================
-- Note: Full implementation in migration 20250122_create_yoy_view.sql
-- This is reference documentation only

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

-- Note: Materialized views don't support RLS, but they inherit from source table
-- necc_monthly_averages is read-only and aggregates public necc_prices data

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
-- MATERIALIZED VIEW: Daily Averages by Day-of-Year
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS necc_yoy_daily_averages AS
WITH aggregated_data AS (
    SELECT 
        zone_id,
        EXTRACT(DOY FROM date)::INTEGER as day_of_year,
        EXTRACT(YEAR FROM date)::INTEGER as year,
        suggested_price,
        date
    FROM necc_prices
    WHERE suggested_price IS NOT NULL
)
SELECT 
    zone_id,
    day_of_year,
    year,
    AVG(suggested_price)::INTEGER as avg_price,
    MIN(suggested_price) as min_price,
    MAX(suggested_price) as max_price,
    COUNT(*) as data_points,
    ARRAY_AGG(DISTINCT date ORDER BY date) as dates
FROM aggregated_data
GROUP BY zone_id, day_of_year, year
ORDER BY zone_id, day_of_year, year;

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_yoy_daily_zone_doy 
    ON necc_yoy_daily_averages(zone_id, day_of_year);

CREATE INDEX IF NOT EXISTS idx_yoy_daily_zone_year 
    ON necc_yoy_daily_averages(zone_id, year);

CREATE INDEX IF NOT EXISTS idx_yoy_daily_year 
    ON necc_yoy_daily_averages(year DESC);

-- =====================================================
-- FUNCTION: Get YoY data for a specific zone
-- Returns pivoted data ready for charting
-- =====================================================

CREATE OR REPLACE FUNCTION get_zone_yoy_data(
    p_zone_id UUID,
    p_min_years INTEGER DEFAULT 2
)
RETURNS TABLE (
    day_of_year INTEGER,
    day_label TEXT,
    year_data JSONB,
    years_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH year_data AS (
        SELECT 
            day_of_year,
            year,
            avg_price
        FROM necc_yoy_daily_averages
        WHERE zone_id = p_zone_id
    ),
    aggregated AS (
        SELECT 
            yd.day_of_year,
            JSONB_OBJECT_AGG(yd.year::TEXT, yd.avg_price) as year_data,
            COUNT(DISTINCT yd.year) as years_count,
            -- Generate day label (e.g., "Jan 1", "Feb 15")
            TO_CHAR(
                DATE '2024-01-01' + (yd.day_of_year - 1) * INTERVAL '1 day',
                'Mon DD'
            ) as day_label
        FROM year_data yd
        GROUP BY yd.day_of_year
        HAVING COUNT(DISTINCT yd.year) >= p_min_years
    )
    SELECT 
        a.day_of_year,
        a.day_label,
        a.year_data,
        a.years_count
    FROM aggregated a
    ORDER BY a.day_of_year;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- FUNCTION: Get YoY statistics for a zone
-- Returns insights like highest/lowest days, etc.
-- =====================================================

CREATE OR REPLACE FUNCTION get_zone_yoy_stats(p_zone_id UUID)
RETURNS TABLE (
    stat_name TEXT,
    stat_value JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH highest_day AS (
        -- Highest price day across all years
        SELECT 
            'highest_price_day'::TEXT as stat_name,
            jsonb_build_object(
                'day_of_year', day_of_year,
                'day_label', TO_CHAR(DATE '2024-01-01' + (day_of_year - 1) * INTERVAL '1 day', 'Mon DD'),
                'year', year,
                'price', max_price
            ) as stat_value
        FROM necc_yoy_daily_averages
        WHERE zone_id = p_zone_id
        ORDER BY max_price DESC NULLS LAST
        LIMIT 1
    ),
    lowest_day AS (
        -- Lowest price day across all years
        SELECT 
            'lowest_price_day'::TEXT as stat_name,
            jsonb_build_object(
                'day_of_year', day_of_year,
                'day_label', TO_CHAR(DATE '2024-01-01' + (day_of_year - 1) * INTERVAL '1 day', 'Mon DD'),
                'year', year,
                'price', min_price
            ) as stat_value
        FROM necc_yoy_daily_averages
        WHERE zone_id = p_zone_id
        ORDER BY min_price ASC NULLS LAST
        LIMIT 1
    ),
    yearly_averages AS (
        -- Average price by year
        SELECT 
            'avg_by_year'::TEXT as stat_name,
            jsonb_object_agg(year::TEXT, avg_price::INTEGER) as stat_value
        FROM (
            SELECT 
                year,
                AVG(avg_price)::INTEGER as avg_price
            FROM necc_yoy_daily_averages
            WHERE zone_id = p_zone_id
            GROUP BY year
            ORDER BY year
        ) yearly_avgs
    ),
    available_years AS (
        -- Available years
        SELECT 
            'years'::TEXT as stat_name,
            jsonb_agg(DISTINCT year ORDER BY year) as stat_value
        FROM necc_yoy_daily_averages
        WHERE zone_id = p_zone_id
    )
    SELECT * FROM highest_day
    UNION ALL
    SELECT * FROM lowest_day
    UNION ALL
    SELECT * FROM yearly_averages
    UNION ALL
    SELECT * FROM available_years;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- FUNCTION: Refresh YoY materialized view
-- Call this daily after price scraper runs
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_necc_yoy_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW necc_yoy_daily_averages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON MATERIALIZED VIEW necc_yoy_daily_averages IS 'Pre-aggregated YoY data for fast year-over-year analysis';
COMMENT ON FUNCTION get_zone_yoy_data IS 'Get YoY comparison data for a zone (optimized for charting)';
COMMENT ON FUNCTION get_zone_yoy_stats IS 'Get YoY statistics and insights for a zone';
COMMENT ON FUNCTION refresh_necc_yoy_view IS 'Refresh YoY materialized view (schedule daily at 00:35 UTC)';


-- =====================================================
-- MAINTENANCE NOTES
-- =====================================================
-- 
-- DAILY MAINTENANCE:
-- 1. Refresh materialized view: SELECT refresh_necc_monthly_averages();
--    Schedule: Daily at 00:30 UTC via Supabase Edge Function or pg_cron
--
-- PERFORMANCE METRICS:
-- - necc_prices: ~273,750 rows (50 zones × 365 days × 15 years)
-- - necc_monthly_averages: ~9,000 rows (50 zones × 12 months × 15 years)
-- - Query improvement: 500ms -> 50ms (10x faster for "All Time" queries)
--
-- STORAGE OVERHEAD:
-- - necc_monthly_averages: ~5 MB (97% reduction vs daily data)
--

-- =====================================================
-- END OF FILE
-- =====================================================

