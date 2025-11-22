# 🚀 NECC Implementation Instructions

**Date:** January 2025  
**Status:** Phase 1 - Foundation Complete  
**Next:** Build page components and data fetching

---

## ✅ COMPLETED

### 1. Database Schema ✅
**File:** `supabase/schema/50_necc_system.sql`

**Tables Created:**
- `entity_likes` - Shared engagement (likes)
- `entity_comments` - Shared engagement (comments)
- `entity_shares` - Shared engagement (shares)
- `necc_zones` - NECC zones
- `necc_prices` - Daily prices
- `necc_scraper_logs` - Scraper logs
- `necc_annotations` - Expert annotations (Phase 2)
- `necc_annotation_metadata` - Annotation metadata (Phase 2)
- `necc_ai_predictions` - AI predictions (Phase 3)
- `feature_flags` - Feature flags

**To Apply:**
```sql
-- Run in Supabase SQL Editor
\i supabase/schema/50_necc_system.sql
```

---

### 2. Scraper Edge Function ✅
**File:** `supabase/functions/scrape-necc-prices/index.ts`

**Features:**
- HTML parsing (regex-based, matches PoultryCare approach)
- Zone name normalization
- Error handling and logging
- Feature flag check
- 15-minute interval support

**To Deploy:**
```bash
# Deploy to Supabase
supabase functions deploy scrape-necc-prices
```

**Environment Variables Needed:**
- `SUPABASE_URL` (auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-set)

**Manual Test:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/scrape-necc-prices \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

---

### 3. Route Structure ✅
**Location:** `apps/web/src/app/necc/`

**Routes Created:**
- `/necc` - Home page
- `/necc/today` - Today's rates
- `/necc/[year]` - Year overview
- `/necc/[year]/[month]` - Month overview
- `/necc/[year]/[month]/[day]` - Day detail (canonical)
- `/necc/[date]` - Day detail (redirects to canonical)
- `/necc/zones` - All zones
- `/necc/zones/[zone]` - Zone detail
- `/necc/analysis` - Analysis dashboard
- `/necc/trends` - Trends page
- `/necc/about` - About page

**Layout:** `apps/web/src/app/necc/layout.tsx` (with Header/Footer)

---

## 🔧 SETUP INSTRUCTIONS

### Step 1: Apply Database Schema

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Run the schema file:**
   ```sql
   -- Copy contents of supabase/schema/50_necc_system.sql
   -- Paste and execute in SQL Editor
   ```

4. **Verify tables created:**
   - Check Tables section in Supabase
   - Should see: `necc_zones`, `necc_prices`, `necc_scraper_logs`, etc.

---

### Step 2: Populate Zones

**Option A: Manual Insert (Quick Start)**
```sql
-- Insert key zones
INSERT INTO necc_zones (name, slug, zone_type, state, status) VALUES
  ('Namakkal', 'namakkal', 'production_center', 'Tamil Nadu', true),
  ('Mumbai', 'mumbai', 'consumption_center', 'Maharashtra', true),
  ('Hyderabad', 'hyderabad', 'consumption_center', 'Telangana', true),
  ('Chennai', 'chennai', 'consumption_center', 'Tamil Nadu', true),
  ('Bengaluru', 'bengaluru', 'consumption_center', 'Karnataka', true),
  ('Kolkata', 'kolkata', 'consumption_center', 'West Bengal', true),
  ('Pune', 'pune', 'production_center', 'Maharashtra', true),
  ('Ajmer', 'ajmer', 'production_center', 'Rajasthan', true);
```

**Option B: Import from PoultryCare**
- Export zones from PoultryCare
- Format as SQL INSERT statements
- Run in Supabase SQL Editor

---

### Step 3: Deploy Scraper Function

1. **Install Supabase CLI** (if not installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link to project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Deploy function:**
   ```bash
   supabase functions deploy scrape-necc-prices
   ```

5. **Test function:**
   ```bash
   supabase functions invoke scrape-necc-prices
   ```

---

### Step 4: Set Up Cron Job

**Option A: Vercel Cron (Recommended)**

1. **Create cron route:** `apps/web/src/app/api/cron/scrape-necc-prices/route.ts` ✅ (Already created)

2. **Add environment variable:**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add: `CRON_SECRET` = (generate random string)

3. **Configure in vercel.json:** ✅ (Already created)
   ```json
   {
     "crons": [{
       "path": "/api/cron/scrape-necc-prices",
       "schedule": "*/15 * * * *"
     }]
   }
   ```

4. **Deploy to Vercel:**
   - Cron will automatically be set up

**Option B: Supabase pg_cron (Alternative)**

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule scraper (every 15 minutes)
SELECT cron.schedule(
  'scrape-necc-prices',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/scrape-necc-prices',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
```

---

### Step 5: Import Historical Data

1. **Export from PoultryCare:**
   ```sql
   -- Export zones
   SELECT * FROM necczone;
   
   -- Export prices
   SELECT nz.name as zone_name, nr.date, nr.rate 
   FROM neccrate nr
   JOIN necczone nz ON nr.necczone_id = nz.id;
   ```

2. **Format for Supabase:**
   - Convert to CSV or SQL INSERT statements
   - Match zone names with `necc_zones` table
   - Format dates as YYYY-MM-DD

3. **Import via Supabase Dashboard:**
   - Go to Table Editor
   - Select `necc_prices` table
   - Click "Insert" → "Import data"
   - Upload CSV or paste SQL

---

## 📝 NEXT STEPS

### Immediate (Day 1-2)

1. **Apply Database Schema**
   - Run `50_necc_system.sql` in Supabase
   - Verify all tables created

2. **Populate Zones**
   - Insert zones manually or import from PoultryCare
   - Verify zones in database

3. **Deploy Scraper**
   - Deploy edge function
   - Test manually
   - Set up cron job

4. **Test Scraper**
   - Run scraper manually
   - Check `necc_scraper_logs` table
   - Verify prices in `necc_prices` table

---

### Short-term (Day 3-5)

5. **Build API Functions**
   - Create `apps/web/src/lib/api/necc-prices.ts`
   - Create `apps/web/src/lib/api/necc-zones.ts`
   - Create `apps/web/src/lib/utils/necc-date.ts`

6. **Build Home Page**
   - Fetch today's average price
   - Display stats
   - Add quick links

7. **Build Today Page**
   - Fetch today's prices
   - Compare with yesterday
   - Display in table

---

## 🐛 TROUBLESHOOTING

### Scraper Not Working

**Check:**
1. Feature flag enabled? (`necc_scraper_enabled = true`)
2. Zones exist in database?
3. Scraper logs show errors?
4. HTML structure changed? (check `necc_scraper_logs.error_details`)

**Fix:**
- Update HTML parser if structure changed
- Add missing zones
- Check network connectivity

### Routes Not Loading

**Check:**
1. Files in correct location?
2. Next.js dev server running?
3. No TypeScript errors?

**Fix:**
- Verify file structure
- Check `npm run dev` output
- Fix any TypeScript errors

### Database Errors

**Check:**
1. Schema applied correctly?
2. Foreign key constraints?
3. RLS policies blocking?

**Fix:**
- Re-run schema file
- Check foreign key references
- Verify RLS policies

---

## 📚 REFERENCE

### Key Files Created

**Database:**
- `supabase/schema/50_necc_system.sql`

**Scraper:**
- `supabase/functions/scrape-necc-prices/index.ts`

**Routes:**
- `apps/web/src/app/necc/layout.tsx`
- `apps/web/src/app/necc/page.tsx`
- `apps/web/src/app/necc/today/page.tsx`
- `apps/web/src/app/necc/[year]/page.tsx`
- `apps/web/src/app/necc/[year]/[month]/page.tsx`
- `apps/web/src/app/necc/[year]/[month]/[day]/page.tsx`
- `apps/web/src/app/necc/[date]/page.tsx`
- `apps/web/src/app/necc/zones/page.tsx`
- `apps/web/src/app/necc/zones/[zone]/page.tsx`
- `apps/web/src/app/necc/analysis/page.tsx`
- `apps/web/src/app/necc/trends/page.tsx`
- `apps/web/src/app/necc/about/page.tsx`

**Cron:**
- `apps/web/src/app/api/cron/scrape-necc-prices/route.ts`
- `vercel.json`

---

**Status:** ✅ Foundation Complete  
**Next:** Build API functions and page components

