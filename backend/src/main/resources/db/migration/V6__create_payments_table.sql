CREATE TABLE payments (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id          BIGINT NOT NULL,
  payment_type      ENUM('ADVANCE','FULL','REFUND') NOT NULL,
  amount            DECIMAL(10,2) NOT NULL,
  razorpay_order_id VARCHAR(100),
  transaction_id    VARCHAR(255),
  payment_status    ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);