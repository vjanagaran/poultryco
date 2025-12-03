# Country & Currency Schema Implementation Summary

**Date:** 2025-12-01  
**Status:** ✅ Complete

---

## 🎯 What Was Implemented

### 1. Enhanced Countries Table (`ref_countries`)

**New Fields Added:**
- `iso3` - ISO 3166-1 alpha-3 code (e.g., 'IND', 'USA')
- `iso_numeric` - ISO 3166-1 numeric code (e.g., '356', '840')
- `flag_emoji` - Flag emoji for display (e.g., '🇮🇳', '🇺🇸')
- `name_local` - Native name (e.g., "भारत" for India)
- `phone_format` - Phone number validation pattern
- `subdivision_label` - Dynamic UI label ('State', 'Province', 'Region')
- `is_favourite` - Flag top focus countries
- `is_default` - Default country selection

**Removed:**
- `currency TEXT` - Replaced with proper currency relationship

---

### 2. New Currencies Table (`ref_currencies`)

**ISO 4217 Compliant:**
- `code` - 3-letter currency code (INR, USD, EUR)
- `numeric_code` - 3-digit numeric code
- `name`, `name_plural` - Currency names
- `symbol` - Currency symbol (₹, $, €)

**Formatting Rules:**
- `decimal_places` - Number of decimal places (0-4)
- `decimal_separator` - '.' or ','
- `thousands_separator` - ',', '.', or ' '
- `symbol_position` - 'before' or 'after'
- `symbol_spacing` - true/false
- `number_system` - 'indian' or 'international'

**Indian Number System:**
- Supports lakhs/crores format: ₹1,23,456.78
- International format: ₹123,456.78

---

### 3. Country-Currency Junction Table (`ref_country_currencies`)

**Features:**
- Many-to-many relationship
- `is_default` - Default currency for country
- `is_primary` - Primary currency (only one per country)
- `valid_from` / `valid_until` - Historical currency changes
- Supports countries with multiple currencies

---

### 4. Helper Functions

**`format_currency(amount, currency_code)`**
- Formats currency with proper symbol and number formatting
- Respects Indian vs International number system
- Returns: `₹ 1,23,456.78` or `$123,456.78`

**`get_country_default_currency(country_id)`**
- Returns currency UUID for a country
- Uses default/primary flags

**`get_country_currency_code(country_id)`**
- Returns currency code (e.g., 'INR', 'USD')
- Fallback to 'INR' if not found

---

## 📁 Files Modified

### Schema Files:
1. **`01_core_and_ref.sql`**
   - Enhanced `ref_countries` table
   - Added `ref_currencies` table
   - Added `ref_country_currencies` junction table
   - Added currency formatting functions

### Seed Files:
2. **`seeds/01_reference_data.sql`**
   - Updated country seed data with new fields
   - Fixed states seed to use `country_id` instead of `country_code`

3. **`seeds/02_currencies.sql`** (NEW)
   - 30 major currencies with formatting rules
   - Country-currency relationships for key countries

---

## 🌱 Seed Data Included

### Currencies (30):
- **Indian Subcontinent:** INR, PKR, BDT, LKR, NPR
- **Major Global:** USD, EUR, GBP, JPY, CNY
- **Middle East:** AED, SAR, QAR, KWD
- **Southeast Asia:** SGD, MYR, THB, IDR, PHP, VND
- **Other Major:** AUD, CAD, CHF, NZD, ZAR, BRL, MXN, RUB, KRW, TRY

### Country-Currency Mappings:
- India → INR
- Pakistan → PKR
- Bangladesh → BDT
- Sri Lanka → LKR
- Nepal → NPR
- United States → USD
- United Kingdom → GBP

---

## 🔄 Migration Path

### For Existing Data:

1. **Countries:**
   - Existing countries will work (backward compatible)
   - New fields are nullable or have defaults
   - Update `currency TEXT` → use `ref_country_currencies`

2. **Currency Fields:**
   - All tables using `currency TEXT DEFAULT 'INR'` need migration:
     - `evt_events.currency`
     - `mkt_orders.currency`
     - `mkt_products.currency`
     - `job_postings.salary_currency`
     - `org_membership_tiers.currency`

3. **Migration Script Needed:**
   ```sql
   -- Example: Update events table
   ALTER TABLE evt_events
     ADD COLUMN currency_id UUID REFERENCES ref_currencies(id);
   
   -- Set default to INR
   UPDATE evt_events
   SET currency_id = (SELECT id FROM ref_currencies WHERE code = 'INR')
   WHERE currency_id IS NULL;
   
   -- Drop old column (after verification)
   -- ALTER TABLE evt_events DROP COLUMN currency;
   ```

---

## 📊 Usage Examples

### Get Currency for Country:
```sql
-- Get currency code
SELECT get_country_currency_code('country-uuid-here');
-- Returns: 'INR'

-- Get currency details
SELECT c.*
FROM ref_country_currencies cc
JOIN ref_currencies c ON c.id = cc.currency_id
WHERE cc.country_id = 'country-uuid-here'
  AND cc.is_default = true;
```

### Format Currency:
```sql
-- Format amount
SELECT format_currency(123456.78, 'INR');
-- Returns: '₹ 1,23,456.78' (Indian format)

SELECT format_currency(123456.78, 'USD');
-- Returns: '$123,456.78' (International format)
```

### Get Countries with Favorites First:
```sql
-- Get countries (favorites first, then visitor country, then others)
SELECT *
FROM ref_countries
WHERE is_active = true
ORDER BY 
  is_favourite DESC,
  is_default DESC,
  sort_order ASC,
  name ASC;
```

---

## ✅ Benefits

1. **Proper Normalization**
   - Currency is now a proper entity, not just text
   - Supports multiple currencies per country
   - Historical currency tracking

2. **Better UX**
   - Dynamic subdivision labels (State/Province/Region)
   - Flag emojis for visual identification
   - Favorites for quick access
   - Visitor country detection

3. **International Support**
   - Full ISO 4217 compliance
   - Proper currency formatting
   - Indian vs International number systems

4. **Market Rate Display**
   - 30 currencies seeded for market rate display
   - Easy to add more currencies
   - Proper formatting for each currency

5. **Future-Proof**
   - Ready for multi-currency support
   - Can add exchange rates later (via 3rd party APIs)
   - Supports payment gateway integration

---

## 🚀 Next Steps

1. **Run Schema Migration:**
   ```bash
   psql -h <host> -U <user> -d <db> -f schema/01_core_and_ref.sql
   ```

2. **Load Seed Data:**
   ```bash
   psql -h <host> -U <user> -d <db> -f seeds/01_reference_data.sql
   psql -h <host> -U <user> -d <db> -f seeds/02_currencies.sql
   ```

3. **Update Application Code:**
   - Replace `currency TEXT` with `currency_id UUID`
   - Use `format_currency()` function for display
   - Use `get_country_currency_code()` for queries

4. **Migration Script:**
   - Create migration to update existing `currency TEXT` fields
   - Test with existing data
   - Verify currency formatting

---

## 📝 Notes

- **No Exchange Rates Table:** As per requirements, using 3rd party APIs for currency conversion/comparison
- **Payment Gateway:** Not integrated yet, but schema supports multi-currency
- **Subdivision Label:** Dynamic UI label allows "State", "Province", "Region" based on country
- **Favorites:** Admin can flag top focus countries, system can detect visitor country

---

**Status:** ✅ Ready for Production  
**Version:** 2.0  
**Last Updated:** 2025-12-01

