CREATE TABLE assignments (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id    BIGINT NOT NULL,
  writer_id   BIGINT NOT NULL,
  assigned_by ENUM('ADMIN','AUTO') DEFAULT 'ADMIN',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)  REFERENCES orders(id),
  FOREIGN KEY (writer_id) REFERENCES users(id)
);