# Refresh Materialized Views After Scraping

After scraping NECC data (e.g., 2009-2011), you need to refresh the materialized views so "All Time" data appears.

## Quick Solution

### Option 1: Use API Endpoint (Easiest)

After scraping, call the refresh endpoint:

```bash
curl -X POST http://localhost:3002/api/v1/necc/views/refresh
```

Or from the admin panel, you can add a button that calls this endpoint.

### Option 2: Auto-Refresh (Already Implemented)

The scraper now **automatically refreshes views** after successful scraping. So if you just scraped data, the views should already be refreshed!

### Option 3: Manual SQL

If you prefer SQL:

```sql
-- Refresh monthly averages (for Historical Trend)
REFRESH MATERIALIZED VIEW CONCURRENTLY nec_monthly_averages;

-- Refresh YoY daily averages (for Year-over-Year)
REFRESH MATERIALIZED VIEW CONCURRENTLY nec_yoy_daily_averages;
```

Or use the function:

```sql
SELECT refresh_all_nec_views();
```

## Verify It Worked

1. **Check view data:**
   ```sql
   SELECT COUNT(*) FROM nec_monthly_averages;
   SELECT COUNT(*) FROM nec_yoy_daily_averages;
   ```

2. **Test API endpoint:**
   ```bash
   curl "http://localhost:3002/api/v1/necc/monthly-averages/zone/YOUR-ZONE-ID"
   ```

3. **Check web page:**
   - Navigate to `/necc/zones/ahmedabad?period=all`
   - You should see data in both "Historical Trend" and "Year-over-Year" views

## Troubleshooting

### Views don't exist

If you get "relation does not exist", create them first:

```bash
psql "your-database-url" -f aws/database/schema/101_nec_materialized_views.sql
```

### Views are empty

1. Check source data exists:
   ```sql
   SELECT COUNT(*) FROM nec_prices WHERE suggested_price IS NOT NULL;
   ```

2. If count > 0, refresh views (see options above)

3. If count = 0, you need to scrape data first

### Still showing "No data available"

1. Clear browser cache
2. Restart API server
3. Check API logs for errors
4. Verify zone ID matches between database and frontend

## When to Refresh

- ✅ After scraping new data
- ✅ After bulk importing prices
- ✅ After manual price updates
- ✅ Daily (automated via cron)

The scraper now auto-refreshes views, so manual refresh is only needed if:
- You manually inserted/updated prices
- You imported data from another source
- Views got out of sync for some reason

