ALTER TABLE payments
    ADD COLUMN student_id BIGINT,
    ADD COLUMN razorpay_payment_id VARCHAR(255),
    ADD COLUMN razorpay_signature VARCHAR(255),
    ADD COLUMN currency VARCHAR(10) DEFAULT 'INR',
    ADD COLUMN transaction_time TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ADD COLUMN failure_reason VARCHAR(255);

ALTER TABLE payments
    ADD CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES users(id);

ALTER TABLE payments
    MODIFY COLUMN payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING';
