CREATE TABLE users (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(100)  NOT NULL UNIQUE,
  phone      VARCHAR(15)   NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  role       ENUM('STUDENT','WRITER','ADMIN') NOT NULL DEFAULT 'STUDENT',
  status     ENUM('ACTIVE','INACTIVE','BANNED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, phone, password, role, status)
VALUES ('Admin User', 'admin@academix.com', '9000000000',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NJwG9v.Iq', 'ADMIN', 'ACTIVE');
-- Default password: admin@123

