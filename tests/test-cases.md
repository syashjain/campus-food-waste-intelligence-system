# Campus Food Waste Intelligence System (CFWIS)
## Database & Application Test Suite Specification (PRD Section 33)

This test matrix validates database constraints, trigger execution, transaction rollback, RLS isolation, and reporting integrity.

| Test ID | Test Category | Target Component / Constraint | Input / Execution Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-SEC-01** | Authentication | Password Hashing & Role Bind | Authenticate with valid bcrypt hash; extract role category | JWT issued with `role=MESS_MANAGER`, session context initialized | PASS |
| **TC-SEC-02** | Multi-Tenancy (RLS) | `tenant_facility_isolation` policy | Set `app.current_campus_id` to Campus A, query `facility` | Only Campus A facilities returned; Campus B records hidden by kernel RLS | PASS |
| **TC-VAL-01** | Quantity Integrity | `chk_prep_qty` & `trg_chk_prep_qty` | Insert `food_preparation` with `prepared_quantity = -15.5` | Aborted with `check_violation (ERRCODE 23514)`; zero-floor enforced | PASS |
| **TC-VAL-02** | Consumption Bound | `trg_validate_consumption_quantity` | Attempt to insert `consumed_quantity = 85.0` for a prep batch of `50.0` | Aborted with trigger exception: *Consumed cannot exceed prepared* | PASS |
| **TC-VAL-03** | Deactivated Master Data | Business Rule #10 / #11 | Attempt to record waste against deactivated facility or food item | Aborted with `integrity_constraint_violation`; historical integrity preserved | PASS |
| **TC-TRG-01** | Cost Snapshotting | `trg_calculate_waste_cost_snapshot` | Insert `food_waste` without specifying `unit_cost_snapshot` | Trigger automatically fetches `food_item.standard_unit_cost` and computes `estimated_waste_cost` | PASS |
| **TC-TRG-02** | Audit Trail Capture | `trg_audit_sensitive_update` | Update facility dining capacity or deactivate food item | Audit tuple inserted in `audit_log` with JSON old/new deltas and user UUID | PASS |
| **TC-TXN-01** | Transaction Rollback | `sp_record_daily_waste` | Execute waste insert with invalid reason FK or simulated system error | Whole transaction aborts; zero partial tuples in `food_waste` or `audit_log` | PASS |
| **TC-TXN-02** | Concurrency Control | Serializable SSI Isolation | 2 concurrent transactions reading & writing shared inventory capacity | Engine detects serialization hazard, raises `40001 serialization_failure`, retries | PASS |
| **TC-REP-01** | View Consistency | `vw_daily_waste_summary` | Compare manual sum of `food_waste` with view aggregation | Exact 1:1 match down to decimal cents; zero float drift | PASS |
| **TC-GIS-01** | Spatial Proximity | `vw_spatial_pantry_rescue_dispatch` | Compute distance from Central Mess to local pantries via `ST_DWithin` | Pantries sorted in ascending meters with R-Tree GiST index pruning | PASS |
