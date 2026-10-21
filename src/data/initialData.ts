import { 
  Campus, Facility, FoodPantryPartner, Role, UserAccount, 
  FoodCategory, FoodItem, Meal, WasteReason, DisposalMethod, 
  Vendor, CampusEvent, Menu, MenuItem, Attendance, FoodPreparation, 
  FoodConsumption, FoodWaste, Purchase, AuditLog, WasteClassification,
  WasteLog, DailyOperation
} from '../types/db';

export const INITIAL_CAMPUSES: Campus[] = [
  {
    campus_id: '11111111-1111-1111-1111-111111111111',
    id: '11111111-1111-1111-1111-111111111111',
    campus_code: 'IIT-TVC',
    name: 'North Campus (IIT Tech Valley)',
    campus_name: 'North Campus',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    address: 'Survey 45, Silicon Corridor, Electronic City, Bengaluru',
    lat: 12.8452,
    lng: 77.6780,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    campus_id: '22222222-2222-2222-2222-222222222222',
    id: '22222222-2222-2222-2222-222222222222',
    campus_code: 'NIT-SGC',
    name: 'South Campus (NIT South Green)',
    campus_name: 'South Campus',
    city: 'Mysuru',
    state: 'Karnataka',
    country: 'India',
    address: 'Outer Ring Road, Hootagalli Suburb, Mysuru',
    lat: 12.3364,
    lng: 76.5921,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    campus_id: '33333333-1111-1111-1111-111111111111',
    id: '33333333-1111-1111-1111-111111111111',
    campus_code: 'TPC-BLR',
    name: 'Tech Park Campus (Innovation Hub)',
    campus_name: 'Tech Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    address: 'Plot 102, Innovation Expressway, Whitefield, Bengaluru',
    lat: 12.9716,
    lng: 77.7499,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_FACILITIES: Facility[] = [
  {
    facility_id: '33333333-3333-3333-3333-333333333301',
    id: '33333333-3333-3333-3333-333333333301',
    campus_id: '11111111-1111-1111-1111-111111111111',
    facility_code: 'MESS-CENTRAL-01',
    facility_name: 'Aryabhata Central Dining Hall',
    name: 'Aryabhata Central Dining Hall',
    facility_type: 'CENTRAL_MESS',
    dining_capacity: 1200,
    operating_status: 'ACTIVE',
    status: 'ACTIVE',
    contact_phone: '+91-9876543210',
    contact_email: 'aryabhata.mess@iit-tvc.edu',
    lat: 12.8455,
    lng: 77.6785,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    facility_id: '33333333-3333-3333-3333-333333333302',
    id: '33333333-3333-3333-3333-333333333302',
    campus_id: '11111111-1111-1111-1111-111111111111',
    facility_code: 'MESS-NORTH-02',
    facility_name: 'Kalam North Hostel Mess',
    name: 'Kalam North Hostel Mess',
    facility_type: 'HOSTEL_MESS',
    dining_capacity: 650,
    operating_status: 'ACTIVE',
    status: 'ACTIVE',
    contact_phone: '+91-9876543211',
    contact_email: 'kalam.mess@iit-tvc.edu',
    lat: 12.8470,
    lng: 77.6792,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    facility_id: '33333333-3333-3333-3333-333333333303',
    id: '33333333-3333-3333-3333-333333333303',
    campus_id: '11111111-1111-1111-1111-111111111111',
    facility_code: 'MESS-SOUTH-03',
    facility_name: 'Sarabhai South Hostel Mess',
    name: 'Sarabhai South Hostel Mess',
    facility_type: 'HOSTEL_MESS',
    dining_capacity: 750,
    operating_status: 'ACTIVE',
    status: 'ACTIVE',
    contact_phone: '+91-9876543212',
    contact_email: 'sarabhai.mess@iit-tvc.edu',
    lat: 12.8440,
    lng: 77.6770,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    facility_id: '33333333-3333-3333-3333-333333333304',
    id: '33333333-3333-3333-3333-333333333304',
    campus_id: '11111111-1111-1111-1111-111111111111',
    facility_code: 'CAFE-RAMAN-04',
    facility_name: 'Ramanujan Food Court & Canteen',
    name: 'Ramanujan Food Court & Canteen',
    facility_type: 'CAFETERIA',
    dining_capacity: 400,
    operating_status: 'ACTIVE',
    status: 'ACTIVE',
    contact_phone: '+91-9876543213',
    contact_email: 'canteen@iit-tvc.edu',
    lat: 12.8462,
    lng: 77.6781,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    facility_id: '33333333-3333-3333-3333-333333333305',
    id: '33333333-3333-3333-3333-333333333305',
    campus_id: '22222222-2222-2222-2222-222222222222',
    facility_code: 'MESS-VISVES-05',
    facility_name: 'Visvesvaraya Engineering Dining Hall',
    name: 'Visvesvaraya Engineering Dining Hall',
    facility_type: 'CENTRAL_MESS',
    dining_capacity: 950,
    operating_status: 'ACTIVE',
    status: 'ACTIVE',
    contact_phone: '+91-9876543214',
    contact_email: 'visvesvaraya.mess@nit-sgc.edu',
    lat: 12.3370,
    lng: 76.5930,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    facility_id: '33333333-3333-3333-3333-333333333306',
    id: '33333333-3333-3333-3333-333333333306',
    campus_id: '22222222-2222-2222-2222-222222222222',
    facility_code: 'CAFE-KAVERI-06',
    facility_name: 'Kaveri South Student Cafeteria',
    name: 'Kaveri South Student Cafeteria',
    facility_type: 'CAFETERIA',
    dining_capacity: 550,
    operating_status: 'ACTIVE',
    status: 'ACTIVE',
    contact_phone: '+91-9876543215',
    contact_email: 'kaveri.cafe@nit-sgc.edu',
    lat: 12.3355,
    lng: 76.5910,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    facility_id: '33333333-3333-3333-3333-333333333307',
    id: '33333333-3333-3333-3333-333333333307',
    campus_id: '22222222-2222-2222-2222-222222222222',
    facility_code: 'MESS-CHAMUNDI-07',
    facility_name: 'Chamundi Hills Executive Dining',
    name: 'Chamundi Hills Executive Dining',
    facility_type: 'HOSTEL_MESS',
    dining_capacity: 350,
    operating_status: 'ACTIVE',
    status: 'ACTIVE',
    contact_phone: '+91-9876543216',
    contact_email: 'chamundi.exec@nit-sgc.edu',
    lat: 12.3380,
    lng: 76.5945,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    facility_id: '33333333-3333-3333-3333-333333333308',
    id: '33333333-3333-3333-3333-333333333308',
    campus_id: '33333333-1111-1111-1111-111111111111',
    facility_code: 'BISTRO-TECH-08',
    facility_name: 'Silicon Tech Park Bistro & Grill',
    name: 'Silicon Tech Park Bistro & Grill',
    facility_type: 'CAFETERIA',
    dining_capacity: 600,
    operating_status: 'ACTIVE',
    status: 'ACTIVE',
    contact_phone: '+91-9876543217',
    contact_email: 'bistro@techpark.edu',
    lat: 12.9720,
    lng: 77.7505,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    facility_id: '33333333-3333-3333-3333-333333333309',
    id: '33333333-3333-3333-3333-333333333309',
    campus_id: '33333333-1111-1111-1111-111111111111',
    facility_code: 'LAB-QUANTUM-09',
    facility_name: 'Quantum Innovation Food Lab',
    name: 'Quantum Innovation Food Lab',
    facility_type: 'CENTRAL_MESS',
    dining_capacity: 800,
    operating_status: 'ACTIVE',
    status: 'ACTIVE',
    contact_phone: '+91-9876543218',
    contact_email: 'quantum.food@techpark.edu',
    lat: 12.9710,
    lng: 77.7490,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    facility_id: '33333333-3333-3333-3333-333333333310',
    id: '33333333-3333-3333-3333-333333333310',
    campus_id: '33333333-1111-1111-1111-111111111111',
    facility_code: 'NIGHT-CYBER-10',
    facility_name: 'CyberHub Night Canteen & Cafe',
    name: 'CyberHub Night Canteen & Cafe',
    facility_type: 'NIGHT_CANTEEN',
    dining_capacity: 300,
    operating_status: 'ACTIVE',
    status: 'ACTIVE',
    contact_phone: '+91-9876543219',
    contact_email: 'cyberhub@techpark.edu',
    lat: 12.9725,
    lng: 77.7512,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_PANTRY_PARTNERS: FoodPantryPartner[] = [
  {
    pantry_id: '44444444-4444-4444-4444-444444444401',
    campus_id: '11111111-1111-1111-1111-111111111111',
    partner_name: 'Robin Hood Army Bengaluru Hub 7',
    contact_person: 'Arjun Verma',
    contact_phone: '+91-9820011223',
    storage_capacity_kg: 500,
    lat: 12.8490,
    lng: 77.6820,
    is_active: true
  },
  {
    pantry_id: '44444444-4444-4444-4444-444444444402',
    campus_id: '11111111-1111-1111-1111-111111111111',
    partner_name: 'Feeding India Shelter Pantry',
    contact_person: 'Divya Nair',
    contact_phone: '+91-9830022334',
    storage_capacity_kg: 350,
    lat: 12.8410,
    lng: 77.6740,
    is_active: true
  },
  {
    pantry_id: '44444444-4444-4444-4444-444444444403',
    campus_id: '11111111-1111-1111-1111-111111111111',
    partner_name: 'Green Earth Bio-Digester Plant',
    contact_person: 'Kiran Rao',
    contact_phone: '+91-9840033445',
    storage_capacity_kg: 2000,
    lat: 12.8520,
    lng: 77.6890,
    is_active: true
  }
];

export const INITIAL_ROLES: Role[] = [
  { role_id: 1, role_code: 'SUPER_ADMIN', role_name: 'Super Administrator', description: 'Full system configuration, multi-campus administration, and security oversight' },
  { role_id: 2, role_code: 'CAMPUS_ADMIN', role_name: 'Campus Administrator', description: 'Campus-scoped facility management, procurement contracts, and macro reporting' },
  { role_id: 3, role_code: 'FINANCE_OFFICER', role_name: 'Finance Officer', description: 'Budget governance, financial loss reconciliation, dining audit reports, and invoice sign-offs' },
  { role_id: 4, role_code: 'MESS_MANAGER', role_name: 'Mess Manager', description: 'Mess-scoped operational control, menu planning, prep approvals, and inventory control' },
  { role_id: 5, role_code: 'KITCHEN_STAFF', role_name: 'Kitchen Staff & Chef', description: 'Daily preparation quantities, scale weight entries, and waste recording' },
  { role_id: 6, role_code: 'PROCUREMENT_MANAGER', role_name: 'Procurement Officer', description: 'Vendor lifecycle, purchase orders, standard cost updates, and deliveries' },
  { role_id: 7, role_code: 'ANALYST', role_name: 'Sustainability Analyst', description: 'Read-only analytics, SQL reporting, cost optimization, and ESG audits' },
  { role_id: 8, role_code: 'STUDENT', role_name: 'Student Representative', description: 'View daily menus, nutritional facts, and log meal satisfaction ratings' }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    user_id: '55555555-5555-5555-5555-555555555501',
    id: '55555555-5555-5555-5555-555555555501',
    campus_id: '11111111-1111-1111-1111-111111111111',
    role_id: 1,
    role_code: 'SUPER_ADMIN',
    username: 'superadmin',
    email: 'admin@cfwis.edu',
    full_name: 'Dr. Ramesh Sharma (Super Admin)',
    name: 'Dr. Ramesh Sharma (Super Admin)',
    role: 'SUPER_ADMIN',
    phone: '+91-9988776655',
    is_active: true
  },
  {
    user_id: '55555555-5555-5555-5555-555555555502',
    id: '55555555-5555-5555-5555-555555555502',
    campus_id: '11111111-1111-1111-1111-111111111111',
    role_id: 2,
    role_code: 'CAMPUS_ADMIN',
    username: 'campusadmin',
    email: 'campusadmin@cfwis.edu',
    full_name: 'Prof. Sunita Rao (Dean of Student Affairs)',
    name: 'Prof. Sunita Rao (Dean of Student Affairs)',
    role: 'CAMPUS_ADMIN',
    phone: '+91-9988776656',
    is_active: true
  },
  {
    user_id: '55555555-5555-5555-5555-555555555508',
    id: '55555555-5555-5555-5555-555555555508',
    campus_id: '11111111-1111-1111-1111-111111111111',
    role_id: 3,
    role_code: 'FINANCE_OFFICER',
    username: 'finance_officer',
    email: 'finance@cfwis.edu',
    full_name: 'Vikramaditya Iyer (Finance Officer)',
    name: 'Vikramaditya Iyer (Finance Officer)',
    role: 'FINANCE_OFFICER',
    phone: '+91-9988776603',
    is_active: true
  },
  {
    user_id: '55555555-5555-5555-5555-555555555503',
    id: '55555555-5555-5555-5555-555555555503',
    campus_id: '11111111-1111-1111-1111-111111111111',
    facility_id: '33333333-3333-3333-3333-333333333301',
    role_id: 4,
    role_code: 'MESS_MANAGER',
    username: 'messmanager',
    email: 'manager.aryabhata@cfwis.edu',
    full_name: 'Vikramaditya Hegde (Aryabhata Mess Manager)',
    name: 'Vikramaditya Hegde (Aryabhata Mess Manager)',
    role: 'MESS_MANAGER',
    phone: '+91-9988776657',
    is_active: true
  },
  {
    user_id: '55555555-5555-5555-5555-555555555509',
    id: '55555555-5555-5555-5555-555555555509',
    campus_id: '11111111-1111-1111-1111-111111111111',
    facility_id: '33333333-3333-3333-3333-333333333302',
    role_id: 4,
    role_code: 'MESS_MANAGER',
    username: 'college_manager',
    email: 'manager@college.edu',
    full_name: 'Rajesh Verma (Campus Mess Manager)',
    name: 'Rajesh Verma (Campus Mess Manager)',
    role: 'MESS_MANAGER',
    phone: '+91-9988776699',
    is_active: true
  },
  {
    user_id: '55555555-5555-5555-5555-555555555504',
    id: '55555555-5555-5555-5555-555555555504',
    campus_id: '11111111-1111-1111-1111-111111111111',
    facility_id: '33333333-3333-3333-3333-333333333301',
    role_id: 5,
    role_code: 'KITCHEN_STAFF',
    username: 'chef_staff',
    email: 'kitchen.aryabhata@cfwis.edu',
    full_name: 'Chef Anant Joshi (Head Chef)',
    name: 'Chef Anant Joshi (Head Chef)',
    role: 'KITCHEN_STAFF',
    phone: '+91-9988776658',
    is_active: true
  },
  {
    user_id: '55555555-5555-5555-5555-555555555505',
    id: '55555555-5555-5555-5555-555555555505',
    campus_id: '11111111-1111-1111-1111-111111111111',
    role_id: 6,
    role_code: 'PROCUREMENT_MANAGER',
    username: 'procurement',
    email: 'procurement@cfwis.edu',
    full_name: 'Manohar Lal Gupta (Procurement Lead)',
    name: 'Manohar Lal Gupta (Procurement Lead)',
    role: 'PROCUREMENT_MANAGER',
    phone: '+91-9988776659',
    is_active: true
  },
  {
    user_id: '55555555-5555-5555-5555-555555555506',
    id: '55555555-5555-5555-5555-555555555506',
    campus_id: '11111111-1111-1111-1111-111111111111',
    role_id: 7,
    role_code: 'ANALYST',
    username: 'analyst',
    email: 'analyst@cfwis.edu',
    full_name: 'Sneha Deshmukh (ESG Analyst)',
    name: 'Sneha Deshmukh (ESG Analyst)',
    role: 'ANALYST',
    phone: '+91-9988776660',
    is_active: true
  },
  {
    user_id: '55555555-5555-5555-5555-555555555507',
    id: '55555555-5555-5555-5555-555555555507',
    campus_id: '11111111-1111-1111-1111-111111111111',
    role_id: 8,
    role_code: 'STUDENT',
    username: 'student_rep',
    email: 'student.council@cfwis.edu',
    full_name: 'Rohan Mathur (General Secy Hostel)',
    name: 'Rohan Mathur (General Secy Hostel)',
    role: 'STUDENT',
    phone: '+91-9988776661',
    is_active: true
  }
];

export const INITIAL_FOOD_CATEGORIES: FoodCategory[] = [
  { category_id: '66666666-6666-6666-6666-666666666601', category_code: 'GRAINS_STAPLES', category_name: 'Grains, Rice & Staples', description: 'Rice, wheat, millets, semolina', is_active: true },
  { category_id: '66666666-6666-6666-6666-666666666602', category_code: 'LENTILS_PULSES', category_name: 'Lentils, Dals & Pulses', description: 'Toor dal, moong, chana, rajma', is_active: true },
  { category_id: '66666666-6666-6666-6666-666666666603', category_code: 'VEGETABLES_FRESH', category_name: 'Fresh Farm Vegetables', description: 'Potatoes, onions, cauliflower, greens', is_active: true },
  { category_id: '66666666-6666-6666-6666-666666666604', category_code: 'DAIRY_PRODUCTS', category_name: 'Dairy & Milk Products', description: 'Paneer, curd, milk, butter, ghee', is_active: true },
  { category_id: '66666666-6666-6666-6666-666666666605', category_code: 'BREADS_BAKERY', category_name: 'Breads, Rotis & Parathas', description: 'Chapati, tandoori roti, poori, pav', is_active: true },
  { category_id: '66666666-6666-6666-6666-666666666606', category_code: 'DESSERTS_SWEETS', category_name: 'Desserts & Sweet Dishes', description: 'Gulab jamun, halwa, kheer, rasgulla', is_active: true },
  { category_id: '66666666-6666-6666-6666-666666666607', category_code: 'BEVERAGES_DRINKS', category_name: 'Beverages & Hot Teas', description: 'Masala chai, coffee, buttermilk', is_active: true },
  { category_id: '66666666-6666-6666-6666-666666666608', category_code: 'SNACKS_APPETIZERS', category_name: 'Snacks & Evening Bites', description: 'Samosa, medu vada, idli, pakoras', is_active: true },
  { category_id: '66666666-6666-6666-6666-666666666609', category_code: 'SALADS_CONDIMENTS', category_name: 'Salads & Condiments', description: 'Green salads, raitas, chutneys', is_active: true },
  { category_id: '66666666-6666-6666-6666-666666666610', category_code: 'SPECIAL_FESTIVE', category_name: 'Festive & Banquet Specialties', description: 'Dum biryani, malai kofta, shahi paneer', is_active: true }
];

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  { item_id: '77777777-7777-7777-7777-777777777701', id: '77777777-7777-7777-7777-777777777701', category_id: '66666666-6666-6666-6666-666666666601', category: 'GRAIN', vendor_id: '88888888-8888-8888-8888-888888888801', item_code: 'RICE-STE-01', item_name: 'Steamed Sona Masuri Rice', standard_unit: 'KG', standard_unit_cost: 48.00, unit_cost: 48.00, average_density_kg_per_unit: 1.0, shelf_life_hours: 12, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777702', id: '77777777-7777-7777-7777-777777777702', category_id: '66666666-6666-6666-6666-666666666601', category: 'GRAIN', vendor_id: '88888888-8888-8888-8888-888888888801', item_code: 'RICE-JEERA-02', item_name: 'Fragrant Jeera Rice', standard_unit: 'KG', standard_unit_cost: 62.00, unit_cost: 62.00, average_density_kg_per_unit: 1.0, shelf_life_hours: 12, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777703', id: '77777777-7777-7777-7777-777777777703', category_id: '66666666-6666-6666-6666-666666666601', category: 'GRAIN', vendor_id: '88888888-8888-8888-8888-888888888801', item_code: 'POHA-IND-03', item_name: 'Indori Kanda Poha', standard_unit: 'KG', standard_unit_cost: 55.00, unit_cost: 55.00, average_density_kg_per_unit: 0.8, shelf_life_hours: 8, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777704', id: '77777777-7777-7777-7777-777777777704', category_id: '66666666-6666-6666-6666-666666666602', category: 'PULSE', vendor_id: '88888888-8888-8888-8888-888888888804', item_code: 'DAL-TADKA-04', item_name: 'Yellow Toor Dal Tadka', standard_unit: 'KG', standard_unit_cost: 72.00, unit_cost: 72.00, average_density_kg_per_unit: 1.0, shelf_life_hours: 10, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777705', id: '77777777-7777-7777-7777-777777777705', category_id: '66666666-6666-6666-6666-666666666602', category: 'PULSE', vendor_id: '88888888-8888-8888-8888-888888888804', item_code: 'DAL-MAKH-05', item_name: 'Dal Makhani Slow Simmered', standard_unit: 'KG', standard_unit_cost: 95.00, unit_cost: 95.00, average_density_kg_per_unit: 1.0, shelf_life_hours: 14, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777706', id: '77777777-7777-7777-7777-777777777706', category_id: '66666666-6666-6666-6666-666666666602', category: 'PULSE', vendor_id: '88888888-8888-8888-8888-888888888804', item_code: 'PULSE-CHANA-06', item_name: 'Pindi Chana Masala', standard_unit: 'KG', standard_unit_cost: 85.00, unit_cost: 85.00, average_density_kg_per_unit: 1.0, shelf_life_hours: 12, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777707', id: '77777777-7777-7777-7777-777777777707', category_id: '66666666-6666-6666-6666-666666666602', category: 'PULSE', vendor_id: '88888888-8888-8888-8888-888888888804', item_code: 'SAMBAR-STH-07', item_name: 'South Indian Vegetable Sambar', standard_unit: 'LITRE', standard_unit_cost: 52.00, unit_cost: 52.00, average_density_kg_per_unit: 1.05, shelf_life_hours: 10, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777708', id: '77777777-7777-7777-7777-777777777708', category_id: '66666666-6666-6666-6666-666666666603', category: 'VEGETABLE', vendor_id: '88888888-8888-8888-8888-888888888803', item_code: 'VEG-ALOO-GOB-08', item_name: 'Aloo Gobi Adraki Curry', standard_unit: 'KG', standard_unit_cost: 65.00, unit_cost: 65.00, average_density_kg_per_unit: 0.9, shelf_life_hours: 10, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777709', id: '77777777-7777-7777-7777-777777777709', category_id: '66666666-6666-6666-6666-666666666603', category: 'VEGETABLE', vendor_id: '88888888-8888-8888-8888-888888888803', item_code: 'VEG-BHINDI-09', item_name: 'Bhindi Do Pyaza', standard_unit: 'KG', standard_unit_cost: 78.00, unit_cost: 78.00, average_density_kg_per_unit: 0.85, shelf_life_hours: 8, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777710', id: '77777777-7777-7777-7777-777777777710', category_id: '66666666-6666-6666-6666-666666666603', category: 'VEGETABLE', vendor_id: '88888888-8888-8888-8888-888888888803', item_code: 'VEG-MIXED-10', item_name: 'Mix Vegetable Kolhapuri', standard_unit: 'KG', standard_unit_cost: 70.00, unit_cost: 70.00, average_density_kg_per_unit: 0.95, shelf_life_hours: 10, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777711', id: '77777777-7777-7777-7777-777777777711', category_id: '66666666-6666-6666-6666-666666666604', category: 'DAIRY', vendor_id: '88888888-8888-8888-8888-888888888802', item_code: 'PAN-BUTT-11', item_name: 'Paneer Butter Masala', standard_unit: 'KG', standard_unit_cost: 180.00, unit_cost: 180.00, average_density_kg_per_unit: 1.05, shelf_life_hours: 10, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777712', id: '77777777-7777-7777-7777-777777777712', category_id: '66666666-6666-6666-6666-666666666604', category: 'DAIRY', vendor_id: '88888888-8888-8888-8888-888888888802', item_code: 'DAIRY-CURD-12', item_name: 'Fresh Set Sweet Curd', standard_unit: 'KG', standard_unit_cost: 45.00, unit_cost: 45.00, average_density_kg_per_unit: 1.03, shelf_life_hours: 24, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777713', id: '77777777-7777-7777-7777-777777777713', category_id: '66666666-6666-6666-6666-666666666604', category: 'DAIRY', vendor_id: '88888888-8888-8888-8888-888888888802', item_code: 'DAIRY-CHHACH-13', item_name: 'Spiced Mint Buttermilk', standard_unit: 'LITRE', standard_unit_cost: 32.00, unit_cost: 32.00, average_density_kg_per_unit: 1.01, shelf_life_hours: 18, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777714', id: '77777777-7777-7777-7777-777777777714', category_id: '66666666-6666-6666-6666-666666666605', category: 'BREAD', vendor_id: '88888888-8888-8888-8888-888888888805', item_code: 'ROTI-WHEAT-14', item_name: 'Whole Wheat Tawa Phulka', standard_unit: 'PIECE', standard_unit_cost: 4.50, unit_cost: 4.50, average_density_kg_per_unit: 0.04, shelf_life_hours: 8, is_perishable: false, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777715', id: '77777777-7777-7777-7777-777777777715', category_id: '66666666-6666-6666-6666-666666666605', category: 'BREAD', vendor_id: '88888888-8888-8888-8888-888888888805', item_code: 'POORI-WHT-15', item_name: 'Fluffy Hot Poori', standard_unit: 'PIECE', standard_unit_cost: 5.00, unit_cost: 5.00, average_density_kg_per_unit: 0.045, shelf_life_hours: 6, is_perishable: false, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777716', id: '77777777-7777-7777-7777-777777777716', category_id: '66666666-6666-6666-6666-666666666605', category: 'BREAD', vendor_id: '88888888-8888-8888-8888-888888888805', item_code: 'PARATHA-ALOO-16', item_name: 'Stuffed Punjabi Aloo Paratha', standard_unit: 'PIECE', standard_unit_cost: 18.00, unit_cost: 18.00, average_density_kg_per_unit: 0.12, shelf_life_hours: 8, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777717', id: '77777777-7777-7777-7777-777777777717', category_id: '66666666-6666-6666-6666-666666666606', category: 'DESSERT', vendor_id: '88888888-8888-8888-8888-888888888807', item_code: 'SWT-GULAB-17', item_name: 'Warm Gulab Jamun', standard_unit: 'PIECE', standard_unit_cost: 12.00, unit_cost: 12.00, average_density_kg_per_unit: 0.05, shelf_life_hours: 48, is_perishable: false, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777718', id: '77777777-7777-7777-7777-777777777718', category_id: '66666666-6666-6666-6666-666666666606', category: 'DESSERT', vendor_id: '88888888-8888-8888-8888-888888888802', item_code: 'SWT-KHEER-18', item_name: 'Kesar Rice Kheer with Dry Fruits', standard_unit: 'KG', standard_unit_cost: 110.00, unit_cost: 110.00, average_density_kg_per_unit: 1.05, shelf_life_hours: 16, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777719', id: '77777777-7777-7777-7777-777777777719', category_id: '66666666-6666-6666-6666-666666666606', category: 'DESSERT', vendor_id: '88888888-8888-8888-8888-888888888807', item_code: 'SWT-HALWA-19', item_name: 'Gajar Halwa in Pure Desi Ghee', standard_unit: 'KG', standard_unit_cost: 160.00, unit_cost: 160.00, average_density_kg_per_unit: 1.1, shelf_life_hours: 36, is_perishable: false, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777720', id: '77777777-7777-7777-7777-777777777720', category_id: '66666666-6666-6666-6666-666666666607', category: 'BEVERAGE', vendor_id: '88888888-8888-8888-8888-888888888808', item_code: 'BEV-CHAI-20', item_name: 'Ginger Cardamom Masala Chai', standard_unit: 'LITRE', standard_unit_cost: 40.00, unit_cost: 40.00, average_density_kg_per_unit: 1.0, shelf_life_hours: 4, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777721', id: '77777777-7777-7777-7777-777777777721', category_id: '66666666-6666-6666-6666-666666666607', category: 'BEVERAGE', vendor_id: '88888888-8888-8888-8888-888888888808', item_code: 'BEV-COFFEE-21', item_name: 'South Indian Filter Coffee', standard_unit: 'LITRE', standard_unit_cost: 55.00, unit_cost: 55.00, average_density_kg_per_unit: 1.0, shelf_life_hours: 4, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777722', id: '77777777-7777-7777-7777-777777777722', category_id: '66666666-6666-6666-6666-666666666608', category: 'SNACK', vendor_id: '88888888-8888-8888-8888-888888888807', item_code: 'SNK-SAMOSA-22', item_name: 'Crispy Punjabi Potato Samosa', standard_unit: 'PIECE', standard_unit_cost: 10.00, unit_cost: 10.00, average_density_kg_per_unit: 0.08, shelf_life_hours: 6, is_perishable: false, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777723', id: '77777777-7777-7777-7777-777777777723', category_id: '66666666-6666-6666-6666-666666666608', category: 'SNACK', vendor_id: '88888888-8888-8888-8888-888888888807', item_code: 'SNK-VADA-23', item_name: 'Medu Vada with Chutney', standard_unit: 'PIECE', standard_unit_cost: 8.50, unit_cost: 8.50, average_density_kg_per_unit: 0.06, shelf_life_hours: 6, is_perishable: false, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777724', id: '77777777-7777-7777-7777-777777777724', category_id: '66666666-6666-6666-6666-666666666608', category: 'SNACK', vendor_id: '88888888-8888-8888-8888-888888888807', item_code: 'SNK-IDLI-24', item_name: 'Steamed Rice & Urad Idli', standard_unit: 'PIECE', standard_unit_cost: 6.00, unit_cost: 6.00, average_density_kg_per_unit: 0.05, shelf_life_hours: 8, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777725', id: '77777777-7777-7777-7777-777777777725', category_id: '66666666-6666-6666-6666-666666666609', category: 'SALAD', vendor_id: '88888888-8888-8888-8888-888888888803', item_code: 'SLD-GREEN-25', item_name: 'Sliced Cucumber & Carrot Salad', standard_unit: 'KG', standard_unit_cost: 35.00, unit_cost: 35.00, average_density_kg_per_unit: 0.8, shelf_life_hours: 6, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777726', id: '77777777-7777-7777-7777-777777777726', category_id: '66666666-6666-6666-6666-666666666609', category: 'SALAD', vendor_id: '88888888-8888-8888-8888-888888888802', item_code: 'RAITA-BUNDI-26', item_name: 'Crispy Boondi Mint Raita', standard_unit: 'KG', standard_unit_cost: 50.00, unit_cost: 50.00, average_density_kg_per_unit: 1.02, shelf_life_hours: 8, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777727', id: '77777777-7777-7777-7777-777777777727', category_id: '66666666-6666-6666-6666-666666666609', category: 'SALAD', vendor_id: '88888888-8888-8888-8888-888888888803', item_code: 'CHUT-COCO-27', item_name: 'Fresh Grated Coconut Chutney', standard_unit: 'KG', standard_unit_cost: 60.00, unit_cost: 60.00, average_density_kg_per_unit: 0.9, shelf_life_hours: 6, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777728', id: '77777777-7777-7777-7777-777777777728', category_id: '66666666-6666-6666-6666-666666666610', category: 'FESTIVE', vendor_id: '88888888-8888-8888-8888-888888888801', item_code: 'SPEC-BIRYANI-28', item_name: 'Royal Hyderabadi Veg Dum Biryani', standard_unit: 'KG', standard_unit_cost: 130.00, unit_cost: 130.00, average_density_kg_per_unit: 1.05, shelf_life_hours: 10, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777729', id: '77777777-7777-7777-7777-777777777729', category_id: '66666666-6666-6666-6666-666666666610', category: 'FESTIVE', vendor_id: '88888888-8888-8888-8888-888888888802', item_code: 'SPEC-PANEER-TIK-29', item_name: 'Tandoori Paneer Tikka Platter', standard_unit: 'PLATE', standard_unit_cost: 120.00, unit_cost: 120.00, average_density_kg_per_unit: 0.35, shelf_life_hours: 6, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777730', id: '77777777-7777-7777-7777-777777777730', category_id: '66666666-6666-6666-6666-666666666610', category: 'FESTIVE', vendor_id: '88888888-8888-8888-8888-888888888802', item_code: 'SPEC-MALAI-KOFTA-30', item_name: 'Shahi Malai Kofta in Gravy', standard_unit: 'KG', standard_unit_cost: 175.00, unit_cost: 175.00, average_density_kg_per_unit: 1.05, shelf_life_hours: 10, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777731', id: '77777777-7777-7777-7777-777777777731', category_id: '66666666-6666-6666-6666-666666666601', category: 'GRAIN', vendor_id: '88888888-8888-8888-8888-888888888801', item_code: 'UPMA-RAVA-31', item_name: 'Vegetable Rava Upma with Cashews', standard_unit: 'KG', standard_unit_cost: 50.00, unit_cost: 50.00, average_density_kg_per_unit: 0.85, shelf_life_hours: 8, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { item_id: '77777777-7777-7777-7777-777777777732', id: '77777777-7777-7777-7777-777777777732', category_id: '66666666-6666-6666-6666-666666666603', category: 'VEGETABLE', vendor_id: '88888888-8888-8888-8888-888888888803', item_code: 'VEG-PALAK-32', item_name: 'Lehsuni Palak Corn Gravy', standard_unit: 'KG', standard_unit_cost: 68.00, unit_cost: 68.00, average_density_kg_per_unit: 0.95, shelf_life_hours: 8, is_perishable: true, is_active: true, created_at: '2026-01-01T00:00:00Z' }
];

export const INITIAL_MEALS: Meal[] = [
  { meal_id: 1, meal_code: 'BREAKFAST', meal_name: 'Morning Breakfast', typical_start_time: '07:30', typical_end_time: '09:30', display_order: 1 },
  { meal_id: 2, meal_code: 'LUNCH', meal_name: 'Afternoon Lunch', typical_start_time: '12:15', typical_end_time: '14:30', display_order: 2 },
  { meal_id: 3, meal_code: 'SNACKS', meal_name: 'Evening Snacks & Tea', typical_start_time: '17:00', typical_end_time: '18:15', display_order: 3 },
  { meal_id: 4, meal_code: 'DINNER', meal_name: 'Night Dinner', typical_start_time: '19:45', typical_end_time: '22:00', display_order: 4 }
];

export const INITIAL_WASTE_REASONS: WasteReason[] = [
  { reason_id: 1, reason_code: 'OVERPRODUCTION', reason_name: 'Kitchen Overproduction', category: 'KITCHEN_OVERPRODUCTION', is_preventable: true, severity_rank: 4, description: 'Portions prepared exceeded student turn-out or appetite' },
  { reason_id: 2, reason_code: 'LOW_ATTENDANCE', reason_name: 'Low Student Attendance', category: 'ATTENDANCE_DROP', is_preventable: true, severity_rank: 4, description: 'Unannounced hostel departures, weekend drops, or post-exam bunking' },
  { reason_id: 3, reason_code: 'MENU_NOT_PREFERRED', reason_name: 'Menu Item Not Preferred', category: 'RECIPE_QUALITY', is_preventable: true, severity_rank: 3, description: 'High rejection due to taste, texture, excessive spice or unpopular vegetable' },
  { reason_id: 4, reason_code: 'SPOILAGE', reason_name: 'Spoilage, Souring or Fermentation', category: 'SPOILAGE_STORAGE', is_preventable: true, severity_rank: 5, description: 'Bacterial contamination or refrigeration holding breakdown' },
  { reason_id: 5, reason_code: 'PREPARATION_ERROR', reason_name: 'Preparation Error / Burnt / Over-salted', category: 'RECIPE_QUALITY', is_preventable: true, severity_rank: 4, description: 'Culinary mistake during cooking rendering batch inedible' },
  { reason_id: 6, reason_code: 'SERVING_LEFTOVERS', reason_name: 'Leftover Serving Residue in Counter', category: 'SERVICE_RESIDUE', is_preventable: false, severity_rank: 2, description: 'Bottom pan scraps or cold residual gravy unable to be served fresh' },
  { reason_id: 7, reason_code: 'EVENT_CANCELLATION', reason_name: 'Event Cancellation / Schedule Shift', category: 'FORCE_MAJEURE', is_preventable: true, severity_rank: 3, description: 'Campus lecture, sports meet, or symposium abruptly halted' },
  { reason_id: 8, reason_code: 'QUALITY_ISSUE', reason_name: 'Ingredient Quality / Texture Defect', category: 'RECIPE_QUALITY', is_preventable: true, severity_rank: 4, description: 'Lumpy rice, curdled yogurt, or stale raw grains from supplier' },
  { reason_id: 9, reason_code: 'RAIN_HOLIDAY_DISRUPTION', reason_name: 'Weather Disruption / Heavy Downpour', category: 'FORCE_MAJEURE', is_preventable: false, severity_rank: 2, description: 'Torrential downpour preventing day scholars from dining' },
  { reason_id: 10, reason_code: 'PLATE_WASTAGE', reason_name: 'Student Post-Consumption Plate Scrap', category: 'SERVICE_RESIDUE', is_preventable: true, severity_rank: 3, description: 'Excessive portions ladled onto plates that were discarded uneaten' }
];

export const INITIAL_DISPOSAL_METHODS: DisposalMethod[] = [
  { method_id: 1, method_code: 'COMPOST_CAMPUS', method_name: 'On-Campus Aerobic Composting Pit', environmental_score: 8.5, is_recovery: true, carbon_offset_factor: 0.450, description: 'Converted to organic manure for campus gardens' },
  { method_id: 2, method_code: 'PANTRY_RESCUE', method_name: 'Donation to Verified Food Pantry / NGO', environmental_score: 9.8, is_recovery: true, carbon_offset_factor: 0.950, description: 'Safe edible food dispatched within 2 hours' },
  { method_id: 3, method_code: 'BIOGAS_DIGESTER', method_name: 'Campus Anaerobic Bio-Methanation Plant', environmental_score: 9.2, is_recovery: true, carbon_offset_factor: 0.720, description: 'Anaerobically digested to generate kitchen cooking methane' },
  { method_id: 4, method_code: 'PIGGERY_FEED', method_name: 'Authorized Livestock & Piggery Feed', environmental_score: 6.5, is_recovery: true, carbon_offset_factor: 0.380, description: 'Repurposed for local farm animals' },
  { method_id: 5, method_code: 'MUNICIPAL_LANDFILL', method_name: 'Municipal Solid Waste Landfill Dump', environmental_score: 1.0, is_recovery: false, carbon_offset_factor: -0.620, description: 'Hauled to municipal dump (high methane release)' }
];

export const INITIAL_VENDORS: Vendor[] = [
  { vendor_id: '88888888-8888-8888-8888-888888888801', id: '88888888-8888-8888-8888-888888888801', campus_id: '11111111-1111-1111-1111-111111111111', vendor_code: 'VEN-ANNAPURNA-01', vendor_name: 'Annapurna Agri Agro Mills Ltd', contact_person: 'Suresh Patel', phone: '+91-9811122233', email: 'suresh@annapurna-agro.com', tax_identifier: 'GST29AAAA1111A1Z5', compliance_rating: 4.8, is_active: true },
  { vendor_id: '88888888-8888-8888-8888-888888888802', id: '88888888-8888-8888-8888-888888888802', campus_id: '11111111-1111-1111-1111-111111111111', vendor_code: 'VEN-NANDINI-02', vendor_name: 'Karnataka Milk Federation (Nandini)', contact_person: 'Rajesh Gowda', phone: '+91-9822233344', email: 'sales.dairy@kmf-nandini.coop', tax_identifier: 'GST29BBBB2222B2Z6', compliance_rating: 4.9, is_active: true },
  { vendor_id: '88888888-8888-8888-8888-888888888803', id: '88888888-8888-8888-8888-888888888803', campus_id: '11111111-1111-1111-1111-111111111111', vendor_code: 'VEN-FARM-FRESH-03', vendor_name: 'Green Valley Farm Fresh Veggies', contact_person: 'Deepak Hegde', phone: '+91-9833344455', email: 'deepak@greenvalleyveggies.com', tax_identifier: 'GST29CCCC3333C3Z7', compliance_rating: 4.5, is_active: true },
  { vendor_id: '88888888-8888-8888-8888-888888888804', id: '88888888-8888-8888-8888-888888888804', campus_id: '11111111-1111-1111-1111-111111111111', vendor_code: 'VEN-PULSE-BHOOMI-04', vendor_name: 'Bhoomi Organic Pulses & Spices Corp', contact_person: 'Kavita Iyer', phone: '+91-9844455566', email: 'kavita@bhoomipulses.in', tax_identifier: 'GST29DDDD4444D4Z8', compliance_rating: 4.7, is_active: true },
  { vendor_id: '88888888-8888-8888-8888-888888888805', id: '88888888-8888-8888-8888-888888888805', campus_id: '11111111-1111-1111-1111-111111111111', vendor_code: 'VEN-SHREE-FLOUR-05', vendor_name: 'Shree Ganesh Roller Flour Mills', contact_person: 'Girish Kulkarni', phone: '+91-9855566677', email: 'girish@shreeflour.com', tax_identifier: 'GST29EEEE5555E5Z9', compliance_rating: 4.4, is_active: true },
  { vendor_id: '88888888-8888-8888-8888-888888888806', id: '88888888-8888-8888-8888-888888888806', campus_id: '11111111-1111-1111-1111-111111111111', vendor_code: 'VEN-KAVERI-OILS-06', vendor_name: 'Kaveri Cold Pressed Cooking Oils', contact_person: 'Prakash Naidu', phone: '+91-9866677788', email: 'prakash@kaverioils.co.in', tax_identifier: 'GST29FFFF6666F6Z1', compliance_rating: 4.6, is_active: true },
  { vendor_id: '88888888-8888-8888-8888-888888888807', id: '88888888-8888-8888-8888-888888888807', campus_id: '11111111-1111-1111-1111-111111111111', vendor_code: 'VEN-BAKERY-GOLD-07', vendor_name: 'Golden Crust Bakery Supplies', contact_person: 'Amitava Sen', phone: '+91-9877788899', email: 'orders@goldencrust.com', tax_identifier: 'GST29GGGG7777G7Z2', compliance_rating: 4.2, is_active: true },
  { vendor_id: '88888888-8888-8888-8888-888888888808', id: '88888888-8888-8888-8888-888888888808', campus_id: '11111111-1111-1111-1111-111111111111', vendor_code: 'VEN-MALNAD-SPICES-08', vendor_name: 'Malnad Spices Plantation Co', contact_person: 'Vinay Prasad', phone: '+91-9888899900', email: 'vinay@malnadspices.org', tax_identifier: 'GST29HHHH8888H8Z3', compliance_rating: 4.8, is_active: true },
  { vendor_id: '88888888-8888-8888-8888-888888888809', id: '88888888-8888-8888-8888-888888888809', campus_id: '11111111-1111-1111-1111-111111111111', vendor_code: 'VEN-CLEAN-HYGIENE-09', vendor_name: 'Sanitron Eco Kitchen Hygiene', contact_person: 'Pooja Bhat', phone: '+91-9899900011', email: 'pooja@sanitronclean.in', tax_identifier: 'GST29IIII9999I9Z4', compliance_rating: 4.7, is_active: true },
  { vendor_id: '88888888-8888-8888-8888-888888888810', id: '88888888-8888-8888-8888-888888888810', campus_id: '11111111-1111-1111-1111-111111111111', vendor_code: 'VEN-CAMPUS-GAS-10', vendor_name: 'Indane Commercial LPG Distributors', contact_person: 'Somnath Mukherjee', phone: '+91-9800011122', email: 'somnath@indane-commercial.com', tax_identifier: 'GST29JJJJ0000J0Z5', compliance_rating: 5.0, is_active: true }
];

export const INITIAL_EVENTS: CampusEvent[] = [
  { event_id: '99999999-9999-9999-9999-999999999901', campus_id: '11111111-1111-1111-1111-111111111111', facility_id: '33333333-3333-3333-3333-333333333301', event_name: 'Tarang 2026 Annual Cultural Fest', event_type: 'CULTURAL_FEST', start_date: '2026-09-12', end_date: '2026-09-15', expected_headcount_impact: 450, notes: 'Visiting college contingents on campus; high buffet waste spike' },
  { event_id: '99999999-9999-9999-9999-999999999902', campus_id: '11111111-1111-1111-1111-111111111111', facility_id: '33333333-3333-3333-3333-333333333302', event_name: 'Mid-Semester Examinations Odd Term', event_type: 'EXAM_PERIOD', start_date: '2026-09-22', end_date: '2026-09-28', expected_headcount_impact: -180, notes: 'Students skip scheduled meals to study; morning attendance drops 30%' },
  { event_id: '99999999-9999-9999-9999-999999999903', campus_id: '11111111-1111-1111-1111-111111111111', facility_id: '33333333-3333-3333-3333-333333333303', event_name: 'Gandhi Jayanti Long Weekend Holiday', event_type: 'HOLIDAY', start_date: '2026-10-02', end_date: '2026-10-04', expected_headcount_impact: -380, notes: 'Mass exodus to hometowns causing significant kitchen overproduction' },
  { event_id: '99999999-9999-9999-9999-999999999904', campus_id: '11111111-1111-1111-1111-111111111111', facility_id: '33333333-3333-3333-3333-333333333301', event_name: 'Inter-NIT Athletics Meet', event_type: 'SPORTS_MEET', start_date: '2026-09-04', end_date: '2026-09-07', expected_headcount_impact: 220, notes: 'High food intake and calorie-heavy menu demand' },
  { event_id: '99999999-9999-9999-9999-999999999905', campus_id: '11111111-1111-1111-1111-111111111111', facility_id: '33333333-3333-3333-3333-333333333304', event_name: 'International ACM Data Science Conference', event_type: 'ACADEMIC_CONFERENCE', start_date: '2026-09-18', end_date: '2026-09-20', expected_headcount_impact: 150, notes: 'Faculty and international guest banquets' }
];

// Generate 30+ days of operational data (From 2026-09-01 to 2026-10-05)
export function generate30DayOperationalHistory() {
  const menus: Menu[] = [];
  const menuItems: MenuItem[] = [];
  const attendances: Attendance[] = [];
  const preparations: FoodPreparation[] = [];
  const consumptions: FoodConsumption[] = [];
  const wastes: FoodWaste[] = [];
  const purchases: Purchase[] = [];
  const audits: AuditLog[] = [];

  const facilities = INITIAL_FACILITIES;
  const items = INITIAL_FOOD_ITEMS;
  let auditCounter = 1;

  // Generate 98 days of historical operational data (July 1, 2026 to October 6, 2026)
  const startDate = new Date(2026, 6, 1); // 2026-07-01
  const daysCount = 98;

  for (let d = 0; d < daysCount; d++) {
    const curDate = new Date(startDate);
    curDate.setDate(curDate.getDate() + d);
    const dateStr = curDate.toISOString().slice(0, 10);
    const dayOfWeek = curDate.getDay(); // 0 is Sunday

    // Check if event active
    const isCulturalFest = (dateStr >= '2026-09-12' && dateStr <= '2026-09-15');
    const isExams = (dateStr >= '2026-09-22' && dateStr <= '2026-09-28');
    const isLongWeekend = (dateStr >= '2026-10-02' && dateStr <= '2026-10-04');

    facilities.forEach((fac) => {
      // Rotate 3 meals per day
      [1, 2, 4].forEach((mealId) => { // Breakfast, Lunch, Dinner
        const menuId = `menu-${dateStr}-${fac.facility_code}-${mealId}`;
        const baseCap = fac.dining_capacity;
        
        let expectedAtt = Math.round(baseCap * (mealId === 1 ? 0.75 : mealId === 2 ? 0.90 : 0.85));
        if (dayOfWeek === 0 || dayOfWeek === 6) expectedAtt = Math.round(expectedAtt * 0.70); // weekend drop

        if (isCulturalFest) expectedAtt += 150;
        if (isExams && mealId === 1) expectedAtt -= 90; // students skip breakfast
        if (isLongWeekend) expectedAtt -= 250;

        menus.push({
          menu_id: menuId,
          facility_id: fac.facility_id,
          meal_id: mealId,
          menu_date: dateStr,
          version: 1,
          expected_attendance: expectedAtt,
          is_active: true,
          created_by: '55555555-5555-5555-5555-555555555503'
        });

        // Actual attendance with realistic drift
        let actualAtt = expectedAtt;
        if (isLongWeekend) {
          actualAtt = expectedAtt - 65; // High overprediction -> high waste
        } else if (isExams && mealId === 1) {
          actualAtt = expectedAtt - 45; // Absenteeism
        } else if (isCulturalFest) {
          actualAtt = expectedAtt + 25;
        } else {
          // slight random jitter -15 to +10
          actualAtt = Math.max(50, expectedAtt + (d % 7 === 0 ? -35 : (d % 3 === 0 ? 12 : -8)));
        }

        attendances.push({
          attendance_id: `att-${dateStr}-${fac.facility_code}-${mealId}`,
          facility_id: fac.facility_id,
          meal_id: mealId,
          attendance_date: dateStr,
          expected_attendance: expectedAtt,
          actual_attendance: actualAtt,
          variance_count: actualAtt - expectedAtt,
          head_count_method: 'BIOMETRIC_TURNSTILE',
          recorded_by: '55555555-5555-5555-5555-555555555504'
        });

        // Select 3 items for this meal
        let selectedItemIds: string[] = [];
        if (mealId === 1) {
          selectedItemIds = [items[2].item_id, items[6].item_id, items[19].item_id]; // Poha, Sambar, Chai
        } else if (mealId === 2) {
          selectedItemIds = [items[0].item_id, items[3].item_id, items[7].item_id, items[13].item_id]; // Rice, Dal Tadka, Aloo Gobi, Roti
        } else {
          selectedItemIds = [items[1].item_id, items[4].item_id, items[10].item_id, items[16].item_id]; // Jeera Rice, Dal Makhani, Paneer Butter, Gulab Jamun
        }

        selectedItemIds.forEach((itemId, idx) => {
          const item = items.find(i => i.item_id === itemId)!;
          const plannedQty = Math.round((expectedAtt * (item.standard_unit === 'PIECE' ? 2.5 : 0.22)));
          
          menuItems.push({
            menu_item_id: `mi-${menuId}-${idx}`,
            menu_id: menuId,
            item_id: itemId,
            planned_quantity: plannedQty,
            portion_size_grams: item.standard_unit === 'PIECE' ? 80 : 200,
            unit: item.standard_unit
          });

          // Kitchen Prep
          const prepId = `prep-${dateStr}-${fac.facility_code}-${mealId}-${item.item_code}`;
          const prepQty = plannedQty; // Cook what was planned

          preparations.push({
            prep_id: prepId,
            facility_id: fac.facility_id,
            menu_id: menuId,
            item_id: itemId,
            prep_date: dateStr,
            meal_id: mealId,
            prepared_quantity: prepQty,
            unit: item.standard_unit,
            batch_number: `B-${dateStr.slice(5).replace('-', '')}-${mealId}-${idx + 1}`,
            prepared_by: '55555555-5555-5555-5555-555555555504',
            created_at: `${dateStr}T${mealId === 1 ? '06:30' : mealId === 2 ? '11:00' : '18:30'}:00Z`
          });

          // Consumption based on actual attendees
          const perStudentPortion = item.standard_unit === 'PIECE' ? 2.2 : 0.19;
          let consumedQty = Math.min(prepQty, Math.round(actualAtt * perStudentPortion));

          // Food Consumption
          consumptions.push({
            consumption_id: `cons-${prepId}`,
            prep_id: prepId,
            consumed_quantity: consumedQty,
            unit: item.standard_unit,
            measurement_type: 'ACTUAL_SCALE',
            recorded_by: '55555555-5555-5555-5555-555555555504',
            recorded_at: `${dateStr}T${mealId === 1 ? '09:45' : mealId === 2 ? '14:45' : '22:15'}:00Z`
          });

          // Leftover & Waste Calculation
          const leftover = Math.max(0, prepQty - consumedQty);
          if (leftover > 0) {
            // High waste scenarios on long weekend or exam breakfast or fest overproduction
            let reasonId = 1; // OVERPRODUCTION
            let wasteClass: WasteClassification = 'EDIBLE_LEFTOVER';
            let methodId = 1; // COMPOST
            let pantryId: string | undefined = undefined;

            if (isLongWeekend) {
              reasonId = 2; // LOW_ATTENDANCE
              wasteClass = 'EDIBLE_LEFTOVER';
              methodId = 2; // PANTRY_RESCUE
              pantryId = '44444444-4444-4444-4444-444444444401';
            } else if (isExams && mealId === 1) {
              reasonId = 2; // LOW_ATTENDANCE
              methodId = 3; // BIOGAS
            } else if (d % 9 === 0) {
              reasonId = 4; // SPOILAGE
              wasteClass = 'SPOILED_FOOD';
              methodId = 5; // LANDFILL
            } else if (d % 6 === 0) {
              reasonId = 3; // MENU_NOT_PREFERRED
              wasteClass = 'PLATE_WASTE';
              methodId = 3; // BIOGAS
            }

            const wasteQty = leftover;
            const costSnapshot = item.standard_unit_cost;
            const estCost = Math.round(wasteQty * costSnapshot * 100) / 100;

            wastes.push({
              waste_id: `waste-${prepId}`,
              prep_id: prepId,
              facility_id: fac.facility_id,
              item_id: itemId,
              meal_id: mealId,
              waste_date: dateStr,
              waste_quantity: wasteQty,
              unit: item.standard_unit,
              waste_category: wasteClass,
              reason_id: reasonId,
              method_id: methodId,
              pantry_partner_id: pantryId,
              unit_cost_snapshot: costSnapshot,
              estimated_waste_cost: estCost,
              reported_by: '55555555-5555-5555-5555-555555555504',
              recorded_at: `${dateStr}T${mealId === 1 ? '10:00' : mealId === 2 ? '15:00' : '22:30'}:00Z`,
              notes: isLongWeekend ? 'Massive student weekend drop logged' : undefined
            });
          }
        });
      });
    });

    // Weekly Purchase Order every 5 days
    if (d % 5 === 0) {
      const poNum = `PO-2026-SEP-0${d / 5 + 1}`;
      const vendor = INITIAL_VENDORS[d % INITIAL_VENDORS.length];
      const pItems = [
        {
          purchase_item_id: `pi-${d}-1`,
          purchase_id: `po-${d}`,
          item_id: items[0].item_id, // Rice
          quantity: 500,
          unit: 'KG' as const,
          unit_price: 47.50,
          tax_percentage: 5.0,
          line_total: 24937.50,
          batch_number: `LOT-RICE-${d}`,
          expiry_date: '2026-12-31'
        },
        {
          purchase_item_id: `pi-${d}-2`,
          purchase_id: `po-${d}`,
          item_id: items[3].item_id, // Toor dal
          quantity: 250,
          unit: 'KG' as const,
          unit_price: 71.00,
          tax_percentage: 5.0,
          line_total: 18637.50,
          batch_number: `LOT-DAL-${d}`,
          expiry_date: '2026-12-31'
        },
        {
          purchase_item_id: `pi-${d}-3`,
          purchase_id: `po-${d}`,
          item_id: items[10].item_id, // Paneer
          quantity: 120,
          unit: 'KG' as const,
          unit_price: 178.00,
          tax_percentage: 12.0,
          line_total: 23923.20,
          batch_number: `LOT-PAN-${d}`,
          expiry_date: '2026-10-15'
        }
      ];

      const poTotal = pItems.reduce((acc, curr) => acc + curr.line_total, 0);

      purchases.push({
        purchase_id: `po-${d}`,
        campus_id: '11111111-1111-1111-1111-111111111111',
        vendor_id: vendor.vendor_id,
        po_number: poNum,
        invoice_number: `INV-V${d}-2026`,
        purchase_date: dateStr,
        total_amount: Math.round(poTotal * 100) / 100,
        status: 'RECEIVED',
        created_by: '55555555-5555-5555-5555-555555555505',
        items: pItems
      });

      audits.push({
        audit_id: auditCounter++,
        campus_id: '11111111-1111-1111-1111-111111111111',
        table_name: 'purchase',
        operation_type: 'INSERT',
        record_pk: `po-${d}`,
        new_data: { po_number: poNum, vendor: vendor.vendor_name, total: poTotal },
        changed_by: '55555555-5555-5555-5555-555555555505',
        executed_at: `${dateStr}T09:15:00Z`
      });
    }
  }

  // Pre-seed some critical audit events
  audits.push(
    {
      audit_id: auditCounter++,
      campus_id: '11111111-1111-1111-1111-111111111111',
      table_name: 'facility',
      operation_type: 'UPDATE',
      record_pk: '33333333-3333-3333-3333-333333333301',
      old_data: { dining_capacity: 1000 },
      new_data: { dining_capacity: 1200 },
      changed_by: '55555555-5555-5555-5555-555555555501',
      executed_at: '2026-09-02T11:42:00Z'
    },
    {
      audit_id: auditCounter++,
      campus_id: '11111111-1111-1111-1111-111111111111',
      table_name: 'food_item',
      operation_type: 'UPDATE',
      record_pk: '77777777-7777-7777-7777-777777777711',
      old_data: { standard_unit_cost: 175.00 },
      new_data: { standard_unit_cost: 180.00 },
      changed_by: '55555555-5555-5555-5555-555555555505',
      executed_at: '2026-09-10T14:20:00Z'
    }
  );

  return {
    menus,
    menuItems,
    attendances,
    preparations,
    consumptions,
    wastes,
    purchases,
    audits
  };
}

export const INITIAL_DAILY_OPERATIONS: DailyOperation[] = [
  { id: 'op-01', operation_id: 'op-01', date: '2026-10-01', facility_id: '33333333-3333-3333-3333-333333333301', campus_id: '11111111-1111-1111-1111-111111111111', expected: 1200, actual_attendance: 1140, meal_period: 'LUNCH', total_prepared_kg: 480, total_consumed_kg: 442, total_waste_kg: 38 },
  { id: 'op-02', operation_id: 'op-02', date: '2026-10-01', facility_id: '33333333-3333-3333-3333-333333333302', campus_id: '11111111-1111-1111-1111-111111111111', expected: 650, actual_attendance: 620, meal_period: 'DINNER', total_prepared_kg: 260, total_consumed_kg: 242, total_waste_kg: 18 },
  { id: 'op-03', operation_id: 'op-03', date: '2026-10-02', facility_id: '33333333-3333-3333-3333-333333333301', campus_id: '11111111-1111-1111-1111-111111111111', expected: 1200, actual_attendance: 820, meal_period: 'LUNCH', total_prepared_kg: 490, total_consumed_kg: 426, total_waste_kg: 64 }, // Holiday drop < 0.8
  { id: 'op-04', operation_id: 'op-04', date: '2026-10-02', facility_id: '33333333-3333-3333-3333-333333333303', campus_id: '11111111-1111-1111-1111-111111111111', expected: 750, actual_attendance: 510, meal_period: 'DINNER', total_prepared_kg: 310, total_consumed_kg: 252, total_waste_kg: 58 }, // Holiday drop < 0.8
  { id: 'op-05', operation_id: 'op-05', date: '2026-10-03', facility_id: '33333333-3333-3333-3333-333333333305', campus_id: '22222222-2222-2222-2222-222222222222', expected: 950, actual_attendance: 910, meal_period: 'LUNCH', total_prepared_kg: 390, total_consumed_kg: 365, total_waste_kg: 25 },
  { id: 'op-06', operation_id: 'op-06', date: '2026-10-03', facility_id: '33333333-3333-3333-3333-333333333306', campus_id: '22222222-2222-2222-2222-222222222222', expected: 550, actual_attendance: 380, meal_period: 'DINNER', total_prepared_kg: 230, total_consumed_kg: 178, total_waste_kg: 52 }, // Exam prep drop < 0.8
  { id: 'op-07', operation_id: 'op-07', date: '2026-10-04', facility_id: '33333333-3333-3333-3333-333333333308', campus_id: '33333333-1111-1111-1111-111111111111', expected: 600, actual_attendance: 580, meal_period: 'LUNCH', total_prepared_kg: 250, total_consumed_kg: 235, total_waste_kg: 15 },
  { id: 'op-08', operation_id: 'op-08', date: '2026-10-04', facility_id: '33333333-3333-3333-3333-333333333309', campus_id: '33333333-1111-1111-1111-111111111111', expected: 800, actual_attendance: 760, meal_period: 'LUNCH', total_prepared_kg: 320, total_consumed_kg: 298, total_waste_kg: 22 },
  { id: 'op-09', operation_id: 'op-09', date: '2026-10-05', facility_id: '33333333-3333-3333-3333-333333333301', campus_id: '11111111-1111-1111-1111-111111111111', expected: 1200, actual_attendance: 1180, meal_period: 'LUNCH', total_prepared_kg: 500, total_consumed_kg: 472, total_waste_kg: 28 },
  { id: 'op-10', operation_id: 'op-10', date: '2026-10-05', facility_id: '33333333-3333-3333-3333-333333333302', campus_id: '11111111-1111-1111-1111-111111111111', expected: 650, actual_attendance: 480, meal_period: 'DINNER', total_prepared_kg: 270, total_consumed_kg: 215, total_waste_kg: 55 }, // Festival drop < 0.8
  { id: 'op-11', operation_id: 'op-11', date: '2026-10-06', facility_id: '33333333-3333-3333-3333-333333333305', campus_id: '22222222-2222-2222-2222-222222222222', expected: 950, actual_attendance: 930, meal_period: 'LUNCH', total_prepared_kg: 410, total_consumed_kg: 385, total_waste_kg: 25 },
  { id: 'op-12', operation_id: 'op-12', date: '2026-10-06', facility_id: '33333333-3333-3333-3333-333333333308', campus_id: '33333333-1111-1111-1111-111111111111', expected: 600, actual_attendance: 420, meal_period: 'DINNER', total_prepared_kg: 250, total_consumed_kg: 195, total_waste_kg: 55 }, // Project deadline drop < 0.8
  { id: 'op-13', operation_id: 'op-13', date: '2026-10-07', facility_id: '33333333-3333-3333-3333-333333333301', campus_id: '11111111-1111-1111-1111-111111111111', expected: 1200, actual_attendance: 1150, meal_period: 'LUNCH', total_prepared_kg: 490, total_consumed_kg: 458, total_waste_kg: 32 },
  { id: 'op-14', operation_id: 'op-14', date: '2026-10-07', facility_id: '33333333-3333-3333-3333-333333333304', campus_id: '11111111-1111-1111-1111-111111111111', expected: 400, actual_attendance: 385, meal_period: 'LUNCH', total_prepared_kg: 170, total_consumed_kg: 148, total_waste_kg: 22 },
  { id: 'op-15', operation_id: 'op-15', date: '2026-10-07', facility_id: '33333333-3333-3333-3333-333333333305', campus_id: '22222222-2222-2222-2222-222222222222', expected: 950, actual_attendance: 905, meal_period: 'DINNER', total_prepared_kg: 395, total_consumed_kg: 367, total_waste_kg: 28 },
  { id: 'op-16', operation_id: 'op-16', date: '2026-10-07', facility_id: '33333333-3333-3333-3333-333333333308', campus_id: '33333333-1111-1111-1111-111111111111', expected: 600, actual_attendance: 570, meal_period: 'LUNCH', total_prepared_kg: 245, total_consumed_kg: 229, total_waste_kg: 16 },
  { id: 'op-17', operation_id: 'op-17', date: '2026-10-08', facility_id: '33333333-3333-3333-3333-333333333301', campus_id: '11111111-1111-1111-1111-111111111111', expected: 1200, actual_attendance: 1120, meal_period: 'LUNCH', total_prepared_kg: 485, total_consumed_kg: 451, total_waste_kg: 34 },
  { id: 'op-18', operation_id: 'op-18', date: '2026-10-08', facility_id: '33333333-3333-3333-3333-333333333302', campus_id: '11111111-1111-1111-1111-111111111111', expected: 650, actual_attendance: 610, meal_period: 'DINNER', total_prepared_kg: 265, total_consumed_kg: 245, total_waste_kg: 20 },
  { id: 'op-19', operation_id: 'op-19', date: '2026-10-08', facility_id: '33333333-3333-3333-3333-333333333307', campus_id: '22222222-2222-2222-2222-222222222222', expected: 350, actual_attendance: 330, meal_period: 'LUNCH', total_prepared_kg: 145, total_consumed_kg: 133, total_waste_kg: 12 },
  { id: 'op-20', operation_id: 'op-20', date: '2026-10-08', facility_id: '33333333-3333-3333-3333-333333333310', campus_id: '33333333-1111-1111-1111-111111111111', expected: 300, actual_attendance: 210, meal_period: 'DINNER', total_prepared_kg: 140, total_consumed_kg: 82, total_waste_kg: 58 },
  { id: 'op-21', operation_id: 'op-21', date: '2026-10-09', facility_id: '33333333-3333-3333-3333-333333333301', campus_id: '11111111-1111-1111-1111-111111111111', expected: 1200, actual_attendance: 1175, meal_period: 'LUNCH', total_prepared_kg: 495, total_consumed_kg: 467, total_waste_kg: 28 },
  { id: 'op-22', operation_id: 'op-22', date: '2026-10-09', facility_id: '33333333-3333-3333-3333-333333333303', campus_id: '11111111-1111-1111-1111-111111111111', expected: 750, actual_attendance: 520, meal_period: 'DINNER', total_prepared_kg: 315, total_consumed_kg: 243, total_waste_kg: 72 },
  { id: 'op-23', operation_id: 'op-23', date: '2026-10-09', facility_id: '33333333-3333-3333-3333-333333333306', campus_id: '22222222-2222-2222-2222-222222222222', expected: 550, actual_attendance: 530, meal_period: 'LUNCH', total_prepared_kg: 235, total_consumed_kg: 219, total_waste_kg: 16 },
  { id: 'op-24', operation_id: 'op-24', date: '2026-10-09', facility_id: '33333333-3333-3333-3333-333333333309', campus_id: '33333333-1111-1111-1111-111111111111', expected: 800, actual_attendance: 785, meal_period: 'LUNCH', total_prepared_kg: 330, total_consumed_kg: 309, total_waste_kg: 21 },
  { id: 'op-25', operation_id: 'op-25', date: '2026-10-10', facility_id: '33333333-3333-3333-3333-333333333305', campus_id: '22222222-2222-2222-2222-222222222222', expected: 950, actual_attendance: 920, meal_period: 'LUNCH', total_prepared_kg: 405, total_consumed_kg: 379, total_waste_kg: 26 },
  { id: 'op-26', operation_id: 'op-26', date: '2026-10-10', facility_id: '33333333-3333-3333-3333-333333333310', campus_id: '33333333-1111-1111-1111-111111111111', expected: 300, actual_attendance: 230, meal_period: 'DINNER', total_prepared_kg: 135, total_consumed_kg: 79, total_waste_kg: 56 }
];

export const INITIAL_WASTE_LOGS: WasteLog[] = [
  { id: 'w-01', waste_id: 'w-01', operation_id: 'op-01', date: '2026-10-01', facility_id: '33333333-3333-3333-3333-333333333301', item_id: '77777777-7777-7777-7777-777777777701', waste_kg: 38.0, financial_loss: 1824.0, reason: 'Over-preparation', category: 'GRAIN', meal_period: 'LUNCH' },
  { id: 'w-02', waste_id: 'w-02', operation_id: 'op-02', date: '2026-10-01', facility_id: '33333333-3333-3333-3333-333333333302', item_id: '77777777-7777-7777-7777-777777777704', waste_kg: 18.0, financial_loss: 1296.0, reason: 'Plate Waste', category: 'PULSE', meal_period: 'DINNER' },
  { id: 'w-03', waste_id: 'w-03', operation_id: 'op-03', date: '2026-10-02', facility_id: '33333333-3333-3333-3333-333333333301', item_id: '77777777-7777-7777-7777-777777777711', waste_kg: 64.0, financial_loss: 11520.0, reason: 'Low Attendance', category: 'DAIRY', meal_period: 'LUNCH' }, // > 50 kg
  { id: 'w-04', waste_id: 'w-04', operation_id: 'op-04', date: '2026-10-02', facility_id: '33333333-3333-3333-3333-333333333303', item_id: '77777777-7777-7777-7777-777777777701', waste_kg: 58.0, financial_loss: 2784.0, reason: 'Low Attendance', category: 'GRAIN', meal_period: 'DINNER' }, // > 50 kg
  { id: 'w-05', waste_id: 'w-05', operation_id: 'op-05', date: '2026-10-03', facility_id: '33333333-3333-3333-3333-333333333305', item_id: '77777777-7777-7777-7777-777777777708', waste_kg: 25.0, financial_loss: 1625.0, reason: 'Spillage / Burn', category: 'VEGETABLE', meal_period: 'LUNCH' },
  { id: 'w-06', waste_id: 'w-06', operation_id: 'op-06', date: '2026-10-03', facility_id: '33333333-3333-3333-3333-333333333306', item_id: '77777777-7777-7777-7777-777777777717', waste_kg: 52.0, financial_loss: 12480.0, reason: 'Low Attendance', category: 'DESSERT', meal_period: 'DINNER' }, // > 50 kg dessert
  { id: 'w-07', waste_id: 'w-07', operation_id: 'op-07', date: '2026-10-04', facility_id: '33333333-3333-3333-3333-333333333308', item_id: '77777777-7777-7777-7777-777777777701', waste_kg: 15.0, financial_loss: 720.0, reason: 'Plate Waste', category: 'GRAIN', meal_period: 'LUNCH' },
  { id: 'w-08', waste_id: 'w-08', operation_id: 'op-08', date: '2026-10-04', facility_id: '33333333-3333-3333-3333-333333333309', item_id: '77777777-7777-7777-7777-777777777718', waste_kg: 22.0, financial_loss: 2420.0, reason: 'Over-preparation', category: 'DESSERT', meal_period: 'LUNCH' },
  { id: 'w-09', waste_id: 'w-09', operation_id: 'op-09', date: '2026-10-05', facility_id: '33333333-3333-3333-3333-333333333301', item_id: '77777777-7777-7777-7777-777777777704', waste_kg: 28.0, financial_loss: 2016.0, reason: 'Over-preparation', category: 'PULSE', meal_period: 'LUNCH' },
  { id: 'w-10', waste_id: 'w-10', operation_id: 'op-10', date: '2026-10-05', facility_id: '33333333-3333-3333-3333-333333333302', item_id: '77777777-7777-7777-7777-777777777711', waste_kg: 55.0, financial_loss: 9900.0, reason: 'Cold Storage Failure', category: 'DAIRY', meal_period: 'DINNER' }, // > 50 kg
  { id: 'w-11', waste_id: 'w-11', operation_id: 'op-11', date: '2026-10-06', facility_id: '33333333-3333-3333-3333-333333333305', item_id: '77777777-7777-7777-7777-777777777701', waste_kg: 25.0, financial_loss: 1200.0, reason: 'Plate Waste', category: 'GRAIN', meal_period: 'LUNCH' },
  { id: 'w-12', waste_id: 'w-12', operation_id: 'op-12', date: '2026-10-06', facility_id: '33333333-3333-3333-3333-333333333308', item_id: '77777777-7777-7777-7777-777777777719', waste_kg: 55.0, financial_loss: 8800.0, reason: 'Low Attendance', category: 'DESSERT', meal_period: 'DINNER' }, // > 50 kg dessert
  // Oct 7 rows (Matching query 10: w.date = '2026-10-07')
  { id: 'w-13', waste_id: 'w-13', operation_id: 'op-13', date: '2026-10-07', facility_id: '33333333-3333-3333-3333-333333333301', item_id: '77777777-7777-7777-7777-777777777701', waste_kg: 32.0, financial_loss: 1536.0, reason: 'Over-preparation', category: 'GRAIN', meal_period: 'LUNCH' },
  { id: 'w-14', waste_id: 'w-14', operation_id: 'op-14', date: '2026-10-07', facility_id: '33333333-3333-3333-3333-333333333304', item_id: '77777777-7777-7777-7777-777777777717', waste_kg: 22.0, financial_loss: 5280.0, reason: 'Expiration', category: 'DESSERT', meal_period: 'LUNCH' },
  { id: 'w-15', waste_id: 'w-15', operation_id: 'op-15', date: '2026-10-07', facility_id: '33333333-3333-3333-3333-333333333305', item_id: '77777777-7777-7777-7777-777777777711', waste_kg: 28.0, financial_loss: 5040.0, reason: 'Plate Waste', category: 'DAIRY', meal_period: 'DINNER' },
  { id: 'w-16', waste_id: 'w-16', operation_id: 'op-16', date: '2026-10-07', facility_id: '33333333-3333-3333-3333-333333333308', item_id: '77777777-7777-7777-7777-777777777708', waste_kg: 16.0, financial_loss: 1040.0, reason: 'Spillage / Burn', category: 'VEGETABLE', meal_period: 'LUNCH' },
  // Oct 8 rows (Matching query 19: w.date = '2026-10-08')
  { id: 'w-17', waste_id: 'w-17', operation_id: 'op-17', date: '2026-10-08', facility_id: '33333333-3333-3333-3333-333333333301', item_id: '77777777-7777-7777-7777-777777777701', waste_kg: 34.0, financial_loss: 1632.0, reason: 'Over-preparation', category: 'GRAIN', meal_period: 'LUNCH' },
  { id: 'w-18', waste_id: 'w-18', operation_id: 'op-18', date: '2026-10-08', facility_id: '33333333-3333-3333-3333-333333333302', item_id: '77777777-7777-7777-7777-777777777704', waste_kg: 20.0, financial_loss: 1440.0, reason: 'Plate Waste', category: 'PULSE', meal_period: 'DINNER' },
  // Additional historical high waste and multi-vendor items
  { id: 'w-19', waste_id: 'w-19', operation_id: 'op-01', date: '2026-10-01', facility_id: '33333333-3333-3333-3333-333333333305', item_id: '77777777-7777-7777-7777-777777777711', waste_kg: 68.0, financial_loss: 12240.0, reason: 'Cold Storage Failure', category: 'DAIRY', meal_period: 'DINNER' }, // > 50 kg
  { id: 'w-20', waste_id: 'w-20', operation_id: 'op-02', date: '2026-10-02', facility_id: '33333333-3333-3333-3333-333333333307', item_id: '77777777-7777-7777-7777-777777777719', waste_kg: 14.0, financial_loss: 2240.0, reason: 'Over-preparation', category: 'DESSERT', meal_period: 'DINNER' },
  { id: 'w-21', waste_id: 'w-21', operation_id: 'op-03', date: '2026-10-03', facility_id: '33333333-3333-3333-3333-333333333301', item_id: '77777777-7777-7777-7777-777777777705', waste_kg: 42.0, financial_loss: 3990.0, reason: 'Over-preparation', category: 'PULSE', meal_period: 'LUNCH' },
  { id: 'w-22', waste_id: 'w-22', operation_id: 'op-04', date: '2026-10-03', facility_id: '33333333-3333-3333-3333-333333333302', item_id: '77777777-7777-7777-7777-777777777709', waste_kg: 24.0, financial_loss: 1872.0, reason: 'Spillage / Burn', category: 'VEGETABLE', meal_period: 'DINNER' },
  { id: 'w-23', waste_id: 'w-23', operation_id: 'op-05', date: '2026-10-04', facility_id: '33333333-3333-3333-3333-333333333306', item_id: '77777777-7777-7777-7777-777777777714', waste_kg: 19.0, financial_loss: 2137.5, reason: 'Plate Waste', category: 'BREAD', meal_period: 'LUNCH' },
  { id: 'w-24', waste_id: 'w-24', operation_id: 'op-06', date: '2026-10-04', facility_id: '33333333-3333-3333-3333-333333333309', item_id: '77777777-7777-7777-7777-777777777728', waste_kg: 45.0, financial_loss: 5850.0, reason: 'Over-preparation', category: 'FESTIVE', meal_period: 'DINNER' },
  { id: 'w-25', waste_id: 'w-25', operation_id: 'op-07', date: '2026-10-05', facility_id: '33333333-3333-3333-3333-333333333301', item_id: '77777777-7777-7777-7777-777777777701', waste_kg: 62.0, financial_loss: 2976.0, reason: 'Over-preparation', category: 'GRAIN', meal_period: 'LUNCH' }, // > 50 kg
  { id: 'w-26', waste_id: 'w-26', operation_id: 'op-08', date: '2026-10-05', facility_id: '33333333-3333-3333-3333-333333333305', item_id: '77777777-7777-7777-7777-777777777708', waste_kg: 33.0, financial_loss: 2145.0, reason: 'Spillage / Burn', category: 'VEGETABLE', meal_period: 'DINNER' },
  { id: 'w-27', waste_id: 'w-27', operation_id: 'op-09', date: '2026-10-06', facility_id: '33333333-3333-3333-3333-333333333303', item_id: '77777777-7777-7777-7777-777777777717', waste_kg: 56.0, financial_loss: 13440.0, reason: 'Expiration', category: 'DESSERT', meal_period: 'DINNER' }, // > 50 kg
  { id: 'w-28', waste_id: 'w-28', operation_id: 'op-10', date: '2026-10-06', facility_id: '33333333-3333-3333-3333-333333333306', item_id: '77777777-7777-7777-7777-777777777704', waste_kg: 29.0, financial_loss: 2088.0, reason: 'Plate Waste', category: 'PULSE', meal_period: 'LUNCH' },
  { id: 'w-29', waste_id: 'w-29', operation_id: 'op-11', date: '2026-10-07', facility_id: '33333333-3333-3333-3333-333333333302', item_id: '77777777-7777-7777-7777-777777777701', waste_kg: 36.0, financial_loss: 1728.0, reason: 'Over-preparation', category: 'GRAIN', meal_period: 'LUNCH' },
  { id: 'w-30', waste_id: 'w-30', operation_id: 'op-12', date: '2026-10-07', facility_id: '33333333-3333-3333-3333-333333333303', item_id: '77777777-7777-7777-7777-777777777711', waste_kg: 54.0, financial_loss: 9720.0, reason: 'Plate Waste', category: 'DAIRY', meal_period: 'DINNER' }, // > 50 kg
  { id: 'w-31', waste_id: 'w-31', operation_id: 'op-17', date: '2026-10-08', facility_id: '33333333-3333-3333-3333-333333333304', item_id: '77777777-7777-7777-7777-777777777718', waste_kg: 21.0, financial_loss: 2310.0, reason: 'Over-preparation', category: 'DESSERT', meal_period: 'LUNCH' },
  { id: 'w-32', waste_id: 'w-32', operation_id: 'op-18', date: '2026-10-08', facility_id: '33333333-3333-3333-3333-333333333305', item_id: '77777777-7777-7777-7777-777777777701', waste_kg: 48.0, financial_loss: 2304.0, reason: 'Over-preparation', category: 'GRAIN', meal_period: 'LUNCH' },
  // High-average facility 03 logs (avg > 50kg) & CyberHub Night Canteen 10 logs (avg > 50kg)
  { id: 'w-33', waste_id: 'w-33', operation_id: 'op-22', date: '2026-10-09', facility_id: '33333333-3333-3333-3333-333333333303', item_id: '77777777-7777-7777-7777-777777777701', waste_kg: 72.0, financial_loss: 3456.0, reason: 'Low Attendance', category: 'GRAIN', meal_period: 'DINNER' }, // > 50 kg
  { id: 'w-34', waste_id: 'w-34', operation_id: 'op-20', date: '2026-10-08', facility_id: '33333333-3333-3333-3333-333333333310', item_id: '77777777-7777-7777-7777-777777777722', waste_kg: 58.0, financial_loss: 5800.0, reason: 'Over-preparation', category: 'SNACK', meal_period: 'DINNER' }, // > 50 kg
  { id: 'w-35', waste_id: 'w-35', operation_id: 'op-26', date: '2026-10-10', facility_id: '33333333-3333-3333-3333-333333333310', item_id: '77777777-7777-7777-7777-777777777720', waste_kg: 56.0, financial_loss: 2240.0, reason: 'Low Attendance', category: 'BEVERAGE', meal_period: 'DINNER' }, // > 50 kg
  { id: 'w-36', waste_id: 'w-36', operation_id: 'op-25', date: '2026-10-10', facility_id: '33333333-3333-3333-3333-333333333305', item_id: '77777777-7777-7777-7777-777777777711', waste_kg: 26.0, financial_loss: 4680.0, reason: 'Plate Waste', category: 'DAIRY', meal_period: 'LUNCH' },
  { id: 'w-37', waste_id: 'w-37', operation_id: 'op-21', date: '2026-10-09', facility_id: '33333333-3333-3333-3333-333333333301', item_id: '77777777-7777-7777-7777-777777777708', waste_kg: 28.0, financial_loss: 1820.0, reason: 'Spillage / Burn', category: 'VEGETABLE', meal_period: 'LUNCH' }
];
