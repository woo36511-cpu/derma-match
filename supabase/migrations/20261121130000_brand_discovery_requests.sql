begin;

create table public.brand_discovery_requests (
  brand_name text not null check (char_length(brand_name) between 2 and 70
    and brand_name ~ '^[[:alnum:] .&+''·_-]+$'),
  brand_key text generated always as (
    regexp_replace(lower(normalize(brand_name, NFKC)), '[[:space:][:punct:]·]+', '', 'g')
  ) stored primary key check (char_length(brand_key) >= 2),
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'queued', 'published', 'needs_review'))
);

create index brand_discovery_requests_recent on public.brand_discovery_requests (requested_at);
alter table public.brand_discovery_requests enable row level security;
revoke all on public.brand_discovery_requests from public, anon, authenticated;
grant insert (brand_name) on public.brand_discovery_requests to anon, authenticated;
grant select, insert, update on public.brand_discovery_requests to service_role;
create policy brand_discovery_submit on public.brand_discovery_requests
  for insert to anon, authenticated with check (status = 'pending');

create function dearsince_private.limit_brand_discovery_requests()
returns trigger language plpgsql security definer set search_path = '' as $fn$
begin
  perform pg_catalog.pg_advisory_xact_lock(721153, 7);
  if exists (select 1 from public.brand_discovery_requests
    where brand_key = pg_catalog.regexp_replace(pg_catalog.lower(pg_catalog.normalize(new.brand_name, 'NFKC')), '[[:space:][:punct:]·]+', '', 'g')) then
    raise exception using errcode = '23505', message = 'brand_already_requested';
  end if;
  if (select count(*) from public.brand_discovery_requests where requested_at >= now() - interval '1 hour') >= 100 then
    raise exception using errcode = 'P0001', message = 'brand_discovery_request_limit';
  end if;
  return new;
end;
$fn$;
revoke all on function dearsince_private.limit_brand_discovery_requests() from public, anon, authenticated;
create trigger brand_discovery_requests_limit before insert on public.brand_discovery_requests
  for each row execute function dearsince_private.limit_brand_discovery_requests();

commit;
