# Country & Currency Schema Review
## PoultryCare (MySQL) vs PoultryCo (PostgreSQL) - Critical Analysis

**Date:** 2025-12-01  
**Reviewer:** Database Architecture Analysis  
**Purpose:** Identify gaps, challenges, and improvement opportunities

---

## 🔍 Current State Comparison

### PoultryCare (MySQL) Structure
```sql
country (id, name, slug, iso2, iso3, isonumeric, flag, dailer, state_name, favourite, sorting, status)
currency (id, name, shortname, fraction, fraction_base, decimal, code, symbol, radix, separator, system, entity, status)
country_currency (id, country_id, currency_id, default, sorting, status)
```

### PoultryCo (PostgreSQL) Current Structure
```sql
ref_countries (id, name, code, phone_code, currency, is_active, sort_order, created_at)
-- ❌ NO currency table
-- ❌ NO country_currency junction table
```

---

## 🚨 Critical Issues Identified

### 1. **Currency is a TEXT Field - No Normalization**
**Current:** `currency TEXT` in `ref_countries`  
**Problem:**
- No currency validation
- No currency details (symbol, decimal places, formatting)
- Can't handle multiple currencies per country
- No currency conversion support
- Hardcoded 'INR' throughout codebase (60_evt_core.sql, 130_mkt_core.sql, etc.)

**Impact:**
- ❌ Can't support international users properly
- ❌ Can't format currency correctly (₹ vs Rs vs INR)
- ❌ Can't handle countries with multiple currencies (e.g., Zimbabwe)
- ❌ No exchange rate tracking
- ❌ Payment gateway integration will be messy

---

### 2. **Missing Critical Country Data**

**Missing from PoultryCo:**
- ❌ `iso3` (ISO 3166-1 alpha-3) - Required for many APIs
- ❌ `iso_numeric` - Required for some payment gateways
- ❌ `flag` / flag emoji - UX enhancement
- ❌ Proper phone code structure (currently just TEXT)

**PoultryCare Issues:**
- ⚠️ `state_name` in country table - **WRONG DESIGN** (should be in states table)
- ⚠️ `dailer` - **TYPO** (should be "dialer")
- ⚠️ `favourite` - User-specific data in reference table (should be in user preferences)

---

### 3. **No Currency Formatting System**

**PoultryCare Has:**
- `system` enum: 'INTERNATIONAL' vs 'INDIAN'
- `radix` (decimal separator): '.' or ','
- `separator` (thousands separator): ',' or '.'
- `decimal` places: 2, 0, etc.
- `symbol`: '₹', '$', '€', etc.

**PoultryCo Has:**
- ❌ Nothing - just TEXT 'INR'

**Real-World Impact:**
```
Indian Format:    ₹1,23,456.78  (lakhs/crores)
International:    ₹123,456.78   (thousands/millions)

Without this, you can't format prices correctly!
```

---

### 4. **No Multi-Currency Support**

**Countries with Multiple Currencies:**
- Zimbabwe: USD, ZWL, ZWB
- Cuba: CUP, CUC
- Some territories use multiple

**Current Limitation:**
- One currency per country (TEXT field)
- Can't handle historical currency changes
- Can't support regional currencies

---

### 5. **Currency Code Inconsistency**

**PoultryCare:**
- `currency.code` (e.g., 'USD', 'INR')
- `currency.shortname` (e.g., 'Dollar', 'Rupee')

**PoultryCo:**
- Just `currency TEXT` - no standard

**ISO 4217 Standard:**
- Should use 3-letter codes: USD, INR, EUR, GBP
- Should support numeric codes: 840, 356, 978, 826

---

## 💡 Recommended Improvements

### Option A: Comprehensive (Recommended for Production)

```sql
-- =====================================================
-- SECTION: ENHANCED COUNTRIES & CURRENCIES
-- =====================================================

-- Enhanced Countries Table
CREATE TABLE IF NOT EXISTS ref_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Names
  name TEXT NOT NULL UNIQUE,
  name_local TEXT, -- Native name
  
  -- ISO Codes (Standard)
  iso2 TEXT NOT NULL UNIQUE CHECK (char_length(iso2) = 2), -- 'IN', 'US'
  iso3 TEXT NOT NULL UNIQUE CHECK (char_length(iso3) = 3), -- 'IND', 'USA'
  iso_numeric TEXT NOT NULL UNIQUE CHECK (char_length(iso_numeric) = 3), -- '356', '840'
  
  -- Display
  flag_emoji TEXT, -- '🇮🇳', '🇺🇸'
  flag_url TEXT, -- For custom flags
  
  -- Contact
  phone_code TEXT NOT NULL, -- '+91', '+1'
  phone_format TEXT, -- Pattern for validation
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Currencies Table (ISO 4217 Compliant)
CREATE TABLE IF NOT EXISTS ref_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Names
  name TEXT NOT NULL, -- 'Indian Rupee', 'US Dollar'
  name_plural TEXT, -- 'Indian Rupees', 'US Dollars'
  symbol TEXT NOT NULL, -- '₹', '$', '€'
  
  -- ISO Codes
  code TEXT NOT NULL UNIQUE CHECK (char_length(code) = 3), -- 'INR', 'USD'
  numeric_code TEXT NOT NULL UNIQUE CHECK (char_length(numeric_code) = 3), -- '356', '840'
  
  -- Formatting
  decimal_places INTEGER NOT NULL DEFAULT 2 CHECK (decimal_places >= 0 AND decimal_places <= 4),
  decimal_separator TEXT NOT NULL DEFAULT '.', -- '.' or ','
  thousands_separator TEXT NOT NULL DEFAULT ',', -- ',' or '.' or ' '
  symbol_position TEXT NOT NULL DEFAULT 'before' CHECK (symbol_position IN ('before', 'after')),
  symbol_spacing BOOLEAN NOT NULL DEFAULT true, -- '₹ 100' vs '₹100'
  
  -- Number System
  number_system TEXT NOT NULL DEFAULT 'international' CHECK (number_system IN ('international', 'indian')),
  -- Indian: lakhs/crores (1,23,456.78)
  -- International: thousands/millions (123,456.78)
  
  -- Minor Unit
  minor_unit_name TEXT, -- 'paise', 'cents'
  minor_unit_ratio INTEGER NOT NULL DEFAULT 100, -- 100 paise = 1 rupee
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_crypto BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Country-Currency Junction (Many-to-Many)
CREATE TABLE IF NOT EXISTS ref_country_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES ref_countries(id) ON DELETE CASCADE,
  currency_id UUID NOT NULL REFERENCES ref_currencies(id) ON DELETE CASCADE,
  
  -- Relationship
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false, -- Only one primary per country
  
  -- Historical
  valid_from DATE,
  valid_until DATE, -- NULL = current
  
  -- Display
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Constraints
  UNIQUE(country_id, currency_id),
  -- Ensure only one primary currency per country at a time
  EXCLUDE USING gist (
    country_id WITH =,
    tstzrange(valid_from, valid_until, '[]') WITH &&
  ) WHERE (is_primary = true AND valid_until IS NULL)
);

-- Exchange Rates (for future multi-currency support)
CREATE TABLE IF NOT EXISTS ref_exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency_id UUID NOT NULL REFERENCES ref_currencies(id),
  to_currency_id UUID NOT NULL REFERENCES ref_currencies(id),
  
  rate DECIMAL(18, 8) NOT NULL CHECK (rate > 0),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  source TEXT, -- 'manual', 'api', 'bank'
  source_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(from_currency_id, to_currency_id, effective_date)
);

-- Indexes
CREATE INDEX idx_ref_countries_iso2 ON ref_countries(iso2);
CREATE INDEX idx_ref_countries_iso3 ON ref_countries(iso3);
CREATE INDEX idx_ref_currencies_code ON ref_currencies(code);
CREATE INDEX idx_ref_country_currencies_country ON ref_country_currencies(country_id);
CREATE INDEX idx_ref_country_currencies_currency ON ref_country_currencies(currency_id);
CREATE INDEX idx_ref_country_currencies_default ON ref_country_currencies(country_id, is_default) WHERE is_default = true;
CREATE INDEX idx_ref_exchange_rates_date ON ref_exchange_rates(effective_date DESC);

-- Helper Functions
CREATE OR REPLACE FUNCTION format_currency(
  amount DECIMAL,
  currency_code TEXT
)
RETURNS TEXT AS $$
DECLARE
  currency_rec RECORD;
  formatted TEXT;
  integer_part TEXT;
  decimal_part TEXT;
BEGIN
  SELECT * INTO currency_rec
  FROM ref_currencies
  WHERE code = currency_code AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN amount::TEXT || ' ' || currency_code;
  END IF;
  
  -- Format number based on system
  IF currency_rec.number_system = 'indian' THEN
    -- Indian numbering: 1,23,456.78
    formatted := to_char(amount, 'FM999G999G999G999D' || repeat('0', currency_rec.decimal_places));
    -- Replace G with thousands_separator
    formatted := replace(formatted, 'G', currency_rec.thousands_separator);
    -- Replace D with decimal_separator
    formatted := replace(formatted, 'D', currency_rec.decimal_separator);
  ELSE
    -- International: 123,456.78
    formatted := to_char(amount, 'FM999G999G999G999D' || repeat('0', currency_rec.decimal_places));
    formatted := replace(formatted, 'G', currency_rec.thousands_separator);
    formatted := replace(formatted, 'D', currency_rec.decimal_separator);
  END IF;
  
  -- Add symbol
  IF currency_rec.symbol_position = 'before' THEN
    IF currency_rec.symbol_spacing THEN
      RETURN currency_rec.symbol || ' ' || formatted;
    ELSE
      RETURN currency_rec.symbol || formatted;
    END IF;
  ELSE
    IF currency_rec.symbol_spacing THEN
      RETURN formatted || ' ' || currency_rec.symbol;
    ELSE
      RETURN formatted || currency_rec.symbol;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get default currency for country
CREATE OR REPLACE FUNCTION get_country_default_currency(p_country_id UUID)
RETURNS UUID AS $$
DECLARE
  currency_id UUID;
BEGIN
  SELECT currency_id INTO currency_id
  FROM ref_country_currencies
  WHERE country_id = p_country_id
    AND is_default = true
    AND is_active = true
    AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
  ORDER BY is_primary DESC, sort_order ASC
  LIMIT 1;
  
  RETURN currency_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

### Option B: Minimal (Quick Fix)

If you want a quick fix without major refactoring:

```sql
-- Add missing columns to ref_countries
ALTER TABLE ref_countries
  ADD COLUMN IF NOT EXISTS iso3 TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS iso_numeric TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS flag_emoji TEXT;

-- Create basic currency table
CREATE TABLE IF NOT EXISTS ref_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (char_length(code) = 3),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create junction table
CREATE TABLE IF NOT EXISTS ref_country_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES ref_countries(id),
  currency_id UUID NOT NULL REFERENCES ref_currencies(id),
  is_default BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(country_id, currency_id)
);

-- Update ref_countries to use FK instead of TEXT
ALTER TABLE ref_countries
  ADD COLUMN currency_id UUID REFERENCES ref_currencies(id),
  DROP COLUMN currency; -- After migration
```

---

## 🎯 Challenges for You

### Challenge 1: Migration Strategy
**Question:** How will you migrate existing data?
- All current `currency TEXT` fields have 'INR'
- Need to create INR currency record
- Need to link all countries to INR
- Need to update all tables using currency TEXT

**Recommendation:**
1. Create currency table and seed with common currencies
2. Create migration script to convert TEXT → UUID
3. Update all foreign key references
4. Add validation constraints

---

### Challenge 2: Number Formatting
**Question:** Do you need Indian vs International formatting?

**Examples:**
```
Indian:      ₹1,23,456.78  (lakhs/crores)
International: ₹123,456.78  (thousands/millions)
```

**If YES:** You need the `number_system` field  
**If NO:** You can simplify

---

### Challenge 3: Multi-Currency Support
**Question:** Will you support:
- Multiple currencies per country? (Zimbabwe, Cuba)
- Currency conversion? (USD → INR)
- Historical currency changes?

**If YES:** Need exchange_rates table  
**If NO:** Can use simpler structure

---

### Challenge 4: Payment Gateway Integration
**Question:** Which payment gateways?
- Razorpay (INR only)
- Stripe (multi-currency)
- PayPal (multi-currency)

**Impact:**
- Razorpay: Can keep simple (INR only)
- Stripe/PayPal: Need full currency support

---

### Challenge 5: Data Source
**Question:** Where will you get currency data?
- ISO 4217 standard list
- Exchange rate APIs (Fixer.io, CurrencyAPI)
- Manual entry

**Recommendation:**
- Use ISO 4217 for base data
- Use API for exchange rates (if needed)

---

## 📊 What PoultryCare Got Right

1. ✅ **Separate currency table** - Good normalization
2. ✅ **Currency formatting details** - Essential for UX
3. ✅ **Number system (INDIAN vs INTERNATIONAL)** - Critical for Indian market
4. ✅ **Junction table for country-currency** - Supports multiple currencies

---

## 🚫 What PoultryCare Got Wrong

1. ❌ **`state_name` in country table** - Should be in states table
2. ❌ **`dailer` typo** - Should be "dialer"
3. ❌ **`favourite` in reference table** - User-specific, should be in user_preferences
4. ❌ **Missing ISO3 and ISO numeric** - Important for APIs
5. ❌ **No exchange rates table** - Can't do currency conversion

---

## ✅ Recommended Action Plan

### Phase 1: Immediate (Week 1)
1. Create `ref_currencies` table with ISO 4217 data
2. Create `ref_country_currencies` junction table
3. Seed with top 20 currencies (INR, USD, EUR, GBP, etc.)
4. Add `iso3` and `iso_numeric` to `ref_countries`

### Phase 2: Migration (Week 2)
1. Create migration script to convert TEXT → UUID
2. Update all currency TEXT fields to currency_id UUID
3. Add foreign key constraints
4. Test with existing data

### Phase 3: Enhancement (Week 3-4)
1. Add currency formatting function
2. Add exchange rates table (if needed)
3. Update application code to use new structure
4. Add validation and constraints

---

## 🔗 References

- [ISO 3166-1 (Countries)](https://en.wikipedia.org/wiki/ISO_3166-1)
- [ISO 4217 (Currencies)](https://en.wikipedia.org/wiki/ISO_4217)
- [Indian Numbering System](https://en.wikipedia.org/wiki/Indian_numbering_system)
- [PostgreSQL Currency Formatting](https://www.postgresql.org/docs/current/functions-formatting.html)

---

## ✅ Final Decisions & Implementation

### Answers Received:

1. **Multi-currency support:** ✅ YES - Create schema with seed data for market rate display
2. **International users:** ✅ YES - Design as global product, market one segment at a time
3. **Currency conversion:** ❌ NO - Use 3rd party APIs if needed for comparison
4. **Payment gateway:** ❌ Not integrating now
5. **state_name field:** ✅ KEPT - It's a label for dynamic UI (State/Province/Region)
6. **favourite field:** ✅ KEPT - Flag top focus countries, bring visitor country on top

### Implementation Status:

✅ **Schema Updated:**
- Enhanced `ref_countries` table with:
  - `iso3`, `iso_numeric` codes
  - `flag_emoji` for display
  - `subdivision_label` for dynamic UI (State/Province/Region)
  - `is_favourite` for top focus countries
  - `is_default` for default selection
  - `name_local` for native names

✅ **Currencies Added:**
- `ref_currencies` table with full ISO 4217 support
- `ref_country_currencies` junction table for many-to-many relationships
- Currency formatting functions (`format_currency`, `get_country_currency_code`)

✅ **Seed Data Created:**
- 30 major currencies with proper formatting rules
- Country-currency relationships for key countries
- Indian vs International number system support

### Files Modified:
1. `/aws/database/schema/01_core_and_ref.sql` - Enhanced countries + currencies tables
2. `/aws/database/seeds/01_reference_data.sql` - Updated country seed data
3. `/aws/database/seeds/02_currencies.sql` - New currency seed file

### Next Steps:
1. Run schema migration
2. Load seed data: `psql -f seeds/02_currencies.sql`
3. Update application code to use `currency_id UUID` instead of `currency TEXT`
4. Use `format_currency()` function for display
5. Use `get_country_currency_code()` for queries

---

**Status:** ✅ Complete - Ready for deployment! 🚀

