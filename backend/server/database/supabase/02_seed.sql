-- Supabase/Postgres seed data for Seamless Event Management
-- Run this after 01_schema.sql

begin;

insert into users (id, name, username, email, role)
values
  (1, 'Admin User', 'admin', 'admin@eventflow.com', 'admin'),
  (2, 'Organizer User', 'organizer', 'organizer@eventflow.com', 'organizer'),
  (3, 'Attendee User', 'attendee', 'attendee@eventflow.com', 'attendee')
on conflict (id) do nothing;

-- Keep identity sequences in sync after explicit ids.
select setval(pg_get_serial_sequence('users', 'id'), (select coalesce(max(id), 1) from users), true);

-- Optional default app settings used by admin/attendee modules.
insert into platform_settings (setting_key, setting_value)
values
  ('certificate_templates_enabled', 'true'),
  ('maintenance_mode', 'false'),
  ('registration_approval_required', 'false')
on conflict (setting_key) do update set setting_value = excluded.setting_value;

commit;
