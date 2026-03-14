-- Backend database bootstrap for Event Management system
-- Run with:
--   mysql -u root -p < backend/server/database/backend_connection_setup.sql

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS event_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE event_management;

-- =========================
-- Users and Authentication
-- =========================

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('admin', 'organizer', 'attendee') DEFAULT 'attendee',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS admin_credentials (
  user_id INT PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organizer_credentials (
  user_id INT PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendee_credentials (
  user_id INT PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organizer_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  organization_name VARCHAR(200),
  contact_phone VARCHAR(20),
  office_address VARCHAR(255),
  website VARCHAR(255),
  tax_id VARCHAR(50),
  bank_account VARCHAR(50),
  total_events INT DEFAULT 0,
  total_attendees INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- Event Management
-- =========================

CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organizer_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  venue_type ENUM('in-person', 'virtual', 'hybrid') DEFAULT 'in-person',
  status ENUM('Planning', 'Live', 'Upcoming', 'Completed', 'Cancelled') DEFAULT 'Planning',
  capacity INT DEFAULT 0,
  registered INT DEFAULT 0,
  checked_in INT DEFAULT 0,
  no_show INT DEFAULT 0,
  engagement DECIMAL(5,2) DEFAULT 0.00,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  feedback_count INT DEFAULT 0,
  qr_scans INT DEFAULT 0,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_organizer (organizer_id),
  INDEX idx_event_date (date),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ticket_type VARCHAR(50) DEFAULT 'General',
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  qr_code VARCHAR(255),
  dietary_preference VARCHAR(255),
  additional_notes TEXT,
  cancellation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (event_id, user_id),
  INDEX idx_registration_event (event_id),
  INDEX idx_registration_user (user_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  registration_id INT NOT NULL,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  check_in_method ENUM('QR', 'Manual', 'App') DEFAULT 'QR',
  location VARCHAR(100),
  duration_minutes INT,
  check_out_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (event_id, user_id),
  INDEX idx_attendance_event (event_id),
  INDEX idx_attendance_user (user_id)
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_feedback (event_id, user_id),
  INDEX idx_feedback_event (event_id),
  INDEX idx_feedback_user (user_id)
);

CREATE TABLE IF NOT EXISTS event_vendors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  vendor_name VARCHAR(200) NOT NULL,
  vendor_contact VARCHAR(255),
  vendor_email VARCHAR(100),
  vendor_phone VARCHAR(20),
  booth_location VARCHAR(100),
  vendor_category VARCHAR(100),
  payment_status ENUM('pending', 'partial', 'completed') DEFAULT 'pending',
  booth_fee DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_vendor_event (event_id)
);

CREATE TABLE IF NOT EXISTS event_expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Other',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_expense_event (event_id),
  INDEX idx_expense_date (expense_date)
);

CREATE TABLE IF NOT EXISTS engagement_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_engagement_event (event_id),
  INDEX idx_engagement_user (user_id),
  INDEX idx_engagement_time (timestamp)
);

CREATE TABLE IF NOT EXISTS analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2),
  metric_type ENUM('count', 'percentage', 'average', 'total', 'rate') DEFAULT 'count',
  dimension VARCHAR(100),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_analytics_event (event_id),
  INDEX idx_analytics_metric (metric_name)
);

-- Optional helper data for immediate testing
INSERT IGNORE INTO users (id, name, username, email, role) VALUES
  (1, 'Admin User', 'admin', 'admin@eventflow.com', 'admin'),
  (2, 'Organizer User', 'organizer', 'organizer@eventflow.com', 'organizer'),
  (3, 'Attendee User', 'attendee', 'attendee@eventflow.com', 'attendee');

-- Note: credentials are intentionally not inserted here.
-- Use your application registration flow or hashed values from setup scripts.
