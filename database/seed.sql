-- ============================================================================
-- CAMPUS FOOD WASTE INTELLIGENCE SYSTEM (CFWIS)
-- Comprehensive Enterprise Seed Data Specification (30+ Days)
-- Engine: PostgreSQL 15+ / PostGIS 3+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ROLES
-- ----------------------------------------------------------------------------
INSERT INTO role (role_code, role_name, description) VALUES
('SUPER_ADMIN', 'Super Administrator', 'Full system configuration, multi-campus administration, and security oversight'),
('CAMPUS_ADMIN', 'Campus Administrator', 'Campus-scoped facility management, procurement contracts, and macro reporting'),
('MESS_MANAGER', 'Mess Manager', 'Mess-scoped operational control, menu planning, prep approvals, and inventory control'),
('KITCHEN_STAFF', 'Kitchen Staff & Chef', 'Daily preparation quantities, scale weight entries, and waste recording'),
('PROCUREMENT_MANAGER', 'Procurement Officer', 'Vendor lifecycle, purchase orders, standard cost updates, and deliveries'),
('ANALYST', 'Sustainability Analyst', 'Read-only analytics, SQL reporting, cost optimization, and ESG audits'),
('STUDENT', 'Student Representative', 'View daily menus, nutritional facts, and log meal satisfaction ratings');

-- ----------------------------------------------------------------------------
-- 2. CAMPUSES & POSTGIS SPATIAL LOCATIONS
-- ----------------------------------------------------------------------------
INSERT INTO campus (campus_id, campus_code, name, city, state, address, geom) VALUES
('11111111-1111-1111-1111-111111111111', 'IIT-TVC', 'IIT Tech Valley Campus', 'Bengaluru', 'Karnataka', 'Survey 45, Silicon Corridor, Electronic City, Bengaluru', ST_SetSRID(ST_MakePoint(77.6780, 12.8452), 4326)),
('22222222-2222-2222-2222-222222222222', 'NIT-SGC', 'National Institute of Tech South Green', 'Mysuru', 'Karnataka', 'Outer Ring Road, Hootagalli Industrial Suburb, Mysuru', ST_SetSRID(ST_MakePoint(76.5921, 12.3364), 4326));

-- ----------------------------------------------------------------------------
-- 3. FACILITIES (Mess Halls & Cafeterias)
-- ----------------------------------------------------------------------------
INSERT INTO facility (facility_id, campus_id, facility_code, facility_name, facility_type, dining_capacity, contact_phone, contact_email, geom) VALUES
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'MESS-CENTRAL-01', 'Aryabhata Central Dining Hall', 'CENTRAL_MESS', 1200, '+91-9876543210', 'aryabhata.mess@iit-tvc.edu', ST_SetSRID(ST_MakePoint(77.6785, 12.8455), 4326)),
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 'MESS-NORTH-02', 'Kalam North Hostel Mess', 'HOSTEL_MESS', 650, '+91-9876543211', 'kalam.mess@iit-tvc.edu', ST_SetSRID(ST_MakePoint(77.6792, 12.8470), 4326)),
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', 'MESS-SOUTH-03', 'Sarabhai South Hostel Mess', 'HOSTEL_MESS', 750, '+91-9876543212', 'sarabhai.mess@iit-tvc.edu', ST_SetSRID(ST_MakePoint(77.6770, 12.8440), 4326)),
('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111111', 'CAFE-RAMAN-04', 'Ramanujan Food Court & Canteen', 'CAFETERIA', 400, '+91-9876543213', 'canteen@iit-tvc.edu', ST_SetSRID(ST_MakePoint(77.6781, 12.8462), 4326));

-- ----------------------------------------------------------------------------
-- 4. FOOD PANTRY RESCUE PARTNERS (PostGIS Spatial Routing)
-- ----------------------------------------------------------------------------
INSERT INTO food_pantry_partner (pantry_id, campus_id, partner_name, contact_person, contact_phone, storage_capacity_kg, geom) VALUES
('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', 'Robin Hood Army Bengaluru Hub 7', 'Arjun Verma', '+91-9820011223', 500.00, ST_SetSRID(ST_MakePoint(77.6820, 12.8490), 4326)),
('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', 'Feeding India Shelter Pantry', 'Divya Nair', '+91-9830022334', 350.00, ST_SetSRID(ST_MakePoint(77.6740, 12.8410), 4326)),
('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', 'Green Earth Bio-Digester Plant', 'Kiran Rao', '+91-9840033445', 2000.00, ST_SetSRID(ST_MakePoint(77.6890, 12.8520), 4326));

-- ----------------------------------------------------------------------------
-- 5. USERS (Bcrypt / Argon2 hashed demo users)
-- ----------------------------------------------------------------------------
INSERT INTO user_account (user_id, campus_id, facility_id, role_id, username, email, password_hash, full_name, phone) VALUES
('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', NULL, 1, 'superadmin', 'admin@cfwis.edu', '$2b$12$K8yXo6t0kH65.O8QY2VqseH1zR4fWzZf51M9eP2aQ3o.yK7e1Bw5S', 'Dr. Ramesh Sharma', '+91-9988776655'),
('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', NULL, 2, 'campusadmin', 'campusadmin@cfwis.edu', '$2b$12$K8yXo6t0kH65.O8QY2VqseH1zR4fWzZf51M9eP2aQ3o.yK7e1Bw5S', 'Prof. Sunita Rao', '+91-9988776656'),
('55555555-5555-5555-5555-555555555503', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', 3, 'messmanager', 'manager.aryabhata@cfwis.edu', '$2b$12$K8yXo6t0kH65.O8QY2VqseH1zR4fWzZf51M9eP2aQ3o.yK7e1Bw5S', 'Vikramaditya Hegde', '+91-9988776657'),
('55555555-5555-5555-5555-555555555504', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', 4, 'chef_staff', 'kitchen.aryabhata@cfwis.edu', '$2b$12$K8yXo6t0kH65.O8QY2VqseH1zR4fWzZf51M9eP2aQ3o.yK7e1Bw5S', 'Chef Anant Joshi', '+91-9988776658'),
('55555555-5555-5555-5555-555555555505', '11111111-1111-1111-1111-111111111111', NULL, 5, 'procurement', 'procurement@cfwis.edu', '$2b$12$K8yXo6t0kH65.O8QY2VqseH1zR4fWzZf51M9eP2aQ3o.yK7e1Bw5S', 'Manohar Lal Gupta', '+91-9988776659'),
('55555555-5555-5555-5555-555555555506', '11111111-1111-1111-1111-111111111111', NULL, 6, 'analyst', 'analyst@cfwis.edu', '$2b$12$K8yXo6t0kH65.O8QY2VqseH1zR4fWzZf51M9eP2aQ3o.yK7e1Bw5S', 'Sneha Deshmukh', '+91-9988776660'),
('55555555-5555-5555-5555-555555555507', '11111111-1111-1111-1111-111111111111', NULL, 7, 'student_rep', 'student.council@cfwis.edu', '$2b$12$K8yXo6t0kH65.O8QY2VqseH1zR4fWzZf51M9eP2aQ3o.yK7e1Bw5S', 'Rohan Mathur', '+91-9988776661');

-- ----------------------------------------------------------------------------
-- 6. FOOD CATEGORIES (10 Categories)
-- ----------------------------------------------------------------------------
INSERT INTO food_category (category_id, category_code, category_name, description) VALUES
('66666666-6666-6666-6666-666666666601', 'GRAINS_STAPLES', 'Grains, Rice & Staples', 'Basmati rice, sona masuri, wheat flour, poha, suji, millets'),
('66666666-6666-6666-6666-666666666602', 'LENTILS_PULSES', 'Lentils, Dals & Pulses', 'Toor dal, moong dal, chana, rajma, urad dal, chickpeas'),
('66666666-6666-6666-6666-666666666603', 'VEGETABLES_FRESH', 'Fresh Farm Vegetables', 'Potatoes, onions, tomatoes, cauliflower, cabbage, spinach, paneer gravies'),
('66666666-6666-6666-6666-666666666604', 'DAIRY_PRODUCTS', 'Dairy & Milk Products', 'Fresh milk, paneer, curd/yogurt, butter, ghee, buttermilk'),
('66666666-6666-6666-6666-666666666605', 'BREADS_BAKERY', 'Breads, Rotis & Parathas', 'Tandoori roti, chapati, poori, pav, sandwich bread, naans'),
('66666666-6666-6666-6666-666666666606', 'DESSERTS_SWEETS', 'Desserts & Sweet Dishes', 'Gulab jamun, kheer, moong dal halwa, rasgulla, fruit custard'),
('66666666-6666-6666-6666-666666666607', 'BEVERAGES_DRINKS', 'Beverages & Hot Teas', 'Masala chai, filter coffee, lemonade, fruit juice, soup'),
('66666666-6666-6666-6666-666666666608', 'SNACKS_APPETIZERS', 'Snacks & Evening Bites', 'Samosa, veg cutlet, vada pav, pakora, aloo tikki'),
('66666666-6666-6666-6666-666666666609', 'SALADS_CONDIMENTS', 'Salads & Condiments', 'Green salad, cucumber raita, pickle, coconut chutney, mint dip'),
('66666666-6666-6666-6666-666666666610', 'SPECIAL_FESTIVE', 'Festive & Banquet Specialties', 'Dum biryani, paneer butter masala, navratan korma, gulab firni');

-- ----------------------------------------------------------------------------
-- 7. FOOD ITEMS (32 Distinct Items with Units and Standard Costs)
-- ----------------------------------------------------------------------------
INSERT INTO food_item (item_id, category_id, item_code, item_name, standard_unit, standard_unit_cost, shelf_life_hours, is_perishable) VALUES
('77777777-7777-7777-7777-777777777701', '66666666-6666-6666-6666-666666666601', 'RICE-STE-01', 'Steamed Sona Masuri Rice', 'KG', 48.00, 12, TRUE),
('77777777-7777-7777-7777-777777777702', '66666666-6666-6666-6666-666666666601', 'RICE-JEERA-02', 'Fragrant Jeera Rice', 'KG', 62.00, 12, TRUE),
('77777777-7777-7777-7777-777777777703', '66666666-6666-6666-6666-666666666601', 'POHA-IND-03', 'Indori Kanda Poha', 'KG', 55.00, 8, TRUE),
('77777777-7777-7777-7777-777777777704', '66666666-6666-6666-6666-666666666602', 'DAL-TADKA-04', 'Yellow Toor Dal Tadka', 'KG', 72.00, 10, TRUE),
('77777777-7777-7777-7777-777777777705', '66666666-6666-6666-6666-666666666602', 'DAL-MAKH-05', 'Dal Makhani Slow Simmered', 'KG', 95.00, 14, TRUE),
('77777777-7777-7777-7777-777777777706', '66666666-6666-6666-6666-666666666602', 'PULSE-CHANA-06', 'Pindi Chana Masala', 'KG', 85.00, 12, TRUE),
('77777777-7777-7777-7777-777777777707', '66666666-6666-6666-6666-666666666602', 'SAMBAR-STH-07', 'South Indian Vegetable Sambar', 'LITRE', 52.00, 10, TRUE),
('77777777-7777-7777-7777-777777777708', '66666666-6666-6666-6666-666666666603', 'VEG-ALOO-GOB-08', 'Aloo Gobi Adraki Curry', 'KG', 65.00, 10, TRUE),
('77777777-7777-7777-7777-777777777709', '66666666-6666-6666-6666-666666666603', 'VEG-BHINDI-09', 'Bhindi Do Pyaza', 'KG', 78.00, 8, TRUE),
('77777777-7777-7777-7777-777777777710', '66666666-6666-6666-6666-666666666603', 'VEG-MIXED-10', 'Mix Vegetable Curry (Kolhapuri)', 'KG', 70.00, 10, TRUE),
('77777777-7777-7777-7777-777777777711', '66666666-6666-6666-6666-666666666604', 'PAN-BUTT-11', 'Paneer Butter Masala', 'KG', 180.00, 10, TRUE),
('77777777-7777-7777-7777-777777777712', '66666666-6666-6666-6666-666666666604', 'DAIRY-CURD-12', 'Fresh Set Sweet Curd', 'KG', 45.00, 24, TRUE),
('77777777-7777-7777-7777-777777777713', '66666666-6666-6666-6666-666666666604', 'DAIRY-CHHACH-13', 'Spiced Mint Buttermilk', 'LITRE', 32.00, 18, TRUE),
('77777777-7777-7777-7777-777777777714', '66666666-6666-6666-6666-666666666605', 'ROTI-WHEAT-14', 'Whole Wheat Tawa Phulka', 'PIECE', 4.50, 8, FALSE),
('77777777-7777-7777-7777-777777777715', '66666666-6666-6666-6666-666666666605', 'POORI-WHT-15', 'Fluffy Hot Poori', 'PIECE', 5.00, 6, FALSE),
('77777777-7777-7777-7777-777777777716', '66666666-6666-6666-6666-666666666605', 'PARATHA-ALOO-16', 'Stuffed Punjabi Aloo Paratha', 'PIECE', 18.00, 8, TRUE),
('77777777-7777-7777-7777-777777777717', '66666666-6666-6666-6666-666666666606', 'SWT-GULAB-17', 'Warm Gulab Jamun', 'PIECE', 12.00, 48, FALSE),
('77777777-7777-7777-7777-777777777718', '66666666-6666-6666-6666-666666666606', 'SWT-KHEER-18', 'Kesar Rice Kheer with Dry Fruits', 'KG', 110.00, 16, TRUE),
('77777777-7777-7777-7777-777777777719', '66666666-6666-6666-6666-666666666606', 'SWT-HALWA-19', 'Gajar Halwa in Pure Desi Ghee', 'KG', 160.00, 36, FALSE),
('77777777-7777-7777-7777-777777777720', '66666666-6666-6666-6666-666666666607', 'BEV-CHAI-20', 'Ginger Cardamom Masala Chai', 'LITRE', 40.00, 4, TRUE),
('77777777-7777-7777-7777-777777777721', '66666666-6666-6666-6666-666666666607', 'BEV-COFFEE-21', 'South Indian Filter Coffee', 'LITRE', 55.00, 4, TRUE),
('77777777-7777-7777-7777-777777777722', '66666666-6666-6666-6666-666666666608', 'SNK-SAMOSA-22', 'Crispy Punjabi Potato Samosa', 'PIECE', 10.00, 6, FALSE),
('77777777-7777-7777-7777-777777777723', '66666666-6666-6666-6666-666666666608', 'SNK-VADA-23', 'Medu Vada with Crispy Crust', 'PIECE', 8.50, 6, FALSE),
('77777777-7777-7777-7777-777777777724', '66666666-6666-6666-6666-666666666608', 'SNK-IDLI-24', 'Steamed Rice & Urad Idli', 'PIECE', 6.00, 8, TRUE),
('77777777-7777-7777-7777-777777777725', '66666666-6666-6666-6666-666666666609', 'SLD-GREEN-25', 'Sliced Cucumber, Carrot & Beet Salad', 'KG', 35.00, 6, TRUE),
('77777777-7777-7777-7777-777777777726', '66666666-6666-6666-6666-666666666609', 'RAITA-BUNDI-26', 'Crispy Boondi & Mint Raita', 'KG', 50.00, 8, TRUE),
('77777777-7777-7777-7777-777777777727', '66666666-6666-6666-6666-666666666609', 'CHUT-COCO-27', 'Fresh Coconut Chutney', 'KG', 60.00, 6, TRUE),
('77777777-7777-7777-7777-777777777728', '66666666-6666-6666-6666-666666666610', 'SPEC-BIRYANI-28', 'Royal Hyderabadi Veg Dum Biryani', 'KG', 130.00, 10, TRUE),
('77777777-7777-7777-7777-777777777729', '66666666-6666-6666-6666-666666666610', 'SPEC-PANEER-TIK-29', 'Tandoori Paneer Tikka Platter', 'PLATE', 120.00, 6, TRUE),
('77777777-7777-7777-7777-777777777730', '66666666-6666-6666-6666-666666666610', 'SPEC-MALAI-KOFTA-30', 'Shahi Malai Kofta in Cashew Gravy', 'KG', 175.00, 10, TRUE),
('77777777-7777-7777-7777-777777777731', '66666666-6666-6666-6666-666666666601', 'UPMA-RAVA-31', 'Vegetable Rava Upma with Cashews', 'KG', 50.00, 8, TRUE),
('77777777-7777-7777-7777-777777777732', '66666666-6666-6666-6666-666666666603', 'VEG-PALAK-32', 'Lehsuni Palak Gravy', 'KG', 68.00, 8, TRUE);

-- ----------------------------------------------------------------------------
-- 8. MEALS
-- ----------------------------------------------------------------------------
INSERT INTO meal (meal_code, meal_name, typical_start_time, typical_end_time, display_order) VALUES
('BREAKFAST', 'Morning Breakfast', '07:30:00', '09:30:00', 1),
('LUNCH', 'Afternoon Lunch', '12:15:00', '14:30:00', 2),
('SNACKS', 'Evening Snacks & Tea', '17:00:00', '18:15:00', 3),
('DINNER', 'Night Dinner', '19:45:00', '22:00:00', 4);

-- ----------------------------------------------------------------------------
-- 9. CONTROLLED WASTE REASONS (PRD Section 9.9)
-- ----------------------------------------------------------------------------
INSERT INTO waste_reason (reason_code, reason_name, category, is_preventable, severity_rank, description) VALUES
('OVERPRODUCTION', 'Kitchen Overproduction', 'KITCHEN_OVERPRODUCTION', TRUE, 4, 'Portions prepared exceeded student turn-out or consumption appetite'),
('LOW_ATTENDANCE', 'Low Student Attendance / Absenteeism', 'ATTENDANCE_DROP', TRUE, 4, 'Unannounced hostel departures, weekend dips, or post-exam bunking'),
('MENU_NOT_PREFERRED', 'Menu Item Not Preferred / Disliked', 'RECIPE_QUALITY', TRUE, 3, 'High plate rejection due to taste, texture, excessive spice or unpopular vegetable'),
('SPOILAGE', 'Spoilage, Souring or Fermentation', 'SPOILAGE_STORAGE', TRUE, 5, 'Bacterial contamination, refrigeration failure, or exceeding safe ambient holding time'),
('PREPARATION_ERROR', 'Preparation Error / Burnt / Over-salted', 'RECIPE_QUALITY', TRUE, 4, 'Culinary mistake during cooking rendering batch inedible'),
('SERVING_LEFTOVERS', 'Leftover Serving Residue in Counter', 'SERVICE_RESIDUE', FALSE, 2, 'Bottom pan scraps or cold residual gravy unable to be served fresh'),
('EVENT_CANCELLATION', 'Event Cancellation / Schedule Shift', 'FORCE_MAJEURE', TRUE, 3, 'Campus lecture, sports meet, or symposium abruptly halted or rescheduled'),
('QUALITY_ISSUE', 'Ingredient Quality / Texture Defect', 'RECIPE_QUALITY', TRUE, 4, 'Lumpy rice, curdled yogurt, or stale raw grains from supplier'),
('RAIN_HOLIDAY_DISRUPTION', 'Weather Disruption / Heavy Downpour', 'FORCE_MAJEURE', FALSE, 2, 'Torrential rainfall preventing off-campus students from dining'),
('PLATE_WASTAGE', 'Student Post-Consumption Plate Scrap', 'SERVICE_RESIDUE', TRUE, 3, 'Excessive portions ladled onto plates that were discarded uneaten');

-- ----------------------------------------------------------------------------
-- 10. DISPOSAL METHODS
-- ----------------------------------------------------------------------------
INSERT INTO disposal_method (method_code, method_name, environmental_score, is_recovery, carbon_offset_factor, description) VALUES
('COMPOST_CAMPUS', 'On-Campus Aerobic Composting Pit', 8.5, TRUE, 0.450, 'Converted to fertile organic manure for campus botanical gardens and landscaping'),
('PANTRY_RESCUE', 'Donation to Verified Food Pantry / NGO', 9.8, TRUE, 0.950, 'Safe edible food transferred via temperature-controlled transport within 2 hours'),
('BIOGAS_DIGESTER', 'Campus Anaerobic Bio-Methanation Plant', 9.2, TRUE, 0.720, 'Anaerobically digested to generate methane for kitchen burner fuel'),
('PIGGERY_FEED', 'Authorized Livestock & Piggery Feed', 6.5, TRUE, 0.380, 'Boiled food scraps repurposed for local dairy and farm animal feed'),
('MUNICIPAL_LANDFILL', 'Municipal Solid Waste Landfill Dump', 1.0, FALSE, -0.620, 'Hauled to city dump with high methane and greenhouse gas emissions');

-- ----------------------------------------------------------------------------
-- 11. VENDORS (10 Vendors)
-- ----------------------------------------------------------------------------
INSERT INTO vendor (vendor_id, campus_id, vendor_code, vendor_name, contact_person, phone, email, tax_identifier, compliance_rating) VALUES
('88888888-8888-8888-8888-888888888801', '11111111-1111-1111-1111-111111111111', 'VEN-ANNAPURNA-01', 'Annapurna Agri Agro Mills Ltd', 'Suresh Patel', '+91-9811122233', 'suresh@annapurna-agro.com', 'GST29AAAA1111A1Z5', 4.8),
('88888888-8888-8888-8888-888888888802', '11111111-1111-1111-1111-111111111111', 'VEN-NANDINI-02', 'Karnataka Milk Federation (Nandini Dairy)', 'Rajesh Gowda', '+91-9822233344', 'sales.dairy@kmf-nandini.coop', 'GST29BBBB2222B2Z6', 4.9),
('88888888-8888-8888-8888-888888888803', '11111111-1111-1111-1111-111111111111', 'VEN-FARM-FRESH-03', 'Green Valley Hydroponic & Farm Fresh', 'Deepak Hegde', '+91-9833344455', 'deepak@greenvalleyveggies.com', 'GST29CCCC3333C3Z7', 4.5),
('88888888-8888-8888-8888-888888888804', '11111111-1111-1111-1111-111111111111', 'VEN-PULSE-BHOOMI-04', 'Bhoomi Organic Pulses & Spices Corp', 'Kavita Iyer', '+91-9844455566', 'kavita@bhoomipulses.in', 'GST29DDDD4444D4Z8', 4.7),
('88888888-8888-8888-8888-888888888805', '11111111-1111-1111-1111-111111111111', 'VEN-SHREE-FLOUR-05', 'Shree Ganesh Modern Roller Flour Mills', 'Girish Kulkarni', '+91-9855566677', 'girish@shreeflour.com', 'GST29EEEE5555E5Z9', 4.4),
('88888888-8888-8888-8888-888888888806', '11111111-1111-1111-1111-111111111111', 'VEN-KAVERI-OILS-06', 'Kaveri Pure Cold Pressed Oils', 'Prakash Naidu', '+91-9866677788', 'prakash@kaverioils.co.in', 'GST29FFFF6666F6Z1', 4.6),
('88888888-8888-8888-8888-888888888807', '11111111-1111-1111-1111-111111111111', 'VEN-BAKERY-GOLD-07', 'Golden Crust Industrial Bakery Supplies', 'Amitava Sen', '+91-9877788899', 'orders@goldencrust.com', 'GST29GGGG7777G7Z2', 4.2),
('88888888-8888-8888-8888-888888888808', '11111111-1111-1111-1111-111111111111', 'VEN-MALNAD-SPICES-08', 'Malnad Plantation Cardamom & Pepper Co', 'Vinay Prasad', '+91-9888899900', 'vinay@malnadspices.org', 'GST29HHHH8888H8Z3', 4.8),
('88888888-8888-8888-8888-888888888809', '11111111-1111-1111-1111-111111111111', 'VEN-CLEAN-HYGIENE-09', 'Sanitron Eco Kitchen & Cleaning Solns', 'Pooja Bhat', '+91-9899900011', 'pooja@sanitronclean.in', 'GST29IIII9999I9Z4', 4.7),
('88888888-8888-8888-8888-888888888810', '11111111-1111-1111-1111-111111111111', 'VEN-CAMPUS-GAS-10', 'Bharat Petro Indane Commercial LPG Bottlers', 'Somnath Mukherjee', '+91-9800011122', 'somnath@indane-commercial.com', 'GST29JJJJ0000J0Z5', 5.0);

-- ----------------------------------------------------------------------------
-- 12. CAMPUS EVENTS (5 Academic & Cultural Events)
-- ----------------------------------------------------------------------------
INSERT INTO campus_event (event_id, campus_id, facility_id, event_name, event_type, start_date, end_date, expected_headcount_impact, notes) VALUES
('99999999-9999-9999-9999-999999999901', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', 'Tarang 2026 Annual Inter-College Cultural Fest', 'CULTURAL_FEST', '2026-09-12', '2026-09-15', 450, 'Huge student surge with visiting college contingents'),
('99999999-9999-9999-9999-999999999902', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333302', 'Mid-Semester Examinations Odd Term', 'EXAM_PERIOD', '2026-09-22', '2026-09-28', -180, 'Students skip scheduled mess breakfast and study through night; high irregular meals'),
('99999999-9999-9999-9999-999999999903', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333303', 'Gandhi Jayanti Extended Long Weekend Outing', 'HOLIDAY', '2026-10-02', '2026-10-04', -380, 'Significant mass departure of hostel boarders to home towns; severe overproduction risk'),
('99999999-9999-9999-9999-999999999904', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', 'Inter-NIT Annual Athletics Championship', 'SPORTS_MEET', '2026-09-04', '2026-09-07', 220, 'High protein demand and elevated calorie consumption in central dining hall'),
('99999999-9999-9999-9999-999999999905', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333304', 'International ACM Conference on Data Science', 'ACADEMIC_CONFERENCE', '2026-09-18', '2026-09-20', 150, 'Delegates accommodated with special buffet menus in cafeteria');
