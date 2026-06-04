CREATE TABLE ratings (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id   BIGINT UNIQUE,
  student_id BIGINT,
  writer_id  BIGINT,
  stars      INT CHECK (stars BETWEEN 1 AND 5),
  review     TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)   REFERENCES orders(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (writer_id)  REFERENCES users(id)
);