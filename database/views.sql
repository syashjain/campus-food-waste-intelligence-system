-- ============================================================================
-- CAMPUS FOOD WASTE INTELLIGENCE SYSTEM (CFWIS)
-- Enterprise Analytics & Reporting Views
-- Engine: PostgreSQL 15+ / PostGIS 3+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View 1: Daily Waste Summary
-- PRD Section 19: vw_daily_waste_summary
-- Aggregates daily operational metrics across facilities, meals, and quantities
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_daily_waste_summary AS
WITH daily_prep AS (
    SELECT 
        fp.prep_date,
        fp.facility_id,
        f.facility_name,
        c.campus_id,
        c.name AS campus_name,
        fp.meal_id,
        m.meal_name,
        COUNT(DISTINCT fp.prep_id) AS total_prep_batches,
        COALESCE(SUM(fp.prepared_quantity), 0) AS total_prepared_qty
    FROM food_preparation fp
    JOIN facility f ON fp.facility_id = f.facility_id
    JOIN campus c ON f.campus_id = c.campus_id
    JOIN meal m ON fp.meal_id = m.meal_id
    GROUP BY fp.prep_date, fp.facility_id, f.facility_name, c.campus_id, c.name, fp.meal_id, m.meal_name
),
daily_cons AS (
    SELECT 
        fp.prep_date,
        fp.facility_id,
        fp.meal_id,
        COALESCE(SUM(fc.consumed_quantity), 0) AS total_consumed_qty
    FROM food_consumption fc
    JOIN food_preparation fp ON fc.prep_id = fp.prep_id
    GROUP BY fp.prep_date, fp.facility_id, fp.meal_id
),
daily_waste AS (
    SELECT 
        fw.waste_date,
        fw.facility_id,
        fw.meal_id,
        COALESCE(SUM(fw.waste_quantity), 0) AS total_waste_qty,
        COALESCE(SUM(fw.estimated_waste_cost), 0) AS total_waste_cost,
        COUNT(fw.waste_id) AS waste_incident_count
    FROM food_waste fw
    GROUP BY fw.waste_date, fw.facility_id, fw.meal_id
),
daily_att AS (
    SELECT 
        a.attendance_date,
        a.facility_id,
        a.meal_id,
        a.expected_attendance,
        a.actual_attendance,
        a.variance_count
    FROM attendance a
)
SELECT 
    p.prep_date AS operation_date,
    p.campus_id,
    p.campus_name,
    p.facility_id,
    p.facility_name,
    p.meal_id,
    p.meal_name,
    p.total_prep_batches,
    p.total_prepared_qty,
    COALESCE(c.total_consumed_qty, 0) AS total_consumed_qty,
    COALESCE(w.total_waste_qty, 0) AS total_waste_qty,
    GREATEST(0, (p.total_prepared_qty - COALESCE(c.total_consumed_qty, 0) - COALESCE(w.total_waste_qty, 0))) AS salvage_surplus_qty,
    ROUND(
        CASE 
            WHEN p.total_prepared_qty > 0 
            THEN (COALESCE(w.total_waste_qty, 0) / p.total_prepared_qty) * 100 
            ELSE 0 
        END, 
        2
    ) AS waste_percentage,
    COALESCE(w.total_waste_cost, 0) AS total_waste_cost,
    COALESCE(w.waste_incident_count, 0) AS waste_incident_count,
    COALESCE(att.expected_attendance, 0) AS expected_attendance,
    COALESCE(att.actual_attendance, 0) AS actual_attendance,
    COALESCE(att.variance_count, 0) AS attendance_variance
FROM daily_prep p
LEFT JOIN daily_cons c ON p.prep_date = c.prep_date AND p.facility_id = c.facility_id AND p.meal_id = c.meal_id
LEFT JOIN daily_waste w ON p.prep_date = w.waste_date AND p.facility_id = w.facility_id AND p.meal_id = w.meal_id
LEFT JOIN daily_att att ON p.prep_date = att.attendance_date AND p.facility_id = att.facility_id AND p.meal_id = att.meal_id;

-- ----------------------------------------------------------------------------
-- View 2: Food Item Waste Analysis
-- PRD Section 19: vw_food_item_waste_analysis
-- Granular item-level analytics with ranking, volatility, and financial loss
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_food_item_waste_analysis AS
WITH item_prep AS (
    SELECT 
        fp.item_id,
        COUNT(DISTINCT fp.prep_id) AS times_prepared,
        COALESCE(SUM(fp.prepared_quantity), 0) AS total_prepared_qty
    FROM food_preparation fp
    GROUP BY fp.item_id
),
item_waste AS (
    SELECT 
        fw.item_id,
        COUNT(fw.waste_id) AS waste_incidents,
        COALESCE(SUM(fw.waste_quantity), 0) AS total_waste_qty,
        COALESCE(SUM(fw.estimated_waste_cost), 0) AS total_financial_loss,
        ROUND(AVG(fw.unit_cost_snapshot), 2) AS avg_unit_cost_snapshot,
        MODE() WITHIN GROUP (ORDER BY wr.reason_name) AS primary_waste_reason
    FROM food_waste fw
    JOIN waste_reason wr ON fw.reason_id = wr.reason_id
    GROUP BY fw.item_id
)
SELECT 
    fi.item_id,
    fi.item_code,
    fi.item_name,
    fc.category_name,
    fi.standard_unit,
    fi.standard_unit_cost,
    fi.is_perishable,
    COALESCE(ip.times_prepared, 0) AS times_prepared,
    COALESCE(ip.total_prepared_qty, 0) AS total_prepared_qty,
    COALESCE(iw.waste_incidents, 0) AS waste_incidents,
    COALESCE(iw.total_waste_qty, 0) AS total_waste_qty,
    COALESCE(iw.total_financial_loss, 0) AS total_financial_loss,
    COALESCE(iw.primary_waste_reason, 'None') AS primary_waste_reason,
    ROUND(
        CASE 
            WHEN COALESCE(ip.total_prepared_qty, 0) > 0 
            THEN (COALESCE(iw.total_waste_qty, 0) / ip.total_prepared_qty) * 100 
            ELSE 0 
        END, 
        2
    ) AS item_waste_rate_pct,
    DENSE_RANK() OVER (ORDER BY COALESCE(iw.total_financial_loss, 0) DESC) AS financial_loss_rank
FROM food_item fi
JOIN food_category fc ON fi.category_id = fc.category_id
LEFT JOIN item_prep ip ON fi.item_id = ip.item_id
LEFT JOIN item_waste iw ON fi.item_id = iw.item_id
WHERE fi.is_active = TRUE;

-- ----------------------------------------------------------------------------
-- View 3: Facility Performance
-- PRD Section 19: vw_facility_performance
-- Facility-level waste KPIs, per-seat waste intensity, and compliance ratings
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_facility_performance AS
SELECT 
    f.facility_id,
    f.campus_id,
    c.name AS campus_name,
    f.facility_code,
    f.facility_name,
    f.facility_type,
    f.dining_capacity,
    f.operating_status,
    COUNT(DISTINCT fp.prep_date) AS total_operational_days,
    COALESCE(SUM(fp.prepared_quantity), 0) AS total_prepared_qty,
    COALESCE(SUM(fc.consumed_quantity), 0) AS total_consumed_qty,
    COALESCE(SUM(fw.waste_quantity), 0) AS total_waste_qty,
    COALESCE(SUM(fw.estimated_waste_cost), 0) AS total_waste_cost,
    ROUND(
        CASE 
            WHEN SUM(fp.prepared_quantity) > 0 
            THEN (SUM(fw.waste_quantity) / SUM(fp.prepared_quantity)) * 100 
            ELSE 0 
        END, 
        2
    ) AS facility_waste_percentage,
    ROUND(
        CASE 
            WHEN SUM(att.actual_attendance) > 0 
            THEN (SUM(fw.waste_quantity) / SUM(att.actual_attendance)) 
            ELSE 0 
        END, 
        3
    ) AS waste_kg_per_attendee,
    ROUND(AVG(NULLIF(att.actual_attendance, 0)), 1) AS avg_daily_attendance
FROM facility f
JOIN campus c ON f.campus_id = c.campus_id
LEFT JOIN food_preparation fp ON f.facility_id = fp.facility_id
LEFT JOIN food_consumption fc ON fp.prep_id = fc.prep_id
LEFT JOIN food_waste fw ON f.facility_id = fw.facility_id
LEFT JOIN attendance att ON f.facility_id = att.facility_id
GROUP BY f.facility_id, f.campus_id, c.name, f.facility_code, f.facility_name, f.facility_type, f.dining_capacity, f.operating_status;

-- ----------------------------------------------------------------------------
-- View 4: Attendance vs Consumption
-- PRD Section 19: vw_attendance_consumption
-- Cross-correlation of attendance discrepancies against consumption and portion drift
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_attendance_consumption AS
SELECT 
    a.attendance_date,
    a.facility_id,
    f.facility_name,
    a.meal_id,
    m.meal_name,
    a.expected_attendance,
    a.actual_attendance,
    a.variance_count,
    ROUND(
        CASE 
            WHEN a.expected_attendance > 0 
            THEN ((a.actual_attendance - a.expected_attendance)::NUMERIC / a.expected_attendance) * 100 
            ELSE 0 
        END, 
        2
    ) AS attendance_variance_pct,
    COALESCE(SUM(fp.prepared_quantity), 0) AS total_prepared_qty,
    COALESCE(SUM(fc.consumed_quantity), 0) AS total_consumed_qty,
    ROUND(
        CASE 
            WHEN a.actual_attendance > 0 
            THEN (SUM(fc.consumed_quantity) / a.actual_attendance) 
            ELSE 0 
        END, 
        3
    ) AS consumed_qty_per_student,
    ROUND(
        CASE 
            WHEN a.actual_attendance > 0 
            THEN (SUM(fp.prepared_quantity) / a.actual_attendance) 
            ELSE 0 
        END, 
        3
    ) AS planned_qty_per_actual_student,
    ce.event_name,
    ce.event_type
FROM attendance a
JOIN facility f ON a.facility_id = f.facility_id
JOIN meal m ON a.meal_id = m.meal_id
LEFT JOIN campus_event ce ON a.event_id = ce.event_id
LEFT JOIN food_preparation fp ON a.facility_id = fp.facility_id 
    AND a.meal_id = fp.meal_id 
    AND a.attendance_date = fp.prep_date
LEFT JOIN food_consumption fc ON fp.prep_id = fc.prep_id
GROUP BY 
    a.attendance_date, 
    a.facility_id, 
    f.facility_name, 
    a.meal_id, 
    m.meal_name, 
    a.expected_attendance, 
    a.actual_attendance, 
    a.variance_count, 
    ce.event_name, 
    ce.event_type;

-- ----------------------------------------------------------------------------
-- View 5: PostGIS Spatial Proximity & Food Pantry Rescue Routing
-- Spatial View joining Facilities with Excess Edible Leftovers to Nearby Pantries
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_spatial_pantry_rescue_dispatch AS
SELECT 
    f.facility_id,
    f.facility_name,
    c.name AS campus_name,
    p.pantry_id,
    p.partner_name AS pantry_name,
    p.contact_person,
    p.contact_phone,
    p.storage_capacity_kg,
    ROUND(ST_Distance(f.geom::geography, p.geom::geography)::NUMERIC, 1) AS distance_meters,
    ROUND((ST_Distance(f.geom::geography, p.geom::geography) / 1000.0)::NUMERIC, 2) AS distance_km
FROM facility f
CROSS JOIN food_pantry_partner p
JOIN campus c ON f.campus_id = c.campus_id AND p.campus_id = c.campus_id
WHERE ST_DWithin(f.geom::geography, p.geom::geography, 5000) -- within 5km radius
ORDER BY f.facility_id, distance_meters ASC;
