-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 100_nec_core.sql
-- Description: NECC egg price data system
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: NECC ZONES
-- =====================================================

CREATE TABLE IF NOT EXISTS nec_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zone Information
  name TEXT NOT NULL UNIQUE, -- 'Namakkal', 'Mumbai', 'Hyderabad', etc.
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Zone Type
  zone_type TEXT NOT NULL CHECK (zone_type IN ('production_center', 'consumption_center')),
  zone_code TEXT,
  
  -- Location
  state TEXT,
  district TEXT,
  city TEXT,
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nec_zones_name ON nec_zones(name);
CREATE INDEX idx_nec_zones_slug ON nec_zones(slug);
CREATE INDEX idx_nec_zones_type ON nec_zones(zone_type);
CREATE INDEX idx_nec_zones_active ON nec_zones(is_active) WHERE is_active = true;
CREATE INDEX idx_nec_zones_location ON nec_zones(state, district);

CREATE TRIGGER update_nec_zones_updated_at
  BEFORE UPDATE ON nec_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: NECC PRICES
-- =====================================================

CREATE TABLE IF NOT EXISTS nec_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zone
  zone_id UUID NOT NULL REFERENCES nec_zones(id) ON DELETE RESTRICT,
  
  -- Date
  date DATE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
  
  -- Prices (per 100 eggs)
  suggested_price INTEGER,
  prevailing_price INTEGER,
  
  -- Data Source
  source TEXT NOT NULL DEFAULT 'scraped' CHECK (source IN ('scraped', 'manual', 'imported')),
  scraper_mode TEXT CHECK (scraper_mode IN ('CRON', 'MANUAL')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one price per zone per date
  UNIQUE(zone_id, date)
);

CREATE INDEX idx_nec_prices_zone_date ON nec_prices(zone_id, date DESC);
CREATE INDEX idx_nec_prices_date ON nec_prices(date DESC);
CREATE INDEX idx_nec_prices_year_month ON nec_prices(year, month);
CREATE INDEX idx_nec_prices_zone_year_month ON nec_prices(zone_id, year, month);
CREATE INDEX idx_nec_prices_source ON nec_prices(source);

CREATE TRIGGER update_nec_prices_updated_at
  BEFORE UPDATE ON nec_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: MONTHLY AVERAGES (Materialized View)
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS nec_monthly_averages AS
SELECT
  zone_id,
  year,
  month,
  COUNT(*) as days_count,
  AVG(suggested_price) as avg_suggested_price,
  AVG(prevailing_price) as avg_prevailing_price,
  MIN(suggested_price) as min_suggested_price,
  MAX(suggested_price) as max_suggested_price,
  MIN(prevailing_price) as min_prevailing_price,
  MAX(prevailing_price) as max_prevailing_price,
  MIN(date) as period_start,
  MAX(date) as period_end
FROM nec_prices
GROUP BY zone_id, year, month;

CREATE UNIQUE INDEX idx_nec_monthly_averages_zone_year_month 
  ON nec_monthly_averages(zone_id, year, month);
CREATE INDEX idx_nec_monthly_averages_year_month 
  ON nec_monthly_averages(year DESC, month DESC);

-- Function to refresh monthly averages
CREATE OR REPLACE FUNCTION refresh_nec_monthly_averages()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY nec_monthly_averages;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 4: YEAR-OVER-YEAR VIEW
-- =====================================================

CREATE OR REPLACE VIEW nec_yoy_comparison AS
SELECT
  curr.zone_id,
  curr.year as current_year,
  curr.month,
  curr.avg_prevailing_price as current_price,
  prev.avg_prevailing_price as previous_year_price,
  ROUND(
    ((curr.avg_prevailing_price - prev.avg_prevailing_price) / 
     NULLIF(prev.avg_prevailing_price, 0) * 100)::numeric, 
    2
  ) as yoy_change_percent,
  curr.avg_prevailing_price - prev.avg_prevailing_price as yoy_change_absolute
FROM nec_monthly_averages curr
LEFT JOIN nec_monthly_averages prev ON
  curr.zone_id = prev.zone_id AND
  curr.month = prev.month AND
  curr.year = prev.year + 1
ORDER BY curr.zone_id, curr.year DESC, curr.month DESC;

-- =====================================================
-- SECTION 5: ANNOTATIONS (User comments on prices)
-- =====================================================

CREATE TABLE IF NOT EXISTS nec_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference
  zone_id UUID NOT NULL REFERENCES nec_zones(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Annotation
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  annotation_type TEXT CHECK (annotation_type IN ('event', 'trend', 'alert', 'insight')),
  
  -- Author
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Moderation
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Engagement
  likes_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nec_annotations_zone_date ON nec_annotations(zone_id, date DESC);
CREATE INDEX idx_nec_annotations_author ON nec_annotations(author_id);
CREATE INDEX idx_nec_annotations_approved ON nec_annotations(is_approved, created_at DESC) WHERE is_approved = true;
CREATE INDEX idx_nec_annotations_type ON nec_annotations(annotation_type);

CREATE TRIGGER update_nec_annotations_updated_at
  BEFORE UPDATE ON nec_annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 6: ANNOTATION METADATA (Tags, categories)
-- =====================================================

CREATE TABLE IF NOT EXISTS nec_annotation_metadata (
  annotation_id UUID PRIMARY KEY REFERENCES nec_annotations(id) ON DELETE CASCADE,
  
  -- Metadata
  tags TEXT[],
  related_events TEXT[],
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nec_annotation_metadata_tags ON nec_annotation_metadata USING gin(tags);

CREATE TRIGGER update_nec_annotation_metadata_updated_at
  BEFORE UPDATE ON nec_annotation_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 7: AI PREDICTIONS (Future feature)
-- =====================================================

CREATE TABLE IF NOT EXISTS nec_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference
  zone_id UUID NOT NULL REFERENCES nec_zones(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  
  -- Prediction
  predicted_price INTEGER NOT NULL,
  confidence_score DECIMAL(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Model info
  model_version TEXT,
  features_used JSONB,
  
  -- Actual (filled after prediction date)
  actual_price INTEGER,
  prediction_error INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(zone_id, prediction_date, model_version)
);

CREATE INDEX idx_nec_predictions_zone_date ON nec_predictions(zone_id, prediction_date DESC);
CREATE INDEX idx_nec_predictions_confidence ON nec_predictions(confidence_score DESC);

-- =====================================================
-- SECTION 8: SCRAPER LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS nec_scraper_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Execution info
  execution_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  
  -- Results
  zones_scraped INTEGER,
  prices_inserted INTEGER,
  prices_updated INTEGER,
  errors_count INTEGER,
  
  -- Details
  error_details JSONB,
  execution_time_ms INTEGER,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nec_scraper_logs_execution ON nec_scraper_logs(execution_id);
CREATE INDEX idx_nec_scraper_logs_status ON nec_scraper_logs(status);
CREATE INDEX idx_nec_scraper_logs_created ON nec_scraper_logs(created_at DESC);

-- =====================================================
-- SECTION 9: HELPER FUNCTIONS
-- =====================================================

-- Get latest price for a zone
CREATE OR REPLACE FUNCTION get_latest_nec_price(p_zone_id UUID)
RETURNS TABLE (
  date DATE,
  suggested_price INTEGER,
  prevailing_price INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT np.date, np.suggested_price, np.prevailing_price
  FROM nec_prices np
  WHERE np.zone_id = p_zone_id
  ORDER BY np.date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get price trend (last N days)
CREATE OR REPLACE FUNCTION get_nec_price_trend(
  p_zone_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  prevailing_price INTEGER,
  change_from_previous INTEGER,
  change_percent DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH price_data AS (
    SELECT 
      np.date,
      np.prevailing_price,
      LAG(np.prevailing_price) OVER (ORDER BY np.date) as prev_price
    FROM nec_prices np
    WHERE np.zone_id = p_zone_id
      AND np.date >= CURRENT_DATE - p_days
    ORDER BY np.date DESC
  )
  SELECT 
    pd.date,
    pd.prevailing_price,
    pd.prevailing_price - COALESCE(pd.prev_price, pd.prevailing_price) as change_from_previous,
    ROUND(
      ((pd.prevailing_price - COALESCE(pd.prev_price, pd.prevailing_price))::DECIMAL / 
       NULLIF(pd.prev_price, 0) * 100)::numeric,
      2
    ) as change_percent
  FROM price_data pd;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE nec_zones IS 'NECC price zones (production and consumption centers)';
COMMENT ON TABLE nec_prices IS 'Daily egg prices from NECC';
COMMENT ON MATERIALIZED VIEW nec_monthly_averages IS 'Pre-aggregated monthly price data';
COMMENT ON VIEW nec_yoy_comparison IS 'Year-over-year price comparison';
COMMENT ON TABLE nec_annotations IS 'User annotations on price data';
COMMENT ON TABLE nec_predictions IS 'AI-powered price predictions';
COMMENT ON TABLE nec_scraper_logs IS 'Scraper execution logs';

