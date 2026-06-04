CREATE TABLE plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    monthly_order_limit INT NOT NULL,
    priority_matching BOOLEAN NOT NULL DEFAULT FALSE,
    advanced_analytics BOOLEAN NOT NULL DEFAULT FALSE,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    domain VARCHAR(100) UNIQUE,
    plan_id BIGINT NOT NULL,
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    subscription_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_organization_plan FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    billing_period_start TIMESTAMP NULL,
    billing_period_end TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN organization_id BIGINT;
ALTER TABLE users ADD COLUMN role_in_org VARCHAR(50);
ALTER TABLE users ADD COLUMN plan_id BIGINT;
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users ADD CONSTRAINT fk_user_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE orders ADD COLUMN title VARCHAR(255);
ALTER TABLE orders ADD COLUMN organization_id BIGINT;
ALTER TABLE orders ADD CONSTRAINT fk_order_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE assignments ADD COLUMN decline_reason VARCHAR(255);

-- Insert default plans
INSERT INTO plans (name, monthly_order_limit, priority_matching, advanced_analytics, price_monthly, price_yearly)
VALUES 
('FREE', 5, FALSE, FALSE, 0.00, 0.00),
('PRO', 25, TRUE, FALSE, 29.00, 290.00),
('ENTERPRISE', 999999, TRUE, TRUE, 199.00, 1990.00);

-- Link existing users to the FREE plan and mark their email verified
UPDATE users SET plan_id = (SELECT id FROM plans WHERE name = 'FREE');
UPDATE users SET email_verified = TRUE;

ALTER TABLE users ADD CONSTRAINT fk_user_plan FOREIGN KEY (plan_id) REFERENCES plans(id);
