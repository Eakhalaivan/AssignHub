-- Migration V17: Add database indexes for user lookups, order status, writer geo-queries, payment references, and audit logs.

-- Orders table indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_org_id ON orders(organization_id);
CREATE INDEX idx_orders_writer_id ON orders(writer_id);

-- Users table indexes
CREATE INDEX idx_users_org_id ON users(organization_id);
CREATE INDEX idx_users_plan_id ON users(plan_id);

-- Writer profiles indexes for matching and geolocation queries
CREATE INDEX idx_writer_profiles_geo ON writer_profiles(latitude, longitude);
CREATE INDEX idx_writer_profiles_avail_verified ON writer_profiles(availability, is_verified);

-- Payments indexes
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment ON payments(razorpay_payment_id);

-- Wallet transactions index
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);

-- Login history index
CREATE INDEX idx_login_history_user ON login_history(user_id);

-- Add max_seats to plans
ALTER TABLE plans ADD COLUMN max_seats INT NOT NULL DEFAULT 5;
UPDATE plans SET max_seats = 1 WHERE name = 'FREE';
UPDATE plans SET max_seats = 5 WHERE name = 'PRO';
UPDATE plans SET max_seats = 999999 WHERE name = 'ENTERPRISE';
