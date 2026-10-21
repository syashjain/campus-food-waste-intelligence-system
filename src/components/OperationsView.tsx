import React, { useState } from 'react';
import { 
  ChefHat, Scale, Trash2, Calendar, PlusCircle, CheckCircle, 
  AlertCircle, Users, Check, Clock, ShieldCheck, MapPin, 
  Sparkles, Layers, Compass
} from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';
import { MeasurementUnit, WasteClassification } from '../types/db';
import { GeospatialFacilitiesMap } from './GeospatialFacilitiesMap';

export const OperationsView: React.FC = () => {
  const { state, db } = useRelationalDatabase();
  const [activeSubTab, setActiveSubTab] = useState<'prep' | 'consumption' | 'waste' | 'attendance' | 'menu' | 'geospatial'>('waste');
  
  // Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states: Preparation
  const [prepFacilityId, setPrepFacilityId] = useState(state.currentFacilityId);
  const [prepMealId, setPrepMealId] = useState(2); // Lunch
  const [prepItemId, setPrepItemId] = useState(state.foodItems[0].item_id);
  const [prepQuantity, setPrepQuantity] = useState(50);
  const [prepNotes, setPrepNotes] = useState('');

  // Form states: Consumption
  const [consPrepId, setConsPrepId] = useState('');
  const [consQuantity, setConsQuantity] = useState(45);
  const [consMeasurementType, setConsMeasurementType] = useState<'ACTUAL_SCALE' | 'ESTIMATED_TALLY'>('ACTUAL_SCALE');

  // Form states: Waste
  const [wastePrepId, setWastePrepId] = useState('');
  const [wasteQuantity, setWasteQuantity] = useState(8);
  const [wasteCategory, setWasteCategory] = useState<WasteClassification>('EDIBLE_LEFTOVER');
  const [wasteReasonId, setWasteReasonId] = useState(1);
  const [wasteMethodId, setWasteMethodId] = useState(1);
  const [wastePantryId, setWastePantryId] = useState('');

  // Form states: Attendance
  const [attExpected, setAttExpected] = useState(650);
  const [attActual, setAttActual] = useState(580);

  const selectedDatePreps = state.preparations.filter(p => p.prep_date === state.selectedDate);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Submit Handlers
  const handleCreatePrep = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    try {
      const selectedItem = state.foodItems.find(i => i.item_id === prepItemId);
      const newPrep = db.recordPreparation({
        facilityId: prepFacilityId,
        mealId: prepMealId,
        prepDate: state.selectedDate,
        itemId: prepItemId,
        preparedQuantity: Number(prepQuantity),
        unit: selectedItem?.standard_unit || 'KG',
        notes: prepNotes
      });
      setSuccessMsg(`Preparation recorded successfully! Batch ID: ${newPrep.batch_number}`);
      setPrepNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'System error recording preparation.');
    }
  };

  const handleRecordConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!consPrepId) {
      setErrorMsg('Please select a valid preparation batch.');
      return;
    }
    try {
      const newCons = db.recordConsumption(
        consPrepId,
        Number(consQuantity),
        consMeasurementType
      );
      setSuccessMsg(`Consumption log #${newCons.consumption_id} verified against trigger constraint.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Constraint violation on consumption.');
    }
  };

  const handleRecordWaste = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!wastePrepId) {
      setErrorMsg('Please select a valid preparation batch to attribute this waste.');
      return;
    }
    try {
      const prep = state.preparations.find(p => p.prep_id === wastePrepId);
      if (!prep) throw new Error('Referenced prep batch not found');

      const newWaste = db.recordWaste({
        prepId: wastePrepId,
        wasteQuantity: Number(wasteQuantity),
        unit: prep.unit,
        wasteCategory,
        reasonId: wasteReasonId,
        methodId: wasteMethodId,
        pantryPartnerId: wastePantryId || undefined
      });

      setSuccessMsg(`Food waste incident committed! Snapshot Cost Loss calculated: ₹${newWaste.estimated_waste_cost}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing food waste trigger.');
    }
  };

  const handleRecordAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    try {
      const newAtt = db.recordAttendance({
        facilityId: state.currentFacilityId,
        mealId: 2, // Lunch
        attendanceDate: state.selectedDate,
        expectedAttendance: Number(attExpected),
        actualAttendance: Number(attActual)
      });
      setSuccessMsg(`Turnstile attendance logged! Generated variance: ${newAtt.variance_count} students`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Database error recording attendance.');
    }
  };

  return (
    <div className="p-2 sm:p-4 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 harness-card p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-light text-[#ffffff] flex items-center gap-2.5 tracking-[0.056em]">
            <ChefHat className="w-6 h-6 text-[#70dcd3]" />
            Kitchen &amp; Dining Operations
          </h1>
          <p className="text-xs sm:text-sm text-[#aeaeb7] mt-1">
            Operational batch capture enforcing database integrity constraints and forensic triggers.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] p-1 rounded-full text-xs">
          <button
            onClick={() => { setActiveSubTab('waste'); clearMessages(); }}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeSubTab === 'waste' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            Waste Entry
          </button>
          <button
            onClick={() => { setActiveSubTab('consumption'); clearMessages(); }}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeSubTab === 'consumption' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            Consumption
          </button>
          <button
            onClick={() => { setActiveSubTab('prep'); clearMessages(); }}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeSubTab === 'prep' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            Preparation
          </button>
          <button
            onClick={() => { setActiveSubTab('attendance'); clearMessages(); }}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeSubTab === 'attendance' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => { setActiveSubTab('geospatial'); clearMessages(); }}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'geospatial' ? 'bg-[#70dcd3] text-[#070707] font-bold' : 'text-[#70dcd3] hover:text-[var(--color-pure-white)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Spatial Map (PostGIS)</span>
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {errorMsg && (
        <div className="p-4 bg-[#141418] border border-[#f43f5e] rounded-[16px] text-[#f43f5e] text-xs font-mono flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#f43f5e] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[#ffffff]">Database Constraint / Trigger Violation</span>
            <p className="leading-relaxed text-[#c8cad0]">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-[#141418] border border-[#75ae4c] rounded-[16px] text-[#70dcd3] text-xs flex items-center gap-3 font-mono">
          <CheckCircle className="w-5 h-5 text-[#75ae4c] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: WASTE ENTRY (PRD Section 9.8 & 20.1) */}
      {activeSubTab === 'waste' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 harness-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#22222a] pb-3">
              <div>
                <h2 className="text-base font-light text-[#ffffff] flex items-center gap-2 tracking-[0.056em]">
                  <Trash2 className="w-4 h-4 text-[#f43f5e]" />
                  Record Food Waste Incident
                </h2>
                <p className="text-xs text-[#aeaeb7]">Triggers snapshot of unit cost basis and commits audit event</p>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full border border-[#f43f5e] text-[#f43f5e]">
                trg_calculate_waste_cost_snapshot
              </span>
            </div>

            <form onSubmit={handleRecordWaste} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#aeaeb7] mb-1">
                  Preparation Batch Reference (Foreign Key)
                </label>
                <select
                  value={wastePrepId}
                  onChange={(e) => setWastePrepId(e.target.value)}
                  className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff] focus:outline-none"
                  required
                >
                  <option value="">-- Choose Prepared Batch for {state.selectedDate} --</option>
                  {selectedDatePreps.map(p => {
                    const item = state.foodItems.find(i => i.item_id === p.item_id);
                    const meal = state.meals.find(m => m.meal_id === p.meal_id);
                    return (
                      <option key={p.prep_id} value={p.prep_id} className="bg-[#0d0e12] text-[#ffffff]">
                        [{meal?.meal_name}] {item?.item_name} - Prepared: {p.prepared_quantity} {p.unit} ({p.batch_number})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#aeaeb7] mb-1">
                    Waste Quantity (kg/units)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={wasteQuantity}
                    onChange={(e) => setWasteQuantity(Number(e.target.value))}
                    className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff] font-mono focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#aeaeb7] mb-1">
                    Waste Category (PRD Section 9.8)
                  </label>
                  <select
                    value={wasteCategory}
                    onChange={(e) => setWasteCategory(e.target.value as WasteClassification)}
                    className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff] focus:outline-none"
                  >
                    <option value="EDIBLE_LEFTOVER" className="bg-[#0d0e12] text-[#ffffff]">EDIBLE_LEFTOVER (Safe for rescue)</option>
                    <option value="SPOILED_FOOD" className="bg-[#0d0e12] text-[#ffffff]">SPOILED_FOOD (Sour / Rotten)</option>
                    <option value="PREPARATION_WASTE" className="bg-[#0d0e12] text-[#ffffff]">PREPARATION_WASTE (Peels / Trimmings)</option>
                    <option value="SERVING_WASTE" className="bg-[#0d0e12] text-[#ffffff]">SERVING_WASTE (Counter Residue)</option>
                    <option value="PLATE_WASTE" className="bg-[#0d0e12] text-[#ffffff]">PLATE_WASTE (Student plate scrap)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#aeaeb7] mb-1">
                    Controlled Waste Reason (PRD Section 9.9)
                  </label>
                  <select
                    value={wasteReasonId}
                    onChange={(e) => setWasteReasonId(Number(e.target.value))}
                    className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff] focus:outline-none"
                  >
                    {state.wasteReasons.map(r => (
                      <option key={r.reason_id} value={r.reason_id} className="bg-[#0d0e12] text-[#ffffff]">
                        {r.reason_name} ({r.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#aeaeb7] mb-1">
                    Disposal Method / Diversion Destination
                  </label>
                  <select
                    value={wasteMethodId}
                    onChange={(e) => setWasteMethodId(Number(e.target.value))}
                    className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff] focus:outline-none"
                  >
                    {state.disposalMethods.map(m => (
                      <option key={m.method_id} value={m.method_id} className="bg-[#0d0e12] text-[#ffffff]">
                        {m.method_name} (Eco Score: {m.environmental_score}/10)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {wasteCategory === 'EDIBLE_LEFTOVER' && (
                <div className="p-3.5 bg-[#141418] border border-[#2e3038] rounded-[14px] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#70dcd3]">
                    <MapPin className="w-3.5 h-3.5 text-[#70dcd3]" />
                    PostGIS Spatial Rescue Dispatch Available
                  </div>
                  <p className="text-[11px] text-[#aeaeb7]">
                    Route this surplus batch directly to registered campus food bank pantry partners.
                  </p>
                  <select
                    value={wastePantryId}
                    onChange={(e) => setWastePantryId(e.target.value)}
                    className="w-full harness-input rounded-[5px] p-2 text-xs text-[#ffffff] focus:outline-none"
                  >
                    <option value="" className="bg-[#0d0e12] text-[#ffffff]">-- Select Verified Pantry Partner (Optional) --</option>
                    {state.pantryPartners.map(p => (
                      <option key={p.pantry_id} value={p.pantry_id} className="bg-[#0d0e12] text-[#ffffff]">
                        {p.partner_name} (Capacity: {p.storage_capacity_kg}kg)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-6 rounded-full harness-btn-primary transition-colors flex items-center justify-center gap-2 min-h-[42px]"
              >
                <PlusCircle className="w-4 h-4" />
                Commit Waste Record &amp; Snapshot Cost Basis
              </button>
            </form>
          </div>

          {/* Side Info & Rules Card */}
          <div className="harness-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#ffffff] flex items-center gap-2 tracking-tight">
              <ShieldCheck className="w-4 h-4 text-[#75ae4c]" />
              DBMS Rule Enforcement
            </h3>
            <div className="space-y-3 text-xs text-[#aeaeb7]">
              <div className="p-3 bg-[#141418] border border-[#2e3038] rounded-[14px]">
                <strong className="text-[#ffffff] block">Rule #13: Unit Cost Snapshot</strong>
                The unit price of the food item is frozen into the waste tuple at transaction time. If procurement costs change next week, historical waste costs remain unaltered.
              </div>
              <div className="p-3 bg-[#141418] border border-[#2e3038] rounded-[14px]">
                <strong className="text-[#ffffff] block">Rule #11: Facility Active Guard</strong>
                Deactivated mess facilities cannot accept waste inputs. Triggers check <code className="text-[#0092e4] font-mono">facility.is_active = TRUE</code>.
              </div>
              <div className="p-3 bg-[#141418] border border-[#2e3038] rounded-[14px]">
                <strong className="text-[#ffffff] block">Range Partitioning Target</strong>
                Inserts route automatically to partition table <code className="text-[#70dcd3] font-mono">food_waste_2026_q4</code> based on date.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSUMPTION ENTRY (Demonstrates trg_validate_consumption_quantity) */}
      {activeSubTab === 'consumption' && (
        <div className="max-w-2xl harness-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#22222a] pb-3">
            <div>
              <h2 className="text-base font-light text-[#ffffff] flex items-center gap-2 tracking-[0.056em]">
                <Scale className="w-4 h-4 text-[#70dcd3]" />
                Record Measured Food Consumption
              </h2>
              <p className="text-xs text-[#aeaeb7]">Enforces Consumed Quantity &le; Prepared Quantity</p>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full border border-[#75ae4c] text-[#75ae4c]">
              trg_validate_consumption_quantity
            </span>
          </div>

          <form onSubmit={handleRecordConsumption} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#aeaeb7] mb-1">
                Select Preparation Batch
              </label>
              <select
                value={consPrepId}
                onChange={(e) => {
                  setConsPrepId(e.target.value);
                  const prep = selectedDatePreps.find(p => p.prep_id === e.target.value);
                  if (prep) setConsQuantity(Math.round(prep.prepared_quantity * 0.9));
                }}
                className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff] focus:outline-none"
                required
              >
                <option value="">-- Choose Prep Batch for {state.selectedDate} --</option>
                {selectedDatePreps.map(p => {
                  const item = state.foodItems.find(i => i.item_id === p.item_id);
                  const meal = state.meals.find(m => m.meal_id === p.meal_id);
                  return (
                    <option key={p.prep_id} value={p.prep_id} className="bg-[#0d0e12] text-[#ffffff]">
                      [{meal?.meal_name}] {item?.item_name} - Prepared: {p.prepared_quantity} {p.unit} ({p.batch_number})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#aeaeb7] mb-1">
                Measured Consumed Quantity (Test trigger with value &gt; Prepared)
              </label>
              <input
                type="number"
                step="0.1"
                value={consQuantity}
                onChange={(e) => setConsQuantity(Number(e.target.value))}
                className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff] font-mono focus:outline-none"
                required
              />
              <p className="text-[11px] text-[#60606c] mt-1">
                Tip: Try inputting <strong className="text-[#70dcd3] font-mono">9999</strong> to watch the database trigger immediately raise a <code className="text-[#f43f5e] font-mono">check_violation</code>!
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#aeaeb7] mb-1">
                Measurement Methodology
              </label>
              <select
                value={consMeasurementType}
                onChange={(e) => setConsMeasurementType(e.target.value as any)}
                className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff] focus:outline-none"
              >
                <option value="ACTUAL_SCALE" className="bg-[#0d0e12] text-[#ffffff]">ACTUAL_SCALE (Calibrated Kitchen Floor Scale)</option>
                <option value="ESTIMATED_TALLY" className="bg-[#0d0e12] text-[#ffffff]">ESTIMATED_TALLY (Portion Ladle Tally Estimation)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-6 rounded-full harness-btn-primary transition-colors flex items-center justify-center gap-2 min-h-[42px]"
            >
              <Check className="w-4 h-4" />
              Save Consumption &amp; Enforce Upper Bound
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PREPARATION ENTRY */}
      {activeSubTab === 'prep' && (
        <div className="max-w-2xl harness-card p-6 space-y-5">
          <div className="border-b border-[#22222a] pb-3">
            <h2 className="text-base font-light text-[#ffffff] flex items-center gap-2 tracking-[0.056em]">
              <ChefHat className="w-4 h-4 text-[#0092e4]" />
              Kitchen Food Preparation Entry
            </h2>
            <p className="text-xs text-[#aeaeb7]">Log planned batch cooking for the day</p>
          </div>

          <form onSubmit={handleCreatePrep} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#aeaeb7] mb-1">Mess Facility</label>
                <select
                  value={prepFacilityId}
                  onChange={(e) => setPrepFacilityId(e.target.value)}
                  className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff]"
                >
                  {db.getRlsFacilities().map(f => (
                    <option key={f.facility_id} value={f.facility_id} className="bg-[#0d0e12] text-[#ffffff]">{f.facility_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#aeaeb7] mb-1">Meal Period</label>
                <select
                  value={prepMealId}
                  onChange={(e) => setPrepMealId(Number(e.target.value))}
                  className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff]"
                >
                  {state.meals.map(m => (
                    <option key={m.meal_id} value={m.meal_id} className="bg-[#0d0e12] text-[#ffffff]">{m.meal_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#aeaeb7] mb-1">Food Item</label>
                <select
                  value={prepItemId}
                  onChange={(e) => setPrepItemId(e.target.value)}
                  className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff]"
                >
                  {state.foodItems.filter(i => i.is_active).map(i => (
                    <option key={i.item_id} value={i.item_id} className="bg-[#0d0e12] text-[#ffffff]">
                      {i.item_name} ({i.standard_unit}) - ₹{i.standard_unit_cost}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#aeaeb7] mb-1">Prepared Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={prepQuantity}
                  onChange={(e) => setPrepQuantity(Number(e.target.value))}
                  className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff] font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#aeaeb7] mb-1">Kitchen Notes</label>
              <input
                type="text"
                placeholder="e.g. Extra batch prepared for guest delegates"
                value={prepNotes}
                onChange={(e) => setPrepNotes(e.target.value)}
                className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[#ffffff]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-6 rounded-full harness-btn-primary transition-colors flex items-center justify-center gap-2 min-h-[42px]"
            >
              <PlusCircle className="w-4 h-4" />
              Register Preparation Batch
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ATTENDANCE ENTRY */}
      {activeSubTab === 'attendance' && (
        <div className="max-w-2xl harness-card p-6 space-y-5">
          <div className="border-b border-[var(--color-steel-border)] pb-3">
            <h2 className="text-base font-light text-[var(--color-pure-white)] flex items-center gap-2 tracking-[0.056em]">
              <Users className="w-4 h-4 text-[#a6e5f2]" />
              Dining Attendance &amp; Biometric Turnstile Headcount
            </h2>
            <p className="text-xs text-[var(--color-graphite)]">Stores expected demand vs turnstile count for correlation</p>
          </div>

          <form onSubmit={handleRecordAttendance} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-graphite)] mb-1">Expected Attendance</label>
                <input
                  type="number"
                  min="0"
                  value={attExpected}
                  onChange={(e) => setAttExpected(Number(e.target.value))}
                  className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[var(--color-pure-white)] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-graphite)] mb-1">Actual Attendance (Turnstile Count)</label>
                <input
                  type="number"
                  min="0"
                  value={attActual}
                  onChange={(e) => setAttActual(Number(e.target.value))}
                  className="w-full harness-input rounded-[5px] p-2.5 text-xs text-[var(--color-pure-white)] font-mono"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-[14px] text-xs text-[var(--color-graphite)] flex justify-between">
              <span>Computed Generated Variance:</span>
              <span className={`font-mono font-bold ${attActual - attExpected < 0 ? 'text-[#f43f5e]' : 'text-[#70dcd3]'}`}>
                {attActual - attExpected} students
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-6 rounded-full harness-btn-primary transition-colors flex items-center justify-center gap-2 min-h-[42px] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Attendance Record
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: GEOSPATIAL POSTGIS RADAR & RESCUE ROUTING */}
      {activeSubTab === 'geospatial' && (
        <GeospatialFacilitiesMap />
      )}

    </div>
  );
};
