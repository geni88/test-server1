SELECT 
    a.name AS apartment,
    s.name AS school,
    ST_Distance(a.geom, s.geom) AS distance_meters,
    ROUND(CAST(ST_Distance(a.geom, s.geom) / 1000 AS numeric), 2) AS distance_km
FROM 
    apartments a
CROSS JOIN 
    schools s
WHERE 
    a.name = '청구빌라트'
ORDER BY 
    distance_meters ASC;

-- 각 아파트에서 가장 가까운 학교 찾기
WITH closest_schools AS (
    SELECT 
        a.id AS apartment_id,
        a.name AS apartment_name,
        s.id AS school_id,
        s.name AS school_name,
        ST_Distance(a.geom, s.geom) AS distance,
        RANK() OVER (PARTITION BY a.id ORDER BY ST_Distance(a.geom, s.geom)) AS rank
    FROM 
        apartments a
    CROSS JOIN 
        schools s
)
SELECT 
    apartment_name,
    school_name,
    distance AS distance_meters,
    ROUND(CAST(distance / 1000 AS numeric), 2) AS distance_km
FROM 
    closest_schools
WHERE 
    rank = 1
ORDER BY 
    apartment_name;

-- 특정 아파트 반경 1km 내 학교 검색
SELECT 
    s.name AS school,
    ST_Distance(a.geom, s.geom) AS distance_meters
FROM 
    schools s, 
    apartments a
WHERE 
    a.name = '청구빌라트'
    AND ST_DWithin(a.geom, s.geom, 1000)  -- 1000m = 1km
ORDER BY 
    distance_meters ASC;

--전체 아파트에서 반경 1km 내 학교 수 검색
COPY (
SELECT
  a.id AS apartment_id,
  a.name AS apartment_name,
  count(s.name) AS school_count
FROM
  apartments a
LEFT JOIN
  schools s ON ST_DWithin(a.geom, s.geom, 1000)  -- 1000m = 1km
GROUP BY
  a.id,
  a.name
ORDER BY 
  school_count DESC,
  apartment_name
) TO '/users/jin/workMap/test-server1/database/school_count.csv' WITH CSV HEADER;