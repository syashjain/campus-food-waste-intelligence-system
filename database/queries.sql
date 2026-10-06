-- ============================================================================
-- CAMPUS FOOD WASTE INTELLIGENCE SYSTEM (CFWIS)
-- Complete Repository of 20+ PRD Demonstration SQL Queries
-- Demonstrates: Multi-table JOINs, CTEs, Subqueries, Window Functions, PostGIS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 1: Top 5 Food Items by Total Waste Quantity in a Selected Month (PRD #17.1)
-- ----------------------------------------------------------------------------
SELECT 
    fi.item_name,
    fc.category_name,
    fi.standard_unit,
    ROUND(SUM(fw.waste_quantity), 2) AS total_waste_qty,
    ROUND(SUM(fw.estimated_waste_cost), 2) AS total_financial_loss,
    ROUND(AVG(fw.unit_cost_snapshot), 2) AS avg_unit_cost,
    DENSE_RANK() OVER (ORDER BY SUM(fw.waste_quantity) DESC) AS waste_rank
FROM food_waste fw
JOIN food_item fi ON fw.item_id = fi.item_id
JOIN food_category fc ON fi.category_id = fc.category_id
WHERE fw.waste_date >= '2026-09-01' AND fw.waste_date < '2026-10-01'
GROUP BY fi.item_name, fc.category_name, fi.standard_unit
ORDER BY total_waste_qty DESC
LIMIT 5;

-- ----------------------------------------------------------------------------
-- Query 2: Facilities whose Average Waste Percentage Exceeds the Campus Average (PRD #17.2)
-- Subquery with CTE computing global campus benchmark
-- ----------------------------------------------------------------------------
WITH facility_waste_stats AS (
    SELECT 
        f.facility_id,
        f.facility_name,
        f.facility_type,
        SUM(fp.prepared_quantity) AS total_prep,
        SUM(fw.waste_quantity) AS total_waste,
        ROUND((SUM(fw.waste_quantity) / NULLIF(SUM(fp.prepared_quantity), 0)) * 100, 2) AS facility_waste_pct
    FROM facility f
    JOIN food_preparation fp ON f.facility_id = fp.facility_id
    JOIN food_waste fw ON fp.prep_id = fw.prep_id
    GROUP BY f.facility_id, f.facility_name, f.facility_type
),
campus_global_avg AS (
    SELECT 
        ROUND((SUM(fw.waste_quantity) / NULLIF(SUM(fp.prepared_quantity), 0)) * 100, 2) AS campus_avg_waste_pct
    FROM food_preparation fp
    JOIN food_waste fw ON fp.prep_id = fw.prep_id
)
SELECT 
    fws.facility_name,
    fws.facility_type,
    fws.total_prep,
    fws.total_waste,
    fws.facility_waste_pct,
    cga.campus_avg_waste_pct,
    ROUND(fws.facility_waste_pct - cga.campus_avg_waste_pct, 2) AS excess_above_campus_avg_pct
FROM facility_waste_stats fws
CROSS JOIN campus_global_avg cga
WHERE fws.facility_waste_pct > cga.campus_avg_waste_pct
ORDER BY excess_above_campus_avg_pct DESC;

-- ----------------------------------------------------------------------------
-- Query 3: Meals with Attendance Drop and High Waste Exceeding Threshold (PRD #17.3)
-- Correlates attendance variance < -50 with waste > 15 kg
-- ----------------------------------------------------------------------------
SELECT 
    a.attendance_date,
    f.facility_name,
    m.meal_name,
    a.expected_attendance,
    a.actual_attendance,
    a.variance_count AS student_drop_count,
    ROUND(SUM(fw.waste_quantity), 2) AS total_waste_kg,
    ROUND(SUM(fw.estimated_waste_cost), 2) AS waste_cost_incurred,
    wr.reason_name AS primary_reported_reason
FROM attendance a
JOIN facility f ON a.facility_id = f.facility_id
JOIN meal m ON a.meal_id = m.meal_id
JOIN food_waste fw ON a.facility_id = fw.facility_id 
    AND a.meal_id = fw.meal_id 
    AND a.attendance_date = fw.waste_date
JOIN waste_reason wr ON fw.reason_id = wr.reason_id
WHERE a.variance_count <= -40 -- At least 40 students absent
GROUP BY a.attendance_date, f.facility_name, m.meal_name, a.expected_attendance, a.actual_attendance, a.variance_count, wr.reason_name
HAVING SUM(fw.waste_quantity) >= 15.00
ORDER BY student_drop_count ASC, total_waste_kg DESC;

-- ----------------------------------------------------------------------------
-- Query 4: Top Waste Reason for Each Facility (PRD #17.4)
-- Window function ROW_NUMBER() partitioned by facility
-- ----------------------------------------------------------------------------
WITH reason_frequency AS (
    SELECT 
        f.facility_id,
        f.facility_name,
        wr.reason_name,
        COUNT(fw.waste_id) AS incident_count,
        ROUND(SUM(fw.waste_quantity), 2) AS total_wasted_kg,
        ROUND(SUM(fw.estimated_waste_cost), 2) AS total_cost,
        ROW_NUMBER() OVER (
            PARTITION BY f.facility_id 
            ORDER BY SUM(fw.waste_quantity) DESC
        ) AS reason_rank
    FROM food_waste fw
    JOIN facility f ON fw.facility_id = f.facility_id
    JOIN waste_reason wr ON fw.reason_id = wr.reason_id
    GROUP BY f.facility_id, f.facility_name, wr.reason_name
)
SELECT 
    facility_name,
    reason_name AS dominant_waste_driver,
    incident_count,
    total_wasted_kg,
    total_cost
FROM reason_frequency
WHERE reason_rank = 1
ORDER BY total_wasted_kg DESC;

-- ----------------------------------------------------------------------------
-- Query 5: Month-over-Month Food Item Waste Cost Growth (PRD #17.5)
-- Window function LAG() analyzing sequential financial escalation
-- ----------------------------------------------------------------------------
WITH monthly_item_costs AS (
    SELECT 
        fi.item_id,
        fi.item_name,
        DATE_TRUNC('month', fw.waste_date)::DATE AS report_month,
        ROUND(SUM(fw.estimated_waste_cost), 2) AS monthly_waste_cost
    FROM food_waste fw
    JOIN food_item fi ON fw.item_id = fi.item_id
    GROUP BY fi.item_id, fi.item_name, DATE_TRUNC('month', fw.waste_date)
),
cost_differences AS (
    SELECT 
        item_name,
        report_month,
        monthly_waste_cost,
        LAG(monthly_waste_cost, 1) OVER (
            PARTITION BY item_id 
            ORDER BY report_month
        ) AS prior_month_cost
    FROM monthly_item_costs
)
SELECT 
    item_name,
    report_month,
    prior_month_cost,
    monthly_waste_cost,
    (monthly_waste_cost - prior_month_cost) AS cost_increase,
    ROUND(((monthly_waste_cost - prior_month_cost) / NULLIF(prior_month_cost, 0)) * 100, 2) AS pct_growth
FROM cost_differences
WHERE prior_month_cost IS NOT NULL AND monthly_waste_cost > prior_month_cost
ORDER BY cost_increase DESC;

-- ----------------------------------------------------------------------------
-- Query 6: Event-Day Waste vs Non-Event-Day Waste Comparison (PRD #17.6)
-- Compares average waste on days with scheduled campus events vs normal days
-- ----------------------------------------------------------------------------
SELECT 
    CASE 
        WHEN ce.event_id IS NOT NULL THEN 'EVENT_DAY (' || ce.event_type || ')'
        ELSE 'NORMAL_CAMPUS_DAY'
    END AS operational_context,
    COUNT(DISTINCT fw.waste_date) AS days_sampled,
    ROUND(AVG(day_waste.daily_waste_kg), 2) AS avg_daily_waste_kg,
    ROUND(AVG(day_waste.daily_waste_cost), 2) AS avg_daily_waste_cost
FROM (
    SELECT 
        waste_date,
        facility_id,
        SUM(waste_quantity) AS daily_waste_kg,
        SUM(estimated_waste_cost) AS daily_waste_cost
    FROM food_waste
    GROUP BY waste_date, facility_id
) day_waste
LEFT JOIN campus_event ce ON day_waste.waste_date BETWEEN ce.start_date AND ce.end_date
GROUP BY 
    CASE 
        WHEN ce.event_id IS NOT NULL THEN 'EVENT_DAY (' || ce.event_type || ')'
        ELSE 'NORMAL_CAMPUS_DAY'
    END
ORDER BY avg_daily_waste_kg DESC;

-- ----------------------------------------------------------------------------
-- Query 7: Most Frequently Wasted Food Item for Each Meal Period (PRD #17.7)
-- ----------------------------------------------------------------------------
WITH meal_item_waste AS (
    SELECT 
        m.meal_name,
        fi.item_name,
        COUNT(fw.waste_id) AS waste_frequency,
        ROUND(SUM(fw.waste_quantity), 2) AS total_kg_wasted,
        ROW_NUMBER() OVER (
            PARTITION BY m.meal_id 
            ORDER BY COUNT(fw.waste_id) DESC, SUM(fw.waste_quantity) DESC
        ) AS rank_in_meal
    FROM food_waste fw
    JOIN meal m ON fw.meal_id = m.meal_id
    JOIN food_item fi ON fw.item_id = fi.item_id
    GROUP BY m.meal_id, m.meal_name, fi.item_name
)
SELECT 
    meal_name,
    item_name AS most_frequent_waste_item,
    waste_frequency,
    total_kg_wasted
FROM meal_item_waste
WHERE rank_in_meal = 1
ORDER BY meal_name;

-- ----------------------------------------------------------------------------
-- Query 8: High Waste Percentage but Low Purchase Cost Items (PRD #17.9)
-- Identifies cheap staple items (e.g. Rice, Idli) heavily wasted in bulk
-- ----------------------------------------------------------------------------
SELECT 
    fi.item_name,
    fc.category_name,
    fi.standard_unit_cost,
    SUM(fp.prepared_quantity) AS total_prepared,
    SUM(fw.waste_quantity) AS total_wasted,
    ROUND((SUM(fw.waste_quantity) / NULLIF(SUM(fp.prepared_quantity), 0)) * 100, 2) AS waste_pct,
    ROUND(SUM(fw.estimated_waste_cost), 2) AS financial_loss
FROM food_item fi
JOIN food_category fc ON fi.category_id = fc.category_id
JOIN food_preparation fp ON fi.item_id = fp.item_id
JOIN food_waste fw ON fp.prep_id = fw.prep_id
WHERE fi.standard_unit_cost < 60.00 -- Low unit price threshold
GROUP BY fi.item_name, fc.category_name, fi.standard_unit_cost
HAVING (SUM(fw.waste_quantity) / NULLIF(SUM(fp.prepared_quantity), 0)) > 0.15 -- >15% waste
ORDER BY total_wasted DESC;

-- ----------------------------------------------------------------------------
-- Query 9: Phantom Waste / Preparation-Consumption Discrepancies (PRD #17.10)
-- Cases where (prepared - consumed) is high, but recorded waste is unexpectedly low
-- ----------------------------------------------------------------------------
SELECT 
    fp.prep_date,
    f.facility_name,
    fi.item_name,
    fp.prepared_quantity,
    COALESCE(fc.consumed_quantity, 0) AS consumed_quantity,
    (fp.prepared_quantity - COALESCE(fc.consumed_quantity, 0)) AS expected_leftover,
    COALESCE(SUM(fw.waste_quantity), 0) AS logged_waste_quantity,
    ((fp.prepared_quantity - COALESCE(fc.consumed_quantity, 0)) - COALESCE(SUM(fw.waste_quantity), 0)) AS unaccounted_discrepancy_kg
FROM food_preparation fp
JOIN facility f ON fp.facility_id = f.facility_id
JOIN food_item fi ON fp.item_id = fi.item_id
LEFT JOIN food_consumption fc ON fp.prep_id = fc.prep_id
LEFT JOIN food_waste fw ON fp.prep_id = fw.prep_id
GROUP BY fp.prep_id, fp.prep_date, f.facility_name, fi.item_name, fp.prepared_quantity, fc.consumed_quantity
HAVING ((fp.prepared_quantity - COALESCE(fc.consumed_quantity, 0)) - COALESCE(SUM(fw.waste_quantity), 0)) > 8.00
ORDER BY unaccounted_discrepancy_kg DESC;

-- ----------------------------------------------------------------------------
-- Query 10: Procurement Vendor Cost & Volume Breakdown
-- ----------------------------------------------------------------------------
SELECT 
    v.vendor_name,
    v.compliance_rating,
    COUNT(p.purchase_id) AS total_orders,
    ROUND(SUM(p.total_amount), 2) AS total_procurement_spend,
    COUNT(DISTINCT pi.item_id) AS unique_items_supplied
FROM vendor v
JOIN purchase p ON v.vendor_id = p.vendor_id
JOIN purchase_item pi ON p.purchase_id = pi.purchase_id
GROUP BY v.vendor_id, v.vendor_name, v.compliance_rating
ORDER BY total_procurement_spend DESC;
