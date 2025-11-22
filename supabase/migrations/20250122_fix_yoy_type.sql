-- Fix the return type mismatch in get_zone_yoy_data function
-- COUNT returns BIGINT, not INTEGER

DROP FUNCTION IF EXISTS get_zone_yoy_data(UUID, INTEGER);

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

