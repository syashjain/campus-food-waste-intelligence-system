import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  text, 
  integer, 
  doublePrecision, 
  boolean, 
  timestamp 
} from 'drizzle-orm/pg-core';

// Users table with Firebase Auth UID linkage
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name'),
  roleCode: text('role_code').default('STUDENT').notNull(),
  campusId: text('campus_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Campuses table
export const campuses = pgTable('campuses', {
  campusId: text('campus_id').primaryKey(),
  campusCode: text('campus_code').notNull(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  address: text('address'),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Facilities table
export const facilities = pgTable('facilities', {
  facilityId: text('facility_id').primaryKey(),
  campusId: text('campus_id').notNull(),
  facilityCode: text('facility_code').notNull(),
  facilityName: text('facility_name').notNull(),
  facilityType: text('facility_type').notNull(), // CENTRAL_MESS, HOSTEL_MESS, CAFETERIA, etc.
  diningCapacity: integer('dining_capacity').notNull(),
  operatingStatus: text('operating_status').default('ACTIVE').notNull(),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Food Pantry Partners
export const foodPantryPartners = pgTable('food_pantry_partners', {
  pantryId: text('pantry_id').primaryKey(),
  campusId: text('campus_id').notNull(),
  partnerName: text('partner_name').notNull(),
  contactPerson: text('contact_person'),
  contactPhone: text('contact_phone'),
  storageCapacityKg: doublePrecision('storage_capacity_kg').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// Food Items catalog
export const foodItems = pgTable('food_items', {
  itemId: text('item_id').primaryKey(),
  categoryId: text('category_id').notNull(),
  itemCode: text('item_code').notNull(),
  itemName: text('item_name').notNull(),
  standardUnit: text('standard_unit').notNull(),
  standardUnitCost: doublePrecision('standard_unit_cost').notNull(),
  averageDensityKgPerUnit: doublePrecision('average_density_kg_per_unit').default(1.0),
  shelfLifeHours: integer('shelf_life_hours').default(24),
  isPerishable: boolean('is_perishable').default(true),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Food Waste Telemetry logs
export const foodWasteLogs = pgTable('food_waste_logs', {
  wasteId: text('waste_id').primaryKey(),
  prepId: text('prep_id'),
  facilityId: text('facility_id').notNull(),
  itemId: text('item_id').notNull(),
  mealPeriod: text('meal_period').notNull(), // BREAKFAST, LUNCH, SNACKS, DINNER
  wasteDate: text('waste_date').notNull(),
  wasteQuantity: doublePrecision('waste_quantity').notNull(),
  unit: text('unit').notNull(),
  wasteCategory: text('waste_category').notNull(),
  reason: text('reason').notNull(),
  unitCostSnapshot: doublePrecision('unit_cost_snapshot').notNull(),
  estimatedWasteCost: doublePrecision('estimated_waste_cost').notNull(),
  reportedBy: text('reported_by').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow(),
  notes: text('notes'),
});

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  auditId: serial('audit_id').primaryKey(),
  campusId: text('campus_id'),
  tableName: text('table_name').notNull(),
  operationType: text('operation_type').notNull(),
  recordPk: text('record_pk'),
  details: text('details'),
  executedAt: timestamp('executed_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wasteLogs: many(foodWasteLogs),
}));

export const facilitiesRelations = relations(facilities, ({ many }) => ({
  wasteLogs: many(foodWasteLogs),
}));

export const foodWasteLogsRelations = relations(foodWasteLogs, ({ one }) => ({
  facility: one(facilities, {
    fields: [foodWasteLogs.facilityId],
    references: [facilities.facilityId],
  }),
  item: one(foodItems, {
    fields: [foodWasteLogs.itemId],
    references: [foodItems.itemId],
  }),
}));
