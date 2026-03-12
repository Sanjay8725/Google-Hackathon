-- Test data for event_management database
-- NOTE: This file populates test data without credentials.
-- Use 'node setup-credentials.js' to create login credentials with hashed passwords

USE event_management;

-- Clear existing data (OPTIONAL - comment out if you want to keep existing users)
-- DELETE FROM engagement_logs;
-- DELETE FROM analytics;
-- DELETE FROM feedback;
-- DELETE FROM attendance;
-- DELETE FROM registrations;
-- DELETE FROM events;
-- DELETE FROM admin_credentials;
-- DELETE FROM organizer_credentials;
-- DELETE FROM attendee_credentials;
-- DELETE FROM users;

-- Reset auto-increment (OPTIONAL - uncomment with DELETE statements above)
-- ALTER TABLE users AUTO_INCREMENT = 1;
-- ALTER TABLE events AUTO_INCREMENT = 1;
-- ALTER TABLE registrations AUTO_INCREMENT = 1;
-- ALTER TABLE attendance AUTO_INCREMENT = 1;
-- ALTER TABLE feedback AUTO_INCREMENT = 1;
-- ALTER TABLE analytics AUTO_INCREMENT = 1;
-- ALTER TABLE engagement_logs AUTO_INCREMENT = 1;

-- Insert test users (passwords created via setup-credentials.js)
INSERT IGNORE INTO users (name, username, email, role) VALUES
('Admin User', 'admin', 'admin@eventflow.com', 'admin'),
('Organizer User', 'organizer', 'organizer@eventflow.com', 'organizer'),
('Jane Smith', 'jane_smith', 'jane@eventflow.com', 'organizer'),
('Alice Attendee', 'alice_attendee', 'alice@eventflow.com', 'attendee'),
('Bob Johnson', 'bob_johnson', 'bob@eventflow.com', 'attendee'),
('Charlie Brown', 'charlie_brown', 'charlie@eventflow.com', 'attendee'),
('Diana Prince', 'diana_prince', 'diana@eventflow.com', 'attendee');

-- Insert test events
INSERT INTO events (organizer_id, title, description, date, time, location, status, capacity, registered, checked_in, engagement, avg_rating, feedback_count, category) VALUES
(1, 'Tech Summit 2026', 'Annual technology conference featuring keynote speakers, workshops, and networking opportunities', '2026-03-15', '09:00 AM', 'Convention Center', 'Live', 300, 250, 187, 92.00, 4.70, 124, 'Technology'),
(1, 'Web Dev Workshop', 'Learn modern web development with React, Node.js, and best practices', '2026-04-20', '02:00 PM', 'Tech Hub', 'Upcoming', 50, 42, 0, 0.00, 0.00, 0, 'Workshop'),
(1, 'Startup Networking', 'Connect with entrepreneurs, investors, and innovators in the startup ecosystem', '2026-05-10', '06:00 PM', 'Innovation Hub', 'Planning', 150, 65, 0, 0.00, 0.00, 0, 'Networking'),
(2, 'AI Conference 2026', 'Explore the latest in artificial intelligence and machine learning', '2026-06-05', '10:00 AM', 'Science Park', 'Planning', 200, 0, 0, 0.00, 0.00, 0, 'Technology');

-- Insert registrations for Tech Summit (Event ID: 1)
INSERT INTO registrations (event_id, user_id, ticket_type, qr_code) VALUES
(1, 3, 'VIP', 'QR-1-3-1738353600000'),
(1, 4, 'General', 'QR-1-4-1738353600001'),
(1, 5, 'General', 'QR-1-5-1738353600002'),
(1, 6, 'VIP', 'QR-1-6-1738353600003');

-- Insert registrations for Web Dev Workshop (Event ID: 2)
INSERT INTO registrations (event_id, user_id, ticket_type, qr_code) VALUES
(2, 3, 'General', 'QR-2-3-1738353600004'),
(2, 4, 'General', 'QR-2-4-1738353600005');

-- Insert registrations for Startup Networking (Event ID: 3)
INSERT INTO registrations (event_id, user_id, ticket_type, qr_code) VALUES
(3, 5, 'General', 'QR-3-5-1738353600006'),
(3, 6, 'General', 'QR-3-6-1738353600007');

-- Insert attendance records (only for live event)
INSERT INTO attendance (registration_id, event_id, user_id, check_in_method) VALUES
(1, 1, 3, 'QR'),
(2, 1, 4, 'QR'),
(3, 1, 5, 'Manual'),
(4, 1, 6, 'QR');

-- Insert feedback for Tech Summit
INSERT INTO feedback (event_id, user_id, rating, comment) VALUES
(1, 3, 5, 'Excellent event! Very well organized and informative sessions.'),
(1, 4, 4, 'Great networking opportunities. Would love more hands-on workshops.'),
(1, 5, 5, 'Amazing speakers and content. Looking forward to next year!'),
(1, 6, 5, 'Best tech conference I have attended. Highly recommend!');

-- Insert engagement logs
INSERT INTO engagement_logs (event_id, user_id, action) VALUES
(1, 3, 'event_registration'),
(1, 3, 'qr_checkin'),
(1, 3, 'session_view'),
(1, 3, 'feedback_submission'),
(1, 4, 'event_registration'),
(1, 4, 'qr_checkin'),
(1, 4, 'feedback_submission'),
(2, 3, 'event_registration'),
(2, 4, 'event_registration'),
(3, 5, 'event_registration'),
(3, 6, 'event_registration');

-- Insert analytics metrics
INSERT INTO analytics (event_id, metric_name, metric_value) VALUES
(1, 'attendance_rate', 74.80),
(1, 'engagement_score', 92.00),
(1, 'satisfaction_rate', 95.00),
(1, 'revenue', 12500.00);

-- Update event statistics based on inserted data
UPDATE events SET 
  registered = (SELECT COUNT(*) FROM registrations WHERE event_id = 1),
  checked_in = (SELECT COUNT(*) FROM attendance WHERE event_id = 1),
  feedback_count = (SELECT COUNT(*) FROM feedback WHERE event_id = 1),
  qr_scans = (SELECT COUNT(*) FROM attendance WHERE event_id = 1 AND check_in_method = 'QR'),
  avg_rating = (SELECT AVG(rating) FROM feedback WHERE event_id = 1)
WHERE id = 1;

UPDATE events SET 
  registered = (SELECT COUNT(*) FROM registrations WHERE event_id = 2)
WHERE id = 2;

UPDATE events SET 
  registered = (SELECT COUNT(*) FROM registrations WHERE event_id = 3)
WHERE id = 3;

-- Verify data
SELECT 'Users' as TableName, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'Registrations', COUNT(*) FROM registrations
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'Feedback', COUNT(*) FROM feedback
UNION ALL
SELECT 'Engagement Logs', COUNT(*) FROM engagement_logs;

-- Show sample data
SELECT 'Sample Events:' as Info;
SELECT id, title, status, registered, checked_in FROM events;

SELECT 'Sample Registrations:' as Info;
SELECT r.id, e.title as event, u.name as user, r.qr_code 
FROM registrations r
JOIN events e ON r.event_id = e.id
JOIN users u ON r.user_id = u.id
LIMIT 5;
