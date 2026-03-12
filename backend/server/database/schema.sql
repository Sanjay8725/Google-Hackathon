-- ============================================================================
-- EVENT MANAGEMENT SYSTEM - COMPREHENSIVE DATABASE SCHEMA
-- ============================================================================
-- This schema handles: User Authentication, Event Management, Attendance,
-- Feedback, Analytics, Engagement Tracking, and Complete Event Lifecycle
-- ============================================================================

CREATE DATABASE IF NOT EXISTS event_management;
USE event_management;

-- ============================================================================
-- SECTION 1: USER MANAGEMENT & AUTHENTICATION
-- ============================================================================

-- Core Users table (All user types)
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
  INDEX idx_role (role),
  INDEX idx_active (is_active)
);

-- Unified Credentials table (Single location for all passwords)
CREATE TABLE IF NOT EXISTS credentials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  last_login TIMESTAMP,
  login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- Attendee Profile Details (Extended user info for attendees)
CREATE TABLE IF NOT EXISTS attendee_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  phone VARCHAR(20),
  company VARCHAR(150),
  job_title VARCHAR(100),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  zip_code VARCHAR(20),
  bio TEXT,
  interests VARCHAR(500),
  dietary_restrictions VARCHAR(255),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  profile_picture_url VARCHAR(255),
  newsletter_subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- Organizer Profile Details (Extended info for event organizers)
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (verification_status)
);

-- Admin Profile Details (Extended info for admins)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  department VARCHAR(100),
  access_level ENUM('basic', 'advanced', 'super_admin') DEFAULT 'basic',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- Session Management for Login Tracking
CREATE TABLE IF NOT EXISTS sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_token (session_token),
  INDEX idx_expires (expires_at)
);

-- Legacy credential tables (kept for compatibility)
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

-- ============================================================================
-- SECTION 2: EVENT MANAGEMENT
-- ============================================================================

-- Events table (Core event information)
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
  sub_category VARCHAR(50),
  image_url VARCHAR(255),
  banner_url VARCHAR(255),
  registration_open BOOLEAN DEFAULT TRUE,
  registration_end_date DATE,
  cost DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_organizer (organizer_id),
  INDEX idx_status (status),
  INDEX idx_date (date),
  INDEX idx_category (category)
);

-- Event Sessions/Agenda (For multi-session events)
CREATE TABLE IF NOT EXISTS event_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  session_name VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_date DATE NOT NULL,
  speaker_id INT,
  location VARCHAR(255),
  capacity INT DEFAULT 0,
  registered INT DEFAULT 0,
  session_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (speaker_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_event (event_id),
  INDEX idx_speaker (speaker_id),
  INDEX idx_date (session_date)
);

-- Event Vendors/Sponsors
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
  INDEX idx_event (event_id)
);

-- Event Expenses (Organizer expense tracker)
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
  INDEX idx_event (event_id),
  INDEX idx_expense_date (expense_date)
);

-- ============================================================================
-- SECTION 3: REGISTRATION & ATTENDANCE
-- ============================================================================

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
  INDEX idx_event (event_id),
  INDEX idx_user (user_id),
  INDEX idx_payment_status (payment_status)
);

-- Attendance table
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
  INDEX idx_event (event_id),
  INDEX idx_user (user_id),
  INDEX idx_check_in_time (check_in_time)
);

-- Session Attendance (Track which sessions attendees joined)
CREATE TABLE IF NOT EXISTS session_attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  attendance_status ENUM('registered', 'attended', 'no-show', 'excused') DEFAULT 'registered',
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  duration_minutes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_session_attendance (session_id, user_id),
  INDEX idx_session (session_id),
  INDEX idx_user (user_id),
  INDEX idx_status (attendance_status)
);

-- ============================================================================
-- SECTION 4: FEEDBACK & RATINGS
-- ============================================================================

-- ============================================================================
-- SECTION 4: FEEDBACK & RATINGS
-- ============================================================================

-- Enhanced Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  session_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  venue_rating INT CHECK (venue_rating BETWEEN 1 AND 5),
  organization_rating INT CHECK (organization_rating BETWEEN 1 AND 5),
  content_rating INT CHECK (content_rating BETWEEN 1 AND 5),
  comment TEXT,
  would_recommend BOOLEAN,
  improvement_suggestions TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE SET NULL,
  UNIQUE KEY unique_feedback (event_id, user_id),
  INDEX idx_event (event_id),
  INDEX idx_user (user_id),
  INDEX idx_rating (rating)
);

-- ============================================================================
-- SECTION 5: ENGAGEMENT TRACKING
-- ============================================================================

-- Detailed Engagement logs
CREATE TABLE IF NOT EXISTS engagement_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  session_id INT,
  action VARCHAR(100) NOT NULL,
  action_type ENUM('view', 'click', 'register', 'check_in', 'check_out', 'feedback', 'share', 'download', 'interaction') DEFAULT 'interaction',
  description TEXT,
  metadata JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE SET NULL,
  INDEX idx_event (event_id),
  INDEX idx_user (user_id),
  INDEX idx_action_type (action_type),
  INDEX idx_timestamp (timestamp)
);

-- Engagement Summary (Calculated metrics per user per event)
CREATE TABLE IF NOT EXISTS engagement_summary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  total_interactions INT DEFAULT 0,
  session_attended INT DEFAULT 0,
  feedback_submitted BOOLEAN DEFAULT FALSE,
  time_spent_minutes INT DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0.00,
  last_interaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_engagement (event_id, user_id),
  INDEX idx_event (event_id),
  INDEX idx_user (user_id),
  INDEX idx_score (engagement_score)
);

-- ============================================================================
-- SECTION 6: ANALYTICS & METRICS
-- ============================================================================

-- Detailed Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2),
  metric_type ENUM('count', 'percentage', 'average', 'total', 'rate') DEFAULT 'count',
  dimension VARCHAR(100),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event (event_id),
  INDEX idx_metric (metric_name),
  INDEX idx_recorded (recorded_at)
);

-- Event Analytics Summary (Daily/Periodic snapshots)
CREATE TABLE IF NOT EXISTS event_analytics_summary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  total_registrations INT DEFAULT 0,
  check_ins INT DEFAULT 0,
  no_shows INT DEFAULT 0,
  feedback_count INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  session_count INT DEFAULT 0,
  total_attendees INT DEFAULT 0,
  peak_hour_check_ins INT DEFAULT 0,
  total_engagement_score DECIMAL(10,2) DEFAULT 0.00,
  average_time_spent_minutes INT DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0.00,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE KEY unique_snapshot (event_id, snapshot_date),
  INDEX idx_event (event_id),
  INDEX idx_date (snapshot_date)
);

-- Hourly Analytics (For real-time tracking)
CREATE TABLE IF NOT EXISTS hourly_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  event_date DATE NOT NULL,
  hour_of_day INT NOT NULL,
  check_ins INT DEFAULT 0,
  check_outs INT DEFAULT 0,
  feedback_submissions INT DEFAULT 0,
  total_interactions INT DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE KEY unique_hour_snapshot (event_id, event_date, hour_of_day),
  INDEX idx_event (event_id),
  INDEX idx_date (event_date)
);

-- ============================================================================
-- SECTION 7: CERTIFICATES & ACHIEVEMENTS
-- ============================================================================

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  certificate_type VARCHAR(100),
  title VARCHAR(200) NOT NULL,
  issued_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url VARCHAR(255),
  verification_code VARCHAR(100) UNIQUE,
  issued_by INT,
  credential_id VARCHAR(255),
  skills_earned VARCHAR(500),
  is_valid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_certificate (event_id, user_id),
  INDEX idx_event (event_id),
  INDEX idx_user (user_id),
  INDEX idx_verification (verification_code)
);

-- User Achievements/Badges
CREATE TABLE IF NOT EXISTS achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  achievement_type VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(200) NOT NULL,
  description TEXT,
  badge_icon_url VARCHAR(255),
  earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  related_event_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_event_id) REFERENCES events(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_type (achievement_type)
);

-- ============================================================================
-- SECTION 8: PROMOTIONS & DISCOUNTS
-- ============================================================================

-- Coupon Codes / Promotional Codes
CREATE TABLE IF NOT EXISTS coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  coupon_code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  discount_type ENUM('percentage', 'fixed_amount') DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INT DEFAULT 999999,
  used_count INT DEFAULT 0,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_event (event_id),
  INDEX idx_code (coupon_code),
  INDEX idx_active (is_active)
);

-- Coupon Usage Tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coupon_id INT NOT NULL,
  registration_id INT NOT NULL,
  discount_amount DECIMAL(10,2),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  INDEX idx_coupon (coupon_id),
  INDEX idx_registration (registration_id)
);

-- ============================================================================
-- SECTION 9: AUDIT LOGS & SECURITY
-- ============================================================================

-- Admin Activity Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin (admin_id),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
);

-- Error Logs
CREATE TABLE IF NOT EXISTS error_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  error_type VARCHAR(100),
  error_message TEXT,
  stack_trace TEXT,
  user_id INT,
  endpoint VARCHAR(255),
  method VARCHAR(10),
  ip_address VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_timestamp (timestamp),
  INDEX idx_error_type (error_type)
);

-- ============================================================================
-- SECTION 10: NOTIFICATIONS & COMMUNICATIONS
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_id INT,
  notification_type VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url VARCHAR(255),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_event (event_id),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  template_name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (template_name)
);

-- Email Log
CREATE TABLE IF NOT EXISTS email_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recipient_email VARCHAR(100) NOT NULL,
  template_id INT,
  subject VARCHAR(255),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent', 'pending', 'failed') DEFAULT 'pending',
  error_message TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_sent (sent_at)
);

