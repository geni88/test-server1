  /*
  -- PostGIS 확장 기능 활성화
-- CREATE EXTENSION postgis;

    -- 공간 참조 시스템 확인 (일반적으로 WGS84 사용)
SELECT * FROM spatial_ref_sys WHERE srid = 4326;

-- 학교 테이블 생성
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    geom GEOGRAPHY(POINT, 4326)
);

-- 아파트 테이블 생성
CREATE TABLE apartments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    address VARCHAR(200),
    geom GEOGRAPHY(POINT, 4326)
);

-- 학교 데이터 입력 (예시)
INSERT INTO schools (name, geom) VALUES
('서울초등학교', ST_MakePoint(126.984200, 37.563273)::geography),
('강남중학교', ST_MakePoint(127.028000, 37.497000)::geography);

-- 아파트 데이터 입력 (예시)
INSERT INTO apartments (name, address, geom) VALUES
('래미안아파트', '서울특별시 중구 세종대로 110', ST_MakePoint(126.978388, 37.566610)::geography),
('힐스테이트', '서울특별시 강남구 테헤란로 521', ST_MakePoint(127.039000, 37.501000)::geography);
*/
-- 특정 아파트에서 모든 학교까지의 거리 (미터 단위)
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
    a.name = '래미안아파트'
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


