# Quick Setup: NECC Materialized Views

## Problem
The "All Time" view shows "No data available" because the materialized views haven't been created or refreshed.

## Solution

### Step 1: Check if views exist

Connect to your database and run:

```sql
SELECT * FROM pg_matviews WHERE matviewname LIKE 'nec_%';
```

If you see no results, the views don't exist yet.

### Step 2: Run the migration

```bash
psql -h your-rds-endpoint -U your-user -d your-database -f aws/database/schema/101_nec_materialized_views.sql
```

Or if you're using a connection string:

```bash
psql "postgresql://user:password@host:5432/database" -f aws/database/schema/101_nec_materialized_views.sql
```

### Step 3: Verify views were created

```sql
SELECT 
  schemaname,
  matviewname,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size
FROM pg_matviews 
WHERE matviewname LIKE 'nec_%';
```

You should see:
- `nec_monthly_averages`
- `nec_yoy_daily_averages`

### Step 4: Check if source data exists

```sql
SELECT COUNT(*) FROM nec_prices WHERE suggested_price IS NOT NULL;
```

If this returns 0, you need to scrape data first using the admin scraper.

### Step 5: Refresh views (if they exist but are empty)

```sql
-- Refresh monthly averages
REFRESH MATERIALIZED VIEW CONCURRENTLY nec_monthly_averages;

-- Refresh YoY view
REFRESH MATERIALIZED VIEW CONCURRENTLY nec_yoy_daily_averages;
```

Or use the refresh function:

```sql
SELECT refresh_all_nec_views();
```

### Step 6: Verify data in views

```sql
-- Check monthly averages
SELECT COUNT(*) FROM nec_monthly_averages;

-- Check for a specific zone
SELECT COUNT(*) FROM nec_monthly_averages 
WHERE zone_id = 'b61c9e1c-c352-4279-8463-b6d34f3d4d2b';
```

### Step 7: Test API endpoint

```bash
curl "http://localhost:3002/api/v1/necc/monthly-averages/zone/b61c9e1c-c352-4279-8463-b6d34f3d4d2b"
```

Should return an array of monthly averages.

## Troubleshooting

### Views exist but are empty

1. Check if source table has data:
   ```sql
   SELECT COUNT(*) FROM nec_prices WHERE suggested_price IS NOT NULL;
   ```

2. If source has data, refresh the views:
   ```sql
   REFRESH MATERIALIZED VIEW nec_monthly_averages;
   REFRESH MATERIALIZED VIEW nec_yoy_daily_averages;
   ```

### Migration fails with "relation does not exist"

Make sure you've run the base schema files first:
- `100_nec_core.sql` (creates `nec_prices` table)

### API still returns empty array

1. Check API logs for errors
2. Verify the view exists and has data (Step 6)
3. Check the API service is querying the correct view name (`nec_monthly_averages`)

## Automated Refresh (Recommended)

Set up a daily cron job or scheduled task to refresh views:

```sql
-- Using pg_cron (if enabled)
SELECT cron.schedule(
  'refresh-nec-views',
  '0 0 * * *',  -- Daily at midnight UTC
  $$SELECT refresh_all_nec_views();$$
);
```

Or use AWS EventBridge to call a Lambda function that refreshes the views.

