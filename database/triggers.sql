-- ============================================================================
-- CAMPUS FOOD WASTE INTELLIGENCE SYSTEM (CFWIS)
-- Database Triggers & Data Integrity Enforcement
-- Engine: PostgreSQL 15+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Trigger 1: validate_consumption_quantity (PRD Section 18)
-- Prevents recorded consumption from exceeding total prepared food quantity
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_validate_consumption_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_prepared_qty NUMERIC(10, 2);
    v_item_name VARCHAR(120);
BEGIN
    SELECT fp.prepared_quantity, fi.item_name
    INTO v_prepared_qty, v_item_name
    FROM food_preparation fp
    JOIN food_item fi ON fp.item_id = fi.item_id
    WHERE fp.prep_id = NEW.prep_id;

    IF v_prepared_qty IS NULL THEN
        RAISE EXCEPTION 'Preparation record % does not exist.', NEW.prep_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    IF NEW.consumed_quantity > v_prepared_qty THEN
        RAISE EXCEPTION 'Integrity Violation: Consumed quantity (%) cannot exceed prepared quantity (%) for item "%".',
            NEW.consumed_quantity, v_prepared_qty, v_item_name
            USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.consumed_quantity < 0 THEN
        RAISE EXCEPTION 'Integrity Violation: Consumed quantity cannot be negative.'
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chk_consumption ON food_consumption;
CREATE TRIGGER trg_chk_consumption
    BEFORE INSERT OR UPDATE ON food_consumption
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_consumption_quantity();

-- ----------------------------------------------------------------------------
-- Trigger 2: calculate_waste_cost_snapshot (PRD Section 18)
-- Automatically snapshots item unit cost and calculates estimated waste cost
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_calculate_waste_cost_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_unit_cost NUMERIC(10, 2);
    v_is_active BOOLEAN;
    v_facility_active BOOLEAN;
BEGIN
    -- Validate food item active status (PRD Section 11 Rule 10)
    SELECT fi.standard_unit_cost, fi.is_active
    INTO v_unit_cost, v_is_active
    FROM food_item fi
    WHERE fi.item_id = NEW.item_id;

    IF v_is_active = FALSE THEN
        RAISE EXCEPTION 'Business Rule Violation: Deactivated food item cannot receive new waste entries.'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    -- Validate facility active status (PRD Section 11 Rule 11)
    SELECT f.is_active
    INTO v_facility_active
    FROM facility f
    WHERE f.facility_id = NEW.facility_id;

    IF v_facility_active = FALSE THEN
        RAISE EXCEPTION 'Business Rule Violation: Deactivated facility cannot record new waste events.'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    -- If snapshot not provided, snapshot current standard cost basis
    IF NEW.unit_cost_snapshot IS NULL OR NEW.unit_cost_snapshot = 0 THEN
        NEW.unit_cost_snapshot := COALESCE(v_unit_cost, 0);
    END IF;

    -- Compute estimated financial waste cost
    NEW.estimated_waste_cost := ROUND(NEW.waste_quantity * NEW.unit_cost_snapshot, 2);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_waste_cost_snapshot ON food_waste;
CREATE TRIGGER trg_waste_cost_snapshot
    BEFORE INSERT OR UPDATE ON food_waste
    FOR EACH ROW
    EXECUTE FUNCTION trg_calculate_waste_cost_snapshot();

-- ----------------------------------------------------------------------------
-- Trigger 3: audit_sensitive_update (PRD Section 18 & 21)
-- Logs administrative mutations, master data edits, and critical deletions
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_audit_sensitive_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
    v_op_type VARCHAR(10);
    v_old JSONB := NULL;
    v_new JSONB := NULL;
    v_pk UUID := NULL;
BEGIN
    v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::UUID;

    IF TG_OP = 'INSERT' THEN
        v_op_type := 'INSERT';
        v_new := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_op_type := 'UPDATE';
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_op_type := 'DELETE';
        v_old := to_jsonb(OLD);
    END IF;

    INSERT INTO audit_log (
        table_name,
        operation_type,
        old_data,
        new_data,
        changed_by,
        executed_at
    ) VALUES (
        TG_TABLE_NAME,
        v_op_type,
        v_old,
        v_new,
        v_user_id,
        CURRENT_TIMESTAMP
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_facility ON facility;
CREATE TRIGGER trg_audit_facility
    AFTER UPDATE OR DELETE ON facility
    FOR EACH ROW
    EXECUTE FUNCTION trg_audit_sensitive_update();

DROP TRIGGER IF EXISTS trg_audit_food_item ON food_item;
CREATE TRIGGER trg_audit_food_item
    AFTER UPDATE OR DELETE ON food_item
    FOR EACH ROW
    EXECUTE FUNCTION trg_audit_sensitive_update();

DROP TRIGGER IF EXISTS trg_audit_food_waste ON food_waste;
CREATE TRIGGER trg_audit_food_waste
    AFTER UPDATE OR DELETE ON food_waste
    FOR EACH ROW
    EXECUTE FUNCTION trg_audit_sensitive_update();

-- ----------------------------------------------------------------------------
-- Trigger 4: prevent_invalid_negative_quantity (PRD Section 18)
-- Defensive validation guarding against zero-floor breaches
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_prevent_invalid_negative_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.prepared_quantity < 0 THEN
        RAISE EXCEPTION 'Check Violation: Prepared quantity (%) cannot be negative.', NEW.prepared_quantity
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chk_prep_qty ON food_preparation;
CREATE TRIGGER trg_chk_prep_qty
    BEFORE INSERT OR UPDATE ON food_preparation
    FOR EACH ROW
    EXECUTE FUNCTION trg_prevent_invalid_negative_quantity();
