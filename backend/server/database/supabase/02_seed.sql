-- Optional seed data for Supabase

insert into users (name, username, email, role, organizer_status, password_hash)
values
  ('Admin User', 'admin', 'admin@example.com', 'admin', 'active', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhashdum'),
  ('Organizer User', 'organizer1', 'organizer1@example.com', 'organizer', 'active', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhashdum'),
  ('Attendee User', 'attendee1', 'attendee1@example.com', 'attendee', 'active', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhashdum')
on conflict (email) do nothing;

insert into events (title, description, date, time, location, category, venue_type, status, approved, capacity, organizer_id)
select
  'Sample Tech Meetup',
  'Sample event for local testing',
  current_date + interval '7 day',
  '10:00',
  'Main Hall',
  'Technology',
  'In-Person',
  'Upcoming',
  true,
  200,
  (select id from users where role = 'organizer' order by id asc limit 1)
where not exists (select 1 from events where title = 'Sample Tech Meetup');
