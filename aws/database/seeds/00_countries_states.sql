-- =====================================================
-- PoultryCo AWS Database Schema
-- File: seeds/00_countries_states.sql
-- Description: Comprehensive seed data for countries and states/provinces
-- Version: 2.0
-- Date: 2025-12-01
-- =====================================================

-- =====================================================
-- SECTION 1: COUNTRIES (Comprehensive List)
-- =====================================================

INSERT INTO ref_countries (name, code, iso3, iso_numeric, flag_emoji, phone_code, phone_format, subdivision_label, is_favourite, is_default, is_active) VALUES
-- South Asia (Focus Region)
('India', 'IN', 'IND', '356', '🇮🇳', '+91', '+91-XXXXXXXXXX', 'State', true, true, true),
('Pakistan', 'PK', 'PAK', '586', '🇵🇰', '+92', '+92-XXX-XXXXXXX', 'Province', true, false, true),
('Bangladesh', 'BD', 'BGD', '050', '🇧🇩', '+880', '+880-XXXX-XXXXXX', 'Division', true, false, true),
('Sri Lanka', 'LK', 'LKA', '144', '🇱🇰', '+94', '+94-XX-XXXXXXX', 'Province', true, false, true),
('Nepal', 'NP', 'NPL', '524', '🇳🇵', '+977', '+977-XX-XXXXXXX', 'Province', true, false, true),
('Bhutan', 'BT', 'BTN', '064', '🇧🇹', '+975', '+975-X-XXXXXX', 'District', false, false, true),
('Maldives', 'MV', 'MDV', '462', '🇲🇻', '+960', '+960-XXX-XXXX', 'Atoll', false, false, true),
('Afghanistan', 'AF', 'AFG', '004', '🇦🇫', '+93', '+93-XX-XXX-XXXX', 'Province', false, false, true),

-- Southeast Asia
('Thailand', 'TH', 'THA', '764', '🇹🇭', '+66', '+66-X-XXXX-XXXX', 'Province', false, false, true),
('Vietnam', 'VN', 'VNM', '704', '🇻🇳', '+84', '+84-XX-XXXX-XXXX', 'Province', false, false, true),
('Indonesia', 'ID', 'IDN', '360', '🇮🇩', '+62', '+62-XXX-XXXX-XXXX', 'Province', false, false, true),
('Malaysia', 'MY', 'MYS', '458', '🇲🇾', '+60', '+60-X-XXXX-XXXX', 'State', false, false, true),
('Philippines', 'PH', 'PHL', '608', '🇵🇭', '+63', '+63-XXX-XXX-XXXX', 'Province', false, false, true),
('Singapore', 'SG', 'SGP', '702', '🇸🇬', '+65', '+65-XXXX-XXXX', NULL, false, false, true),
('Myanmar', 'MM', 'MMR', '104', '🇲🇲', '+95', '+95-X-XXXX-XXXX', 'State', false, false, true),
('Cambodia', 'KH', 'KHM', '116', '🇰🇭', '+855', '+855-XX-XXX-XXXX', 'Province', false, false, true),
('Laos', 'LA', 'LAO', '418', '🇱🇦', '+856', '+856-XX-XX-XXXXX', 'Province', false, false, true),
('Brunei', 'BN', 'BRN', '096', '🇧🇳', '+673', '+673-XXXX-XXXX', 'District', false, false, true),
('East Timor', 'TL', 'TLS', '626', '🇹🇱', '+670', '+670-XXXX-XXXX', 'District', false, false, true),

-- East Asia
('China', 'CN', 'CHN', '156', '🇨🇳', '+86', '+86-XXX-XXXX-XXXX', 'Province', false, false, true),
('Japan', 'JP', 'JPN', '392', '🇯🇵', '+81', '+81-XX-XXXX-XXXX', 'Prefecture', false, false, true),
('South Korea', 'KR', 'KOR', '410', '🇰🇷', '+82', '+82-XX-XXXX-XXXX', 'Province', false, false, true),
('North Korea', 'KP', 'PRK', '408', '🇰🇵', '+850', '+850-XXX-XXXX', 'Province', false, false, false),
('Taiwan', 'TW', 'TWN', '158', '🇹🇼', '+886', '+886-X-XXXX-XXXX', 'County', false, false, true),
('Hong Kong', 'HK', 'HKG', '344', '🇭🇰', '+852', '+852-XXXX-XXXX', NULL, false, false, true),
('Macau', 'MO', 'MAC', '446', '🇲🇴', '+853', '+853-XXXX-XXXX', NULL, false, false, true),
('Mongolia', 'MN', 'MNG', '496', '🇲🇳', '+976', '+976-XXXX-XXXX', 'Province', false, false, true),

-- Middle East
('Saudi Arabia', 'SA', 'SAU', '682', '🇸🇦', '+966', '+966-X-XXX-XXXX', 'Province', false, false, true),
('United Arab Emirates', 'AE', 'ARE', '784', '🇦🇪', '+971', '+971-X-XXX-XXXX', 'Emirate', false, false, true),
('Qatar', 'QA', 'QAT', '634', '🇶🇦', '+974', '+974-XXXX-XXXX', 'Municipality', false, false, true),
('Kuwait', 'KW', 'KWT', '414', '🇰🇼', '+965', '+965-XXXX-XXXX', 'Governorate', false, false, true),
('Oman', 'OM', 'OMN', '512', '🇴🇲', '+968', '+968-XXXX-XXXX', 'Governorate', false, false, true),
('Bahrain', 'BH', 'BHR', '048', '🇧🇭', '+973', '+973-XXXX-XXXX', 'Governorate', false, false, true),
('Iraq', 'IQ', 'IRQ', '368', '🇮🇶', '+964', '+964-XXX-XXX-XXXX', 'Governorate', false, false, true),
('Iran', 'IR', 'IRN', '364', '🇮🇷', '+98', '+98-XXX-XXX-XXXX', 'Province', false, false, true),
('Israel', 'IL', 'ISR', '376', '🇮🇱', '+972', '+972-X-XXX-XXXX', 'District', false, false, true),
('Jordan', 'JO', 'JOR', '400', '🇯🇴', '+962', '+962-X-XXXX-XXXX', 'Governorate', false, false, true),
('Lebanon', 'LB', 'LBN', '422', '🇱🇧', '+961', '+961-X-XXX-XXX', 'Governorate', false, false, true),
('Syria', 'SY', 'SYR', '760', '🇸🇾', '+963', '+963-XXX-XXXX-XXX', 'Governorate', false, false, false),
('Yemen', 'YE', 'YEM', '887', '🇾🇪', '+967', '+967-X-XXX-XXX', 'Governorate', false, false, true),
('Palestine', 'PS', 'PSE', '275', '🇵🇸', '+970', '+970-X-XXX-XXXX', 'Governorate', false, false, true),

-- Europe
('United Kingdom', 'GB', 'GBR', '826', '🇬🇧', '+44', '+44-XXXX-XXXXXX', 'County', false, false, true),
('Germany', 'DE', 'DEU', '276', '🇩🇪', '+49', '+49-XXX-XXXXXXX', 'State', false, false, true),
('France', 'FR', 'FRA', '250', '🇫🇷', '+33', '+33-X-XX-XX-XX-XX', 'Region', false, false, true),
('Italy', 'IT', 'ITA', '380', '🇮🇹', '+39', '+39-XXX-XXXXXXX', 'Region', false, false, true),
('Spain', 'ES', 'ESP', '724', '🇪🇸', '+34', '+34-XXX-XXX-XXX', 'Autonomous Community', false, false, true),
('Netherlands', 'NL', 'NLD', '528', '🇳🇱', '+31', '+31-XX-XXXX-XXXX', 'Province', false, false, true),
('Belgium', 'BE', 'BEL', '056', '🇧🇪', '+32', '+32-XXX-XX-XX-XX', 'Region', false, false, true),
('Switzerland', 'CH', 'CHE', '756', '🇨🇭', '+41', '+41-XX-XXX-XX-XX', 'Canton', false, false, true),
('Austria', 'AT', 'AUT', '040', '🇦🇹', '+43', '+43-XXX-XXXXXXX', 'State', false, false, true),
('Sweden', 'SE', 'SWE', '752', '🇸🇪', '+46', '+46-XX-XXX-XXXX', 'County', false, false, true),
('Norway', 'NO', 'NOR', '578', '🇳🇴', '+47', '+47-XXX-XX-XXX', 'County', false, false, true),
('Denmark', 'DK', 'DNK', '208', '🇩🇰', '+45', '+45-XX-XX-XX-XX', 'Region', false, false, true),
('Finland', 'FI', 'FIN', '246', '🇫🇮', '+358', '+358-XX-XXX-XXXX', 'Region', false, false, true),
('Poland', 'PL', 'POL', '616', '🇵🇱', '+48', '+48-XXX-XXX-XXX', 'Voivodeship', false, false, true),
('Russia', 'RU', 'RUS', '643', '🇷🇺', '+7', '+7-XXX-XXX-XXXX', 'Oblast', false, false, true),
('Turkey', 'TR', 'TUR', '792', '🇹🇷', '+90', '+90-XXX-XXX-XXXX', 'Province', false, false, true),
('Greece', 'GR', 'GRC', '300', '🇬🇷', '+30', '+30-XXX-XXX-XXXX', 'Region', false, false, true),
('Portugal', 'PT', 'PRT', '620', '🇵🇹', '+351', '+351-XXX-XXX-XXX', 'District', false, false, true),
('Ireland', 'IE', 'IRL', '372', '🇮🇪', '+353', '+353-XX-XXX-XXXX', 'County', false, false, true),

-- Americas
('United States', 'US', 'USA', '840', '🇺🇸', '+1', '+1-XXX-XXX-XXXX', 'State', false, false, true),
('Canada', 'CA', 'CAN', '124', '🇨🇦', '+1', '+1-XXX-XXX-XXXX', 'Province', false, false, true),
('Mexico', 'MX', 'MEX', '484', '🇲🇽', '+52', '+52-XXX-XXX-XXXX', 'State', false, false, true),
('Brazil', 'BR', 'BRA', '986', '🇧🇷', '+55', '+55-XX-XXXXX-XXXX', 'State', false, false, true),
('Argentina', 'AR', 'ARG', '032', '🇦🇷', '+54', '+54-XXX-XXXX-XXXX', 'Province', false, false, true),
('Chile', 'CL', 'CHL', '152', '🇨🇱', '+56', '+56-X-XXXX-XXXX', 'Region', false, false, true),
('Colombia', 'CO', 'COL', '170', '🇨🇴', '+57', '+57-XXX-XXX-XXXX', 'Department', false, false, true),
('Peru', 'PE', 'PER', '604', '🇵🇪', '+51', '+51-XXX-XXX-XXX', 'Region', false, false, true),
('Venezuela', 'VE', 'VEN', '862', '🇻🇪', '+58', '+58-XXX-XXX-XXXX', 'State', false, false, true),

-- Africa
('South Africa', 'ZA', 'ZAF', '710', '🇿🇦', '+27', '+27-XX-XXX-XXXX', 'Province', false, false, true),
('Egypt', 'EG', 'EGY', '818', '🇪🇬', '+20', '+20-XXX-XXXX-XXX', 'Governorate', false, false, true),
('Nigeria', 'NG', 'NGA', '566', '🇳🇬', '+234', '+234-XXX-XXX-XXXX', 'State', false, false, true),
('Kenya', 'KE', 'KEN', '404', '🇰🇪', '+254', '+254-XXX-XXXXXX', 'County', false, false, true),
('Ghana', 'GH', 'GHA', '288', '🇬🇭', '+233', '+233-XXX-XXX-XXXX', 'Region', false, false, true),
('Morocco', 'MA', 'MAR', '504', '🇲🇦', '+212', '+212-XXXX-XXXXXX', 'Region', false, false, true),
('Tanzania', 'TZ', 'TZA', '834', '🇹🇿', '+255', '+255-XXX-XXX-XXX', 'Region', false, false, true),
('Ethiopia', 'ET', 'ETH', '231', '🇪🇹', '+251', '+251-XX-XXX-XXXX', 'Region', false, false, true),
('Uganda', 'UG', 'UGA', '800', '🇺🇬', '+256', '+256-XXX-XXXXXX', 'Region', false, false, true),

-- Oceania
('Australia', 'AU', 'AUS', '036', '🇦🇺', '+61', '+61-X-XXXX-XXXX', 'State', false, false, true),
('New Zealand', 'NZ', 'NZL', '554', '🇳🇿', '+64', '+64-XX-XXX-XXXX', 'Region', false, false, true),
('Fiji', 'FJ', 'FJI', '242', '🇫🇯', '+679', '+679-XXXX-XXXX', 'Division', false, false, true),
('Papua New Guinea', 'PG', 'PNG', '598', '🇵🇬', '+675', '+675-XXX-XXXX', 'Province', false, false, true)
ON CONFLICT (code) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  iso_numeric = EXCLUDED.iso_numeric,
  flag_emoji = EXCLUDED.flag_emoji,
  phone_code = EXCLUDED.phone_code,
  phone_format = EXCLUDED.phone_format,
  subdivision_label = EXCLUDED.subdivision_label,
  updated_at = NOW();

-- =====================================================
-- SECTION 2: STATES/PROVINCES - INDIA
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, state_data.name, state_data.code, state_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Andhra Pradesh', 'AP', true),
  ('Arunachal Pradesh', 'AR', true),
  ('Assam', 'AS', true),
  ('Bihar', 'BR', true),
  ('Chhattisgarh', 'CG', true),
  ('Goa', 'GA', true),
  ('Gujarat', 'GJ', true),
  ('Haryana', 'HR', true),
  ('Himachal Pradesh', 'HP', true),
  ('Jharkhand', 'JH', true),
  ('Karnataka', 'KA', true),
  ('Kerala', 'KL', true),
  ('Madhya Pradesh', 'MP', true),
  ('Maharashtra', 'MH', true),
  ('Manipur', 'MN', true),
  ('Meghalaya', 'ML', true),
  ('Mizoram', 'MZ', true),
  ('Nagaland', 'NL', true),
  ('Odisha', 'OR', true),
  ('Punjab', 'PB', true),
  ('Rajasthan', 'RJ', true),
  ('Sikkim', 'SK', true),
  ('Tamil Nadu', 'TN', true),
  ('Telangana', 'TG', true),
  ('Tripura', 'TR', true),
  ('Uttar Pradesh', 'UP', true),
  ('Uttarakhand', 'UK', true),
  ('West Bengal', 'WB', true),
  ('Andaman and Nicobar Islands', 'AN', true),
  ('Chandigarh', 'CH', true),
  ('Dadra and Nagar Haveli and Daman and Diu', 'DH', true),
  ('Delhi', 'DL', true),
  ('Jammu and Kashmir', 'JK', true),
  ('Ladakh', 'LA', true),
  ('Lakshadweep', 'LD', true),
  ('Puducherry', 'PY', true)
) AS state_data(name, code, is_active)
WHERE c.code = 'IN'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 3: PROVINCES - PAKISTAN
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, province_data.name, province_data.code, province_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Punjab', 'PB', true),
  ('Sindh', 'SD', true),
  ('Khyber Pakhtunkhwa', 'KP', true),
  ('Balochistan', 'BA', true),
  ('Gilgit-Baltistan', 'GB', true),
  ('Azad Jammu and Kashmir', 'AJK', true),
  ('Islamabad Capital Territory', 'ICT', true)
) AS province_data(name, code, is_active)
WHERE c.code = 'PK'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 4: DIVISIONS - BANGLADESH
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, division_data.name, division_data.code, division_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Dhaka', 'DH', true),
  ('Chittagong', 'CT', true),
  ('Rajshahi', 'RJ', true),
  ('Khulna', 'KH', true),
  ('Barisal', 'BR', true),
  ('Sylhet', 'SY', true),
  ('Rangpur', 'RP', true),
  ('Mymensingh', 'MY', true)
) AS division_data(name, code, is_active)
WHERE c.code = 'BD'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 5: PROVINCES - SRI LANKA
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, province_data.name, province_data.code, province_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Western Province', 'WP', true),
  ('Central Province', 'CP', true),
  ('Southern Province', 'SP', true),
  ('Northern Province', 'NP', true),
  ('Eastern Province', 'EP', true),
  ('North Western Province', 'NWP', true),
  ('North Central Province', 'NCP', true),
  ('Uva Province', 'UP', true),
  ('Sabaragamuwa Province', 'SBP', true)
) AS province_data(name, code, is_active)
WHERE c.code = 'LK'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 6: PROVINCES - NEPAL
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, province_data.name, province_data.code, province_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Koshi', 'KO', true),
  ('Madhesh', 'MA', true),
  ('Bagmati', 'BA', true),
  ('Gandaki', 'GA', true),
  ('Lumbini', 'LU', true),
  ('Karnali', 'KA', true),
  ('Sudurpashchim', 'SU', true)
) AS province_data(name, code, is_active)
WHERE c.code = 'NP'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 7: STATES - UNITED STATES
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, state_data.name, state_data.code, state_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Alabama', 'AL', true),
  ('Alaska', 'AK', true),
  ('Arizona', 'AZ', true),
  ('Arkansas', 'AR', true),
  ('California', 'CA', true),
  ('Colorado', 'CO', true),
  ('Connecticut', 'CT', true),
  ('Delaware', 'DE', true),
  ('Florida', 'FL', true),
  ('Georgia', 'GA', true),
  ('Hawaii', 'HI', true),
  ('Idaho', 'ID', true),
  ('Illinois', 'IL', true),
  ('Indiana', 'IN', true),
  ('Iowa', 'IA', true),
  ('Kansas', 'KS', true),
  ('Kentucky', 'KY', true),
  ('Louisiana', 'LA', true),
  ('Maine', 'ME', true),
  ('Maryland', 'MD', true),
  ('Massachusetts', 'MA', true),
  ('Michigan', 'MI', true),
  ('Minnesota', 'MN', true),
  ('Mississippi', 'MS', true),
  ('Missouri', 'MO', true),
  ('Montana', 'MT', true),
  ('Nebraska', 'NE', true),
  ('Nevada', 'NV', true),
  ('New Hampshire', 'NH', true),
  ('New Jersey', 'NJ', true),
  ('New Mexico', 'NM', true),
  ('New York', 'NY', true),
  ('North Carolina', 'NC', true),
  ('North Dakota', 'ND', true),
  ('Ohio', 'OH', true),
  ('Oklahoma', 'OK', true),
  ('Oregon', 'OR', true),
  ('Pennsylvania', 'PA', true),
  ('Rhode Island', 'RI', true),
  ('South Carolina', 'SC', true),
  ('South Dakota', 'SD', true),
  ('Tennessee', 'TN', true),
  ('Texas', 'TX', true),
  ('Utah', 'UT', true),
  ('Vermont', 'VT', true),
  ('Virginia', 'VA', true),
  ('Washington', 'WA', true),
  ('West Virginia', 'WV', true),
  ('Wisconsin', 'WI', true),
  ('Wyoming', 'WY', true),
  ('District of Columbia', 'DC', true)
) AS state_data(name, code, is_active)
WHERE c.code = 'US'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 8: PROVINCES - CANADA
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, province_data.name, province_data.code, province_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Alberta', 'AB', true),
  ('British Columbia', 'BC', true),
  ('Manitoba', 'MB', true),
  ('New Brunswick', 'NB', true),
  ('Newfoundland and Labrador', 'NL', true),
  ('Northwest Territories', 'NT', true),
  ('Nova Scotia', 'NS', true),
  ('Nunavut', 'NU', true),
  ('Ontario', 'ON', true),
  ('Prince Edward Island', 'PE', true),
  ('Quebec', 'QC', true),
  ('Saskatchewan', 'SK', true),
  ('Yukon', 'YT', true)
) AS province_data(name, code, is_active)
WHERE c.code = 'CA'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 9: STATES - AUSTRALIA
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, state_data.name, state_data.code, state_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('New South Wales', 'NSW', true),
  ('Victoria', 'VIC', true),
  ('Queensland', 'QLD', true),
  ('Western Australia', 'WA', true),
  ('South Australia', 'SA', true),
  ('Tasmania', 'TAS', true),
  ('Northern Territory', 'NT', true),
  ('Australian Capital Territory', 'ACT', true)
) AS state_data(name, code, is_active)
WHERE c.code = 'AU'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 10: PROVINCES - CHINA
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, province_data.name, province_data.code, province_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Beijing', 'BJ', true),
  ('Tianjin', 'TJ', true),
  ('Hebei', 'HE', true),
  ('Shanxi', 'SX', true),
  ('Inner Mongolia', 'NM', true),
  ('Liaoning', 'LN', true),
  ('Jilin', 'JL', true),
  ('Heilongjiang', 'HL', true),
  ('Shanghai', 'SH', true),
  ('Jiangsu', 'JS', true),
  ('Zhejiang', 'ZJ', true),
  ('Anhui', 'AH', true),
  ('Fujian', 'FJ', true),
  ('Jiangxi', 'JX', true),
  ('Shandong', 'SD', true),
  ('Henan', 'HA', true),
  ('Hubei', 'HB', true),
  ('Hunan', 'HN', true),
  ('Guangdong', 'GD', true),
  ('Guangxi', 'GX', true),
  ('Hainan', 'HI', true),
  ('Chongqing', 'CQ', true),
  ('Sichuan', 'SC', true),
  ('Guizhou', 'GZ', true),
  ('Yunnan', 'YN', true),
  ('Tibet', 'XZ', true),
  ('Shaanxi', 'SN', true),
  ('Gansu', 'GS', true),
  ('Qinghai', 'QH', true),
  ('Ningxia', 'NX', true),
  ('Xinjiang', 'XJ', true),
  ('Hong Kong', 'HK', true),
  ('Macau', 'MO', true)
) AS province_data(name, code, is_active)
WHERE c.code = 'CN'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 11: STATES - BRAZIL
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, state_data.name, state_data.code, state_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Acre', 'AC', true),
  ('Alagoas', 'AL', true),
  ('Amapá', 'AP', true),
  ('Amazonas', 'AM', true),
  ('Bahia', 'BA', true),
  ('Ceará', 'CE', true),
  ('Distrito Federal', 'DF', true),
  ('Espírito Santo', 'ES', true),
  ('Goiás', 'GO', true),
  ('Maranhão', 'MA', true),
  ('Mato Grosso', 'MT', true),
  ('Mato Grosso do Sul', 'MS', true),
  ('Minas Gerais', 'MG', true),
  ('Pará', 'PA', true),
  ('Paraíba', 'PB', true),
  ('Paraná', 'PR', true),
  ('Pernambuco', 'PE', true),
  ('Piauí', 'PI', true),
  ('Rio de Janeiro', 'RJ', true),
  ('Rio Grande do Norte', 'RN', true),
  ('Rio Grande do Sul', 'RS', true),
  ('Rondônia', 'RO', true),
  ('Roraima', 'RR', true),
  ('Santa Catarina', 'SC', true),
  ('São Paulo', 'SP', true),
  ('Sergipe', 'SE', true),
  ('Tocantins', 'TO', true)
) AS state_data(name, code, is_active)
WHERE c.code = 'BR'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 12: PROVINCES - THAILAND
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, province_data.name, province_data.code, province_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Bangkok', 'BK', true),
  ('Chiang Mai', 'CM', true),
  ('Chiang Rai', 'CR', true),
  ('Phuket', 'PK', true),
  ('Krabi', 'KB', true),
  ('Pattaya', 'PT', true),
  ('Ayutthaya', 'AY', true),
  ('Kanchanaburi', 'KN', true),
  ('Hua Hin', 'HH', true),
  ('Koh Samui', 'KS', true)
) AS province_data(name, code, is_active)
WHERE c.code = 'TH'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 13: PROVINCES - INDONESIA (Major)
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, province_data.name, province_data.code, province_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Jakarta', 'JK', true),
  ('West Java', 'JB', true),
  ('East Java', 'JI', true),
  ('Central Java', 'JT', true),
  ('Banten', 'BT', true),
  ('Bali', 'BA', true),
  ('Sumatra', 'SU', true),
  ('Kalimantan', 'KA', true),
  ('Sulawesi', 'SL', true),
  ('Papua', 'PA', true)
) AS province_data(name, code, is_active)
WHERE c.code = 'ID'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 14: STATES - MALAYSIA
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, state_data.name, state_data.code, state_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Johor', 'JH', true),
  ('Kedah', 'KH', true),
  ('Kelantan', 'KN', true),
  ('Malacca', 'ML', true),
  ('Negeri Sembilan', 'NS', true),
  ('Pahang', 'PH', true),
  ('Penang', 'PG', true),
  ('Perak', 'PK', true),
  ('Perlis', 'PL', true),
  ('Sabah', 'SB', true),
  ('Sarawak', 'SR', true),
  ('Selangor', 'SL', true),
  ('Terengganu', 'TR', true),
  ('Kuala Lumpur', 'KL', true),
  ('Labuan', 'LB', true),
  ('Putrajaya', 'PJ', true)
) AS state_data(name, code, is_active)
WHERE c.code = 'MY'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 15: PROVINCES - PHILIPPINES
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, province_data.name, province_data.code, province_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Metro Manila', 'NCR', true),
  ('Cebu', 'CE', true),
  ('Davao', 'DA', true),
  ('Iloilo', 'IL', true),
  ('Cagayan', 'CG', true),
  ('Pampanga', 'PM', true),
  ('Batangas', 'BT', true),
  ('Laguna', 'LG', true),
  ('Cavite', 'CV', true),
  ('Bulacan', 'BC', true)
) AS province_data(name, code, is_active)
WHERE c.code = 'PH'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 16: PROVINCES - VIETNAM
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, province_data.name, province_data.code, province_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Hanoi', 'HN', true),
  ('Ho Chi Minh City', 'HCM', true),
  ('Da Nang', 'DN', true),
  ('Hai Phong', 'HP', true),
  ('Can Tho', 'CT', true),
  ('An Giang', 'AG', true),
  ('Bac Lieu', 'BL', true),
  ('Bac Kan', 'BK', true),
  ('Bac Giang', 'BG', true),
  ('Bac Ninh', 'BN', true)
) AS province_data(name, code, is_active)
WHERE c.code = 'VN'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 17: PROVINCES - SOUTH AFRICA
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, province_data.name, province_data.code, province_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Eastern Cape', 'EC', true),
  ('Free State', 'FS', true),
  ('Gauteng', 'GP', true),
  ('KwaZulu-Natal', 'KZN', true),
  ('Limpopo', 'LP', true),
  ('Mpumalanga', 'MP', true),
  ('Northern Cape', 'NC', true),
  ('North West', 'NW', true),
  ('Western Cape', 'WC', true)
) AS province_data(name, code, is_active)
WHERE c.code = 'ZA'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- SECTION 18: STATES - NIGERIA
-- =====================================================

INSERT INTO ref_states (country_id, name, code, is_active)
SELECT c.id, state_data.name, state_data.code, state_data.is_active
FROM ref_countries c
CROSS JOIN (VALUES
  ('Abia', 'AB', true),
  ('Adamawa', 'AD', true),
  ('Akwa Ibom', 'AK', true),
  ('Anambra', 'AN', true),
  ('Bauchi', 'BA', true),
  ('Bayelsa', 'BY', true),
  ('Benue', 'BE', true),
  ('Borno', 'BO', true),
  ('Cross River', 'CR', true),
  ('Delta', 'DE', true),
  ('Ebonyi', 'EB', true),
  ('Edo', 'ED', true),
  ('Ekiti', 'EK', true),
  ('Enugu', 'EN', true),
  ('Gombe', 'GO', true),
  ('Imo', 'IM', true),
  ('Jigawa', 'JI', true),
  ('Kaduna', 'KD', true),
  ('Kano', 'KN', true),
  ('Katsina', 'KT', true),
  ('Kebbi', 'KE', true),
  ('Kogi', 'KO', true),
  ('Kwara', 'KW', true),
  ('Lagos', 'LA', true),
  ('Nasarawa', 'NA', true),
  ('Niger', 'NI', true),
  ('Ogun', 'OG', true),
  ('Ondo', 'ON', true),
  ('Osun', 'OS', true),
  ('Oyo', 'OY', true),
  ('Plateau', 'PL', true),
  ('Rivers', 'RI', true),
  ('Sokoto', 'SO', true),
  ('Taraba', 'TA', true),
  ('Yobe', 'YO', true),
  ('Zamfara', 'ZA', true),
  ('Federal Capital Territory', 'FCT', true)
) AS state_data(name, code, is_active)
WHERE c.code = 'NG'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- Notes
-- =====================================================

-- This file contains comprehensive country and state/province data
-- Countries: 80+ countries across all continents
-- States/Provinces: Major subdivisions for key countries
-- 
-- To add more countries or states, follow the same pattern.
-- For countries with many subdivisions, you can add them in batches.

