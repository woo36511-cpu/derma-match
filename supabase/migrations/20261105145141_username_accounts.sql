begin;
create schema if not exists dearsince_private;
revoke all on schema dearsince_private from public, anon, authenticated;
grant usage on schema dearsince_private to service_role;

create table dearsince_private.username_accounts (
  username text primary key check (username ~ '^[a-z0-9][a-z0-9_]{3,19}$'),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  recovery_digest text not null check (recovery_digest ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table dearsince_private.username_rate_limits (
  bucket text primary key check (length(bucket) between 1 and 200),
  attempts integer not null check (attempts > 0),
  resets_at timestamptz not null
);
create index username_rate_limits_expiry on dearsince_private.username_rate_limits(resets_at);
alter table dearsince_private.username_accounts enable row level security;
alter table dearsince_private.username_rate_limits enable row level security;
revoke all on all tables in schema dearsince_private from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema dearsince_private to service_role;

create function public.username_auth_limit(p_bucket text, p_limit integer, p_seconds integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
  if p_limit not between 1 and 1000 or p_seconds not between 1 and 86400 then
    raise exception using errcode='22023', message='invalid_limit';
  end if;
  delete from dearsince_private.username_rate_limits where resets_at < now() - interval '1 day';
  insert into dearsince_private.username_rate_limits(bucket, attempts, resets_at)
  values(p_bucket, 1, now() + make_interval(secs => p_seconds))
  on conflict(bucket) do update set
    attempts = case when username_rate_limits.resets_at <= now() then 1 else least(username_rate_limits.attempts + 1, 1000000) end,
    resets_at = case when username_rate_limits.resets_at <= now() then now() + make_interval(secs => p_seconds) else username_rate_limits.resets_at end
  returning attempts into n;
  return n <= p_limit;
end $$;

create function public.username_account_lookup(p_username text)
returns uuid language sql stable security invoker set search_path = '' as $$
  select user_id from dearsince_private.username_accounts where username = p_username;
$$;
create function public.username_for_user(p_user_id uuid)
returns text language sql stable security invoker set search_path = '' as $$
  select username from dearsince_private.username_accounts where user_id = p_user_id;
$$;
create function public.register_username(p_username text, p_user_id uuid, p_digest text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  insert into dearsince_private.username_accounts(username,user_id,recovery_digest) values(p_username,p_user_id,p_digest);
  return true;
exception when unique_violation then return false;
end $$;
create function public.replace_username_recovery(p_user_id uuid, p_digest text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update dearsince_private.username_accounts set recovery_digest=p_digest, updated_at=now() where user_id=p_user_id;
  return found;
end $$;
create function public.consume_username_recovery(p_username text, p_old_digest text, p_new_digest text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare owner_id uuid;
begin
  update dearsince_private.username_accounts set recovery_digest=p_new_digest, updated_at=now()
    where username=p_username and recovery_digest=p_old_digest returning user_id into owner_id;
  return owner_id;
end $$;
create function public.restore_username_recovery(p_user_id uuid, p_expected_digest text, p_digest text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update dearsince_private.username_accounts set recovery_digest=p_digest, updated_at=now()
    where user_id=p_user_id and recovery_digest=p_expected_digest;
  return found;
end $$;

revoke all on function public.username_auth_limit(text,integer,integer) from public,anon,authenticated;
revoke all on function public.username_account_lookup(text) from public,anon,authenticated;
revoke all on function public.username_for_user(uuid) from public,anon,authenticated;
revoke all on function public.register_username(text,uuid,text) from public,anon,authenticated;
revoke all on function public.replace_username_recovery(uuid,text) from public,anon,authenticated;
revoke all on function public.consume_username_recovery(text,text,text) from public,anon,authenticated;
revoke all on function public.restore_username_recovery(uuid,text,text) from public,anon,authenticated;
grant execute on function public.username_auth_limit(text,integer,integer) to service_role;
grant execute on function public.username_account_lookup(text) to service_role;
grant execute on function public.username_for_user(uuid) to service_role;
grant execute on function public.register_username(text,uuid,text) to service_role;
grant execute on function public.replace_username_recovery(uuid,text) to service_role;
grant execute on function public.consume_username_recovery(text,text,text) to service_role;
grant execute on function public.restore_username_recovery(uuid,text,text) to service_role;
commit;
