import {
  readJourneyCache, writeJourneyCache, saveLocalRecord, mergeCloudRecords,
  getPendingRecords, acknowledgeCloudWrites, resolveCloudConflicts,
  importGuestRecords, accountStorageKey, createJourneyRecordId,
} from "./journeyStorage";
import { JOURNEY_HISTORY_KEY } from "../data/storageKeys";
import { readCloudConfig } from "../services/supabaseClient";

const record = { id: "survey-one", type: "initial_survey", savedAt: "2026-10-12T00:00:00Z", surveyAnswers: { dryness: "some" } };
beforeEach(() => localStorage.clear());

test("guest and each account use separate caches, without automatic guest import", () => {
  const guest = saveLocalRecord(readJourneyCache(localStorage), record, false);
  writeJourneyCache(localStorage, null, guest);
  expect(JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY))).toEqual([record]);
  expect(readJourneyCache(localStorage, "alice").records).toEqual([]);
  const alice = saveLocalRecord(readJourneyCache(localStorage, "alice"), { ...record, id: "alice-record" }, true);
  writeJourneyCache(localStorage, "alice", alice);
  expect(readJourneyCache(localStorage, "bob").records).toEqual([]);
  expect(readJourneyCache(localStorage).records).toEqual([record]);
  expect(accountStorageKey("alice")).not.toBe(accountStorageKey("bob"));
});

test("explicit import preserves account records and is repeatable without duplicates", () => {
  const existing = { ...record, surveyAnswers: { dryness: "changed" } };
  const cache = saveLocalRecord(readJourneyCache(localStorage, "alice"), existing, true);
  expect(importGuestRecords(cache, [record]).records).toEqual([existing]);
  expect(importGuestRecords(importGuestRecords(cache, [{ ...record, id: "new" }]), [{ ...record, id: "new" }]).records).toHaveLength(2);
});

test("edits made during an upload stay queued and use the acknowledged server revision", () => {
  const cache = saveLocalRecord(readJourneyCache(localStorage, "alice"), record, true);
  const sent = getPendingRecords(cache);
  const newer = saveLocalRecord(cache, { ...record, surveyAnswers: { dryness: "updated" } }, true);
  const acked = acknowledgeCloudWrites(newer, sent, [{ record_id: record.id, revision: 1 }]);
  expect(acked.dirtyIds).toEqual([record.id]);
  expect(getPendingRecords(acked)[0].expected_revision).toBe(1);
  expect(getPendingRecords(acked)[0].payload.surveyAnswers.dryness).toBe("updated");
});

test("server JSON key order does not create a spurious conflict after a lost upload acknowledgement", () => {
  const cache = saveLocalRecord(readJourneyCache(localStorage, "alice"), record, true);
  const reordered = Object.fromEntries(Object.entries(record).reverse());
  const merged = mergeCloudRecords(cache, [{ record_id: record.id, revision: 1, payload: reordered }]);
  expect(merged.dirtyIds).toEqual([]);
  expect(merged.conflicts).toEqual([]);
  expect(merged.revisions[record.id]).toBe(1);
});

test("newer server edits preserve local pending data until explicit conflict resolution", () => {
  const cache = { ...saveLocalRecord(readJourneyCache(localStorage, "alice"), record, true), revisions: { [record.id]: 1 } };
  const row = { record_id: record.id, revision: 2, payload: { ...record, surveyAnswers: { dryness: "server" } } };
  const merged = mergeCloudRecords(cache, [row]);
  expect(merged.records[0]).toEqual(record);
  expect(merged.conflicts).toEqual([row]);
  expect(getPendingRecords(merged)).toEqual([]);
  const cloud = resolveCloudConflicts(merged, "cloud");
  expect(cloud.records[0]).toEqual(row.payload);
  expect(cloud.dirtyIds).toEqual([]);
  const local = resolveCloudConflicts(merged, "local");
  expect(local.records[0]).toEqual(record);
  expect(getPendingRecords(local)[0].expected_revision).toBe(2);
});

test("same-version pending edits and new cloud records merge without losing either", () => {
  const cache = { ...saveLocalRecord(readJourneyCache(localStorage, "alice"), record, true), revisions: { [record.id]: 1 } };
  const merged = mergeCloudRecords(cache, [
    { record_id: record.id, revision: 1, payload: { ...record, surveyAnswers: {} } },
    { record_id: "another", revision: 1, payload: { ...record, id: "another", savedAt: "2026-10-13T00:00:00Z" } },
  ]);
  expect(merged.records).toHaveLength(2);
  expect(merged.conflicts).toEqual([]);
  expect(merged.dirtyIds).toContain(record.id);
});

test("corrupt cache and failed writes are surfaced rather than reported as saved", () => {
  localStorage.setItem(accountStorageKey("alice"), "invalid-json");
  expect(() => readJourneyCache(localStorage, "alice")).toThrow();
  expect(() => writeJourneyCache({ setItem: () => { throw new Error("disk full"); } }, "alice", { records: [record] })).toThrow("disk full");
});

test("record identifiers remain distinct across successive journeys", () => {
  const ids = new Set(Array.from({ length: 100 }, () => createJourneyRecordId("feedback")));
  expect(ids.size).toBe(100);
});

test("configuration rejects incomplete settings, secret keys and credential-bearing URLs", () => {
  expect(readCloudConfig({}).configured).toBe(false);
  expect(readCloudConfig({ REACT_APP_SUPABASE_URL: "https://example.supabase.co" }).configured).toBe(false);
  expect(readCloudConfig({ REACT_APP_SUPABASE_URL: "https://example.supabase.co", REACT_APP_SUPABASE_PUBLISHABLE_KEY: "sb_secret_private" }).configured).toBe(false);
  expect(readCloudConfig({ REACT_APP_SUPABASE_URL: "https://user:pass@example.supabase.co", REACT_APP_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_public" }).configured).toBe(false);
  expect(readCloudConfig({ REACT_APP_SUPABASE_URL: "https://example.supabase.co", REACT_APP_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_public" }).configured).toBe(true);
});
