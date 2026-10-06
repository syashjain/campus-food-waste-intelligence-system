-- ============================================================================
-- CAMPUS FOOD WASTE INTELLIGENCE SYSTEM (CFWIS)
-- Stored Functions & Academic Intelligence Calculators
-- Engine: PostgreSQL 15+ / PostGIS 3+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function 1: Food Waste Intelligence Score Calculator (PRD Section 13)
-- Computes internal index (0 - 100) based on waste %, volatility, cost loss,
-- and attendance deviation. Lower score is superior operational efficiency.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_waste_intelligence_score(
    p_facility_id UUID,
    p_start_date DATE,
    p_end_date DATE
) 
RETURNS TABLE (
    facility_id UUID,
    facility_name VARCHAR(150),
    waste_rate_score NUMERIC(5, 2),
    financial_severity_score NUMERIC(5, 2),
    attendance_prediction_score NUMERIC(5, 2),
    composite_intelligence_index NUMERIC(5, 2),
    operational_rating VARCHAR(30)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_prep NUMERIC(10, 2);
    v_total_waste NUMERIC(10, 2);
    v_total_waste_cost NUMERIC(12, 2);
    v_avg_att_variance NUMERIC(6, 2);
    v_waste_pct NUMERIC(5, 2);
    v_facility_name VARCHAR(150);
    v_c1 NUMERIC(5, 2);
    v_c2 NUMERIC(5, 2);
    v_c3 NUMERIC(5, 2);
    v_composite NUMERIC(5, 2);
    v_rating VARCHAR(30);
BEGIN
    SELECT f.facility_name INTO v_facility_name
    FROM facility f WHERE f.facility_id = p_facility_id;

    -- Aggregate metrics for period
    SELECT 
        COALESCE(SUM(fp.prepared_quantity), 0),
        COALESCE(SUM(fw.waste_quantity), 0),
        COALESCE(SUM(fw.estimated_waste_cost), 0)
    INTO v_total_prep, v_total_waste, v_total_waste_cost
    FROM food_preparation fp
    LEFT JOIN food_waste fw ON fp.prep_id = fw.prep_id AND fw.waste_date BETWEEN p_start_date AND p_end_date
    WHERE fp.facility_id = p_facility_id AND fp.prep_date BETWEEN p_start_date AND p_end_date;

    SELECT COALESCE(AVG(ABS(variance_count)), 0)
    INTO v_avg_att_variance
    FROM attendance
    WHERE facility_id = p_facility_id AND attendance_date BETWEEN p_start_date AND p_end_date;

    IF v_total_prep = 0 THEN
        v_waste_pct := 0;
    ELSE
        v_waste_pct := (v_total_waste / v_total_prep) * 100.0;
    END IF;

    -- Sub-score 1: Waste % penalty (scaled 0-40)
    v_c1 := LEAST(40.0, (v_waste_pct / 25.0) * 40.0);

    -- Sub-score 2: Financial impact penalty (scaled 0-35, assuming $500/month baseline)
    v_c2 := LEAST(35.0, (v_total_waste_cost / 50000.0) * 35.0);

    -- Sub-score 3: Attendance forecast inaccuracy (scaled 0-25)
    v_c3 := LEAST(25.0, (v_avg_att_variance / 50.0) * 25.0);

    -- Composite Index (0 - 100)
    v_composite := ROUND(v_c1 + v_c2 + v_c3, 2);

    IF v_composite < 20 THEN
        v_rating := 'EXCELLENT (LEAN OPERATIONS)';
    ELSIF v_composite < 45 THEN
        v_rating := 'GOOD (NORMAL DRIFT)';
    ELSIF v_composite < 70 THEN
        v_rating := 'MODERATE CONCERN';
    ELSE
        v_rating := 'CRITICAL WASTE ANOMALY';
    END IF;

    RETURN QUERY SELECT 
        p_facility_id,
        v_facility_name,
        ROUND(v_c1, 2),
        ROUND(v_c2, 2),
        ROUND(v_c3, 2),
        v_composite,
        v_rating;
END;
$$;

-- ----------------------------------------------------------------------------
-- Function 2: Automated Unit Conversion Engine (PRD Section 9.3)
-- Converts any registered measurement unit to standard kilograms
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_convert_to_standard_kg(
    p_quantity NUMERIC,
    p_unit measurement_unit,
    p_density NUMERIC DEFAULT 1.0000
) 
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN CASE p_unit
        WHEN 'KG' THEN p_quantity
        WHEN 'GRAM' THEN p_quantity / 1000.0
        WHEN 'LITRE' THEN p_quantity * COALESCE(p_density, 1.0)
        WHEN 'PIECE' THEN p_quantity * 0.150 -- default 150g per piece
        WHEN 'PLATE' THEN p_quantity * 0.450 -- default 450g per plate
        WHEN 'SERVING' THEN p_quantity * 0.250 -- default 250g per serving
        ELSE p_quantity
    END;
END;
$$;
