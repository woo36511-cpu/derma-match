begin;
alter table public.brand_discovery_requests
  drop constraint brand_discovery_requests_brand_name_check,
  add constraint brand_discovery_requests_brand_name_check check (char_length(brand_name) between 2 and 100
    and brand_name ~ '^[[:alnum:] .&+''·_()/,%!-]+$'),
  add column resolved_brand text check (char_length(resolved_brand) between 2 and 80);
commit;
