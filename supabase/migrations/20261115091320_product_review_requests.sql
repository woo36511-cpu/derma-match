begin;

create table public.product_review_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product_name text not null check (char_length(btrim(product_name)) between 2 and 100
    and product_name !~ '[[:cntrl:]<>@]'),
  product_key text not null generated always as (
    regexp_replace(lower(normalize(btrim(product_name), NFKC)), '[[:space:][:punct:]]+', '', 'g')
  ) stored check (char_length(product_key) >= 2),
  category text not null check (category in ('cleanser', 'moisturizer', 'toner', 'serum', 'sunscreen')),
  source_url text check (source_url is null or (char_length(source_url) <= 512
    and source_url ~ '^https://[A-Za-z0-9.-]+\.[A-Za-z]{2,}([/?][^[:space:]#]*)?$')),
  status text not null default 'pending' check (status in ('pending', 'insufficient', 'published')),
  catalog_id integer check (catalog_id > 0),
  requested_at timestamptz not null default now(),
  unique (user_id, product_key, category),
  check ((status = 'published') = (catalog_id is not null))
);

create index product_review_requests_owner_recent on public.product_review_requests (user_id, requested_at desc);
create index product_review_requests_pending on public.product_review_requests (requested_at) where status = 'pending';

alter table public.product_review_requests enable row level security;
revoke all on public.product_review_requests from public, anon, authenticated;
grant select (product_name, category, status, requested_at),
  insert (product_name, category, source_url) on public.product_review_requests to authenticated;
grant select, insert, update, delete on public.product_review_requests to service_role;

create policy review_request_select_own on public.product_review_requests for select to authenticated
  using ((select auth.uid()) = user_id);
create policy review_request_insert_own on public.product_review_requests for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Serialize the limit check per account. No browser role can set owner, time or review status.
create function dearsince_private.limit_product_review_requests()
returns trigger language plpgsql security definer set search_path = '' as $fn$
begin
  if new.user_id is null or new.user_id is distinct from auth.uid() then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.user_id::text, 27));
  if exists (select 1 from public.product_review_requests where user_id = new.user_id and category = new.category
    and product_key = pg_catalog.regexp_replace(pg_catalog.lower(pg_catalog.normalize(pg_catalog.btrim(new.product_name), 'NFKC')), '[[:space:][:punct:]]+', '', 'g')) then
    raise exception using errcode = '23505', message = 'product_already_requested';
  end if;
  if (select count(*) from public.product_review_requests where user_id = new.user_id and requested_at >= now() - interval '24 hours') >= 5 then
    raise exception using errcode = 'P0001', message = 'product_review_request_limit';
  end if;
  return new;
end;
$fn$;
revoke all on function dearsince_private.limit_product_review_requests() from public, anon, authenticated;
create trigger product_review_requests_limit before insert on public.product_review_requests
  for each row execute function dearsince_private.limit_product_review_requests();

commit;
