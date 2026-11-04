-- =====================================================================
-- Vehicle E-Commerce & Multi-Branch Management System
-- COMPLETE SUPABASE INITIALIZATION SCRIPT (Schema + Seed Data)
-- =====================================================================
-- Instructions for Supabase:
-- 1. Open your Supabase Project (https://supabase.com/dashboard)
-- 2. Click "SQL Editor" in the left sidebar -> Click "New query"
-- 3. Paste this entire file into the SQL Editor and click "Run"
-- =====================================================================

-- 0. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUM TYPES
-- ==========================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'BRANCH_ADMIN', 'STAFF', 'CUSTOMER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_type') THEN
        CREATE TYPE category_type AS ENUM ('GASOLINE_VEHICLE', 'ELECTRIC_VEHICLE', 'BICYCLE', 'SPARE_PART');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') THEN
        CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'IN_TRANSIT', 'MAINTENANCE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('FULL_PAYMENT_CASH', 'FULL_PAYMENT_KHQR', 'INSTALLMENT', 'TRADE_IN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'installment_status') THEN
        CREATE TYPE installment_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'SETTLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_in_status') THEN
        CREATE TYPE trade_in_status AS ENUM ('PENDING_INSPECTION', 'APPRAISED', 'ACCEPTED_BY_CUSTOMER', 'REJECTED', 'APPLIED_TO_ORDER');
    END IF;
END $$;

-- ==========================================
-- 2. TABLES CREATION
-- ==========================================

-- 2.1 Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    telegram_chat_id VARCHAR(100),
    is_headquarters BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Users Table (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 Product Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    type category_type NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 Products Master
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    sku VARCHAR(60) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT,
    base_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    condition VARCHAR(50) NOT NULL DEFAULT 'NEW',
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.5 Individual Vehicle Inventory (VIN Tracking)
CREATE TABLE IF NOT EXISTS vehicle_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    vin VARCHAR(50) UNIQUE NOT NULL,
    engine_no VARCHAR(50),
    color VARCHAR(50) NOT NULL,
    mileage_km INT DEFAULT 0,
    plate_number VARCHAR(50),
    cost_price NUMERIC(12, 2),
    selling_price NUMERIC(12, 2) NOT NULL,
    status vehicle_status DEFAULT 'AVAILABLE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.6 Spare Parts & Bicycle Branch Stock Quantity
CREATE TABLE IF NOT EXISTS branch_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    reserved_qty INT NOT NULL DEFAULT 0,
    min_threshold INT NOT NULL DEFAULT 5,
    unit_cost NUMERIC(12, 2) DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_branch_product UNIQUE (branch_id, product_id)
);

-- 2.7 Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    national_id VARCHAR(50),
    address TEXT,
    telegram_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.8 Orders & Invoices
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(40) UNIQUE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    handled_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_method payment_method NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    status order_status DEFAULT 'PENDING',
    payment_status VARCHAR(40) DEFAULT 'UNPAID',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.9 Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    vehicle_item_id UUID REFERENCES vehicle_items(id) ON DELETE SET NULL,
    item_name VARCHAR(200) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- 2.10 Installment Applications
CREATE TABLE IF NOT EXISTS installment_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    vehicle_price NUMERIC(12, 2) NOT NULL,
    down_payment NUMERIC(12, 2) NOT NULL,
    down_payment_percentage NUMERIC(5, 2) NOT NULL,
    loan_amount NUMERIC(12, 2) NOT NULL,
    interest_rate_annual NUMERIC(5, 2) NOT NULL,
    term_months INT NOT NULL,
    monthly_installment NUMERIC(12, 2) NOT NULL,
    employment_info JSONB,
    guarantor_info JSONB,
    documents JSONB DEFAULT '[]'::jsonb,
    status installment_status DEFAULT 'SUBMITTED',
    reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.11 Vehicle Trade-in Requests
CREATE TABLE IF NOT EXISTS trade_in_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    target_vehicle_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    target_branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT,
    trade_in_type VARCHAR(30) DEFAULT 'TRADE_IN',
    current_brand VARCHAR(100) NOT NULL,
    current_model VARCHAR(100) NOT NULL,
    current_year INT NOT NULL,
    current_mileage INT NOT NULL,
    condition_description TEXT,
    customer_expected_price NUMERIC(12, 2),
    appraised_value NUMERIC(12, 2),
    appraised_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    appraisal_notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    inspection_report JSONB DEFAULT '{}'::jsonb,
    applied_to_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    status trade_in_status DEFAULT 'PENDING_INSPECTION',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.12 Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    changes JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 3. SEED DATA
-- =====================================================================

-- 3.1 Seed Branches
INSERT INTO branches (id, code, name, city, address, phone, is_headquarters, is_active)
VALUES
('b1111111-1111-1111-1111-111111111111', 'BR-PP-01', 'Phnom Penh Main Showroom (HQ)', 'Phnom Penh', 'Preah Monivong Blvd, Sangkat Boeung Keng Kang 1', '+855 23 888 999', TRUE, TRUE),
('b2222222-2222-2222-2222-222222222222', 'BR-SR-02', 'Siem Reap Heritage Branch', 'Siem Reap', 'National Road 6, Sangkat Svay Dangkum', '+855 63 777 888', FALSE, TRUE),
('b3333333-3333-3333-3333-333333333333', 'BR-BB-03', 'Battambang Regional Branch', 'Battambang', 'Street 106, Sangkat Svay Por', '+855 53 666 777', FALSE, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 3.2 Seed Categories
INSERT INTO categories (id, name, slug, type, description, icon, is_active)
VALUES
('ca111111-1111-1111-1111-111111111111', 'Electric & Hybrid (EV)', 'electric-vehicles', 'ELECTRIC_VEHICLE', 'Zero-emission Battery EVs, Plug-in Hybrids & Fuel Cell EVs', 'Zap', TRUE),
('ca222222-2222-2222-2222-222222222222', 'Gasoline & SUVs', 'gasoline-vehicles', 'GASOLINE_VEHICLE', 'High-performance SUVs, Trucks & Sedans', 'Fuel', TRUE),
('ca333333-3333-3333-3333-333333333333', 'Bicycles & E-Bikes', 'bicycles', 'BICYCLE', 'Urban commuter and electric bicycles', 'Bike', TRUE),
('ca444444-4444-4444-4444-444444444444', 'Vehicle Spare Parts', 'spare-parts', 'SPARE_PART', 'Genuine OEM parts and performance accessories', 'Wrench', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 3.3 Seed Core Products
INSERT INTO products (id, category_id, sku, name, brand, model, year, base_price, condition, description, images, specs)
VALUES
('da111111-1111-1111-1111-111111111111', 'ca111111-1111-1111-1111-111111111111', 'BYD-SEAL-2025', 'BYD Seal EV Performance', 'BYD', 'Seal Performance', 2025, 49500.00, 'NEW', 'Pure Electric Sports Sedan with 530HP and 3.8s 0-100km/h acceleration.', '["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800"]'::jsonb, '{"Battery": "82.5 kWh", "Range": "520 km WLTP", "Drivetrain": "AWD"}'::jsonb),
('da222222-2222-2222-2222-222222222222', 'ca111111-1111-1111-1111-111111111111', 'TSLA-M3-2025', 'Tesla Model 3 Long Range', 'Tesla', 'Model 3 LR', 2025, 58900.00, 'NEW', 'Next-Gen Tesla Model 3 with acoustic glass, ambient lighting and Autopilot.', '["https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800"]'::jsonb, '{"Battery": "78 kWh", "Range": "629 km WLTP", "Autopilot": "Standard"}'::jsonb),
('da333333-3333-3333-3333-333333333333', 'ca222222-2222-2222-2222-222222222222', 'LEX-LX600-2025', 'Lexus LX600 VIP 4-Seater', 'Lexus', 'LX600 VIP', 2025, 179000.00, 'NEW', 'Flagship Ultra Luxury SUV with 3.5L Twin Turbo V6 and Ottoman rear seats.', '["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"]'::jsonb, '{"Engine": "3.5L Twin-Turbo V6", "Horsepower": "409 HP", "Seating": "4 VIP"}'::jsonb),
('da444444-4444-4444-4444-444444444444', 'ca222222-2222-2222-2222-222222222222', 'FRD-RAPTOR-2025', 'Ford Ranger Raptor 3.0L V6', 'Ford', 'Ranger Raptor', 2025, 76500.00, 'NEW', 'High-performance off-road pickup truck with FOX 2.5 Live Valve dampers.', '["https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&q=80&w=800"]'::jsonb, '{"Engine": "3.0L EcoBoost V6", "Horsepower": "392 HP", "Suspension": "FOX 2.5 Internal Bypass"}'::jsonb),
('da555555-5555-5555-5555-555555555555', 'ca333333-3333-3333-3333-333333333333', 'S73-RX-2025', 'Super73-RX Electric Adventure Bike', 'Super73', 'RX Mojave', 2025, 4250.00, 'NEW', 'Premium street-legal electric motorbike with 2000W peak power and full suspension.', '["https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800"]'::jsonb, '{"TopSpeed": "45 km/h", "Range": "120 km", "Brakes": "4-Piston Hydraulic"}'::jsonb),
('da666666-6666-6666-6666-666666666666', 'ca444444-4444-4444-4444-444444444444', 'BRM-GT6-380', 'Brembo GT 6-Piston Big Brake Kit', 'Brembo', 'GT Big Brake Kit 380mm', 2025, 1450.00, 'NEW', 'Monobloc 6-piston caliper with 380mm drilled 2-piece floating discs.', '["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800"]'::jsonb, '{"Pistons": "6-Piston", "RotorSize": "380x32mm", "Material": "Billet Aluminum"}'::jsonb)
ON CONFLICT (sku) DO NOTHING;

-- 3.4 Seed Official Toyota 2026-2027 Lineup (27 Models)
INSERT INTO products (id, category_id, sku, name, brand, model, year, base_price, condition, description, images, specs)
VALUES
('018e0001-0000-0000-0000-000000000001', 'ca222222-2222-2222-2222-222222222222', 'TYT-4RN-2026-01', 'Toyota 4Runner', 'Toyota', '4Runner', 2026, 42270.00, 'NEW', 'Rugged body-on-frame legendary off-road SUV featuring 7-passenger capability, multi-terrain select, and crawl control.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/4runner/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"i-FORCE 2.4L Turbo (278 HP)","MPG":"20/26","Seating":7,"TopLabel":"Hybrid EV Available"}'::jsonb),
('018e0001-0000-0000-0000-000000000002', 'ca111111-1111-1111-1111-111111111111', 'TYT-4RNMAX-2026-02', 'Toyota 4Runner i-FORCE MAX', 'Toyota', '4Runner i-FORCE MAX', 2026, 53490.00, 'NEW', 'Electrified monster with 326 HP and 465 lb-ft of instantaneous torque, delivering formidable off-road prowess with high efficiency.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/4runnerhybrid/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"i-FORCE MAX 2.4L Turbo Hybrid","MPG":"23/24","Seating":5,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000003', 'ca111111-1111-1111-1111-111111111111', 'TYT-BZ-2026-03', 'Toyota bZ', 'Toyota', 'bZ', 2026, 34900.00, 'NEW', 'Toyota all-electric SUV featuring up to 314 miles EPA estimated range, standard wireless Apple CarPlay, and fast charging.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/bz/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"100% Electric e-TNGA","Range":"314 miles","Seating":5,"TopLabel":"Battery EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000004', 'ca111111-1111-1111-1111-111111111111', 'TYT-BZW-2026-04', 'Toyota bZ Woodland', 'Toyota', 'bZ Woodland', 2026, 45300.00, 'NEW', 'Adventure-tuned all-electric crossover equipped with dual-motor Electronic AWD, raised ground clearance, and all-weather capability.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/bzwoodland/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"Dual-Motor Electric AWD","Range":"281 miles","Seating":5,"TopLabel":"Battery EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000005', 'ca111111-1111-1111-1111-111111111111', 'TYT-CAM-2026-05', 'Toyota Camry', 'Toyota', 'Camry', 2026, 29600.00, 'NEW', 'All-new exclusively hybrid powertrain delivering an astounding 52/49 MPG, refined suspension, and Toyota Safety Sense 3.0.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/camry/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"5th Gen Toyota Hybrid 2.5L","MPG":"52/49","Seating":5,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000006', 'ca111111-1111-1111-1111-111111111111', 'TYT-CHR-2026-06', 'Toyota C-HR', 'Toyota', 'C-HR', 2026, 37000.00, 'NEW', 'Striking coupe-styled compact pure electric crossover with 287 miles range, distinctive LED light bars, and intuitive cockpit.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/c-hr/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"High-Efficiency Battery EV","Range":"287 miles","Seating":5,"TopLabel":"Battery EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000007', 'ca222222-2222-2222-2222-222222222222', 'TYT-COR-2026-07', 'Toyota Corolla', 'Toyota', 'Corolla', 2026, 23125.00, 'NEW', 'The worlds benchmark for reliable daily driving: Dynamic Force 2.0L engine, 32/41 MPG, and full suite of active safety tech.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/corolla/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"2.0L 4-Cylinder Dynamic Force","MPG":"32/41","Seating":5,"TopLabel":"Hybrid EV Available"}'::jsonb),
('018e0001-0000-0000-0000-000000000008', 'ca222222-2222-2222-2222-222222222222', 'TYT-CC-2026-08', 'Toyota Corolla Cross', 'Toyota', 'Corolla Cross', 2026, 25335.00, 'NEW', 'Combines Corolla reliability with practical SUV stance, versatile 60/40 folding rear seats, and impressive 31/33 MPG.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/corollacross/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"2.0L 4-Cylinder (169 HP)","MPG":"31/33","Seating":5,"TopLabel":"Hybrid EV Available"}'::jsonb),
('018e0001-0000-0000-0000-000000000009', 'ca111111-1111-1111-1111-111111111111', 'TYT-CCH-2026-09', 'Toyota Corolla Cross Hybrid', 'Toyota', 'Corolla Cross Hybrid', 2026, 29795.00, 'NEW', 'Standard Electronic AWD with 196 combined HP, quick off-the-line electric burst, and a thrifty 42 combined MPG.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/corollacrosshybrid/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"2.0L Hybrid AWD (196 Net HP)","MPG":"46/39","Seating":5,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000010', 'ca222222-2222-2222-2222-222222222222', 'TYT-CHB-2027-10', 'Toyota Corolla Hatchback', 'Toyota', 'Corolla Hatchback', 2027, 24780.00, 'NEW', 'Sporty European-inspired hatchback with responsive chassis tuning, dual chrome exhaust diffusers, and 32/41 MPG efficiency.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2027/corollahatchback/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"2.0L Dynamic Force (169 HP)","MPG":"32/41","Seating":5}'::jsonb),
('018e0001-0000-0000-0000-000000000011', 'ca111111-1111-1111-1111-111111111111', 'TYT-CORHYB-2026-11', 'Toyota Corolla Hybrid', 'Toyota', 'Corolla Hybrid', 2026, 24975.00, 'NEW', 'Ultra-efficient compact hybrid achieving up to 53 city / 46 hwy MPG with quiet city EV gliding mode.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/corollahybrid/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"1.8L 4-Cylinder Hybrid","MPG":"53/46","Seating":5,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000012', 'ca222222-2222-2222-2222-222222222222', 'TYT-GRCOR-2026-12', 'Toyota GR Corolla', 'Toyota', 'GR Corolla', 2026, 40520.00, 'NEW', 'Born from rally racing: 300 HP 1.6L Turbo 3-Cylinder, GR-FOUR all-wheel drive with selectable torque splits and front/rear Torsen LSDs.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/grcorolla/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"1.6L Turbo (300 HP)","MPG":"21/28","Seating":5,"TopLabel":"Gazoo Racing"}'::jsonb),
('018e0001-0000-0000-0000-000000000013', 'ca222222-2222-2222-2222-222222222222', 'TYT-GRSUPRA-2026-13', 'Toyota GR Supra', 'Toyota', 'GR Supra', 2026, 58300.00, 'NEW', 'Purebred sports coupe powerhouse: 382 HP 3.0L Turbocharged Inline-6, 0-60 mph in 3.9 seconds, active rear sport differential, and Brembo brakes.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/grsupra/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"3.0L Turbo Inline-6 (382 HP)","MPG":"22/29","Seating":2,"TopLabel":"Gazoo Racing"}'::jsonb),
('018e0001-0000-0000-0000-000000000014', 'ca222222-2222-2222-2222-222222222222', 'TYT-GR86-2026-14', 'Toyota GR86', 'Toyota', 'GR86', 2026, 31400.00, 'NEW', 'Lightweight rear-wheel-drive purist coupe: 2.4L Boxer engine (228 HP), razor-sharp steering feedback, and track-ready balance.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/gr86/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"2.4L Boxer-4 (228 HP)","MPG":"21/30","Seating":4,"TopLabel":"Gazoo Racing"}'::jsonb),
('018e0001-0000-0000-0000-000000000015', 'ca222222-2222-2222-2222-222222222222', 'TYT-GHL-2026-15', 'Toyota Grand Highlander', 'Toyota', 'Grand Highlander', 2026, 42260.00, 'NEW', 'Full-size 3-row comfort for the whole family: true adult 3rd-row legroom, 13 cup holders, and 5,000 lbs towing capability.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/grandhighlander/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"2.4L Turbo (265 HP)","MPG":"21/28","Seating":8,"TopLabel":"Hybrid EV Available"}'::jsonb),
('018e0001-0000-0000-0000-000000000016', 'ca111111-1111-1111-1111-111111111111', 'TYT-GHLH-2026-16', 'Toyota Grand Highlander Hybrid', 'Toyota', 'Grand Highlander Hybrid', 2026, 45610.00, 'NEW', 'The benchmark eco-luxury 3-row SUV achieving 37/34 MPG while traveling over 500 miles on a single tank.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/grandhighlanderhybrid/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"2.5L Hybrid (245 HP)","MPG":"37/34","Seating":8,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000017', 'ca222222-2222-2222-2222-222222222222', 'TYT-HL-2026-17', 'Toyota Highlander', 'Toyota', 'Highlander', 2026, 46270.00, 'NEW', 'Refined 3-row mid-size crossover boasting Dynamic Torque Vectoring AWD, dual panoramic moonroof, and JBL 11-speaker audio.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/highlander/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"2.4L Turbo (265 HP)","MPG":"21/28","Seating":8,"TopLabel":"Hybrid EV Available"}'::jsonb),
('018e0001-0000-0000-0000-000000000018', 'ca111111-1111-1111-1111-111111111111', 'TYT-HLH-2026-18', 'Toyota Highlander Hybrid', 'Toyota', 'Highlander Hybrid', 2026, 48020.00, 'NEW', 'Exceptional efficiency for 8 passengers with 35 MPG city/highway, standard electronic On-Demand AWD, and hands-free tailgate.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/highlanderhybrid/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"2.5L Hybrid eAWD (243 HP)","MPG":"35/35","Seating":8,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000019', 'ca111111-1111-1111-1111-111111111111', 'TYT-LC-2027-19', 'Toyota Land Cruiser', 'Toyota', 'Land Cruiser', 2027, 58180.00, 'NEW', 'The global off-road legend reimagined: standard i-FORCE MAX hybrid (326 HP, 465 lb-ft), full-time 4WD, center & rear locking differentials, and iconic heritage styling.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2027/landcruiser/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"i-FORCE MAX Hybrid (326 HP)","MPG":"22/25","Seating":5,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000020', 'ca111111-1111-1111-1111-111111111111', 'TYT-MIRAI-2026-20', 'Toyota Mirai', 'Toyota', 'Mirai', 2026, 51795.00, 'NEW', 'Zero-emission hydrogen fuel-cell flagship luxury sedan: generates electricity onboard with only pure water coming out the tailpipe.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/mirai/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"Hydrogen Fuel Cell (FCEV)","MPGe":"76/71","Seating":5,"TopLabel":"Fuel Cell EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000021', 'ca111111-1111-1111-1111-111111111111', 'TYT-PRIUS-2026-21', 'Toyota Prius', 'Toyota', 'Prius', 2026, 28550.00, 'NEW', 'Sleek aerodynamic coupe silhouette paired with an exhilarating 196 HP, up to 57 MPG combined, and low-slung sporty posture.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/prius/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"5th Gen 2.0L Hybrid","MPG":"57/56","Seating":5,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000022', 'ca111111-1111-1111-1111-111111111111', 'TYT-PRIUSPHEV-2026-22', 'Toyota Prius Plug-in Hybrid', 'Toyota', 'Prius Plug-in Hybrid', 2026, 33775.00, 'NEW', 'Drive on pure electricity for everyday commutes (up to 44 miles EV range) with 127 MPGe total rating and 220 combined HP.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/priuspluginhybrid/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"EV Range":"44 miles","MPGe":"127 MPGe","Seating":5,"TopLabel":"Plug-in Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000023', 'ca111111-1111-1111-1111-111111111111', 'TYT-RAV4-2026-23', 'Toyota RAV4', 'Toyota', 'RAV4', 2026, 31900.00, 'NEW', 'The worlds best-selling compact SUV: refined hybrid efficiency (44/38 MPG), electronic On-Demand AWD, and spacious cargo capacity.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/rav4/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"2.5L Hybrid (219 HP)","MPG":"44/38","Seating":5,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000024', 'ca111111-1111-1111-1111-111111111111', 'TYT-RAV4PHEV-2026-24', 'Toyota RAV4 Plug-in Hybrid', 'Toyota', 'RAV4 Plug-in Hybrid', 2026, 41500.00, 'NEW', 'Astounding 302 HP combined output rocketing from 0-60 in 5.7 seconds, with 42 miles pure electric range and 102 MPGe total rating.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/rav4pluginhybrid/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Power":"302 HP","MPGe":"102 MPGe","Seating":5,"TopLabel":"Plug-in Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000025', 'ca111111-1111-1111-1111-111111111111', 'TYT-SEQ-2026-25', 'Toyota Sequoia', 'Toyota', 'Sequoia', 2026, 65725.00, 'NEW', 'Dominant full-size luxury 3-row flagship: i-FORCE MAX Twin-Turbo V6 hybrid generating 437 HP and massive 9,520 lbs towing capacity.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/sequoia/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"Twin-Turbo V6 Hybrid (437 HP)","MPG":"21/24","Seating":8,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000026', 'ca111111-1111-1111-1111-111111111111', 'TYT-SIENNA-2026-26', 'Toyota Sienna', 'Toyota', 'Sienna', 2026, 41320.00, 'NEW', 'First-class family travel: standard hybrid (36/36 MPG), hands-free dual sliding doors, built-in vacuum & fridge, and super-long-slide seating.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/sienna/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Powertrain":"2.5L Hybrid (245 HP)","MPG":"36/36","Seating":8,"TopLabel":"Hybrid EV"}'::jsonb),
('018e0001-0000-0000-0000-000000000027', 'ca222222-2222-2222-2222-222222222222', 'TYT-TACOMA-2026-27', 'Toyota Tacoma', 'Toyota', 'Tacoma', 2026, 32545.00, 'NEW', 'Americas #1 mid-size pickup truck: multi-link rear coil suspension, high-strength boxed steel frame, crawl control, and legendary resale value.', '["https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/tacoma/base.png?bg=fff&fmt=webp&qlt=90&wid=600"]'::jsonb, '{"Engine":"i-FORCE 2.4L Turbo (278 HP)","MPG":"21/26","Seating":5,"TopLabel":"Hybrid EV Available"}'::jsonb)
ON CONFLICT (sku) DO NOTHING;

-- 3.5 Seed Users
INSERT INTO users (id, branch_id, username, email, password_hash, full_name, phone, role, status)
VALUES
('a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'superadmin', 'admin@vehiclemall.com', '$2a$10$6wV5U3G8jJmZpWzHqVd5peT7g7ePZ7Ym6F8c1k2A3b4C5d6E7f8G.', 'System Super Administrator', '+855 12 999 001', 'SUPER_ADMIN', 'ACTIVE'),
('a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'pp_manager', 'branch.pp@vehiclemall.com', '$2a$10$6wV5U3G8jJmZpWzHqVd5peT7g7ePZ7Ym6F8c1k2A3b4C5d6E7f8G.', 'Sokha Chan (PP Branch Manager)', '+855 12 999 002', 'BRANCH_ADMIN', 'ACTIVE'),
('a3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'staff_dara', 'dara.sales@vehiclemall.com', '$2a$10$6wV5U3G8jJmZpWzHqVd5peT7g7ePZ7Ym6F8c1k2A3b4C5d6E7f8G.', 'Dara Pich (Senior Sales)', '+855 12 999 003', 'STAFF', 'ACTIVE'),
('a4444444-4444-4444-4444-444444444444', NULL, 'customer_visal', 'visal.customer@gmail.com', '$2a$10$6wV5U3G8jJmZpWzHqVd5peT7g7ePZ7Ym6F8c1k2A3b4C5d6E7f8G.', 'Visal Kem', '+855 98 123 456', 'CUSTOMER', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 3.6 Seed Vehicle Inventory (VIN Units)
INSERT INTO vehicle_items (id, product_id, branch_id, vin, engine_no, color, mileage_km, selling_price, status)
VALUES
('e1111111-1111-1111-1111-111111111111', '018e0001-0000-0000-0000-000000000001', 'b1111111-1111-1111-1111-111111111111', 'TYT4RN2026VIN001PP', 'T24A-FTS-001', 'Heritage Blue', 15, 42270.00, 'AVAILABLE'),
('e2222222-2222-2222-2222-222222222222', '018e0001-0000-0000-0000-000000000005', 'b1111111-1111-1111-1111-111111111111', 'TYTCAM2026VIN002PP', 'A25A-FXS-002', 'Wind Chill Pearl', 10, 29600.00, 'AVAILABLE'),
('e3333333-3333-3333-3333-333333333333', '018e0001-0000-0000-0000-000000000019', 'b1111111-1111-1111-1111-111111111111', 'TYTLC2027VIN003PP', 'T24A-FTS-MAX03', 'Trail Dust / Grayscale', 25, 58180.00, 'AVAILABLE'),
('e4444444-4444-4444-4444-444444444444', '018e0001-0000-0000-0000-000000000027', 'b2222222-2222-2222-2222-222222222222', 'TYTTAC2026VIN004SR', 'T24A-FTS-004', 'Solar Octane', 30, 32545.00, 'AVAILABLE'),
('e5555555-5555-5555-5555-555555555555', '018e0001-0000-0000-0000-000000000013', 'b3333333-3333-3333-3333-333333333333', 'TYTSUP2026VIN005BB', 'B58-TURBO-005', 'Renaissance Red', 12, 58300.00, 'AVAILABLE'),
('e6666666-6666-6666-6666-666666666666', 'da111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'LC0BYDSEAL2025PP01', 'TZ200XY-00192', 'Aurora Green', 15, 49500.00, 'AVAILABLE')
ON CONFLICT (vin) DO NOTHING;

-- 3.7 Seed Branch Inventory for Bikes & Spare Parts
INSERT INTO branch_inventory (id, branch_id, product_id, quantity, reserved_qty, min_threshold, unit_cost, selling_price)
VALUES
(uuid_generate_v4(), 'b1111111-1111-1111-1111-111111111111', 'da555555-5555-5555-5555-555555555555', 8, 1, 2, 3300.00, 4250.00),
(uuid_generate_v4(), 'b2222222-2222-2222-2222-222222222222', 'da555555-5555-5555-5555-555555555555', 4, 0, 2, 3300.00, 4250.00),
(uuid_generate_v4(), 'b1111111-1111-1111-1111-111111111111', 'da666666-6666-6666-6666-666666666666', 25, 2, 5, 950.00, 1450.00),
(uuid_generate_v4(), 'b2222222-2222-2222-2222-222222222222', 'da666666-6666-6666-6666-666666666666', 12, 0, 3, 950.00, 1450.00),
(uuid_generate_v4(), 'b3333333-3333-3333-3333-333333333333', 'da666666-6666-6666-6666-666666666666', 6, 0, 2, 950.00, 1450.00)
ON CONFLICT (branch_id, product_id) DO NOTHING;
