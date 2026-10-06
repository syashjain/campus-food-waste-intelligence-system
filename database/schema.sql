-- ============================================================================
-- CAMPUS FOOD WASTE INTELLIGENCE SYSTEM (CFWIS)
-- Enterprise Relational Schema & BCNF DDL Specification
-- Engine: PostgreSQL 15+ / PostGIS 3+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & SYSTEM DOMAINS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Custom Types & Enums
CREATE TYPE role_category AS ENUM (
    'SUPER_ADMIN',
    'CAMPUS_ADMIN',
    'MESS_MANAGER',
    'KITCHEN_STAFF',
    'PROCUREMENT_MANAGER',
    'ANALYST',
    'STUDENT'
);

CREATE TYPE meal_period AS ENUM (
    'BREAKFAST',
    'LUNCH',
    'SNACKS',
    'DINNER',
    'SPECIAL_EVENT'
);

CREATE TYPE measurement_unit AS ENUM (
    'KG',
    'LITRE',
    'GRAM',
    'PIECE',
    'PLATE',
    'SERVING'
);

CREATE TYPE waste_classification AS ENUM (
    'EDIBLE_LEFTOVER',
    'SPOILED_FOOD',
    'PREPARATION_WASTE',
    'SERVING_WASTE',
    'PLATE_WASTE',
    'OTHER'
);

CREATE TYPE operational_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE',
    'DECOMMISSIONED'
);

-- ----------------------------------------------------------------------------
-- 2. MASTER DATA ENTITIES (Boyce-Codd Normal Form)
-- ----------------------------------------------------------------------------

-- Table: campus (Master Tenant)
CREATE TABLE campus (
    campus_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    address TEXT,
    geom geometry(Point, 4326),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_campus_code_upper CHECK (campus_code = UPPER(campus_code))
);

-- Table: role
CREATE TABLE role (
    role_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_code role_category NOT NULL UNIQUE,
    role_name VARCHAR(50) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT TRUE
);

-- Table: facility (Mess / Cafeteria / Food Outlet)
CREATE TABLE facility (
    facility_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID NOT NULL REFERENCES campus(campus_id) ON DELETE RESTRICT,
    facility_code VARCHAR(30) NOT NULL,
    facility_name VARCHAR(150) NOT NULL,
    facility_type VARCHAR(50) NOT NULL CHECK (facility_type IN ('CENTRAL_MESS', 'HOSTEL_MESS', 'CAFETERIA', 'NIGHT_CANTEEN', 'FACULTY_CLUB')),
    dining_capacity INT NOT NULL CHECK (dining_capacity > 0),
    operating_status operational_status NOT NULL DEFAULT 'ACTIVE',
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    geom geometry(Point, 4326),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_campus_facility_code UNIQUE (campus_id, facility_code)
);

-- Table: food_pantry_partner (PostGIS Spatial Donation & Rescue Routing)
CREATE TABLE food_pantry_partner (
    pantry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID NOT NULL REFERENCES campus(campus_id) ON DELETE RESTRICT,
    partner_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20) NOT NULL,
    storage_capacity_kg NUMERIC(10, 2) NOT NULL CHECK (storage_capacity_kg >= 0),
    geom geometry(Point, 4326) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_account
CREATE TABLE user_account (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID NOT NULL REFERENCES campus(campus_id) ON DELETE RESTRICT,
    facility_id UUID REFERENCES facility(facility_id) ON DELETE SET NULL,
    role_id INT NOT NULL REFERENCES role(role_id) ON DELETE RESTRICT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: food_category
CREATE TABLE food_category (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_code VARCHAR(30) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: food_item (Master Data)
CREATE TABLE food_item (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES food_category(category_id) ON DELETE RESTRICT,
    item_code VARCHAR(30) NOT NULL UNIQUE,
    item_name VARCHAR(120) NOT NULL,
    standard_unit measurement_unit NOT NULL,
    standard_unit_cost NUMERIC(10, 2) NOT NULL CHECK (standard_unit_cost >= 0),
    average_density_kg_per_unit NUMERIC(8, 4) DEFAULT 1.0000 CHECK (average_density_kg_per_unit > 0),
    shelf_life_hours INT CHECK (shelf_life_hours > 0),
    is_perishable BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_item_name UNIQUE (category_id, item_name)
);

-- Table: meal
CREATE TABLE meal (
    meal_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    meal_code meal_period NOT NULL UNIQUE,
    meal_name VARCHAR(50) NOT NULL,
    typical_start_time TIME NOT NULL,
    typical_end_time TIME NOT NULL,
    display_order INT NOT NULL UNIQUE,
    CONSTRAINT chk_meal_time_order CHECK (typical_start_time < typical_end_time)
);

-- Table: waste_reason
CREATE TABLE waste_reason (
    reason_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reason_code VARCHAR(40) NOT NULL UNIQUE,
    reason_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('KITCHEN_OVERPRODUCTION', 'ATTENDANCE_DROP', 'RECIPE_QUALITY', 'SPOILAGE_STORAGE', 'SERVICE_RESIDUE', 'FORCE_MAJEURE')),
    is_preventable BOOLEAN NOT NULL DEFAULT TRUE,
    severity_rank INT NOT NULL DEFAULT 1 CHECK (severity_rank BETWEEN 1 AND 5),
    description TEXT
);

-- Table: disposal_method
CREATE TABLE disposal_method (
    method_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    method_code VARCHAR(40) NOT NULL UNIQUE,
    method_name VARCHAR(100) NOT NULL,
    environmental_score NUMERIC(4, 2) NOT NULL CHECK (environmental_score BETWEEN 0.0 AND 10.0),
    is_recovery BOOLEAN NOT NULL DEFAULT FALSE,
    carbon_offset_factor NUMERIC(6, 3) NOT NULL DEFAULT 0.000,
    description TEXT
);

-- Table: vendor
CREATE TABLE vendor (
    vendor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID NOT NULL REFERENCES campus(campus_id) ON DELETE RESTRICT,
    vendor_code VARCHAR(30) NOT NULL,
    vendor_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(120),
    tax_identifier VARCHAR(50),
    compliance_rating NUMERIC(3, 2) CHECK (compliance_rating BETWEEN 0.0 AND 5.0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_campus_vendor_code UNIQUE (campus_id, vendor_code)
);

-- Table: campus_event
CREATE TABLE campus_event (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID NOT NULL REFERENCES campus(campus_id) ON DELETE RESTRICT,
    facility_id UUID REFERENCES facility(facility_id) ON DELETE SET NULL,
    event_name VARCHAR(150) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('CULTURAL_FEST', 'EXAM_PERIOD', 'VACATION_DEPARTURE', 'SPORTS_MEET', 'ACADEMIC_CONFERENCE', 'HOLIDAY')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    expected_headcount_impact INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_event_dates CHECK (start_date <= end_date)
);

-- ----------------------------------------------------------------------------
-- 3. MENU & OPERATIONAL PLANNING ENTITIES
-- ----------------------------------------------------------------------------

-- Table: menu (Menu Header)
CREATE TABLE menu (
    menu_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facility(facility_id) ON DELETE RESTRICT,
    meal_id INT NOT NULL REFERENCES meal(meal_id) ON DELETE RESTRICT,
    menu_date DATE NOT NULL,
    version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
    expected_attendance INT NOT NULL CHECK (expected_attendance >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES user_account(user_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_facility_meal_date_version UNIQUE (facility_id, meal_id, menu_date, version)
);

-- Table: menu_item (Menu Lines)
CREATE TABLE menu_item (
    menu_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menu(menu_id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES food_item(item_id) ON DELETE RESTRICT,
    planned_quantity NUMERIC(10, 2) NOT NULL CHECK (planned_quantity >= 0),
    portion_size_grams NUMERIC(8, 2) CHECK (portion_size_grams > 0),
    unit measurement_unit NOT NULL,
    notes VARCHAR(255),
    CONSTRAINT uq_menu_food_item UNIQUE (menu_id, item_id)
);

-- ----------------------------------------------------------------------------
-- 4. HIGH-GROWTH OPERATIONAL ENTITIES (Partitioned Declaratively by Date)
-- ----------------------------------------------------------------------------

-- Table: attendance (Declarative Range Partitioning by attendance_date)
CREATE TABLE attendance (
    attendance_id UUID DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facility(facility_id) ON DELETE RESTRICT,
    meal_id INT NOT NULL REFERENCES meal(meal_id) ON DELETE RESTRICT,
    attendance_date DATE NOT NULL,
    expected_attendance INT NOT NULL CHECK (expected_attendance >= 0),
    actual_attendance INT NOT NULL CHECK (actual_attendance >= 0),
    variance_count INT GENERATED ALWAYS AS (actual_attendance - expected_attendance) STORED,
    event_id UUID REFERENCES campus_event(event_id) ON DELETE SET NULL,
    head_count_method VARCHAR(40) DEFAULT 'BIOMETRIC_TURNSTILE' CHECK (head_count_method IN ('BIOMETRIC_TURNSTILE', 'RFID_CARD', 'MANUAL_CLICKER', 'COUPON_TALLY')),
    recorded_by UUID NOT NULL REFERENCES user_account(user_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (attendance_id, attendance_date),
    CONSTRAINT uq_facility_meal_attendance_date UNIQUE (facility_id, meal_id, attendance_date)
) PARTITION BY RANGE (attendance_date);

-- Table: food_preparation
CREATE TABLE food_preparation (
    prep_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facility(facility_id) ON DELETE RESTRICT,
    menu_id UUID NOT NULL REFERENCES menu(menu_id) ON DELETE RESTRICT,
    item_id UUID NOT NULL REFERENCES food_item(item_id) ON DELETE RESTRICT,
    prep_date DATE NOT NULL,
    meal_id INT NOT NULL REFERENCES meal(meal_id) ON DELETE RESTRICT,
    prepared_quantity NUMERIC(10, 2) NOT NULL CHECK (prepared_quantity >= 0),
    unit measurement_unit NOT NULL,
    prep_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    batch_number VARCHAR(30) NOT NULL,
    prepared_by UUID NOT NULL REFERENCES user_account(user_id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_facility_prep_item_batch UNIQUE (facility_id, prep_date, meal_id, item_id, batch_number)
);

-- Table: food_consumption
CREATE TABLE food_consumption (
    consumption_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prep_id UUID NOT NULL REFERENCES food_preparation(prep_id) ON DELETE RESTRICT,
    consumed_quantity NUMERIC(10, 2) NOT NULL CHECK (consumed_quantity >= 0),
    unit measurement_unit NOT NULL,
    measurement_type VARCHAR(20) NOT NULL CHECK (measurement_type IN ('ACTUAL_SCALE', 'ESTIMATED_TALLY')),
    recorded_by UUID NOT NULL REFERENCES user_account(user_id) ON DELETE RESTRICT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT uq_prep_consumption UNIQUE (prep_id)
);

-- Table: food_waste (Declarative Range Partitioning by waste_date)
CREATE TABLE food_waste (
    waste_id UUID DEFAULT uuid_generate_v4(),
    prep_id UUID NOT NULL REFERENCES food_preparation(prep_id) ON DELETE RESTRICT,
    facility_id UUID NOT NULL REFERENCES facility(facility_id) ON DELETE RESTRICT,
    item_id UUID NOT NULL REFERENCES food_item(item_id) ON DELETE RESTRICT,
    meal_id INT NOT NULL REFERENCES meal(meal_id) ON DELETE RESTRICT,
    waste_date DATE NOT NULL,
    waste_quantity NUMERIC(10, 2) NOT NULL CHECK (waste_quantity >= 0),
    unit measurement_unit NOT NULL,
    waste_category waste_classification NOT NULL,
    reason_id INT NOT NULL REFERENCES waste_reason(reason_id) ON DELETE RESTRICT,
    method_id INT REFERENCES disposal_method(method_id) ON DELETE SET NULL,
    pantry_partner_id UUID REFERENCES food_pantry_partner(pantry_id) ON DELETE SET NULL,
    unit_cost_snapshot NUMERIC(10, 2) NOT NULL CHECK (unit_cost_snapshot >= 0),
    estimated_waste_cost NUMERIC(12, 2) NOT NULL CHECK (estimated_waste_cost >= 0),
    reported_by UUID NOT NULL REFERENCES user_account(user_id) ON DELETE RESTRICT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (waste_id, waste_date)
) PARTITION BY RANGE (waste_date);

-- Declarative Partition Table Definitions (2026 Quarters)
CREATE TABLE food_waste_2026_q1 PARTITION OF food_waste
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE food_waste_2026_q2 PARTITION OF food_waste
    FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

CREATE TABLE food_waste_2026_q3 PARTITION OF food_waste
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');

CREATE TABLE food_waste_2026_q4 PARTITION OF food_waste
    FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

CREATE TABLE attendance_2026_q1 PARTITION OF attendance
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE attendance_2026_q2 PARTITION OF attendance
    FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

CREATE TABLE attendance_2026_q3 PARTITION OF attendance
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');

CREATE TABLE attendance_2026_q4 PARTITION OF attendance
    FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

-- ----------------------------------------------------------------------------
-- 5. PROCUREMENT & VENDOR INVOICING
-- ----------------------------------------------------------------------------

-- Table: purchase (Header)
CREATE TABLE purchase (
    purchase_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID NOT NULL REFERENCES campus(campus_id) ON DELETE RESTRICT,
    vendor_id UUID NOT NULL REFERENCES vendor(vendor_id) ON DELETE RESTRICT,
    po_number VARCHAR(50) NOT NULL,
    invoice_number VARCHAR(50),
    purchase_date DATE NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED')),
    created_by UUID NOT NULL REFERENCES user_account(user_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_campus_po_number UNIQUE (campus_id, po_number)
);

-- Table: purchase_item (Lines)
CREATE TABLE purchase_item (
    purchase_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchase(purchase_id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES food_item(item_id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit measurement_unit NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    tax_percentage NUMERIC(5, 2) DEFAULT 0.00 CHECK (tax_percentage >= 0),
    line_total NUMERIC(12, 2) GENERATED ALWAYS AS (ROUND(quantity * unit_price * (1 + (tax_percentage / 100)), 2)) STORED,
    batch_number VARCHAR(50),
    expiry_date DATE,
    CONSTRAINT uq_purchase_line UNIQUE (purchase_id, item_id)
);

-- ----------------------------------------------------------------------------
-- 6. AUDIT TRAIL & SYSTEM LOGGING
-- ----------------------------------------------------------------------------

CREATE TABLE audit_log (
    audit_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    campus_id UUID REFERENCES campus(campus_id) ON DELETE CASCADE,
    table_name VARCHAR(60) NOT NULL,
    operation_type VARCHAR(10) NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE', 'ROLLBACK')),
    record_pk UUID,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES user_account(user_id) ON DELETE SET NULL,
    ip_address INET,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 7. ROW-LEVEL SECURITY (RLS) POLICIES FOR ENTERPRISE MULTI-TENANCY
-- ----------------------------------------------------------------------------
ALTER TABLE facility ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_preparation ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_waste ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policies using session variables
CREATE POLICY tenant_isolation_facility ON facility
    USING (
        current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
        OR campus_id = NULLIF(current_setting('app.current_campus_id', true), '')::UUID
    );

CREATE POLICY tenant_isolation_menu ON menu
    USING (
        current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
        OR facility_id IN (
            SELECT f.facility_id FROM facility f 
            WHERE f.campus_id = NULLIF(current_setting('app.current_campus_id', true), '')::UUID
        )
    );

CREATE POLICY tenant_isolation_prep ON food_preparation
    USING (
        current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
        OR facility_id IN (
            SELECT f.facility_id FROM facility f 
            WHERE f.campus_id = NULLIF(current_setting('app.current_campus_id', true), '')::UUID
        )
    );

CREATE POLICY tenant_isolation_waste ON food_waste
    USING (
        current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
        OR facility_id IN (
            SELECT f.facility_id FROM facility f 
            WHERE f.campus_id = NULLIF(current_setting('app.current_campus_id', true), '')::UUID
        )
    );

CREATE POLICY tenant_isolation_purchase ON purchase
    USING (
        current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
        OR campus_id = NULLIF(current_setting('app.current_campus_id', true), '')::UUID
    );
