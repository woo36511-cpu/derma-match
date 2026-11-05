const assert = require("node:assert/strict");
const fs = require("node:fs");
const { PGlite } = require("@electric-sql/pglite");

async function main() {
  const db = new PGlite();
  const alice = "11111111-1111-4111-8111-111111111111";
  const bob = "22222222-2222-4222-8222-222222222222";
  try {
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create role service_role nologin bypassrls;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated;
      insert into auth.users values ('${alice}'), ('${bob}');
    `);
    await db.exec(fs.readFileSync("supabase/migrations/20261105052119_journey_records.sql", "utf8"));
    await db.exec(fs.readFileSync("supabase/migrations/20261105145141_username_accounts.sql", "utf8"));
    const asUser = async (id) => {
      await db.exec("reset role; set role authenticated;");
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
    };
    const save = async (id, entries) => (await db.query(
      "select public.sync_journey_records($1::uuid, $2::jsonb) as records", [id, JSON.stringify(entries)],
    )).rows[0].records;
    const record = { id: "feedback-main", type: "feedback", savedAt: "2026-10-12T00:00:00Z", outcome: { dryness: 5 } };
    const entry = { record_id: record.id, expected_revision: 0, payload: record };
    await asUser(alice);
    assert.equal((await save(alice, [entry]))[0].revision, 1);
    assert.equal((await save(alice, [entry]))[0].revision, 1, "retry is idempotent");
    const changed = { ...entry, expected_revision: 1, payload: { ...record, outcome: { dryness: 3 } } };
    assert.equal((await save(alice, [changed]))[0].revision, 2);
    await assert.rejects(save(alice, [{ ...changed, payload: record }]), { code: "40001" });
    assert.equal((await db.query("select payload from public.journey_records")).rows[0].payload.outcome.dryness, 3);
    const fresh = { record_id: "a-new", expected_revision: 0, payload: { id: "a-new", type: "initial_survey" } };
    await assert.rejects(save(alice, [fresh, { ...changed, payload: record }]), { code: "40001" });
    assert.equal((await db.query("select count(*)::integer as count from public.journey_records")).rows[0].count, 1, "conflicting batch rolls back all writes");
    await assert.rejects(save(alice, [{ record_id: "bad", expected_revision: 0, payload: { id: null, type: "feedback" } }]), { code: "23514" });
    await asUser(bob);
    assert.equal((await db.query("select * from public.journey_records")).rows.length, 0, "other user's records are invisible");
    await assert.rejects(save(alice, [fresh]), { code: "42501" }, "owner mismatch is rejected");
    await assert.rejects(db.query("insert into public.journey_records(user_id,record_id,payload) values ($1,$2,$3::jsonb)", [alice, record.id, JSON.stringify(record)]), { code: "42501" });
    assert.equal((await save(bob, [entry]))[0].revision, 1, "same record ID remains account scoped");
    await db.exec("reset role; set role anon;");
    await assert.rejects(db.query("select * from public.journey_records"), { code: "42501" });
    await assert.rejects(save(alice, [entry]), { code: "42501" });
    await assert.rejects(db.query("select public.username_account_lookup('test_user')"), { code: "42501" });
    await asUser(alice);
    await assert.rejects(db.query("select * from dearsince_private.username_accounts"), { code: "42501" });
    await assert.rejects(db.query("select public.register_username('test_user',$1,$2)", [alice, "a".repeat(64)]), { code: "42501" });
    await db.exec("reset role; set role service_role;");
    const a = "a".repeat(64), b = "b".repeat(64), c = "c".repeat(64);
    assert.equal((await db.query("select public.register_username('test_user',$1,$2) as ok", [alice,a])).rows[0].ok, true);
    assert.equal((await db.query("select public.register_username('test_user',$1,$2) as ok", [bob,b])).rows[0].ok, false, "username uniqueness");
    assert.equal((await db.query("select public.register_username('another_user',$1,$2) as ok", [alice,b])).rows[0].ok, false, "one username per account");
    assert.equal((await db.query("select public.consume_username_recovery('test_user',$1,$2) as owner", [a,b])).rows[0].owner, alice);
    assert.equal((await db.query("select public.consume_username_recovery('test_user',$1,$2) as owner", [a,c])).rows[0].owner, null, "recovery code is single use");
    assert.equal((await db.query("select public.restore_username_recovery($1,$2,$3) as ok", [alice,c,a])).rows[0].ok, false, "stale compensation cannot overwrite newer recovery state");
    assert.equal((await db.query("select public.restore_username_recovery($1,$2,$3) as ok", [alice,b,a])).rows[0].ok, true);
    for (const expected of [true,true,false]) assert.equal((await db.query("select public.username_auth_limit('qa-bucket',2,60) as ok")).rows[0].ok, expected);
    await db.exec("update dearsince_private.username_rate_limits set resets_at=now()-interval '1 second' where bucket='qa-bucket'");
    assert.equal((await db.query("select public.username_auth_limit('qa-bucket',2,60) as ok")).rows[0].ok, true);
    console.log("Journey SQL checks passed: RLS isolation, ownership guard, revisions, idempotence, atomic rollback, validation, anonymous denial, private username registry, single-use recovery and throttling.");
  } finally { await db.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
