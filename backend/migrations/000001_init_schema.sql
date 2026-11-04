-- 000001_init_schema.sql
-- Vehicle E-commerce & Multi-Branch Management System Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Branches Table
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

-- 2. Users Table (RBAC)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'BRANCH_ADMIN', 'STAFF', 'CUSTOMER');
    END IF;
END $$;

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

-- 3. Product Categories
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_type') THEN
        CREATE TYPE category_type AS ENUM ('GASOLINE_VEHICLE', 'ELECTRIC_VEHICLE', 'BICYCLE', 'SPARE_PART');
    END IF;
END $$;

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

-- 4. Products Master
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

-- 5. Individual Vehicle Inventory
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') THEN
        CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'IN_TRANSIT', 'MAINTENANCE');
    END IF;
END $$;

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

-- 6. Spare Parts & Bicycle Branch Stock Quantity
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

-- 7. Customers
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

-- 8. Orders & Invoices
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('FULL_PAYMENT_CASH', 'FULL_PAYMENT_KHQR', 'INSTALLMENT', 'TRADE_IN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED');
    END IF;
END $$;

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

-- 9. Order Items
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

-- 10. Installment Loan Applications
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'installment_status') THEN
        CREATE TYPE installment_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'SETTLED');
    END IF;
END $$;

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

-- 11. Vehicle Trade-in & Buy-Resell Requests
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_in_status') THEN
        CREATE TYPE trade_in_status AS ENUM ('PENDING_INSPECTION', 'APPRAISED', 'ACCEPTED_BY_CUSTOMER', 'REJECTED', 'APPLIED_TO_ORDER');
    END IF;
END $$;

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

-- 12. Audit Logs
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
