-- ============================================================================
-- EVENT MANAGEMENT SYSTEM - COMPREHENSIVE TEST DATA
-- ============================================================================
-- This file contains realistic test data for all tables in the event management system
-- ============================================================================

USE event_management;

-- ============================================================================
-- SECTION 1: TEST USERS (Admin, Organizers, Attendees)
-- ============================================================================

-- Admin Users
INSERT INTO users (name, username, email, role, is_active) VALUES
('Sarah Johnson', 'admin_sarah', 'admin@eventflow.com', 'admin', TRUE),
('Michael Chen', 'admin_michael', 'michael.admin@eventflow.com', 'admin', TRUE);

-- Organizer Users
INSERT INTO users (name, username, email, role, is_active) VALUES
('John Smith', 'organizer_john', 'john@techconferences.com', 'organizer', TRUE),
('Emily Williams', 'organizer_emily', 'emily@businessevents.com', 'organizer', TRUE),
('David Martinez', 'organizer_david', 'david@marketingconf.com', 'organizer', TRUE);

-- Attendee Users (Sample attendees)
INSERT INTO users (name, username, email, role, is_active) VALUES
('Alice Johnson', 'alice_j', 'alice.johnson@company.com', 'attendee', TRUE),
('Bob Thompson', 'bob_t', 'bob.thompson@company.com', 'attendee', TRUE),
('Carol White', 'carol_w', 'carol.white@startup.io', 'attendee', TRUE),
('Daniel Brown', 'daniel_b', 'daniel.brown@tech.com', 'attendee', TRUE),
('Emma Davis', 'emma_d', 'emma.davis@business.com', 'attendee', TRUE),
('Frank Wilson', 'frank_w', 'frank.wilson@company.com', 'attendee', TRUE),
('Grace Lee', 'grace_l', 'grace.lee@innovate.com', 'attendee', TRUE),
('Henry Martinez', 'henry_m', 'henry.martinez@startup.io', 'attendee', TRUE);

-- ============================================================================
-- SECTION 2: TEST CREDENTIALS (Password hashes are examples)
-- ============================================================================

-- Note: In production, use bcrypt or similar. These are example hashes.
INSERT INTO credentials (user_id, password_hash, last_login) VALUES
(1, '$2b$10$exampleHashedPassword1234567890admin', NOW()),
(2, '$2b$10$exampleHashedPassword1234567890admin', NOW() - INTERVAL 1 DAY),
(3, '$2b$10$exampleHashedPassword1234567890organizer', NOW() - INTERVAL 2 HOUR),
(4, '$2b$10$exampleHashedPassword1234567890organizer', NOW() - INTERVAL 5 HOUR),
(5, '$2b$10$exampleHashedPassword1234567890organizer', NOW() - INTERVAL 1 HOUR),
(6, '$2b$10$exampleHashedPassword1234567890attendee', NOW() - INTERVAL 30 MINUTE),
(7, '$2b$10$exampleHashedPassword1234567890attendee', NOW() - INTERVAL 15 MINUTE),
(8, '$2b$10$exampleHashedPassword1234567890attendee', NOW() - INTERVAL 2 DAY),
(9, '$2b$10$exampleHashedPassword1234567890attendee', NOW()),
(10, '$2b$10$exampleHashedPassword1234567890attendee', NOW() - INTERVAL 3 DAY),
(11, '$2b$10$exampleHashedPassword1234567890attendee', NOW() - INTERVAL 1 HOUR),
(12, '$2b$10$exampleHashedPassword1234567890attendee', NOW() - INTERVAL 45 MINUTE),
(13, '$2b$10$exampleHashedPassword1234567890attendee', NOW() - INTERVAL 12 HOUR);

-- ============================================================================
-- SECTION 3: TEST ATTENDEE PROFILES
-- ============================================================================

INSERT INTO attendee_profiles (user_id, phone, company, job_title, address, city, state, country, zip_code, interests, dietary_restrictions, newsletter_subscribed) VALUES
(6, '+1-555-0101', 'Tech Corp', 'Software Engineer', '123 Main St', 'San Francisco', 'CA', 'USA', '94102', 'AI, Cloud, Web Development', 'Vegetarian', TRUE),
(7, '+1-555-0102', 'Business Inc', 'Product Manager', '456 Oak Ave', 'New York', 'NY', 'USA', '10001', 'Product, Strategy, Marketing', 'None', TRUE),
(8, '+1-555-0103', 'StartUp Lab', 'Founder', '789 Pine Rd', 'Austin', 'TX', 'USA', '78701', 'Startups, Entrepreneurship', 'Vegan', FALSE),
(9, '+1-555-0104', 'Design Studios', 'UX Designer', '321 Elm St', 'Los Angeles', 'CA', 'USA', '90001', 'Design, UX, UI', 'None', TRUE),
(10, '+1-555-0105', 'Analytics Pro', 'Data Scientist', '654 Maple Dr', 'Boston', 'MA', 'USA', '02101', 'Data, Analytics, ML', 'Gluten-Free', TRUE),
(11, '+1-555-0106', 'Marketing Hub', 'Marketing Manager', '987 Cedar Ln', 'Chicago', 'IL', 'USA', '60601', 'Marketing, Growth, Branding', 'None', TRUE),
(12, '+1-555-0107', 'FinTech Solutions', 'Finance Analyst', '135 Birch Way', 'Miami', 'FL', 'USA', '33101', 'Finance, Blockchain, Web3', 'None', FALSE);

-- ============================================================================
-- SECTION 4: TEST ORGANIZER PROFILES
-- ============================================================================

INSERT INTO organizer_profiles (user_id, organization_name, contact_phone, office_address, website, verification_status, total_events) VALUES
(3, 'Tech Conferences Inc', '+1-555-2001', '100 Tech Blvd', 'www.techconferences.com', 'verified', 15),
(4, 'Business Events LLC', '+1-555-2002', '200 Business Ave', 'www.businessevents.com', 'verified', 22),
(5, 'Marketing Masters', '+1-555-2003', '300 Marketing St', 'www.marketingmasters.com', 'verified', 8);

-- ============================================================================
-- SECTION 5: TEST ADMIN PROFILES
-- ============================================================================

INSERT INTO admin_profiles (user_id, department, access_level) VALUES
(1, 'System Administration', 'super_admin'),
(2, 'Operations', 'advanced');

-- ============================================================================
-- SECTION 6: TEST EVENTS
-- ============================================================================

INSERT INTO events (organizer_id, title, description, date, start_time, end_time, location, venue_type, status, capacity, category, cost, registration_open, registration_end_date) VALUES
(3, 'Annual Tech Conference 2026', 'Largest tech conference featuring keynotes from industry leaders, workshops, and networking', '2026-04-15', '09:00:00', '17:00:00', 'San Francisco Convention Center', 'in-person', 'Upcoming', 1000, 'Technology', 199.00, TRUE, '2026-04-10'),
(3, 'Web Development Bootcamp', 'Intensive 3-day bootcamp covering React, Node.js, and Web Development best practices', '2026-03-20', '10:00:00', '16:00:00', 'Virtual - Zoom', 'virtual', 'Upcoming', 500, 'Technology', 99.00, TRUE, '2026-03-18'),
(4, 'Business Growth Summit', 'Strategic summit for entrepreneurs and business leaders', '2026-05-01', '08:30:00', '18:00:00', 'New York Marriott', 'in-person', 'Planning', 800, 'Business', 149.00, TRUE, '2026-04-25'),
(4, 'Digital Marketing Workshop', 'Master modern digital marketing strategies and tools', '2026-03-25', '14:00:00', '17:00:00', 'Boston Innovation Hub', 'hybrid', 'Upcoming', 200, 'Marketing', 79.00, TRUE, '2026-03-23'),
(5, 'Social Media Masterclass', 'Advanced social media strategies for brands', '2026-04-20', '11:00:00', '13:00:00', 'Virtual - Teams', 'virtual', 'Upcoming', 300, 'Marketing', 49.00, TRUE, '2026-04-18');

-- ============================================================================
-- SECTION 7: TEST EVENT SESSIONS
-- ============================================================================

INSERT INTO event_sessions (event_id, session_name, description, start_time, end_time, session_date, speaker_id, location, capacity, session_type) VALUES
(1, 'Keynote: The Future of AI', 'Exploring AI trends and implications', '09:00:00', '10:00:00', '2026-04-15', 3, 'Main Hall', 500, 'Keynote'),
(1, 'Workshop: Building with AI', 'Hands-on workshop on AI implementation', '10:30:00', '12:00:00', '2026-04-15', 4, 'Room A', 50, 'Workshop'),
(1, 'Panel: Cloud Computing in 2026', 'Industry leaders discuss cloud trends', '13:00:00', '14:30:00', '2026-04-15', 3, 'Main Hall', 500, 'Panel'),
(2, 'React Fundamentals', 'Learn React basics and components', '10:00:00', '13:00:00', '2026-03-20', 4, 'Online Room 1', 100, 'Workshop'),
(2, 'Node.js Backend Development', 'Building scalable backends with Node.js', '14:00:00', '17:00:00', '2026-03-20', 3, 'Online Room 2', 100, 'Workshop');

-- ============================================================================
-- SECTION 8: TEST REGISTRATIONS
-- ============================================================================

INSERT INTO registrations (event_id, user_id, ticket_type, payment_status, amount_paid, dietary_preference, additional_notes) VALUES
(1, 6, 'General', 'completed', 199.00, 'Vegetarian', 'First timer - excited!'),
(1, 7, 'VIP', 'completed', 299.00, 'None', ''),
(1, 8, 'General', 'completed', 199.00, 'Vegan', 'Bringing a guest'),
(1, 9, 'General', 'completed', 199.00, 'None', ''),
(1, 10, 'Student', 'completed', 99.00, 'Gluten-Free', ''),
(2, 6, 'General', 'completed', 99.00, 'Vegetarian', ''),
(2, 11, 'General', 'completed', 99.00, 'None', ''),
(2, 12, 'General', 'pending', 99.00, 'None', 'Waiting for payment confirmation'),
(3, 7, 'General', 'completed', 149.00, 'None', ''),
(3, 9, 'General', 'completed', 149.00, 'None', ''),
(4, 10, 'General', 'completed', 79.00, 'Gluten-Free', ''),
(5, 11, 'General', 'completed', 49.00, 'None', ''),
(5, 12, 'General', 'completed', 49.00, 'None', '');

-- ============================================================================
-- SECTION 9: TEST ATTENDANCE
-- ============================================================================

INSERT INTO attendance (registration_id, event_id, user_id, check_in_time, check_in_method, duration_minutes) VALUES
(1, 1, 6, '2026-04-15 09:05:00', 'QR', 480),
(2, 1, 7, '2026-04-15 08:55:00', 'QR', 500),
(3, 1, 8, '2026-04-15 09:30:00', 'Manual', 450),
(4, 1, 9, '2026-04-15 10:00:00', 'QR', 420),
(6, 2, 6, '2026-03-20 10:05:00', 'App', 180),
(7, 2, 11, '2026-03-20 10:00:00', 'QR', 190),
(9, 3, 7, '2026-05-01 08:35:00', 'QR', 540),
(10, 3, 9, '2026-05-01 09:00:00', 'Manual', 500),
(11, 4, 10, '2026-03-25 14:05:00', 'QR', 180),
(12, 5, 11, '2026-04-20 11:05:00', 'QR', 115);

-- ============================================================================
-- SECTION 10: TEST FEEDBACK
-- ============================================================================

INSERT INTO feedback (event_id, user_id, rating, venue_rating, organization_rating, content_rating, comment, would_recommend, improvement_suggestions) VALUES
(1, 6, 5, 5, 5, 5, 'Excellent event! Great speakers and organization.', TRUE, 'None - everything was perfect!'),
(1, 7, 4, 5, 4, 4, 'Good event with useful sessions. Food could be better.', TRUE, 'Improve catering options'),
(1, 8, 5, 4, 5, 5, 'Amazing experience! Met many interesting people.', TRUE, 'Add more networking breaks'),
(1, 9, 4, 4, 4, 4, 'Solid conference. Sessions were informative.', TRUE, 'Better time management between sessions'),
(2, 6, 5, 5, 5, 5, 'Excellent bootcamp! Learned so much in 3 days.', TRUE, 'None - highly recommend!'),
(3, 7, 3, 3, 3, 3, 'Good but expected more depth in some topics.', FALSE, 'Increase session duration, better speaker selection'),
(4, 10, 4, 4, 4, 5, 'Great workshop with practical insights.', TRUE, 'Provide more hands-on exercises'),
(5, 11, 4, 5, 4, 4, 'Very informative masterclass on social media strategies.', TRUE, 'Include more case studies');

-- ============================================================================
-- SECTION 11: TEST SESSION ATTENDANCE
-- ============================================================================

INSERT INTO session_attendance (session_id, user_id, attendance_status, check_in_time, duration_minutes) VALUES
(1, 6, 'attended', '2026-04-15 09:05:00', 55),
(1, 7, 'attended', '2026-04-15 08:55:00', 60),
(1, 8, 'attended', '2026-04-15 09:30:00', 30),
(2, 6, 'attended', '2026-04-15 10:30:00', 90),
(2, 9, 'attended', '2026-04-15 10:35:00', 85),
(3, 7, 'attended', '2026-04-15 13:05:00', 85),
(3, 10, 'attended', '2026-04-15 13:00:00', 90),
(4, 6, 'attended', '2026-03-20 10:05:00', 180),
(4, 11, 'attended', '2026-03-20 10:00:00', 180),
(5, 6, 'attended', '2026-03-20 14:05:00', 180),
(5, 11, 'no-show', NULL, NULL);

-- ============================================================================
-- SECTION 12: TEST ENGAGEMENT LOGS
-- ============================================================================

INSERT INTO engagement_logs (event_id, user_id, action, action_type, description) VALUES
(1, 6, 'registered', 'register', 'User registered for event'),
(1, 6, 'viewed_agenda', 'view', 'Viewed event agenda'),
(1, 6, 'checked_in', 'check_in', 'Checked in at registration desk'),
(1, 6, 'attended_session', 'interaction', 'Attended keynote session'),
(1, 6, 'submitted_feedback', 'feedback', 'Submitted event feedback'),
(1, 7, 'registered', 'register', 'User registered for event'),
(1, 7, 'downloaded_materials', 'download', 'Downloaded session materials'),
(1, 7, 'shared_event', 'share', 'Shared event on social media'),
(1, 8, 'registered', 'register', 'User registered for event'),
(1, 9, 'registered', 'register', 'User registered for event'),
(2, 6, 'registered', 'register', 'User registered for bootcamp'),
(2, 6, 'attended_session_1', 'interaction', 'Attended React Fundamentals'),
(2, 6, 'attended_session_2', 'interaction', 'Attended Node.js Backend Development'),
(2, 6, 'submitted_feedback', 'feedback', 'Submitted bootcamp feedback');

-- ============================================================================
-- SECTION 13: TEST ENGAGEMENT SUMMARY
-- ============================================================================

INSERT INTO engagement_summary (event_id, user_id, total_interactions, session_attended, feedback_submitted, time_spent_minutes, engagement_score) VALUES
(1, 6, 5, 2, TRUE, 480, 95.00),
(1, 7, 3, 1, TRUE, 500, 85.00),
(1, 8, 2, 1, TRUE, 450, 80.00),
(1, 9, 1, 1, TRUE, 420, 75.00),
(2, 6, 4, 2, TRUE, 180, 90.00),
(2, 11, 2, 1, FALSE, 190, 70.00),
(3, 7, 1, 1, TRUE, 540, 75.00),
(3, 9, 1, 1, FALSE, 500, 70.00),
(4, 10, 1, 1, TRUE, 180, 80.00),
(5, 11, 2, 1, TRUE, 115, 75.00);

-- ============================================================================
-- SECTION 14: TEST ANALYTICS
-- ============================================================================

INSERT INTO analytics (event_id, metric_name, metric_value, metric_type) VALUES
(1, 'Total_Registrations', 1000, 'count'),
(1, 'Check_In_Rate', 85.50, 'percentage'),
(1, 'Average_Session_Duration', 75, 'average'),
(1, 'Feedback_Response_Rate', 92.00, 'percentage'),
(1, 'Average_Satisfaction_Score', 4.25, 'average'),
(2, 'Total_Registrations', 500, 'count'),
(2, 'Check_In_Rate', 95.00, 'percentage'),
(2, 'Course_Completion_Rate', 88.00, 'percentage'),
(3, 'Total_Registrations', 800, 'count'),
(3, 'Early_Bird_Sales', 450, 'count'),
(3, 'Revenue_Generated', 119200, 'total');

-- ============================================================================
-- SECTION 15: TEST EVENT ANALYTICS SUMMARY
-- ============================================================================

INSERT INTO event_analytics_summary (event_id, total_registrations, check_ins, no_shows, feedback_count, average_rating, session_count, total_attendees, average_time_spent_minutes, revenue_generated, conversion_rate, snapshot_date) VALUES
(1, 1000, 850, 150, 920, 4.25, 3, 850, 450, 169150.00, 85.00, '2026-04-15'),
(2, 500, 475, 25, 475, 4.50, 2, 475, 180, 47025.00, 95.00, '2026-03-20'),
(3, 800, 600, 200, 550, 3.75, 1, 600, 540, 89400.00, 75.00, '2026-05-01');

-- ============================================================================
-- SECTION 16: TEST CERTIFICATES
-- ============================================================================

INSERT INTO certificates (event_id, user_id, certificate_type, title, issued_date, certificate_url, verification_code, issued_by, is_valid) VALUES
(2, 6, 'Bootcamp', 'Web Development Bootcamp Certificate', '2026-03-23', 'https://certificates.eventflow.com/cert_6_2.pdf', 'CERT2026030001', 4, TRUE),
(2, 11, 'Bootcamp', 'Web Development Bootcamp Certificate', '2026-03-23', 'https://certificates.eventflow.com/cert_11_2.pdf', 'CERT2026030002', 4, TRUE),
(1, 6, 'Attendance', 'Conference Attendance Certificate', '2026-04-16', 'https://certificates.eventflow.com/cert_6_1.pdf', 'CERT2026040001', 3, TRUE),
(1, 7, 'Attendance', 'Conference Attendance Certificate', '2026-04-16', 'https://certificates.eventflow.com/cert_7_1.pdf', 'CERT2026040002', 3, TRUE);

-- ============================================================================
-- SECTION 17: TEST COUPONS
-- ============================================================================

INSERT INTO coupons (event_id, coupon_code, description, discount_type, discount_value, max_uses, used_count, valid_from, valid_until, is_active, created_by) VALUES
(1, 'EARLYBIRD2026', 'Early bird 20% discount', 'percentage', 20.00, 500, 450, '2026-03-01', '2026-04-05', TRUE, 3),
(1, 'STUDENT50', 'Student 50% discount', 'percentage', 50.00, 100, 45, '2026-03-01', '2026-04-10', TRUE, 3),
(2, 'LAUNCH100', 'Launch week $100 off', 'fixed_amount', 100.00, 100, 50, '2026-02-15', '2026-02-28', FALSE, 4),
(3, 'SPRING2026', '15% spring discount', 'percentage', 15.00, 300, 200, '2026-03-20', '2026-04-30', TRUE, 4);

-- ============================================================================
-- SECTION 18: TEST COUPON USAGE
-- ============================================================================

INSERT INTO coupon_usage (coupon_id, registration_id, discount_amount) VALUES
(1, 1, 39.80),
(1, 2, 59.80),
(2, 5, 49.50),
(2, 6, 49.50),
(4, 9, 22.35),
(4, 10, 11.85);

-- ============================================================================
-- SECTION 19: TEST SESSIONS
-- ============================================================================

INSERT INTO sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES
(6, 'token_user_6_session_1', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() + INTERVAL 24 HOUR),
(7, 'token_user_7_session_1', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() + INTERVAL 24 HOUR),
(3, 'token_user_3_admin_1', '10.0.0.50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() + INTERVAL 8 HOUR);

-- ============================================================================
-- SECTION 20: TEST NOTIFICATIONS
-- ============================================================================

INSERT INTO notifications (user_id, event_id, notification_type, title, message, action_url, is_read) VALUES
(6, 1, 'event_reminder', 'Event Starting Soon!', 'Annual Tech Conference 2026 starts in 24 hours', '/events/1', FALSE),
(6, 1, 'feedback_request', 'Rate Your Experience', 'Please provide feedback for Annual Tech Conference 2026', '/feedback/1', FALSE),
(7, 3, 'event_registered', 'Registration Confirmed', 'You have successfully registered for Business Growth Summit', '/events/3', TRUE),
(8, 2, 'event_announcement', 'New Workshop Available', 'Join our Web Development Bootcamp starting March 20', '/events/2', FALSE),
(9, 4, 'event_update', 'Schedule Change', 'Digital Marketing Workshop has been rescheduled to 2PM', '/events/4', TRUE);

-- ============================================================================
-- Test Data Summary
-- ============================================================================
-- Total Users: 13 (2 Admin, 3 Organizers, 8 Attendees)
-- Total Events: 5
-- Total Event Sessions: 5
-- Total Registrations: 13
-- Total Check-ins: 10
-- Total Feedback Submissions: 8
-- Total Certificates: 4
-- ===========================================================================
