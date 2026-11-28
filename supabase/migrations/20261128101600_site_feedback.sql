begin;

create table public.site_feedback (
  id uuid primary key,
  category text not null check (category in ('bug', 'suggestion', 'other')),
  message text not null check (char_length(btrim(message)) between 5 and 2000),
  submitted_at timestamptz not null default now()
);

alter table public.site_feedback enable row level security;
revoke all on public.site_feedback from public, anon, authenticated;
grant insert (id, category, message) on public.site_feedback to anon, authenticated;
grant select, insert, update, delete on public.site_feedback to service_role;
create policy site_feedback_submit on public.site_feedback for insert to anon, authenticated with check (true);

commit;
