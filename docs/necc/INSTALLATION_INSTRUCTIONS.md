# 🚀 NECC Admin - Installation Instructions

**Last Updated:** January 2025  
**Status:** Ready to Install & Test

---

## 📋 PREREQUISITES

- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ Supabase project configured
- ✅ Database schema applied (50_necc_system.sql)
- ✅ Admin user account created

---

## 🔧 INSTALLATION STEPS

### Step 1: Install Dependencies

```bash
cd apps/admin
npm install
```

This will install the new `cheerio` dependency for HTML parsing.

---

### Step 2: Verify Environment Variables

Make sure your `.env.local` file has:

```bash
# apps/admin/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### Step 3: Start Development Server

```bash
npm run dev
```

The admin app will start on `http://localhost:3001`

---

### Step 4: Login

1. Navigate to `http://localhost:3001/login`
2. Login with your admin credentials
3. You should see the admin dashboard

---

### Step 5: Access NECC Dashboard

1. Click on "🥚 NECC Dashboard" in the sidebar
2. You should see:
   - Total zones
   - Total prices  
   - Latest price date
   - Quick action buttons

---

## ✅ VERIFICATION

### Verify Navigation

Check that all these routes work:

- ✅ `/necc` - Dashboard
- ✅ `/necc/zones` - Zone list
- ✅ `/necc/zones/new` - Add zone
- ✅ `/necc/prices` - Price list
- ✅ `/necc/prices/daily` - Daily grid
- ✅ `/necc/prices/new` - Add price
- ✅ `/necc/scraper` - Scraper

### Verify Sidebar

Check that sidebar shows:

```
NECC System
  🥚 NECC Dashboard
```

---

## 🧪 TESTING

### Test 1: Create a Zone Manually

1. Go to `/necc/zones`
2. Click "Add New Zone"
3. Fill in:
   - Name: `Test Zone`
   - Type: `Production Center`
   - State: `Test State`
4. Click "Create Zone"
5. Verify it appears in the zone list

### Test 2: Add Manual Price

1. Go to `/necc/prices/new`
2. Select your test zone
3. Select today's date
4. Enter prices:
   - Suggested: `500`
   - Prevailing: `505`
5. Click "Save Price"
6. Verify it appears in `/necc/prices`

### Test 3: Run Scraper

1. Go to `/necc/scraper`
2. Select:
   - Month: November
   - Year: 2025
3. Click "🚀 Scrape Month"
4. Wait for results (15-30 seconds)
5. Verify:
   - ✅ "Scraping completed successfully"
   - ✅ Shows zones found
   - ✅ Shows zones created
   - ✅ Shows prices inserted

### Test 4: View Scraped Data

1. Go to `/necc/zones`
2. You should see 20-30 zones (Namakkal, Mumbai, etc.)
3. Go to `/necc/prices/daily`
4. Select a date in November 2025
5. You should see prices for most zones

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot find module 'cheerio'"

**Solution:**
```bash
cd apps/admin
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Scraper timeout"

**Cause:** NECC website is slow or network issue

**Solution:**
- Wait and try again
- Check internet connection
- Try a different month

### Issue: "Zone already exists"

**Cause:** Trying to create duplicate zone

**Solution:**
- Check existing zones first
- Use different name
- Or edit existing zone

### Issue: "Price already exists"

**Cause:** Trying to add duplicate price

**Solution:**
- Check if price exists for that zone+date
- Scraper automatically skips duplicates (safe to re-run)

### Issue: "Cannot delete zone"

**Cause:** Zone has price records

**Solution:**
- This is intentional (data integrity)
- Delete prices first, then zone
- Or just deactivate the zone (set status to inactive)

### Issue: Scraper returns empty data

**Cause:** NECC website structure changed

**Solution:**
- Check NECC website manually
- Update parser logic if needed
- Contact developer

---

## 📊 DATABASE CHECK

### Verify Zones Table

```sql
SELECT COUNT(*) FROM necc_zones;
-- Should be > 0 after scraping
```

### Verify Prices Table

```sql
SELECT COUNT(*) FROM necc_prices;
-- Should be > 0 after scraping
```

### Check Recent Scrape Results

```sql
SELECT 
  z.name,
  COUNT(p.id) as price_count,
  MAX(p.date) as latest_price
FROM necc_zones z
LEFT JOIN necc_prices p ON p.zone_id = z.id
GROUP BY z.id, z.name
ORDER BY latest_price DESC NULLS LAST
LIMIT 10;
```

---

## 🎯 SUCCESS CRITERIA

Phase 1 is successfully installed if:

- ✅ All routes load without errors
- ✅ Can create/edit/delete zones
- ✅ Can add manual prices
- ✅ Scraper runs and returns data
- ✅ Scraped data appears in database
- ✅ Can view data in daily grid

---

## 📞 SUPPORT

If you encounter issues:

1. Check this troubleshooting guide
2. Check browser console for errors
3. Check server logs (`npm run dev` output)
4. Check Supabase dashboard for data
5. Check PHASE_1_COMPLETE.md for details

---

## 🚀 NEXT STEPS

Once Phase 1 is verified:

1. Test with real NECC data (scrape multiple months)
2. Verify data quality
3. Plan Phase 2 (Expert Management, Annotations, Predictions)
4. Deploy to production (when ready)

---

**Status:** ✅ Ready to Install  
**Estimated Time:** 10 minutes  
**Difficulty:** Easy

