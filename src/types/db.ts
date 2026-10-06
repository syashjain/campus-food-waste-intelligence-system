/**
 * Campus Food Waste Intelligence System (CFWIS)
 * Type Definitions mirroring PostgreSQL 15+ Relational Schema
 */

export type RoleCategory = 
  | 'SUPER_ADMIN'
  | 'CAMPUS_ADMIN'
  | 'MESS_MANAGER'
  | 'KITCHEN_STAFF'
  | 'PROCUREMENT_MANAGER'
  | 'ANALYST'
  | 'STUDENT';

export type MealPeriod = 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';

export type MeasurementUnit = 'KG' | 'LITRE' | 'GRAM' | 'PIECE' | 'PLATE' | 'SERVING';

export type WasteClassification = 
  | 'EDIBLE_LEFTOVER'
  | 'SPOILED_FOOD'
  | 'PREPARATION_WASTE'
  | 'SERVING_WASTE'
  | 'PLATE_WASTE'
  | 'OTHER';

export type OperationalStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Campus {
  campus_id: string;
  campus_code: string;
  name: string;
  city: string;
  state: string;
  country: string;
  address: string;
  lat: number;
  lng: number;
  is_active: boolean;
  created_at: string;
}

export interface Facility {
  facility_id: string;
  campus_id: string;
  facility_code: string;
  facility_name: string;
  facility_type: 'CENTRAL_MESS' | 'HOSTEL_MESS' | 'CAFETERIA' | 'NIGHT_CANTEEN';
  dining_capacity: number;
  operating_status: OperationalStatus;
  contact_phone: string;
  contact_email: string;
  lat: number;
  lng: number;
  is_active: boolean;
  created_at: string;
}

export interface FoodPantryPartner {
  pantry_id: string;
  campus_id: string;
  partner_name: string;
  contact_person: string;
  contact_phone: string;
  storage_capacity_kg: number;
  lat: number;
  lng: number;
  is_active: boolean;
}

export interface Role {
  role_id: number;
  role_code: RoleCategory;
  role_name: string;
  description: string;
}

export interface UserAccount {
  user_id: string;
  campus_id: string;
  facility_id?: string;
  role_id: number;
  role_code: RoleCategory;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  is_active: boolean;
}

export interface FoodCategory {
  category_id: string;
  category_code: string;
  category_name: string;
  description: string;
  is_active: boolean;
}

export interface FoodItem {
  item_id: string;
  category_id: string;
  item_code: string;
  item_name: string;
  standard_unit: MeasurementUnit;
  standard_unit_cost: number;
  average_density_kg_per_unit: number;
  shelf_life_hours: number;
  is_perishable: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Meal {
  meal_id: number;
  meal_code: MealPeriod;
  meal_name: string;
  typical_start_time: string;
  typical_end_time: string;
  display_order: number;
}

export interface WasteReason {
  reason_id: number;
  reason_code: string;
  reason_name: string;
  category: string;
  is_preventable: boolean;
  severity_rank: number;
  description: string;
}

export interface DisposalMethod {
  method_id: number;
  method_code: string;
  method_name: string;
  environmental_score: number;
  is_recovery: boolean;
  carbon_offset_factor: number;
  description: string;
}

export interface Vendor {
  vendor_id: string;
  campus_id: string;
  vendor_code: string;
  vendor_name: string;
  contact_person: string;
  phone: string;
  email: string;
  tax_identifier: string;
  compliance_rating: number;
  is_active: boolean;
}

export interface CampusEvent {
  event_id: string;
  campus_id: string;
  facility_id?: string;
  event_name: string;
  event_type: string;
  start_date: string;
  end_date: string;
  expected_headcount_impact: number;
  notes: string;
}

export interface Menu {
  menu_id: string;
  facility_id: string;
  meal_id: number;
  menu_date: string;
  version: number;
  expected_attendance: number;
  is_active: boolean;
  created_by: string;
}

export interface MenuItem {
  menu_item_id: string;
  menu_id: string;
  item_id: string;
  planned_quantity: number;
  portion_size_grams: number;
  unit: MeasurementUnit;
  notes?: string;
}

export interface Attendance {
  attendance_id: string;
  facility_id: string;
  meal_id: number;
  attendance_date: string;
  expected_attendance: number;
  actual_attendance: number;
  variance_count: number;
  event_id?: string;
  head_count_method: string;
  recorded_by: string;
}

export interface FoodPreparation {
  prep_id: string;
  facility_id: string;
  menu_id: string;
  item_id: string;
  prep_date: string;
  meal_id: number;
  prepared_quantity: number;
  unit: MeasurementUnit;
  batch_number: string;
  prepared_by: string;
  notes?: string;
  created_at: string;
}

export interface FoodConsumption {
  consumption_id: string;
  prep_id: string;
  consumed_quantity: number;
  unit: MeasurementUnit;
  measurement_type: 'ACTUAL_SCALE' | 'ESTIMATED_TALLY';
  recorded_by: string;
  recorded_at: string;
  notes?: string;
}

export interface FoodWaste {
  waste_id: string;
  prep_id: string;
  facility_id: string;
  item_id: string;
  meal_id: number;
  waste_date: string;
  waste_quantity: number;
  unit: MeasurementUnit;
  waste_category: WasteClassification;
  reason_id: number;
  method_id?: number;
  pantry_partner_id?: string;
  unit_cost_snapshot: number;
  estimated_waste_cost: number;
  reported_by: string;
  recorded_at: string;
  notes?: string;
}

export interface Purchase {
  purchase_id: string;
  campus_id: string;
  vendor_id: string;
  po_number: string;
  invoice_number: string;
  purchase_date: string;
  total_amount: number;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  created_by: string;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  purchase_item_id: string;
  purchase_id: string;
  item_id: string;
  quantity: number;
  unit: MeasurementUnit;
  unit_price: number;
  tax_percentage: number;
  line_total: number;
  batch_number: string;
  expiry_date: string;
}

export interface AuditLog {
  audit_id: number;
  campus_id?: string;
  table_name: string;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE' | 'ROLLBACK';
  record_pk?: string;
  old_data?: any;
  new_data?: any;
  changed_by?: string;
  executed_at: string;
}
