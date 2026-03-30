-- Optional Row Level Security policies
-- Enable only if you are ready to handle JWT claims and strict auth checks.

alter table users enable row level security;
alter table events enable row level security;
alter table registrations enable row level security;
alter table attendance enable row level security;
alter table feedback enable row level security;

create policy if not exists users_select_self on users
for select using (supabase_uid = auth.uid());

create policy if not exists users_update_self on users
for update using (supabase_uid = auth.uid()) with check (supabase_uid = auth.uid());

create policy if not exists events_select_all on events
for select using (true);

create policy if not exists registrations_select_self on registrations
for select using (
  user_id in (select id from users where supabase_uid = auth.uid())
);

create policy if not exists feedback_select_self on feedback
for select using (
  user_id in (select id from users where supabase_uid = auth.uid())
);
