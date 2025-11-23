-- =====================================================
-- Fix NECC RLS Policies
-- Description: Add INSERT, UPDATE, DELETE policies for necc_zones and necc_prices
-- Date: 2025-01-23
-- =====================================================

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Service role can insert zones" ON necc_zones;
DROP POLICY IF EXISTS "Service role can update zones" ON necc_zones;
DROP POLICY IF EXISTS "Service role can delete zones" ON necc_zones;
DROP POLICY IF EXISTS "Service role can insert prices" ON necc_prices;
DROP POLICY IF EXISTS "Service role can update prices" ON necc_prices;
DROP POLICY IF EXISTS "Service role can delete prices" ON necc_prices;

-- NECC Zones: Service role can insert (for scraper/admin)
CREATE POLICY "Service role can insert zones"
  ON necc_zones FOR INSERT
  WITH CHECK (true);

-- NECC Zones: Service role can update
CREATE POLICY "Service role can update zones"
  ON necc_zones FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- NECC Zones: Service role can delete
CREATE POLICY "Service role can delete zones"
  ON necc_zones FOR DELETE
  USING (true);

-- NECC Prices: Service role can insert (for scraper/admin)
CREATE POLICY "Service role can insert prices"
  ON necc_prices FOR INSERT
  WITH CHECK (true);

-- NECC Prices: Service role can update
CREATE POLICY "Service role can update prices"
  ON necc_prices FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- NECC Prices: Service role can delete
CREATE POLICY "Service role can delete prices"
  ON necc_prices FOR DELETE
  USING (true);

