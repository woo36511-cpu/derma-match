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
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated;
      insert into auth.users values ('${alice}'), ('${bob}');
    `);
    await db.exec(fs.readFileSync("supabase/migrations/202610120001_journey_records.sql", "utf8"));
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
    console.log("Journey SQL checks passed: RLS isolation, ownership guard, revisions, idempotence, atomic rollback, validation and anonymous denial.");
  } finally { await db.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
