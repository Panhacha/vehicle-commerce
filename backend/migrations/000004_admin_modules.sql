-- Persistent records used by the Admin ERP modules.

UPDATE users
SET password_hash = '$2b$10$qc.hxFHlgNlPJQL7V9KJzu7RLemr1PaXYsdeZth9Q41VtLJL0IdK6'
WHERE password_hash = '$2a$10$6wV5U3G8jJmZpWzHqVd5peT7g7ePZ7Ym6F8c1k2A3b4C5d6E7f8G.';

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'PREPARING';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'READY_FOR_DELIVERY';

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    recorded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    to_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    requested_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    received_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT different_transfer_branches CHECK (from_branch_id <> to_branch_id),
    CONSTRAINT valid_transfer_status CHECK (status IN ('PENDING', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'REJECTED'))
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    transfer_id UUID REFERENCES stock_transfers(id) ON DELETE SET NULL,
    transaction_type VARCHAR(30) NOT NULL,
    quantity INT NOT NULL,
    performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_stock_movement_type CHECK (transaction_type IN ('STOCK_IN', 'STOCK_OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RESERVATION', 'RELEASE'))
);

CREATE TABLE IF NOT EXISTS installment_payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    installment_application_id UUID NOT NULL REFERENCES installment_applications(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_installment_due_date UNIQUE (installment_application_id, due_date),
    CONSTRAINT valid_schedule_status CHECK (status IN ('PENDING', 'PAID', 'OVERDUE'))
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    target_channel VARCHAR(150),
    message_payload TEXT NOT NULL,
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order_created ON payments(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_branch_status ON stock_transfers(from_branch_id, to_branch_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_branch_created ON stock_movements(branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_installment_schedules_due_status ON installment_payment_schedules(due_date, status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON notification_logs(created_at DESC);
