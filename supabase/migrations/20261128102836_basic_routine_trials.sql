begin;
create table public.basic_routine_trials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision integer not null check (revision > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 65536)
);
alter table public.basic_routine_trials enable row level security;
revoke all on public.basic_routine_trials from public, anon, authenticated;
grant select, insert on public.basic_routine_trials to authenticated;
grant update (revision, payload) on public.basic_routine_trials to authenticated;
grant select, insert, update, delete on public.basic_routine_trials to service_role;
create policy basic_trial_read on public.basic_routine_trials for select to authenticated
  using ((select auth.uid()) = user_id);
create policy basic_trial_create on public.basic_routine_trials for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy basic_trial_update on public.basic_routine_trials for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
commit;
