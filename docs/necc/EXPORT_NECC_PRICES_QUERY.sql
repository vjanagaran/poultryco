
SELECT 
    -- zone_id: Use UUID from Supabase (stored in necczone.uuid)
    nz.uuid AS zone_id,
    nr.date,
    YEAR(nr.date) AS year,
    MONTH(nr.date) AS month,
    DAY(nr.date) AS day_of_month,
    nr.rate AS suggested_price,
    'imported' AS source,
    nr.mode,
    nr.created_at
FROM neccrate nr
INNER JOIN necczone nz ON nr.necczone_id = nz.id
WHERE 
    nz.uuid IS NOT NULL 
    AND nz.uuid != ''
    AND nr.rate IS NOT NULL
    -- AND nr.date >= '2010-01-01'
    -- AND nr.date <= '2025-12-31'
ORDER BY
    nr.date ASC,
    nz.name;
