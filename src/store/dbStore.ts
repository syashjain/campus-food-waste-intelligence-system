import { useState, useEffect } from 'react';
import { 
  Campus, Facility, FoodPantryPartner, Role, UserAccount, 
  FoodCategory, FoodItem, Meal, WasteReason, DisposalMethod, 
  Vendor, CampusEvent, Menu, MenuItem, Attendance, FoodPreparation, 
  FoodConsumption, FoodWaste, Purchase, AuditLog, RoleCategory 
} from '../types/db';
import { 
  INITIAL_CAMPUSES, INITIAL_FACILITIES, INITIAL_PANTRY_PARTNERS, 
  INITIAL_ROLES, INITIAL_USERS, INITIAL_FOOD_CATEGORIES, INITIAL_FOOD_ITEMS, 
  INITIAL_MEALS, INITIAL_WASTE_REASONS, INITIAL_DISPOSAL_METHODS, 
  INITIAL_VENDORS, INITIAL_EVENTS, generate30DayOperationalHistory 
} from '../data/initialData';

export interface DatabaseState {
  campuses: Campus[];
  facilities: Facility[];
  pantryPartners: FoodPantryPartner[];
  roles: Role[];
  users: UserAccount[];
  foodCategories: FoodCategory[];
  foodItems: FoodItem[];
  meals: Meal[];
  wasteReasons: WasteReason[];
  disposalMethods: DisposalMethod[];
  vendors: Vendor[];
  campusEvents: CampusEvent[];
  menus: Menu[];
  menuItems: MenuItem[];
  attendances: Attendance[];
  preparations: FoodPreparation[];
  consumptions: FoodConsumption[];
  wastes: FoodWaste[];
  purchases: Purchase[];
  auditLogs: AuditLog[];
  
  // Session Variables (RLS Simulation)
  currentCampusId: string;
  currentUserId: string;
  currentUserRole: RoleCategory;
  currentFacilityId: string;
  selectedDate: string;
  filterStartDate: string;
  filterEndDate: string;
}

// Global In-Memory Relational Engine Instance
class RelationalDatabaseEngine {
  private state: DatabaseState;
  private listeners: Array<() => void> = [];

  constructor() {
    const seed = generate30DayOperationalHistory();
    this.state = {
      campuses: INITIAL_CAMPUSES,
      facilities: INITIAL_FACILITIES,
      pantryPartners: INITIAL_PANTRY_PARTNERS,
      roles: INITIAL_ROLES,
      users: INITIAL_USERS,
      foodCategories: INITIAL_FOOD_CATEGORIES,
      foodItems: INITIAL_FOOD_ITEMS,
      meals: INITIAL_MEALS,
      wasteReasons: INITIAL_WASTE_REASONS,
      disposalMethods: INITIAL_DISPOSAL_METHODS,
      vendors: INITIAL_VENDORS,
      campusEvents: INITIAL_EVENTS,
      menus: seed.menus,
      menuItems: seed.menuItems,
      attendances: seed.attendances,
      preparations: seed.preparations,
      consumptions: seed.consumptions,
      wastes: seed.wastes,
      purchases: seed.purchases,
      auditLogs: seed.audits,
      currentCampusId: '11111111-1111-1111-1111-111111111111',
      currentUserId: '55555555-5555-5555-5555-555555555501',
      currentUserRole: 'SUPER_ADMIN',
      currentFacilityId: '33333333-3333-3333-3333-333333333301',
      selectedDate: '2026-10-04',
      filterStartDate: '2026-09-01',
      filterEndDate: '2026-10-05'
    };
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // Session Context Setters (Simulating SET LOCAL app.current_campus_id)
  public setSessionContext(campusId: string, userId: string, role: RoleCategory, facilityId?: string) {
    this.state = {
      ...this.state,
      currentCampusId: campusId,
      currentUserId: userId,
      currentUserRole: role,
      currentFacilityId: facilityId || this.state.facilities.find(f => f.campus_id === campusId)?.facility_id || this.state.currentFacilityId
    };
    this.notify();
  }

  public setDateFilter(startDate: string, endDate: string) {
    this.state = {
      ...this.state,
      filterStartDate: startDate,
      filterEndDate: endDate
    };
    this.notify();
  }

  public setSelectedDate(date: string) {
    this.state = {
      ...this.state,
      selectedDate: date
    };
    this.notify();
  }

  // --- RLS FILTERED GETTERS ---
  // In PostgreSQL, RLS filters tables based on current_setting('app.current_campus_id')
  public getRlsFacilities(): Facility[] {
    if (this.state.currentUserRole === 'SUPER_ADMIN' || this.state.currentUserRole === 'FINANCE_OFFICER') {
      return this.state.facilities;
    }
    return this.state.facilities.filter(f => f.campus_id === this.state.currentCampusId);
  }

  public getRlsPreparations(): FoodPreparation[] {
    const facilities = this.getRlsFacilities().map(f => f.facility_id);
    return this.state.preparations.filter(p => facilities.includes(p.facility_id));
  }

  public getRlsWastes(): FoodWaste[] {
    const facilities = this.getRlsFacilities().map(f => f.facility_id);
    return this.state.wastes.filter(w => facilities.includes(w.facility_id));
  }

  // --- TRIGGER: validate_consumption_quantity (PRD Section 18) ---
  public recordConsumption(prepId: string, consumedQty: number, measurementType: 'ACTUAL_SCALE' | 'ESTIMATED_TALLY', notes?: string) {
    const prep = this.state.preparations.find(p => p.prep_id === prepId);
    if (!prep) {
      throw new Error(`[foreign_key_violation 23503] Preparation record '${prepId}' does not exist.`);
    }

    if (consumedQty < 0) {
      throw new Error(`[check_violation 23514] Consumed quantity (${consumedQty}) cannot be negative.`);
    }

    // Trigger Execution
    if (consumedQty > prep.prepared_quantity) {
      const item = this.state.foodItems.find(i => i.item_id === prep.item_id);
      throw new Error(
        `[check_violation: trg_validate_consumption_quantity] Consumed quantity (${consumedQty} ${prep.unit}) exceeds prepared quantity (${prep.prepared_quantity} ${prep.unit}) for item '${item?.item_name || prep.item_id}'. Transaction aborted.`
      );
    }

    const existingIdx = this.state.consumptions.findIndex(c => c.prep_id === prepId);
    let newConsumptions = [...this.state.consumptions];
    const consId = `cons-${prepId}`;

    const newRecord: FoodConsumption = {
      consumption_id: consId,
      prep_id: prepId,
      consumed_quantity: consumedQty,
      unit: prep.unit,
      measurement_type: measurementType,
      recorded_by: this.state.currentUserId,
      recorded_at: new Date().toISOString(),
      notes
    };

    if (existingIdx >= 0) {
      newConsumptions[existingIdx] = newRecord;
    } else {
      newConsumptions.push(newRecord);
    }

    // Log to Audit Trail
    const newAudits = [
      ...this.state.auditLogs,
      {
        audit_id: this.state.auditLogs.length + 1,
        campus_id: this.state.currentCampusId,
        table_name: 'food_consumption',
        operation_type: (existingIdx >= 0 ? 'UPDATE' : 'INSERT') as any,
        record_pk: consId,
        new_data: { prepId, consumedQty, unit: prep.unit },
        changed_by: this.state.currentUserId,
        executed_at: new Date().toISOString()
      }
    ];

    this.state = {
      ...this.state,
      consumptions: newConsumptions,
      auditLogs: newAudits
    };
    this.notify();
    return newRecord;
  }

  // --- TRIGGER: calculate_waste_cost_snapshot (PRD Section 18) ---
  public recordWaste(params: {
    prepId: string;
    wasteQuantity: number;
    unit: any;
    wasteCategory: any;
    reasonId: number;
    methodId?: number;
    pantryPartnerId?: string;
    notes?: string;
  }) {
    const prep = this.state.preparations.find(p => p.prep_id === params.prepId);
    if (!prep) {
      throw new Error(`[foreign_key_violation 23503] Preparation batch '${params.prepId}' not found.`);
    }

    if (params.wasteQuantity < 0) {
      throw new Error(`[check_violation 23514] Waste quantity cannot be negative.`);
    }

    const facility = this.state.facilities.find(f => f.facility_id === prep.facility_id);
    if (facility && !facility.is_active) {
      throw new Error(`[integrity_constraint_violation: Rule 11] Facility '${facility.facility_name}' is deactivated and cannot record new waste events.`);
    }

    const item = this.state.foodItems.find(i => i.item_id === prep.item_id);
    if (item && !item.is_active) {
      throw new Error(`[integrity_constraint_violation: Rule 10] Food Item '${item.item_name}' is deactivated and cannot be selected.`);
    }

    // Trigger computes snapshot cost basis
    const unitCostSnapshot = item ? item.standard_unit_cost : 50.00;
    const estimatedCost = Math.round(params.wasteQuantity * unitCostSnapshot * 100) / 100;
    const wasteId = `waste-${params.prepId}-${Date.now()}`;

    const newWasteRecord: FoodWaste = {
      waste_id: wasteId,
      prep_id: params.prepId,
      facility_id: prep.facility_id,
      item_id: prep.item_id,
      meal_id: prep.meal_id,
      waste_date: prep.prep_date,
      waste_quantity: params.wasteQuantity,
      unit: params.unit || prep.unit,
      waste_category: params.wasteCategory,
      reason_id: params.reasonId,
      method_id: params.methodId,
      pantry_partner_id: params.pantryPartnerId,
      unit_cost_snapshot: unitCostSnapshot,
      estimated_waste_cost: estimatedCost,
      reported_by: this.state.currentUserId,
      recorded_at: new Date().toISOString(),
      notes: params.notes
    };

    const newAudits = [
      ...this.state.auditLogs,
      {
        audit_id: this.state.auditLogs.length + 1,
        campus_id: this.state.currentCampusId,
        table_name: 'food_waste',
        operation_type: 'INSERT' as any,
        record_pk: wasteId,
        new_data: { 
          item_name: item?.item_name, 
          qty: params.wasteQuantity, 
          cost_snapshot: unitCostSnapshot, 
          estimated_cost: estimatedCost 
        },
        changed_by: this.state.currentUserId,
        executed_at: new Date().toISOString()
      }
    ];

    this.state = {
      ...this.state,
      wastes: [newWasteRecord, ...this.state.wastes],
      auditLogs: newAudits
    };
    this.notify();
    return newWasteRecord;
  }

  // --- PROCEDURE: sp_record_daily_waste with Atomic Rollback Simulation ---
  public executeWasteTransactionWorkflow(params: {
    prepId: string;
    wasteQuantity: number;
    reasonId: number;
    shouldSimulateRollback: boolean;
  }) {
    // Stage 1: Validate Prep
    const prep = this.state.preparations.find(p => p.prep_id === params.prepId);
    if (!prep) throw new Error("Transaction Rollback: Invalid preparation ID.");

    // Stage 2: Check simulated rollback switch
    if (params.shouldSimulateRollback) {
      // Record failed transaction to audit log and throw
      const auditRollback: AuditLog = {
        audit_id: this.state.auditLogs.length + 1,
        campus_id: this.state.currentCampusId,
        table_name: 'food_waste',
        operation_type: 'ROLLBACK',
        new_data: { reason: 'Simulated Network Failure / Constraint Breach at Step 4', params },
        changed_by: this.state.currentUserId,
        executed_at: new Date().toISOString()
      };
      this.state = {
        ...this.state,
        auditLogs: [...this.state.auditLogs, auditRollback]
      };
      this.notify();
      throw new Error(`[TRANSACTION_ABORTED_AND_ROLLED_BACK] Simulated synthetic fault triggered mid-flight. ACID rollback completed: 0 rows modified.`);
    }

    return this.recordWaste({
      prepId: params.prepId,
      wasteQuantity: params.wasteQuantity,
      unit: prep.unit,
      wasteCategory: 'EDIBLE_LEFTOVER',
      reasonId: params.reasonId,
      notes: 'Executed via sp_record_daily_waste'
    });
  }

  // Master Data Mutators
  public toggleFacilityActive(facilityId: string) {
    const f = this.state.facilities.find(fac => fac.facility_id === facilityId);
    if (!f) return;
    const updated = { ...f, is_active: !f.is_active };

    const newFacilities = this.state.facilities.map(fac => fac.facility_id === facilityId ? updated : fac);
    const newAudit: AuditLog = {
      audit_id: this.state.auditLogs.length + 1,
      campus_id: f.campus_id,
      table_name: 'facility',
      operation_type: 'UPDATE',
      record_pk: facilityId,
      old_data: { is_active: f.is_active },
      new_data: { is_active: updated.is_active },
      changed_by: this.state.currentUserId,
      executed_at: new Date().toISOString()
    };

    this.state = {
      ...this.state,
      facilities: newFacilities,
      auditLogs: [...this.state.auditLogs, newAudit]
    };
    this.notify();
  }

  public toggleFoodItemActive(itemId: string) {
    const item = this.state.foodItems.find(i => i.item_id === itemId);
    if (!item) return;
    const updated = { ...item, is_active: !item.is_active };

    const newItems = this.state.foodItems.map(i => i.item_id === itemId ? updated : i);
    const newAudit: AuditLog = {
      audit_id: this.state.auditLogs.length + 1,
      campus_id: this.state.currentCampusId,
      table_name: 'food_item',
      operation_type: 'UPDATE',
      record_pk: itemId,
      old_data: { is_active: item.is_active },
      new_data: { is_active: updated.is_active },
      changed_by: this.state.currentUserId,
      executed_at: new Date().toISOString()
    };

    this.state = {
      ...this.state,
      foodItems: newItems,
      auditLogs: [...this.state.auditLogs, newAudit]
    };
    this.notify();
  }

  public recordPreparation(params: {
    facilityId: string;
    mealId: number;
    prepDate: string;
    itemId: string;
    preparedQuantity: number;
    unit: any;
    notes?: string;
  }) {
    if (params.preparedQuantity < 0) {
      throw new Error(`[check_violation 23514] Prepared quantity cannot be negative.`);
    }

    const prepId = `prep-${params.prepDate}-${Date.now()}`;
    const newPrep: FoodPreparation = {
      prep_id: prepId,
      facility_id: params.facilityId,
      menu_id: `menu-custom-${params.prepDate}`,
      item_id: params.itemId,
      prep_date: params.prepDate,
      meal_id: params.mealId,
      prepared_quantity: params.preparedQuantity,
      unit: params.unit,
      batch_number: `BATCH-${Date.now().toString().slice(-4)}`,
      prepared_by: this.state.currentUserId,
      created_at: new Date().toISOString(),
      notes: params.notes
    };

    this.state = {
      ...this.state,
      preparations: [newPrep, ...this.state.preparations],
      auditLogs: [
        ...this.state.auditLogs,
        {
          audit_id: this.state.auditLogs.length + 1,
          campus_id: this.state.currentCampusId,
          table_name: 'food_preparation',
          operation_type: 'INSERT',
          record_pk: prepId,
          new_data: { item_id: params.itemId, qty: params.preparedQuantity },
          changed_by: this.state.currentUserId,
          executed_at: new Date().toISOString()
        }
      ]
    };
    this.notify();
    return newPrep;
  }

  public recordAttendance(params: {
    facilityId: string;
    mealId: number;
    attendanceDate: string;
    expectedAttendance: number;
    actualAttendance: number;
    method?: string;
  }) {
    const existingIdx = this.state.attendances.findIndex(
      a => a.facility_id === params.facilityId && a.meal_id === params.mealId && a.attendance_date === params.attendanceDate
    );

    const attId = `att-${params.attendanceDate}-${params.facilityId}-${params.mealId}`;
    const newAtt: Attendance = {
      attendance_id: attId,
      facility_id: params.facilityId,
      meal_id: params.mealId,
      attendance_date: params.attendanceDate,
      expected_attendance: params.expectedAttendance,
      actual_attendance: params.actualAttendance,
      variance_count: params.actualAttendance - params.expectedAttendance,
      head_count_method: params.method || 'BIOMETRIC_TURNSTILE',
      recorded_by: this.state.currentUserId
    };

    let updated = [...this.state.attendances];
    if (existingIdx >= 0) {
      updated[existingIdx] = newAtt;
    } else {
      updated.push(newAtt);
    }

    this.state = {
      ...this.state,
      attendances: updated,
      auditLogs: [
        ...this.state.auditLogs,
        {
          audit_id: this.state.auditLogs.length + 1,
          campus_id: this.state.currentCampusId,
          table_name: 'attendance',
          operation_type: (existingIdx >= 0 ? 'UPDATE' : 'INSERT') as any,
          record_pk: attId,
          new_data: { expected: params.expectedAttendance, actual: params.actualAttendance },
          changed_by: this.state.currentUserId,
          executed_at: new Date().toISOString()
        }
      ]
    };
    this.notify();
    return newAtt;
  }

  // --- ANALYTICAL VIEW 1: vw_daily_waste_summary ---
  public getViewDailyWasteSummary() {
    const { preparations, consumptions, wastes, attendances, facilities, meals, campuses } = this.state;
    const rlsFacIds = this.getRlsFacilities().map(f => f.facility_id);

    // Group by operation date, facility, meal
    const keys = new Set<string>();
    preparations.filter(p => rlsFacIds.includes(p.facility_id)).forEach(p => {
      keys.add(`${p.prep_date}|${p.facility_id}|${p.meal_id}`);
    });

    const rows = Array.from(keys).map(k => {
      const [date, facId, mealIdStr] = k.split('|');
      const mealId = parseInt(mealIdStr);
      const fac = facilities.find(f => f.facility_id === facId);
      const campus = campuses.find(c => c.campus_id === fac?.campus_id);
      const meal = meals.find(m => m.meal_id === mealId);

      const preps = preparations.filter(p => p.prep_date === date && p.facility_id === facId && p.meal_id === mealId);
      const prepIds = preps.map(p => p.prep_id);
      const cons = consumptions.filter(c => prepIds.includes(c.prep_id));
      const wsts = wastes.filter(w => w.waste_date === date && w.facility_id === facId && w.meal_id === mealId);
      const att = attendances.find(a => a.attendance_date === date && a.facility_id === facId && a.meal_id === mealId);

      const totalPrep = preps.reduce((acc, curr) => acc + curr.prepared_quantity, 0);
      const totalCons = cons.reduce((acc, curr) => acc + curr.consumed_quantity, 0);
      const totalWaste = wsts.reduce((acc, curr) => acc + curr.waste_quantity, 0);
      const totalCost = wsts.reduce((acc, curr) => acc + curr.estimated_waste_cost, 0);
      const wastePct = totalPrep > 0 ? (totalWaste / totalPrep) * 100 : 0;

      return {
        operation_date: date,
        campus_id: campus?.campus_id,
        campus_name: campus?.name || 'Main Campus',
        facility_id: facId,
        facility_name: fac?.facility_name || 'Dining Hall',
        meal_id: mealId,
        meal_name: meal?.meal_name || 'Meal',
        total_prepared_qty: totalPrep,
        total_consumed_qty: totalCons,
        total_waste_qty: totalWaste,
        waste_percentage: Math.round(wastePct * 10) / 10,
        total_waste_cost: Math.round(totalCost * 100) / 100,
        expected_attendance: att?.expected_attendance || 0,
        actual_attendance: att?.actual_attendance || 0,
        attendance_variance: att?.variance_count || 0
      };
    });

    return rows.sort((a, b) => b.operation_date.localeCompare(a.operation_date));
  }

  // --- ANALYTICAL VIEW 2: vw_food_item_waste_analysis ---
  public getViewFoodItemWasteAnalysis() {
    const { foodItems, foodCategories, preparations, wastes, wasteReasons } = this.state;
    const rlsFacIds = this.getRlsFacilities().map(f => f.facility_id);

    return foodItems.map(item => {
      const cat = foodCategories.find(c => c.category_id === item.category_id);
      const itemPreps = preparations.filter(p => p.item_id === item.item_id && rlsFacIds.includes(p.facility_id));
      const itemWastes = wastes.filter(w => w.item_id === item.item_id && rlsFacIds.includes(w.facility_id));

      const timesPrepared = itemPreps.length;
      const totalPrepQty = itemPreps.reduce((a, b) => a + b.prepared_quantity, 0);
      const wasteIncidents = itemWastes.length;
      const totalWasteQty = itemWastes.reduce((a, b) => a + b.waste_quantity, 0);
      const totalFinancialLoss = itemWastes.reduce((a, b) => a + b.estimated_waste_cost, 0);
      const wasteRatePct = totalPrepQty > 0 ? (totalWasteQty / totalPrepQty) * 100 : 0;

      // Find top waste reason
      const reasonCount: Record<number, number> = {};
      itemWastes.forEach(w => {
        reasonCount[w.reason_id] = (reasonCount[w.reason_id] || 0) + 1;
      });
      let topReasonId = 1;
      let maxCnt = 0;
      Object.entries(reasonCount).forEach(([rid, cnt]) => {
        if (cnt > maxCnt) {
          maxCnt = cnt;
          topReasonId = parseInt(rid);
        }
      });
      const topReason = wasteReasons.find(r => r.reason_id === topReasonId);

      return {
        item_id: item.item_id,
        item_code: item.item_code,
        item_name: item.item_name,
        category_name: cat?.category_name || 'General',
        standard_unit: item.standard_unit,
        standard_unit_cost: item.standard_unit_cost,
        is_perishable: item.is_perishable,
        times_prepared: timesPrepared,
        total_prepared_qty: totalPrepQty,
        waste_incidents: wasteIncidents,
        total_waste_qty: Math.round(totalWasteQty * 10) / 10,
        total_financial_loss: Math.round(totalFinancialLoss),
        primary_waste_reason: topReason?.reason_name || 'Overproduction',
        item_waste_rate_pct: Math.round(wasteRatePct * 10) / 10
      };
    }).sort((a, b) => b.total_financial_loss - a.total_financial_loss);
  }

  // --- ANALYTICAL VIEW 3: vw_facility_performance ---
  public getViewFacilityPerformance() {
    const facilities = this.getRlsFacilities();
    const { preparations, consumptions, wastes, attendances } = this.state;

    return facilities.map(fac => {
      const fPreps = preparations.filter(p => p.facility_id === fac.facility_id);
      const fPrepIds = fPreps.map(p => p.prep_id);
      const fCons = consumptions.filter(c => fPrepIds.includes(c.prep_id));
      const fWastes = wastes.filter(w => w.facility_id === fac.facility_id);
      const fAtts = attendances.filter(a => a.facility_id === fac.facility_id);

      const totalPrep = fPreps.reduce((a, b) => a + b.prepared_quantity, 0);
      const totalCons = fCons.reduce((a, b) => a + b.consumed_quantity, 0);
      const totalWaste = fWastes.reduce((a, b) => a + b.waste_quantity, 0);
      const totalCost = fWastes.reduce((a, b) => a + b.estimated_waste_cost, 0);
      const wastePct = totalPrep > 0 ? (totalWaste / totalPrep) * 100 : 0;
      const totalAttendees = fAtts.reduce((a, b) => a + b.actual_attendance, 0);
      const wastePerStudent = totalAttendees > 0 ? totalWaste / totalAttendees : 0;

      return {
        facility_id: fac.facility_id,
        facility_name: fac.facility_name,
        facility_type: fac.facility_type,
        dining_capacity: fac.dining_capacity,
        operating_status: fac.operating_status,
        is_active: fac.is_active,
        total_prepared_qty: Math.round(totalPrep),
        total_consumed_qty: Math.round(totalCons),
        total_waste_qty: Math.round(totalWaste),
        total_waste_cost: Math.round(totalCost),
        facility_waste_percentage: Math.round(wastePct * 10) / 10,
        waste_kg_per_attendee: Math.round(wastePerStudent * 1000) / 1000,
        avg_daily_attendance: Math.round(totalAttendees / Math.max(1, fAtts.length))
      };
    });
  }

  // --- POSTGIS SPATIAL PROXIMITY CALCULATOR ---
  // Calculates Haversine/Euclidean distance simulating PostGIS ST_Distance(f.geom::geography, p.geom::geography)
  public getSpatialPantryDispatch(facilityId: string, radiusMeters: number = 5000) {
    const fac = this.state.facilities.find(f => f.facility_id === facilityId);
    if (!fac) return [];

    return this.state.pantryPartners.map(pantry => {
      // Haversine formula
      const R = 6371e3; // Earth radius in meters
      const lat1 = (fac.lat * Math.PI) / 180;
      const lat2 = (pantry.lat * Math.PI) / 180;
      const dLat = ((pantry.lat - fac.lat) * Math.PI) / 180;
      const dLon = ((pantry.lng - fac.lng) * Math.PI) / 180;

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceMeters = Math.round(R * c);

      return {
        facility_id: fac.facility_id,
        facility_name: fac.facility_name,
        pantry_id: pantry.pantry_id,
        pantry_name: pantry.partner_name,
        contact_person: pantry.contact_person,
        contact_phone: pantry.contact_phone,
        storage_capacity_kg: pantry.storage_capacity_kg,
        distance_meters: distanceMeters,
        distance_km: Math.round((distanceMeters / 1000) * 100) / 100,
        is_within_radius: distanceMeters <= radiusMeters
      };
    }).sort((a, b) => a.distance_meters - b.distance_meters);
  }

  // --- Waste Intelligence Score Formula (PRD Section 13) ---
  public getWasteIntelligenceScore(facilityId: string) {
    const fac = this.state.facilities.find(f => f.facility_id === facilityId);
    const preps = this.state.preparations.filter(p => p.facility_id === facilityId);
    const wastes = this.state.wastes.filter(w => w.facility_id === facilityId);
    const atts = this.state.attendances.filter(a => a.facility_id === facilityId);

    const totalPrep = preps.reduce((a, b) => a + b.prepared_quantity, 0);
    const totalWaste = wastes.reduce((a, b) => a + b.waste_quantity, 0);
    const totalCost = wastes.reduce((a, b) => a + b.estimated_waste_cost, 0);
    const avgVariance = atts.reduce((a, b) => a + Math.abs(b.variance_count), 0) / Math.max(1, atts.length);

    const wastePct = totalPrep > 0 ? (totalWaste / totalPrep) * 100 : 0;
    
    // Sub-scores: Waste Rate (0-40), Cost Impact (0-35), Attendance drift (0-25)
    const c1 = Math.min(40, (wastePct / 25) * 40);
    const c2 = Math.min(35, (totalCost / 80000) * 35);
    const c3 = Math.min(25, (avgVariance / 40) * 25);
    const composite = Math.round((c1 + c2 + c3) * 10) / 10;

    let rating = 'EXCELLENT (LEAN OPERATIONS)';
    if (composite >= 70) rating = 'CRITICAL WASTE ANOMALY';
    else if (composite >= 45) rating = 'MODERATE CONCERN';
    else if (composite >= 25) rating = 'GOOD (NORMAL DRIFT)';

    return {
      facility_name: fac?.facility_name || 'Dining Hall',
      composite_score: composite,
      waste_rate_score: Math.round(c1 * 10) / 10,
      financial_severity_score: Math.round(c2 * 10) / 10,
      attendance_prediction_score: Math.round(c3 * 10) / 10,
      rating
    };
  }
}

export const dbEngine = new RelationalDatabaseEngine();

// React Hook for Reactive Database State
export function useRelationalDatabase() {
  const [state, setState] = useState<DatabaseState>(dbEngine.getState());

  useEffect(() => {
    return dbEngine.subscribe(() => {
      setState({ ...dbEngine.getState() });
    });
  }, []);

  return {
    state,
    db: dbEngine
  };
}
