-- Force recreate YoY view
DROP MATERIALIZED VIEW IF EXISTS necc_yoy_daily_averages CASCADE;

-- Recreate with CTE to avoid ambiguity
CREATE MATERIALIZED VIEW necc_yoy_daily_averages AS
WITH aggregated_data AS (
    SELECT 
        zone_id,
        EXTRACT(DOY FROM date)::INTEGER as day_of_year,
        EXTRACT(YEAR FROM date)::INTEGER as year,
        suggested_price,
        date
    FROM necc_prices
    WHERE suggested_price IS NOT NULL
)
SELECT 
    zone_id,
    day_of_year,
    year,
    AVG(suggested_price)::INTEGER as avg_price,
    MIN(suggested_price) as min_price,
    MAX(suggested_price) as max_price,
    COUNT(*) as data_points,
    ARRAY_AGG(DISTINCT date ORDER BY date) as dates
FROM aggregated_data
GROUP BY zone_id, day_of_year, year
ORDER BY zone_id, day_of_year, year;

-- Recreate indexes
CREATE INDEX idx_yoy_daily_zone_doy 
    ON necc_yoy_daily_averages(zone_id, day_of_year);

CREATE INDEX idx_yoy_daily_zone_year 
    ON necc_yoy_daily_averages(zone_id, year);

CREATE INDEX idx_yoy_daily_year 
    ON necc_yoy_daily_averages(year DESC);

-- Populate the view
REFRESH MATERIALIZED VIEW necc_yoy_daily_averages;

-- Recreate the functions that depend on this view
CREATE OR REPLACE FUNCTION get_zone_yoy_data(
    p_zone_id UUID,
    p_min_years INTEGER DEFAULT 2
)
RETURNS TABLE (
    day_of_year INTEGER,
    day_label TEXT,
    year_data JSONB,
    years_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH year_data AS (
        SELECT 
            yd.day_of_year,
            yd.year,
            yd.avg_price
        FROM necc_yoy_daily_averages yd
        WHERE yd.zone_id = p_zone_id
    ),
    aggregated AS (
        SELECT 
            yd.day_of_year,
            jsonb_object_agg(
                yd.year::TEXT, 
                yd.avg_price
                ORDER BY yd.year
            ) as year_data,
            COUNT(DISTINCT yd.year) as years_count,
            TO_CHAR(
                DATE '2024-01-01' + (yd.day_of_year - 1) * INTERVAL '1 day',
                'Mon DD'
            ) as day_label
        FROM year_data yd
        GROUP BY yd.day_of_year
        HAVING COUNT(DISTINCT yd.year) >= p_min_years
    )
    SELECT 
        a.day_of_year,
        a.day_label,
        a.year_data,
        a.years_count
    FROM aggregated a
    ORDER BY a.day_of_year;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_zone_yoy_stats(p_zone_id UUID)
RETURNS TABLE (
    stat_name TEXT,
    stat_value JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH highest_day AS (
        SELECT 
            'highest_price_day'::TEXT as stat_name,
            jsonb_build_object(
                'day_of_year', day_of_year,
                'day_label', TO_CHAR(DATE '2024-01-01' + (day_of_year - 1) * INTERVAL '1 day', 'Mon DD'),
                'year', year,
                'price', max_price
            ) as stat_value
        FROM necc_yoy_daily_averages
        WHERE zone_id = p_zone_id
        ORDER BY max_price DESC NULLS LAST
        LIMIT 1
    ),
    lowest_day AS (
        SELECT 
            'lowest_price_day'::TEXT as stat_name,
            jsonb_build_object(
                'day_of_year', day_of_year,
                'day_label', TO_CHAR(DATE '2024-01-01' + (day_of_year - 1) * INTERVAL '1 day', 'Mon DD'),
                'year', year,
                'price', min_price
            ) as stat_value
        FROM necc_yoy_daily_averages
        WHERE zone_id = p_zone_id
        ORDER BY min_price ASC NULLS LAST
        LIMIT 1
    ),
    yearly_averages AS (
        SELECT 
            'avg_by_year'::TEXT as stat_name,
            jsonb_object_agg(year::TEXT, avg_price::INTEGER) as stat_value
        FROM (
            SELECT 
                year,
                AVG(avg_price)::INTEGER as avg_price
            FROM necc_yoy_daily_averages
            WHERE zone_id = p_zone_id
            GROUP BY year
            ORDER BY year
        ) yearly_avgs
    ),
    available_years AS (
        SELECT 
            'years'::TEXT as stat_name,
            jsonb_agg(DISTINCT year ORDER BY year) as stat_value
        FROM necc_yoy_daily_averages
        WHERE zone_id = p_zone_id
    )
    SELECT * FROM highest_day
    UNION ALL
    SELECT * FROM lowest_day
    UNION ALL
    SELECT * FROM yearly_averages
    UNION ALL
    SELECT * FROM available_years;
END;
$$ LANGUAGE plpgsql STABLE;

