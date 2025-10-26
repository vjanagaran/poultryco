-- =====================================================
-- PoultryCo Database Schema
-- File: 19_market_data_and_dashboard.sql
-- Description: Market prices, user dashboards, activity tracking
-- Version: 1.0
-- Date: 2025-10-25
-- Dependencies: 01_core_profiles.sql
-- =====================================================

-- =====================================================
-- SECTION 1: MARKET PRICES
-- =====================================================

CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product
  product_type TEXT NOT NULL CHECK (product_type IN (
    'broiler', 'layer', 'breeder', 'chicks_broiler', 'chicks_layer',
    'eggs_table', 'eggs_hatching',
    'feed_broiler_starter', 'feed_broiler_finisher', 'feed_layer',
    'feed_breeder', 'medicine', 'vaccine', 'equipment', 'other'
  )),
  product_name TEXT NOT NULL,
  product_description TEXT CHECK (char_length(product_description) <= 200),
  
  -- Location
  location_city TEXT,
  location_district TEXT,
  location_state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  market_name TEXT, -- Specific market/mandi name
  
  -- Price
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  price_min DECIMAL(10, 2) CHECK (price_min >= 0),
  price_max DECIMAL(10, 2) CHECK (price_max >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  unit TEXT NOT NULL, -- 'kg', 'bag', 'piece', 'dozen', 'liter', etc.
  
  -- Quality/Grade (for eggs, chicken)
  quality_grade TEXT,
  
  -- Data source
  source TEXT NOT NULL CHECK (source IN (
    'user_reported', 'government', 'market_aggregator', 
    'business_reported', 'api_feed', 'scraped', 'manual'
  )),
  source_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Temporal
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_time TIME,
  
  -- Metadata
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT CHECK (char_length(notes) <= 500),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_market_prices_product_type ON market_prices(product_type);
CREATE INDEX idx_market_prices_location ON market_prices(location_state, location_district, location_city);
CREATE INDEX idx_market_prices_effective_date ON market_prices(effective_date DESC);
CREATE INDEX idx_market_prices_product_location_date ON market_prices(product_type, location_state, effective_date DESC);
CREATE INDEX idx_market_prices_verified ON market_prices(verified);

-- Trigger
CREATE TRIGGER update_market_prices_updated_at
  BEFORE UPDATE ON market_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get latest price for a product in a location
CREATE OR REPLACE FUNCTION get_latest_price(
  p_product_type TEXT,
  p_location_state TEXT,
  p_location_district TEXT DEFAULT NULL
)
RETURNS TABLE (
  price DECIMAL(10, 2),
  unit TEXT,
  effective_date DATE,
  market_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.price,
    mp.unit,
    mp.effective_date,
    mp.market_name
  FROM market_prices mp
  WHERE mp.product_type = p_product_type
    AND mp.location_state = p_location_state
    AND (p_location_district IS NULL OR mp.location_district = p_location_district)
  ORDER BY mp.effective_date DESC, mp.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 2: USER DASHBOARD WIDGETS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Widget type
  widget_type TEXT NOT NULL CHECK (widget_type IN (
    'market_prices', 'fcr_calculator', 'feed_projection', 'profit_calculator',
    'mortality_tracker', 'quick_links', 'recent_posts', 'network_activity',
    'upcoming_events', 'weather', 'news_feed', 'stats_summary', 'community_growth'
  )),
  
  -- Position on dashboard
  position INTEGER NOT NULL CHECK (position >= 0),
  column_span INTEGER NOT NULL DEFAULT 1 CHECK (column_span BETWEEN 1 AND 3),
  row_span INTEGER NOT NULL DEFAULT 1 CHECK (row_span BETWEEN 1 AND 4),
  
  -- Visibility
  visible BOOLEAN NOT NULL DEFAULT true,
  
  -- Widget-specific configuration
  config JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique widget type per user (can only have one of each type)
  UNIQUE(user_id, widget_type)
);

-- Indexes
CREATE INDEX idx_dashboard_widgets_user ON user_dashboard_widgets(user_id);
CREATE INDEX idx_dashboard_widgets_position ON user_dashboard_widgets(user_id, position);
CREATE INDEX idx_dashboard_widgets_visible ON user_dashboard_widgets(visible) WHERE visible = true;

-- Trigger
CREATE TRIGGER update_user_dashboard_widgets_updated_at
  BEFORE UPDATE ON user_dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to reset dashboard to default
CREATE OR REPLACE FUNCTION reset_dashboard_to_default(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete existing widgets
  DELETE FROM user_dashboard_widgets WHERE user_id = p_user_id;
  
  -- Insert default widgets
  INSERT INTO user_dashboard_widgets (user_id, widget_type, position, column_span, row_span, config)
  VALUES
    (p_user_id, 'market_prices', 0, 2, 2, '{"products": ["broiler", "layer", "eggs_table"]}'),
    (p_user_id, 'community_growth', 1, 1, 1, '{}'),
    (p_user_id, 'fcr_calculator', 2, 1, 1, '{}'),
    (p_user_id, 'recent_posts', 3, 2, 2, '{"limit": 5}'),
    (p_user_id, 'network_activity', 4, 1, 1, '{}');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 3: USER ACTIVITY TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Activity type
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'login', 'logout', 'profile_view', 'profile_update',
    'post_created', 'post_viewed', 'post_liked', 'post_commented',
    'connection_sent', 'connection_accepted',
    'message_sent', 'message_read',
    'job_posted', 'job_applied',
    'event_registered', 'event_attended',
    'tool_used', 'search_performed',
    'other'
  )),
  
  -- Entity reference (optional)
  entity_type TEXT,
  entity_id UUID,
  
  -- Metadata (flexible JSON storage)
  metadata JSONB DEFAULT '{}',
  
  -- Session tracking
  session_id TEXT,
  
  -- Device/Location
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  browser TEXT,
  ip_address INET,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_activity_user ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX idx_user_activity_user_created ON user_activity(user_id, created_at DESC);
CREATE INDEX idx_user_activity_session ON user_activity(session_id);

-- Partitioning for performance (optional - can be added later)
-- CREATE TABLE user_activity_y2025m10 PARTITION OF user_activity
-- FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO user_activity (
    user_id, activity_type, entity_type, entity_id, metadata
  )
  VALUES (
    p_user_id, p_activity_type, p_entity_type, p_entity_id, p_metadata
  )
  RETURNING id INTO v_activity_id;
  
  -- Update profiles.last_active_at
  UPDATE profiles
  SET last_active_at = NOW()
  WHERE id = p_user_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 4: USER PREFERENCES (GENERAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Language
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr')),
  
  -- Theme
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  
  -- Email digest
  email_digest_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (email_digest_frequency IN ('daily', 'weekly', 'monthly', 'never')),
  
  -- Privacy
  show_profile_views BOOLEAN NOT NULL DEFAULT true,
  show_connection_count BOOLEAN NOT NULL DEFAULT true,
  show_last_active BOOLEAN NOT NULL DEFAULT true,
  searchable BOOLEAN NOT NULL DEFAULT true,
  
  -- Content
  default_post_visibility TEXT NOT NULL DEFAULT 'public' CHECK (default_post_visibility IN ('public', 'connections', 'private')),
  
  -- Misc
  preferences_json JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Market prices: Everyone can view
CREATE POLICY "Market prices viewable by everyone"
  ON market_prices FOR SELECT
  USING (true);

-- Market prices: Authenticated users can report prices
CREATE POLICY "Authenticated users can report prices"
  ON market_prices FOR INSERT
  WITH CHECK (auth_uid() IS NOT NULL AND reported_by = auth_uid());

-- Dashboard widgets: Users can manage their own widgets
CREATE POLICY "Users can manage own dashboard widgets"
  ON user_dashboard_widgets FOR ALL
  USING (user_id = auth_uid())
  WITH CHECK (user_id = auth_uid());

-- User activity: Users can view their own activity
CREATE POLICY "Users can view own activity"
  ON user_activity FOR SELECT
  USING (user_id = auth_uid());

-- User activity: System can create activity (via service role)
-- Users typically don't directly insert activity

-- User preferences: Users can manage their own preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (user_id = auth_uid())
  WITH CHECK (user_id = auth_uid());

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE market_prices IS 'Market prices for poultry products across locations';
COMMENT ON COLUMN market_prices.source IS 'Data source - user reported, government, aggregator, etc.';
COMMENT ON COLUMN market_prices.verified IS 'Has this price been verified by moderator/admin';

COMMENT ON TABLE user_dashboard_widgets IS 'Customizable dashboard widgets for each user';
COMMENT ON COLUMN user_dashboard_widgets.config IS 'JSON configuration specific to widget type';
COMMENT ON COLUMN user_dashboard_widgets.position IS 'Display order (0-indexed)';

COMMENT ON TABLE user_activity IS 'User activity tracking for analytics and engagement';
COMMENT ON COLUMN user_activity.metadata IS 'Flexible JSON storage for activity-specific data';

COMMENT ON TABLE user_preferences IS 'General user preferences (language, theme, privacy, etc.)';

COMMENT ON FUNCTION get_latest_price IS 'Returns the latest price for a product in a specific location';
COMMENT ON FUNCTION reset_dashboard_to_default IS 'Resets user dashboard to default widget configuration';
COMMENT ON FUNCTION log_activity IS 'Logs a user activity and updates last_active_at';

-- =====================================================
-- END OF FILE
-- =====================================================

