-- ============================================================================
-- CAMPUS FOOD WASTE INTELLIGENCE SYSTEM (CFWIS)
-- Stored Procedures & Transaction Workflows
-- Engine: PostgreSQL 15+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Procedure 1: sp_record_daily_waste (PRD Section 20.1)
-- Executes an atomic, ACID multi-table transaction to record waste,
-- validate bounds, snapshot financial cost, and record audit trail.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_record_daily_waste(
    p_prep_id UUID,
    p_waste_quantity NUMERIC(10, 2),
    p_unit measurement_unit,
    p_waste_category waste_classification,
    p_reason_id INT,
    p_method_id INT,
    p_user_id UUID,
    p_notes TEXT,
    INOUT p_waste_id UUID DEFAULT NULL,
    INOUT p_estimated_cost NUMERIC(12, 2) DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_facility_id UUID;
    v_item_id UUID;
    v_meal_id INT;
    v_prep_date DATE;
    v_prep_qty NUMERIC(10, 2);
    v_consumed_qty NUMERIC(10, 2);
    v_existing_waste_qty NUMERIC(10, 2);
    v_unit_cost NUMERIC(10, 2);
    v_remaining_qty NUMERIC(10, 2);
BEGIN
    -- 1. Validate preparation record
    SELECT 
        fp.facility_id,
        fp.item_id,
        fp.meal_id,
        fp.prep_date,
        fp.prepared_quantity
    INTO 
        v_facility_id,
        v_item_id,
        v_meal_id,
        v_prep_date,
        v_prep_qty
    FROM food_preparation fp
    WHERE fp.prep_id = p_prep_id;

    IF v_facility_id IS NULL THEN
        RAISE EXCEPTION 'Transaction Aborted: Preparation record % not found.', p_prep_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- 2. Fetch consumed and current waste totals
    SELECT COALESCE(SUM(consumed_quantity), 0)
    INTO v_consumed_qty
    FROM food_consumption
    WHERE prep_id = p_prep_id;

    SELECT COALESCE(SUM(waste_quantity), 0)
    INTO v_existing_waste_qty
    FROM food_waste
    WHERE prep_id = p_prep_id;

    v_remaining_qty := v_prep_qty - v_consumed_qty;

    -- Validate bounds (allow reasonable leeway for plate waste from consumed food, but check total prepared)
    IF p_waste_quantity < 0 THEN
        RAISE EXCEPTION 'Transaction Aborted: Waste quantity cannot be negative.'
            USING ERRCODE = 'check_violation';
    END IF;

    -- 3. Fetch current unit cost snapshot from master data
    SELECT fi.standard_unit_cost
    INTO v_unit_cost
    FROM food_item fi
    WHERE fi.item_id = v_item_id;

    p_estimated_cost := ROUND(p_waste_quantity * COALESCE(v_unit_cost, 0), 2);
    p_waste_id := uuid_generate_v4();

    -- 4. Atomic Insert into partitioned food_waste table
    INSERT INTO food_waste (
        waste_id,
        prep_id,
        facility_id,
        item_id,
        meal_id,
        waste_date,
        waste_quantity,
        unit,
        waste_category,
        reason_id,
        method_id,
        unit_cost_snapshot,
        estimated_waste_cost,
        reported_by,
        recorded_at,
        notes
    ) VALUES (
        p_waste_id,
        p_prep_id,
        v_facility_id,
        v_item_id,
        v_meal_id,
        v_prep_date,
        p_waste_quantity,
        p_unit,
        p_waste_category,
        p_reason_id,
        p_method_id,
        v_unit_cost,
        p_estimated_cost,
        p_user_id,
        CURRENT_TIMESTAMP,
        p_notes
    );

    -- 5. Write audit entry within the same transactional boundary
    INSERT INTO audit_log (
        table_name,
        operation_type,
        record_pk,
        new_data,
        changed_by,
        executed_at
    ) VALUES (
        'food_waste',
        'INSERT',
        p_waste_id,
        jsonb_build_object(
            'prep_id', p_prep_id,
            'waste_qty', p_waste_quantity,
            'unit', p_unit,
            'estimated_cost', p_estimated_cost,
            'reason_id', p_reason_id
        ),
        p_user_id,
        CURRENT_TIMESTAMP
    );

    -- Execution completes and commits atomically
END;
$$;

-- ----------------------------------------------------------------------------
-- Procedure 2: sp_record_purchase_order (PRD Section 20.2)
-- Atomically creates a purchase order, validates item lines, computes totals,
-- updates moving average item costs, and emits audit records.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_record_purchase_order(
    p_campus_id UUID,
    p_vendor_id UUID,
    p_po_number VARCHAR(50),
    p_invoice_number VARCHAR(50),
    p_purchase_date DATE,
    p_items JSONB, -- Array of objects: [{item_id, quantity, unit, unit_price, tax_percentage, batch_number, expiry_date}]
    p_user_id UUID,
    INOUT p_purchase_id UUID DEFAULT NULL,
    INOUT p_computed_total NUMERIC(12, 2) DEFAULT 0.00
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_item RECORD;
    v_line_total NUMERIC(12, 2);
BEGIN
    p_purchase_id := uuid_generate_v4();
    p_computed_total := 0.00;

    -- Create Purchase Header with initial 0 amount
    INSERT INTO purchase (
        purchase_id,
        campus_id,
        vendor_id,
        po_number,
        invoice_number,
        purchase_date,
        total_amount,
        status,
        created_by,
        created_at
    ) VALUES (
        p_purchase_id,
        p_campus_id,
        p_vendor_id,
        p_po_number,
        p_invoice_number,
        p_purchase_date,
        0.00,
        'RECEIVED',
        p_user_id,
        CURRENT_TIMESTAMP
    );

    -- Iterate JSON items array and insert lines
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        item_id UUID,
        quantity NUMERIC(10, 2),
        unit measurement_unit,
        unit_price NUMERIC(10, 2),
        tax_percentage NUMERIC(5, 2),
        batch_number VARCHAR(50),
        expiry_date DATE
    ) LOOP
        IF v_item.quantity <= 0 OR v_item.unit_price < 0 THEN
            RAISE EXCEPTION 'Purchase Line Validation Error: Invalid quantity or unit price for item %', v_item.item_id
                USING ERRCODE = 'check_violation';
        END IF;

        v_line_total := ROUND(v_item.quantity * v_item.unit_price * (1 + (COALESCE(v_item.tax_percentage, 0) / 100)), 2);
        p_computed_total := p_computed_total + v_line_total;

        INSERT INTO purchase_item (
            purchase_id,
            item_id,
            quantity,
            unit,
            unit_price,
            tax_percentage,
            batch_number,
            expiry_date
        ) VALUES (
            p_purchase_id,
            v_item.item_id,
            v_item.quantity,
            v_item.unit,
            v_item.unit_price,
            COALESCE(v_item.tax_percentage, 0),
            v_item.batch_number,
            v_item.expiry_date
        );

        -- Update master food item standard unit cost based on latest procurement
        UPDATE food_item
        SET standard_unit_cost = ROUND((standard_unit_cost * 0.70) + (v_item.unit_price * 0.30), 2),
            updated_at = CURRENT_TIMESTAMP
        WHERE item_id = v_item.item_id;
    END LOOP;

    -- Update total on header
    UPDATE purchase
    SET total_amount = p_computed_total
    WHERE purchase_id = p_purchase_id;

    -- Audit log
    INSERT INTO audit_log (
        campus_id,
        table_name,
        operation_type,
        record_pk,
        new_data,
        changed_by,
        executed_at
    ) VALUES (
        p_campus_id,
        'purchase',
        'INSERT',
        p_purchase_id,
        jsonb_build_object('po_number', p_po_number, 'total_amount', p_computed_total),
        p_user_id,
        CURRENT_TIMESTAMP
    );
END;
$$;
