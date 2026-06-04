CREATE TABLE writer_profiles (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id          BIGINT NOT NULL UNIQUE,
  expertise        TEXT,
  nearby_colleges  TEXT,
  rating           DECIMAL(3,2) DEFAULT 0.00,
  total_ratings    INT DEFAULT 0,
  availability     BOOLEAN DEFAULT TRUE,
  is_verified      BOOLEAN DEFAULT FALSE,
  wallet_balance   DECIMAL(10,2) DEFAULT 0.00,
  sample_work_urls TEXT,
  bio              TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);