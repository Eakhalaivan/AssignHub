-- Migration V13: Add Geolocation and WriterMatch Fields and seed mock data
ALTER TABLE writer_profiles
  ADD COLUMN latitude DECIMAL(10, 8) NULL,
  ADD COLUMN longitude DECIMAL(11, 8) NULL,
  ADD COLUMN hourly_rate_usd DECIMAL(10, 2) DEFAULT 12.00,
  ADD COLUMN degree VARCHAR(50) DEFAULT 'PhD',
  ADD COLUMN min_deadline_hours INT DEFAULT 3;

ALTER TABLE orders
  ADD COLUMN latitude DECIMAL(10, 8) NULL,
  ADD COLUMN longitude DECIMAL(11, 8) NULL,
  ADD COLUMN location_radius_km DECIMAL(5, 2) DEFAULT 5.00,
  ADD COLUMN subject VARCHAR(100) NULL;

-- Update existing writer (eakhal) with coordinates and attributes
UPDATE writer_profiles
SET latitude = 13.0840,
    longitude = 80.2680,
    hourly_rate_usd = 15.00,
    degree = 'PhD',
    min_deadline_hours = 2,
    rating = 4.90,
    availability = TRUE,
    expertise = 'Essays, Research Papers, Literature, Technical Writing'
WHERE user_id = 4;

-- Seed additional high-fidelity mock writers for a gorgeous visual map experience
-- Default password: admin@123 (hashed: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NJwG9v.Iq')
INSERT INTO users (name, email, phone, password, role, status)
VALUES 
  ('Sarah K.', 'sarah@academix.com', '9111111111', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NJwG9v.Iq', 'WRITER', 'ACTIVE'),
  ('David L.', 'david@academix.com', '9222222222', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NJwG9v.Iq', 'WRITER', 'ACTIVE'),
  ('Jane M.', 'jane@academix.com', '9333333333', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NJwG9v.Iq', 'WRITER', 'ACTIVE');

-- Insert profiles for these seeded writers
INSERT INTO writer_profiles (user_id, expertise, nearby_colleges, rating, total_ratings, availability, is_verified, wallet_balance, bio, latitude, longitude, hourly_rate_usd, degree, min_deadline_hours)
VALUES
  (5, 'Essays, Marketing Management, Case Studies', 'IIT Madras, Anna University', 4.90, 312, TRUE, TRUE, 0.00, 'Academic writing specialist with over 5 years of experience in essays and case studies.', 13.0850, 80.2760, 12.00, 'PhD', 3),
  (6, 'Research Papers, Literature, Case Studies', 'Loyola College', 4.80, 154, TRUE, TRUE, 0.00, 'Focused research paper editor and technical writing consultant.', 13.0780, 80.2800, 14.00, 'M.Tech', 4),
  (7, 'Essays, Creative Writing, Philosophy', 'Madras Christian College', 4.50, 89, FALSE, TRUE, 0.00, 'Specialist in humanities, philosophy, and creative coursework.', 13.0950, 80.2600, 10.00, 'MA', 6);
