CREATE TABLE student_profiles (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT NOT NULL UNIQUE,
  college_id BIGINT,
  department VARCHAR(100),
  year       INT CHECK (year BETWEEN 1 AND 5),
  semester   INT CHECK (semester BETWEEN 1 AND 10),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL
);