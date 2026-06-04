CREATE TABLE colleges (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  college_name VARCHAR(200) NOT NULL,
  city         VARCHAR(100),
  address      TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO colleges (college_name, city, address) VALUES
  ('Anna University', 'Chennai', 'Sardar Patel Rd, Guindy, Chennai'),
  ('IIT Madras', 'Chennai', 'IIT P.O., Chennai 600036'),
  ('NIT Trichy', 'Tiruchirappalli', 'Tanjore Main Road, Tiruchirappalli'),
  ('PSG College of Technology', 'Coimbatore', 'Peelamedu, Coimbatore');