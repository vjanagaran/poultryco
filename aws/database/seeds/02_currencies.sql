-- =====================================================
-- PoultryCo AWS Database Schema
-- File: seeds/02_currencies.sql
-- Description: Seed data for currencies (ISO 4217)
-- Version: 2.0
-- Date: 2025-12-01
-- =====================================================

-- =====================================================
-- SECTION 1: CURRENCIES (Top 30 for Market Rate Display)
-- =====================================================

INSERT INTO ref_currencies (code, name, name_plural, symbol, numeric_code, decimal_places, decimal_separator, thousands_separator, symbol_position, symbol_spacing, number_system, minor_unit_name, minor_unit_ratio, is_active) VALUES
-- Indian Subcontinent
('INR', 'Indian Rupee', 'Indian Rupees', '₹', '356', 2, '.', ',', 'before', true, 'indian', 'paise', 100, true),
('PKR', 'Pakistani Rupee', 'Pakistani Rupees', '₨', '586', 2, '.', ',', 'before', true, 'international', 'paisa', 100, true),
('BDT', 'Bangladeshi Taka', 'Bangladeshi Taka', '৳', '050', 2, '.', ',', 'before', true, 'international', 'poisha', 100, true),
('LKR', 'Sri Lankan Rupee', 'Sri Lankan Rupees', '₨', '144', 2, '.', ',', 'before', true, 'international', 'cents', 100, true),
('NPR', 'Nepalese Rupee', 'Nepalese Rupees', '₨', '524', 2, '.', ',', 'before', true, 'international', 'paisa', 100, true),

-- Major Global Currencies
('USD', 'US Dollar', 'US Dollars', '$', '840', 2, '.', ',', 'before', false, 'international', 'cents', 100, true),
('EUR', 'Euro', 'Euros', '€', '978', 2, ',', '.', 'before', true, 'international', 'cents', 100, true),
('GBP', 'British Pound', 'British Pounds', '£', '826', 2, '.', ',', 'before', false, 'international', 'pence', 100, true),
('JPY', 'Japanese Yen', 'Japanese Yen', '¥', '392', 0, '.', ',', 'before', false, 'international', NULL, 1, true),
('CNY', 'Chinese Yuan', 'Chinese Yuan', '¥', '156', 2, '.', ',', 'before', false, 'international', 'fen', 100, true),

-- Middle East
('AED', 'UAE Dirham', 'UAE Dirhams', 'د.إ', '784', 2, '.', ',', 'before', true, 'international', 'fils', 100, true),
('SAR', 'Saudi Riyal', 'Saudi Riyals', '﷼', '682', 2, '.', ',', 'before', true, 'international', 'halalas', 100, true),
('QAR', 'Qatari Riyal', 'Qatari Riyals', '﷼', '634', 2, '.', ',', 'before', true, 'international', 'dirhams', 100, true),
('KWD', 'Kuwaiti Dinar', 'Kuwaiti Dinars', 'د.ك', '414', 3, '.', ',', 'before', true, 'international', 'fils', 1000, true),

-- Southeast Asia
('SGD', 'Singapore Dollar', 'Singapore Dollars', 'S$', '702', 2, '.', ',', 'before', false, 'international', 'cents', 100, true),
('MYR', 'Malaysian Ringgit', 'Malaysian Ringgit', 'RM', '458', 2, '.', ',', 'before', false, 'international', 'sen', 100, true),
('THB', 'Thai Baht', 'Thai Baht', '฿', '764', 2, '.', ',', 'before', false, 'international', 'satang', 100, true),
('IDR', 'Indonesian Rupiah', 'Indonesian Rupiah', 'Rp', '360', 2, ',', '.', 'before', false, 'international', 'sen', 100, true),
('PHP', 'Philippine Peso', 'Philippine Pesos', '₱', '608', 2, '.', ',', 'before', false, 'international', 'centavos', 100, true),
('VND', 'Vietnamese Dong', 'Vietnamese Dong', '₫', '704', 0, ',', '.', 'after', true, 'international', NULL, 1, true),

-- Other Major
('AUD', 'Australian Dollar', 'Australian Dollars', 'A$', '036', 2, '.', ',', 'before', false, 'international', 'cents', 100, true),
('CAD', 'Canadian Dollar', 'Canadian Dollars', 'C$', '124', 2, '.', ',', 'before', false, 'international', 'cents', 100, true),
('CHF', 'Swiss Franc', 'Swiss Francs', 'Fr', '756', 2, '.', "'", 'before', true, 'international', 'centimes', 100, true),
('NZD', 'New Zealand Dollar', 'New Zealand Dollars', 'NZ$', '554', 2, '.', ',', 'before', false, 'international', 'cents', 100, true),
('ZAR', 'South African Rand', 'South African Rand', 'R', '710', 2, '.', ' ', 'before', false, 'international', 'cents', 100, true),
('BRL', 'Brazilian Real', 'Brazilian Reais', 'R$', '986', 2, ',', '.', 'before', false, 'international', 'centavos', 100, true),
('MXN', 'Mexican Peso', 'Mexican Pesos', '$', '484', 2, '.', ',', 'before', false, 'international', 'centavos', 100, true),
('RUB', 'Russian Ruble', 'Russian Rubles', '₽', '643', 2, ',', ' ', 'after', true, 'international', 'kopecks', 100, true),
('KRW', 'South Korean Won', 'South Korean Won', '₩', '410', 0, '.', ',', 'before', false, 'international', NULL, 1, true),
('TRY', 'Turkish Lira', 'Turkish Lira', '₺', '949', 2, ',', '.', 'before', false, 'international', 'kuruş', 100, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SECTION 2: COUNTRY-CURRENCY RELATIONSHIPS
-- =====================================================

-- India
INSERT INTO ref_country_currencies (country_id, currency_id, is_default, is_primary, is_active)
SELECT 
  c.id,
  curr.id,
  true,
  true,
  true
FROM ref_countries c
CROSS JOIN ref_currencies curr
WHERE c.code = 'IN' AND curr.code = 'INR'
ON CONFLICT (country_id, currency_id) DO NOTHING;

-- United States
INSERT INTO ref_country_currencies (country_id, currency_id, is_default, is_primary, is_active)
SELECT 
  c.id,
  curr.id,
  true,
  true,
  true
FROM ref_countries c
CROSS JOIN ref_currencies curr
WHERE c.code = 'US' AND curr.code = 'USD'
ON CONFLICT (country_id, currency_id) DO NOTHING;

-- United Kingdom
INSERT INTO ref_country_currencies (country_id, currency_id, is_default, is_primary, is_active)
SELECT 
  c.id,
  curr.id,
  true,
  true,
  true
FROM ref_countries c
CROSS JOIN ref_currencies curr
WHERE c.code = 'GB' AND curr.code = 'GBP'
ON CONFLICT (country_id, currency_id) DO NOTHING;

-- Add more country-currency mappings as needed
-- For now, we'll add a few key ones. You can expand this based on your market focus.

-- Pakistan
INSERT INTO ref_country_currencies (country_id, currency_id, is_default, is_primary, is_active)
SELECT 
  c.id,
  curr.id,
  true,
  true,
  true
FROM ref_countries c
CROSS JOIN ref_currencies curr
WHERE c.code = 'PK' AND curr.code = 'PKR'
ON CONFLICT (country_id, currency_id) DO NOTHING;

-- Bangladesh
INSERT INTO ref_country_currencies (country_id, currency_id, is_default, is_primary, is_active)
SELECT 
  c.id,
  curr.id,
  true,
  true,
  true
FROM ref_countries c
CROSS JOIN ref_currencies curr
WHERE c.code = 'BD' AND curr.code = 'BDT'
ON CONFLICT (country_id, currency_id) DO NOTHING;

-- Sri Lanka
INSERT INTO ref_country_currencies (country_id, currency_id, is_default, is_primary, is_active)
SELECT 
  c.id,
  curr.id,
  true,
  true,
  true
FROM ref_countries c
CROSS JOIN ref_currencies curr
WHERE c.code = 'LK' AND curr.code = 'LKR'
ON CONFLICT (country_id, currency_id) DO NOTHING;

-- Nepal
INSERT INTO ref_country_currencies (country_id, currency_id, is_default, is_primary, is_active)
SELECT 
  c.id,
  curr.id,
  true,
  true,
  true
FROM ref_countries c
CROSS JOIN ref_currencies curr
WHERE c.code = 'NP' AND curr.code = 'NPR'
ON CONFLICT (country_id, currency_id) DO NOTHING;

-- =====================================================
-- Notes
-- =====================================================

-- This seed file includes:
-- 1. Top 30 currencies for market rate display
-- 2. Country-currency relationships for key countries
-- 3. Proper formatting rules (Indian vs International numbering)
-- 4. Symbol positioning and spacing
-- 
-- To add more currencies or country mappings, follow the same pattern.
-- For countries with multiple currencies, add multiple rows with different is_primary flags.

