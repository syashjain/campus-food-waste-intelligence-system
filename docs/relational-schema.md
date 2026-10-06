# Campus Food Waste Intelligence System (CFWIS)
## Relational Schema Specification & Data Dictionary

This document details the relational schema, attribute domains, primary keys, foreign keys, and integrity constraints in accordance with **Boyce-Codd Normal Form (BCNF)** standards.

---

### 1. Master & Administrative Relations

#### `campus`
- **Description:** Master institutional campus tenant.
- **Attributes:**
  - `campus_id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
  - `campus_code` (VARCHAR(20), NOT NULL, UNIQUE, Upper-case CHECK)
  - `name` (VARCHAR(150), NOT NULL)
  - `city` (VARCHAR(100), NOT NULL)
  - `state` (VARCHAR(50), NOT NULL)
  - `country` (VARCHAR(50), DEFAULT 'India')
  - `address` (TEXT)
  - `geom` (geometry(Point, 4326), PostGIS WGS84 Centroid)
  - `is_active` (BOOLEAN, DEFAULT TRUE)
  - `created_at`, `updated_at` (TIMESTAMPTZ)
- **Candidate Keys:** `{campus_id}`, `{campus_code}`
- **Foreign Keys:** None

#### `facility`
- **Description:** Dining hall, mess, cafeteria, or night canteen operating under a campus.
- **Attributes:**
  - `facility_id` (UUID, Primary Key)
  - `campus_id` (UUID, Foreign Key &rarr; `campus.campus_id`, ON DELETE RESTRICT)
  - `facility_code` (VARCHAR(30), NOT NULL)
  - `facility_name` (VARCHAR(150), NOT NULL)
  - `facility_type` (VARCHAR(50), CHECK: CENTRAL_MESS, HOSTEL_MESS, CAFETERIA, NIGHT_CANTEEN)
  - `dining_capacity` (INT, CHECK > 0)
  - `operating_status` (operational_status, DEFAULT 'ACTIVE')
  - `geom` (geometry(Point, 4326), PostGIS Facility Entrance Location)
  - `is_active` (BOOLEAN, DEFAULT TRUE)
- **Candidate Keys:** `{facility_id}`, `{(campus_id, facility_code)}`
- **Foreign Keys:** `campus_id` &rarr; `campus`

#### `user_account`
- **Description:** Authenticated staff, managers, administrators, and students.
- **Attributes:**
  - `user_id` (UUID, Primary Key)
  - `campus_id` (UUID, Foreign Key &rarr; `campus.campus_id`)
  - `facility_id` (UUID, Foreign Key &rarr; `facility.facility_id`, NULLABLE)
  - `role_id` (INT, Foreign Key &rarr; `role.role_id`)
  - `username` (VARCHAR(50), UNIQUE)
  - `email` (VARCHAR(120), UNIQUE)
  - `password_hash` (VARCHAR(255), Bcrypt/Argon2 hash)
  - `full_name` (VARCHAR(120), NOT NULL)

---

### 2. Food & Menu Specification

#### `food_category`
- **Attributes:** `category_id` (PK), `category_code` (UK), `category_name` (UK), `description`, `is_active`
- **Candidate Keys:** `{category_id}`, `{category_code}`, `{category_name}`

#### `food_item`
- **Attributes:**
  - `item_id` (UUID, PK)
  - `category_id` (UUID, FK &rarr; `food_category`)
  - `item_code` (VARCHAR(30), UK)
  - `item_name` (VARCHAR(120), NOT NULL)
  - `standard_unit` (measurement_unit: KG, LITRE, GRAM, PIECE, PLATE, SERVING)
  - `standard_unit_cost` (NUMERIC(10, 2), CHECK &ge; 0)
  - `is_perishable` (BOOLEAN, DEFAULT TRUE)
  - `is_active` (BOOLEAN, DEFAULT TRUE)
- **Integrity Rule:** `uq_category_item_name UNIQUE (category_id, item_name)`

#### `menu` & `menu_item`
- **Menu Header:** `menu_id` (PK), `facility_id` (FK), `meal_id` (FK), `menu_date`, `version`, `expected_attendance`. Unique on `(facility_id, meal_id, menu_date, version)`.
- **Menu Lines:** `menu_item_id` (PK), `menu_id` (FK, CASCADE), `item_id` (FK, RESTRICT), `planned_quantity`, `portion_size_grams`, `unit`. Unique on `(menu_id, item_id)`.

---

### 3. Operational Transactions & High-Growth Tables

#### `food_preparation`
- **Attributes:** `prep_id` (PK), `facility_id` (FK), `menu_id` (FK), `item_id` (FK), `prep_date`, `meal_id` (FK), `prepared_quantity` (&ge; 0), `unit`, `batch_number`, `prepared_by` (FK).
- **Candidate Key:** `{prep_id}`, `{(facility_id, prep_date, meal_id, item_id, batch_number)}`

#### `food_consumption`
- **Attributes:** `consumption_id` (PK), `prep_id` (FK, UNIQUE), `consumed_quantity` (&ge; 0), `unit`, `measurement_type`, `recorded_by`, `recorded_at`.
- **Integrity Constraint Enforced by Trigger:** `consumed_quantity <= food_preparation.prepared_quantity`.

#### `food_waste` (Declaratively Partitioned by `waste_date`)
- **Attributes:** `waste_id` (PK), `waste_date` (PK), `prep_id` (FK), `facility_id` (FK), `item_id` (FK), `meal_id` (FK), `waste_quantity` (&ge; 0), `unit`, `waste_category`, `reason_id` (FK), `method_id` (FK), `unit_cost_snapshot`, `estimated_waste_cost`, `reported_by` (FK).
- **Partition Scheme:** Range partitioned into quarterly tables (`food_waste_2026_q1`, `q2`, `q3`, `q4`).
- **Snapshotted Derivation:** `estimated_waste_cost = waste_quantity * unit_cost_snapshot`.

#### `attendance` (Declaratively Partitioned by `attendance_date`)
- **Attributes:** `attendance_id` (PK), `attendance_date` (PK), `facility_id` (FK), `meal_id` (FK), `expected_attendance` (&ge; 0), `actual_attendance` (&ge; 0), `variance_count` (GENERATED ALWAYS AS `actual - expected` STORED), `head_count_method`.

---

### 4. Logistics & Auditing

#### `food_pantry_partner`
- **Attributes:** `pantry_id` (PK), `campus_id` (FK), `partner_name`, `contact_person`, `contact_phone`, `storage_capacity_kg`, `geom` (geometry(Point, 4326), NOT NULL).
- **Spatial Index:** GiST R-Tree on `geom`.

#### `audit_log`
- **Attributes:** `audit_id` (BIGINT PK), `campus_id` (FK), `table_name`, `operation_type` (INSERT, UPDATE, DELETE, ROLLBACK), `record_pk` (UUID), `old_data` (JSONB), `new_data` (JSONB), `changed_by` (FK), `executed_at` (TIMESTAMPTZ).
- **Index:** GIN index on `new_data` and `old_data` via `jsonb_path_ops`.
