begin;

create table public.journey_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_id text not null check (length(record_id) between 1 and 200),
  revision integer not null default 1 check (revision > 0),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, record_id),
  constraint valid_record_payload check (coalesce((
    jsonb_typeof(payload) = 'object' and
    payload ? 'id' and payload ? 'type' and
    payload->>'id' = record_id and
    payload->>'type' in ('initial_survey', 'feedback') and
    octet_length(payload::text) <= 1048576
  ), false))
);

alter table public.journey_records enable row level security;
revoke all on public.journey_records from anon, authenticated;
grant select, insert, update on public.journey_records to authenticated;

create policy journey_select_own on public.journey_records for select to authenticated
  using ((select auth.uid()) = user_id);
create policy journey_insert_own on public.journey_records for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy journey_update_own on public.journey_records for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- The authenticated user determines ownership. The caller cannot supply user_id.
-- Revision checks prevent stale devices from silently overwriting newer edits.
create function public.sync_journey_records(p_owner_id uuid, p_records jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  entry jsonb;
  current_row public.journey_records%rowtype;
  result jsonb := '[]'::jsonb;
  expected integer;
  is_new boolean;
begin
  if owner_id is null or p_owner_id is distinct from owner_id then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if p_records is null or jsonb_typeof(p_records) <> 'array' then
    raise exception using errcode = '22023', message = 'invalid_record_batch';
  end if;
  if jsonb_array_length(p_records) > 50 then
    raise exception using errcode = '22023', message = 'record_batch_too_large';
  end if;
  for entry in select value from jsonb_array_elements(p_records) order by value->>'record_id' loop
    if entry->>'record_id' is null or entry->>'expected_revision' is null then
      raise exception using errcode = '22023', message = 'invalid_record_entry';
    end if;
    expected := (entry->>'expected_revision')::integer;
    if expected < 0 then
      raise exception using errcode = '22023', message = 'invalid_record_revision';
    end if;
    select * into current_row from public.journey_records
      where user_id = owner_id and record_id = entry->>'record_id' for update;
    is_new := not found;
    if is_new then
      if expected <> 0 then
        raise exception using errcode = '40001', message = 'journey_record_conflict';
      end if;
      insert into public.journey_records(user_id, record_id, payload)
        values (owner_id, entry->>'record_id', entry->'payload')
        on conflict (user_id, record_id) do nothing returning * into current_row;
      if not found then
        select * into current_row from public.journey_records
          where user_id = owner_id and record_id = entry->>'record_id' for update;
        is_new := false;
      end if;
    end if;
    if not is_new and current_row.payload is distinct from entry->'payload' then
      if current_row.revision <> expected then
        raise exception using errcode = '40001', message = 'journey_record_conflict';
      end if;
      update public.journey_records set payload = entry->'payload',
        revision = revision + 1, updated_at = now()
        where user_id = owner_id and record_id = entry->>'record_id'
        returning * into current_row;
    end if;
    result := result || jsonb_build_array(jsonb_build_object(
      'record_id', current_row.record_id, 'revision', current_row.revision, 'payload', current_row.payload
    ));
  end loop;
  return result;
end;
$$;

revoke all on function public.sync_journey_records(uuid, jsonb) from public, anon;
grant execute on function public.sync_journey_records(uuid, jsonb) to authenticated;

commit;
