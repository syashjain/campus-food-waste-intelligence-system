-- ============================================================================
-- CAMPUS FOOD WASTE INTELLIGENCE SYSTEM (CFWIS)
-- Advanced Indexing Architecture: B-Tree, BRIN, GIN, and GiST
-- Engine: PostgreSQL 15+ / PostGIS 3+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. B-TREE INDEXES (High-cardinality equality, range, and FK constraints)
-- ----------------------------------------------------------------------------

-- Foreign Key Acceleration & Join Optimization
CREATE INDEX idx_facility_campus_id ON facility(campus_id);
CREATE INDEX idx_user_account_campus_id ON user_account(campus_id);
CREATE INDEX idx_user_account_facility_id ON user_account(facility_id);
CREATE INDEX idx_food_item_category_id ON food_item(category_id);
CREATE INDEX idx_menu_facility_date ON menu(facility_id, menu_date);
CREATE INDEX idx_menu_item_menu_id ON menu_item(menu_id);
CREATE INDEX idx_menu_item_item_id ON menu_item(item_id);

-- Operational Query Composite B-Tree Indexes
CREATE INDEX idx_food_prep_facility_date_meal 
    ON food_preparation(facility_id, prep_date, meal_id);

CREATE INDEX idx_food_prep_item_id 
    ON food_preparation(item_id);

CREATE INDEX idx_food_consumption_prep_id 
    ON food_consumption(prep_id);

CREATE INDEX idx_food_waste_facility_item_date 
    ON food_waste(facility_id, item_id, waste_date);

CREATE INDEX idx_food_waste_reason_id 
    ON food_waste(reason_id);

CREATE INDEX idx_attendance_facility_date 
    ON attendance(facility_id, attendance_date);

CREATE INDEX idx_purchase_campus_date 
    ON purchase(campus_id, purchase_date);

CREATE INDEX idx_purchase_item_purchase_id 
    ON purchase_item(purchase_id);

-- ----------------------------------------------------------------------------
-- 2. BRIN (BLOCK RANGE INDEXES) FOR SEQUENTIAL TIME-SERIES PARTITIONS
-- Architectural justification: On large, continuously appended append-only logs,
-- BRIN tracks min/max values per 128 disk pages. Footprint is ~99% smaller than B-Tree,
-- fitting entirely in PostgreSQL shared_buffers cache.
-- ----------------------------------------------------------------------------
CREATE INDEX idx_brin_food_waste_date 
    ON food_waste USING BRIN (waste_date) 
    WITH (pages_per_range = 32);

CREATE INDEX idx_brin_attendance_date 
    ON attendance USING BRIN (attendance_date) 
    WITH (pages_per_range = 32);

CREATE INDEX idx_brin_audit_log_executed_at 
    ON audit_log USING BRIN (executed_at) 
    WITH (pages_per_range = 64);

-- ----------------------------------------------------------------------------
-- 3. GIN (GENERALIZED INVERTED INDEXES) FOR UNSTRUCTURED / JSONB / TEXT
-- ----------------------------------------------------------------------------

-- GIN JSONB Path Index on Audit Log Changes
CREATE INDEX idx_gin_audit_new_data 
    ON audit_log USING GIN (new_data jsonb_path_ops);

CREATE INDEX idx_gin_audit_old_data 
    ON audit_log USING GIN (old_data jsonb_path_ops);

-- GIN Trigram Search on Food Item Names (supports fuzzy ILIKE '%query%' in sub-millisecond)
CREATE INDEX idx_gin_food_item_trgm 
    ON food_item USING GIN (item_name gin_trgm_ops);

CREATE INDEX idx_gin_facility_trgm 
    ON facility USING GIN (facility_name gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- 4. GiST (GENERALIZED SEARCH TREE) INDEXES FOR SPATIAL R-TREE PROCESSING
-- Enables bounding-box intersections and R-Tree nearest-neighbor queries
-- for PostGIS ST_Distance, ST_DWithin, and ST_Contains.
-- ----------------------------------------------------------------------------
CREATE INDEX idx_gist_campus_geom 
    ON campus USING GIST (geom);

CREATE INDEX idx_gist_facility_geom 
    ON facility USING GIST (geom);

CREATE INDEX idx_gist_pantry_geom 
    ON food_pantry_partner USING GIST (geom);
