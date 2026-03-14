-- Optional Row-Level Security policy bootstrap for Supabase.
-- Run only if you want RLS enforced at the Postgres layer.
-- The current Node backend uses direct DB credentials and already applies app-level checks.

begin;

-- Enable RLS on core tables.
alter table users enable row level security;
alter table events enable row level security;
alter table registrations enable row level security;
alter table attendance enable row level security;
alter table feedback enable row level security;
alter table organizer_profiles enable row level security;

-- Basic policy examples for authenticated users.
-- Adjust to your auth model before production hardening.

drop policy if exists users_select_self on users;
create policy users_select_self on users
for select
using (supabase_uid = auth.uid());

drop policy if exists users_update_self on users;
create policy users_update_self on users
for update
using (supabase_uid = auth.uid())
with check (supabase_uid = auth.uid());

drop policy if exists events_select_all_authenticated on events;
create policy events_select_all_authenticated on events
for select
using (auth.role() = 'authenticated');

drop policy if exists registrations_select_self on registrations;
create policy registrations_select_self on registrations
for select
using (
  user_id in (
    select id from users where supabase_uid = auth.uid()
  )
);

drop policy if exists feedback_select_self on feedback;
create policy feedback_select_self on feedback
for select
using (
  user_id in (
    select id from users where supabase_uid = auth.uid()
  )
);

commit;
