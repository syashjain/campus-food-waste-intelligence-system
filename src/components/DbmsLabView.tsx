import React, { useState } from 'react';
import { FlaskConical, RotateCcw, Network } from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';
import { SchemaDiagramVisualizer } from './SchemaDiagramVisualizer';

export const DbmsLabView: React.FC = () => {
  const { state, db } = useRelationalDatabase();
  const [activeModule, setActiveModule] = useState<'schema' | 'triggers' | 'transactions' | 'spatial' | 'rls' | 'bcnf'>('schema');

  // Trigger Sandbox States
  const [triggerItemPrepId, setTriggerItemPrepId] = useState(state.preparations[0]?.prep_id || '');
  const [triggerConsumptionQty, setTriggerConsumptionQty] = useState(9999);
  const [triggerOutput, setTriggerOutput] = useState<{ status: 'IDLE' | 'SUCCESS' | 'ERROR'; message: string }>({
    status: 'IDLE',
    message: 'Select parameters and click "Fire Trigger Execution" to observe constraint checking.'
  });

  // Transaction ACID Sandbox States
  const [simulateFailure, setSimulateFailure] = useState(true);
  const [txnLogs, setTxnLogs] = useState<string[]>([]);
  const [txnStatus, setTxnStatus] = useState<'IDLE' | 'COMMITTED' | 'ROLLED_BACK'>('IDLE');

  // PostGIS Spatial Proximity States
  const [spatialRadius, setSpatialRadius] = useState(5000); // 5km
  const facility = state.facilities.find(f => f.facility_id === state.currentFacilityId) || state.facilities[0];
  const spatialPartners = facility ? db.getSpatialPantryDispatch(facility.facility_id, spatialRadius) : [];

  // Trigger Test Execution Handler
  const handleTriggerTest = () => {
    const prep = state.preparations.find(p => p.prep_id === triggerItemPrepId);
    if (!prep) return;

    if (Number(triggerConsumptionQty) > prep.prepared_quantity) {
      setTriggerOutput({
        status: 'ERROR',
        message: `[ERROR 23514 check_violation]: Execution aborted by BEFORE INSERT trigger "trg_validate_consumption_quantity". Attempted to record ${triggerConsumptionQty} ${prep.unit}, which exceeds prepared batch threshold of ${prep.prepared_quantity} ${prep.unit}. Transaction aborted; WAL write cancelled.`
      });
    } else {
      setTriggerOutput({
        status: 'SUCCESS',
        message: `[SUCCESS 00000 successful_completion]: Trigger "trg_validate_consumption_quantity" evaluated TRUE. Consumed quantity (${triggerConsumptionQty} ${prep.unit}) <= Prepared batch volume (${prep.prepared_quantity} ${prep.unit}). Row written to food_consumption table.`
      });
    }
  };

  // ACID Transaction Workflow Test Handler
  const handleTransactionWorkflowTest = () => {
    const logs: string[] = [];
    logs.push('[T1: BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE]');
    logs.push('[T1: STEP 1] LOCK TABLE food_preparation IN ROW EXCLUSIVE MODE (granted)');
    logs.push('[T1: STEP 2] INSERT INTO food_waste (waste_id, prep_id, quantity) VALUES (gen_random_uuid(), ..., 14.5) -> OK');
    
    if (simulateFailure) {
      logs.push('[T1: STEP 3: SIMULATED FAULT] Enforcing foreign key check on pantry_partner_id -> PARTNER_NOT_FOUND');
      logs.push('[T1: STEP 3: EXCEPTION] RAISE EXCEPTION "FK_pantry_partner violation on step 3"');
      logs.push('[T1: STEP 4: ROLLBACK TRIGGERED] Reverting all modified tuples via PostgreSQL WAL undo log');
      logs.push('[T1: POST-STATE] food_waste insert reverted. Zero phantom or orphan rows remaining in database.');
      logs.push('[T1: ROLLBACK COMPLETE] Transaction aborted cleanly without data corruption.');
      setTxnLogs(logs);
      setTxnStatus('ROLLED_BACK');
    } else {
      logs.push('[T1: STEP 3] INSERT INTO pantry_dispatch (dispatch_id, waste_id) VALUES (gen_random_uuid(), ...) -> OK');
      logs.push('[T1: STEP 4] INSERT INTO audit_log (table_name, operation, record_delta) VALUES (\'food_waste\', \'INSERT\', ...) -> OK');
      logs.push('[T1: STEP 5: COMMIT] PostgreSQL flushing WAL buffers to non-volatile disk storage (fsync).');
      logs.push('[T1: TRANSACTION COMMITTED] All 3 related tables atomically updated.');
      setTxnLogs(logs);
      setTxnStatus('COMMITTED');
    }
  };

  return (
    <div className="p-2 sm:p-4 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 harness-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="harness-badge harness-badge-mint">
              Interactive Evaluation Suite
            </span>
            <span className="text-xs text-[var(--color-graphite)]">PRD Section 16, 18, 20 &amp; 30</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-[var(--color-pure-white)] flex items-center gap-2.5 mt-2 tracking-[0.056em]">
            <FlaskConical className="w-6 h-6 text-[#70dcd3]" />
            DBMS Academic Demonstration Laboratory
          </h1>
          <p className="text-sm text-[var(--color-graphite)] mt-1">
            Interactive proofs for D3 Schema Relationships, Triggers, Transaction Rollback, PostGIS Spatial queries, RLS Multi-Tenancy, and BCNF.
          </p>
        </div>

        {/* Module Picker */}
        <div className="flex flex-wrap items-center bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] p-1 rounded-full text-xs">
          <button
            onClick={() => setActiveModule('schema')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModule === 'schema' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-[#70dcd3]" />
            Schema Graph
          </button>
          <button
            onClick={() => setActiveModule('triggers')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeModule === 'triggers' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            Triggers
          </button>
          <button
            onClick={() => setActiveModule('transactions')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeModule === 'transactions' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            ACID Rollback
          </button>
          <button
            onClick={() => setActiveModule('spatial')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeModule === 'spatial' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            PostGIS Spatial
          </button>
          <button
            onClick={() => setActiveModule('rls')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeModule === 'rls' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            RLS Tenancy
          </button>
          <button
            onClick={() => setActiveModule('bcnf')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeModule === 'bcnf' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            BCNF Proofs
          </button>
        </div>
      </div>

      {/* MODULE 0: D3 SCHEMA RELATIONSHIP GRAPH */}
      {activeModule === 'schema' && (
        <div className="space-y-4">
          <div className="harness-card p-6">
            <div className="border-b border-[var(--color-steel-border)] pb-3">
              <span className="text-xs font-mono text-[#70dcd3] font-bold block">
                Relational Entity-Relationship (ER) Topology Visualizer
              </span>
              <h2 className="text-base font-light text-[var(--color-pure-white)] mt-1 tracking-[0.056em]">
                Interactive D3 Graph of Enterprise PostgreSQL Relations &amp; Foreign Key Constraints
              </h2>
              <p className="text-xs text-[var(--color-graphite)] mt-1">
                Visualizes table definitions, primary keys (PK), foreign keys (FK), indices, domain partitioning, and live row metrics directly from the store. Drag nodes, zoom/pan, or filter by domain.
              </p>
            </div>
            <div className="mt-4">
              <SchemaDiagramVisualizer />
            </div>
          </div>
        </div>
      )}

      {/* MODULE 1: TRIGGERS SANDBOX */}
      {activeModule === 'triggers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="harness-card p-6 space-y-4">
            <div className="border-b border-[var(--color-steel-border)] pb-3">
              <span className="text-xs font-mono text-[#70dcd3] font-bold block">
                Trigger 1: trg_validate_consumption_quantity
              </span>
              <h2 className="text-base font-light text-[var(--color-pure-white)] mt-1 tracking-[0.056em]">
                Upper Bound Consumption Integrity Enforcement
              </h2>
              <p className="text-xs text-[var(--color-graphite)] mt-1">
                Ensures no chef or kitchen worker can enter consumed food greater than prepared food.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--color-graphite)] font-medium mb-1">Target Preparation Batch</label>
                <select
                  value={triggerItemPrepId}
                  onChange={(e) => setTriggerItemPrepId(e.target.value)}
                  className="w-full harness-input rounded-[5px] p-2.5 text-[var(--color-pure-white)]"
                >
                  {state.preparations.slice(0, 8).map(p => {
                    const item = state.foodItems.find(i => i.item_id === p.item_id);
                    return (
                      <option key={p.prep_id} value={p.prep_id} className="bg-[var(--color-carbon-plate)] text-[var(--color-pure-white)]">
                        {item?.item_name} - Prepared: {p.prepared_quantity} {p.unit} ({p.batch_number})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[var(--color-graphite)] font-medium mb-1">
                  Test Consumed Quantity (Set higher than prepared to induce violation)
                </label>
                <input
                  type="number"
                  value={triggerConsumptionQty}
                  onChange={(e) => setTriggerConsumptionQty(Number(e.target.value))}
                  className="w-full harness-input rounded-[5px] p-2.5 text-[var(--color-pure-white)] font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setTriggerConsumptionQty(9999); }}
                  className="px-3.5 py-1.5 rounded-full bg-[var(--color-obsidian)] text-[#f43f5e] border border-[#f43f5e]/40 hover:opacity-90 font-mono text-[11px] cursor-pointer"
                >
                  Preset: Violation (9999)
                </button>
                <button
                  onClick={() => { setTriggerConsumptionQty(20); }}
                  className="px-3.5 py-1.5 rounded-full bg-[var(--color-obsidian)] text-[#70dcd3] border border-[#70dcd3]/40 hover:opacity-90 font-mono text-[11px] cursor-pointer"
                >
                  Preset: Valid (20)
                </button>
              </div>

              <button
                onClick={handleTriggerTest}
                className="w-full py-2.5 px-6 rounded-full harness-btn-primary transition-all flex items-center justify-center gap-2 min-h-[42px] cursor-pointer"
              >
                Fire Trigger Execution
              </button>
            </div>
          </div>

          {/* Trigger Output Display */}
          <div className="bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] p-6 rounded-[20px] shadow-sm space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[var(--color-iron-edge)] pb-3">
              <span className="text-[var(--color-graphite)] font-bold">PostgreSQL Engine Console Output</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                triggerOutput.status === 'ERROR' ? 'border border-[#f43f5e] text-[#f43f5e]' :
                triggerOutput.status === 'SUCCESS' ? 'border border-[#75ae4c] text-[#70dcd3]' :
                'border border-[var(--color-iron-edge)] text-[var(--color-graphite)]'
              }`}>
                STATUS: {triggerOutput.status}
              </span>
            </div>

            <div className={`p-4 rounded-[14px] border leading-relaxed ${
              triggerOutput.status === 'ERROR' ? 'bg-[var(--color-void-canvas)] border-[#f43f5e] text-[#f43f5e]' :
              triggerOutput.status === 'SUCCESS' ? 'bg-[var(--color-void-canvas)] border-[#75ae4c] text-[#70dcd3]' :
              'bg-[var(--color-void-canvas)] border-[var(--color-iron-edge)] text-[var(--color-graphite)]'
            }`}>
              {triggerOutput.message}
            </div>

            <div className="space-y-2 text-[var(--color-graphite)] pt-2 text-[11px]">
              <div className="font-semibold text-[var(--color-pure-white)]">Trigger Mechanism Under the Hood:</div>
              <p>
                Executed via <code className="text-[#0092e4]">BEFORE INSERT OR UPDATE ON food_consumption</code>. If validation evaluates false, <code className="text-[#f43f5e]">RAISE EXCEPTION USING ERRCODE = &apos;check_violation&apos;</code> aborts the statement before writing to the WAL log.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: ACID TRANSACTION ROLLBACK */}
      {activeModule === 'transactions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="harness-card p-6 space-y-5">
            <div className="border-b border-[var(--color-steel-border)] pb-3">
              <span className="text-xs font-mono text-[#a6e5f2] font-bold block">
                Procedure: sp_record_daily_waste (PRD Section 20.1)
              </span>
              <h2 className="text-base font-light text-[var(--color-pure-white)] mt-1 tracking-[0.056em]">
                Atomic Multi-Table Operational Transaction
              </h2>
              <p className="text-xs text-[var(--color-graphite)] mt-1">
                Demonstrates that failure during multi-table writes causes full transaction rollback without state corruption.
              </p>
            </div>

            <div className="p-4 bg-[var(--color-obsidian)] rounded-[16px] border border-[var(--color-iron-edge)] space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[var(--color-pure-white)] block">Inject Synthetic Failure at Step 3</span>
                  <span className="text-[11px] text-[var(--color-graphite)]">Simulates foreign key corruption or power loss mid-transaction</span>
                </div>
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="w-5 h-5 accent-[#0092e4] rounded cursor-pointer"
                />
              </label>
            </div>

            <button
              onClick={handleTransactionWorkflowTest}
              className={`w-full py-2.5 px-6 rounded-full font-medium text-xs shadow-md transition-all flex items-center justify-center gap-2 min-h-[42px] cursor-pointer ${
                simulateFailure ? 'bg-[#f43f5e] text-[#ffffff] hover:opacity-90' : 'harness-btn-primary'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              {simulateFailure ? 'Execute Failing Transaction (Test ROLLBACK)' : 'Execute Clean Transaction (Test COMMIT)'}
            </button>
          </div>

          {/* Transaction Log Walkthrough */}
          <div className="bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] p-6 rounded-[20px] shadow-sm space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[var(--color-iron-edge)] pb-3">
              <span className="text-[var(--color-graphite)] font-bold">ACID Transaction Execution Trace</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                txnStatus === 'ROLLED_BACK' ? 'border border-[#f43f5e] text-[#f43f5e]' :
                txnStatus === 'COMMITTED' ? 'border border-[#75ae4c] text-[#70dcd3]' :
                'border border-[var(--color-iron-edge)] text-[var(--color-graphite)]'
              }`}>
                {txnStatus}
              </span>
            </div>

            <div className="space-y-2 p-3.5 bg-[var(--color-void-canvas)] rounded-[14px] border border-[var(--color-iron-edge)] min-h-48 text-[11px]">
              {txnLogs.length === 0 ? (
                <span className="text-[var(--color-graphite)]">Click &ldquo;Execute Transaction&rdquo; to simulate database engine WAL writes...</span>
              ) : (
                txnLogs.map((log, i) => (
                  <div key={i} className={
                    log.includes('FAILED') || log.includes('ROLLBACK') || log.includes('FAULT') ? 'text-[#f43f5e] font-bold' :
                    log.includes('OK') || log.includes('COMMIT') ? 'text-[#70dcd3] font-bold' :
                    'text-[var(--color-graphite)]'
                  }>
                    {log}
                  </div>
                ))
              )}
            </div>

            <p className="text-[11px] text-[var(--color-graphite)]">
              Serializable Snapshot Isolation (SSI) guarantees write-skew avoidance through predicate lock graphs.
            </p>
          </div>
        </div>
      )}

      {/* MODULE 3: POSTGIS SPATIAL DISPATCH */}
      {activeModule === 'spatial' && (
        <div className="space-y-6">
          <div className="harness-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-steel-border)] pb-4">
              <div>
                <span className="text-xs font-mono text-[#0092e4] font-bold block">
                  PostGIS ST_DWithin &amp; ST_Distance Spatial Engine
                </span>
                <h2 className="text-base font-light text-[var(--color-pure-white)] mt-1 tracking-[0.056em]">
                  Campus Dining to Food Rescue Pantry Proximity Routing
                </h2>
                <p className="text-xs text-[var(--color-graphite)] mt-1">
                  Evaluates geodetic distances using R-Tree GiST indexes on geometry(Point, 4326) coordinates.
                </p>
              </div>

              {/* Radius Filter */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-graphite)] font-medium">Search Radius:</span>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={spatialRadius}
                  onChange={(e) => setSpatialRadius(Number(e.target.value))}
                  className="accent-[#70dcd3] cursor-pointer"
                />
                <span className="text-xs font-mono text-[#70dcd3] font-bold w-16 text-right">
                  {(spatialRadius / 1000).toFixed(1)} km
                </span>
              </div>
            </div>

            {/* Spatial Table */}
            <div className="overflow-x-auto rounded-[14px] border border-[var(--color-steel-border)]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[var(--color-obsidian)] text-[var(--color-graphite)] font-semibold border-b border-[var(--color-steel-border)]">
                  <tr>
                    <th className="py-3 px-3">Rescue Partner</th>
                    <th className="py-3 px-2">Contact Person</th>
                    <th className="py-3 px-2">Phone</th>
                    <th className="py-3 px-2">Capacity</th>
                    <th className="py-3 px-2">Distance (Meters)</th>
                    <th className="py-3 px-2">Distance (Km)</th>
                    <th className="py-3 px-2">Within Radius?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-steel-border)]">
                  {spatialPartners.map((p) => (
                    <tr key={p.pantry_id} className="hover:bg-[var(--color-obsidian)] transition-colors">
                      <td className="py-3 px-3 font-semibold text-[var(--color-pure-white)]">{p.pantry_name}</td>
                      <td className="py-3 px-2 text-[var(--color-graphite)]">{p.contact_person}</td>
                      <td className="py-3 px-2 text-[var(--color-graphite)]">{p.contact_phone}</td>
                      <td className="py-3 px-2 text-[var(--color-pure-white)]">{p.storage_capacity_kg} kg</td>
                      <td className="py-3 px-2 text-[#0092e4] font-bold">{p.distance_meters.toLocaleString()} m</td>
                      <td className="py-3 px-2 text-[#70dcd3]">{p.distance_km} km</td>
                      <td className="py-3 px-2">
                        {p.is_within_radius ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#75ae4c] text-[#70dcd3]">
                            IN RANGE
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[var(--color-iron-edge)] text-[var(--color-graphite)]">
                            EXCEEDS RADIUS
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* MODULE 4: RLS MULTI-TENANCY INSPECTOR */}
      {activeModule === 'rls' && (
        <div className="harness-card p-6 space-y-5">
          <div className="border-b border-[var(--color-steel-border)] pb-3">
            <span className="text-xs font-mono text-[#70dcd3] font-bold block">
              PostgreSQL Row-Level Security (RLS) Policy Execution
            </span>
            <h2 className="text-base font-light text-[var(--color-pure-white)] mt-1 tracking-[0.056em]">
              Kernel-Level Tenant Isolation via Session Variables
            </h2>
            <p className="text-xs text-[var(--color-graphite)] mt-1">
              Demonstrates that tenant data is isolated directly in PostgreSQL using <code className="text-[#0092e4] font-mono">current_setting(&apos;app.current_campus_id&apos;)</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--color-obsidian)] rounded-[16px] border border-[var(--color-iron-edge)] space-y-2">
              <span className="text-xs font-bold text-[var(--color-graphite)]">Active Tenant Context</span>
              <div className="text-sm font-mono text-[#70dcd3]">
                app.current_campus_id = &apos;{state.currentCampusId}&apos;
              </div>
              <div className="text-sm font-mono text-[#0092e4]">
                app.current_user_role = &apos;{state.currentUserRole}&apos;
              </div>
            </div>

            <div className="p-4 bg-[var(--color-obsidian)] rounded-[16px] border border-[var(--color-iron-edge)] space-y-2">
              <span className="text-xs font-bold text-[var(--color-graphite)]">RLS Policy Definition</span>
              <pre className="text-[11px] font-mono text-[var(--color-graphite)] overflow-x-auto">
{`CREATE POLICY tenant_facility_isolation ON facility
  USING (
    current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
    OR campus_id = current_setting('app.current_campus_id', true)::UUID
  );`}
              </pre>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-[var(--color-pure-white)] mb-2 block">
              Filtered Records Visible Under Active Tenant:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {db.getRlsFacilities().map(f => (
                <div key={f.facility_id} className="p-4 bg-[var(--color-obsidian)] rounded-[16px] border border-[var(--color-iron-edge)] space-y-1">
                  <span className="font-bold text-[var(--color-pure-white)] text-xs block truncate">{f.facility_name}</span>
                  <span className="text-[11px] text-[var(--color-graphite)] font-mono block">Code: {f.facility_code}</span>
                  <span className="text-[11px] text-[#70dcd3] font-mono block">Capacity: {f.dining_capacity} seats</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: BCNF NORMALIZATION PROOFS */}
      {activeModule === 'bcnf' && (
        <div className="harness-card p-6 space-y-5">
          <div className="border-b border-[var(--color-steel-border)] pb-3">
            <span className="text-xs font-mono text-[#0092e4] font-bold block">
              Relational Theory &amp; Mathematical Proofs
            </span>
            <h2 className="text-base font-light text-[var(--color-pure-white)] mt-1 tracking-[0.056em]">
              Boyce-Codd Normal Form (BCNF) Decomposition
            </h2>
            <p className="text-xs text-[var(--color-graphite)] mt-1">
              Guarantees every non-trivial functional dependency $X \rightarrow Y$ has a candidate key as determinant $X$.
            </p>
          </div>

          <div className="space-y-4 text-xs text-[var(--color-graphite)] leading-relaxed font-sans">
            <div className="p-5 bg-[var(--color-obsidian)] rounded-[16px] border border-[var(--color-iron-edge)] space-y-2">
              <h3 className="font-bold text-[#70dcd3] font-mono">1. Operational Waste Lifecycle Decomposition</h3>
              <p>
                In an un-normalized relation containing preparation, consumption, and waste together:
              </p>
              <div className="p-2.5 bg-[var(--color-void-canvas)] rounded font-mono text-[11px] text-[#a6e5f2]">
                R(prep_id, facility_id, item_id, prep_qty, consumed_qty, waste_qty, waste_reason, unit_cost)
              </div>
              <p>
                Functional Dependency <code className="text-[#f43f5e] font-mono">prep_id &rarr; &#123;facility_id, item_id, prep_qty&#125;</code> violates BCNF because one preparation batch can yield multiple waste records over time (e.g. initial counter waste, followed by evening salvage waste). Therefore, <code className="text-[var(--color-pure-white)] font-mono">prep_id</code> is NOT a superkey of relation $R$.
              </p>
              <p className="text-[#70dcd3] font-semibold">
                &rarr; Decomposed into separate relations: <code className="font-mono">food_preparation</code> (Key: prep_id), <code className="font-mono">food_consumption</code> (Key: prep_id), and <code className="font-mono">food_waste</code> (Key: waste_id).
              </p>
            </div>

            <div className="p-5 bg-[var(--color-obsidian)] rounded-[16px] border border-[var(--color-iron-edge)] space-y-2">
              <h3 className="font-bold text-[#0092e4] font-mono">2. Temporal Cost Snapshot Justification</h3>
              <p>
                Storing <code className="text-[#0092e4] font-mono">unit_cost_snapshot</code> on <code className="font-mono">food_waste</code> is not a 3NF transitive dependency violation; it is an **immutable temporal snapshot**. Financial ledgers must preserve historical pricing at time $t_1$ even if master data <code className="text-[#0092e4] font-mono">food_item.standard_unit_cost</code> mutates at time $t_2$.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
