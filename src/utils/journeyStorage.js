import { JOURNEY_HISTORY_KEY, SAVED_SURVEY_KEY } from "../data/storageKeys";

export const accountStorageKey = (ownerId) => `dearsince_account_records:${ownerId}`;
const empty = () => ({ records: [], revisions: {}, dirtyIds: [], conflicts: [] });
const validRecord = (record) => record && typeof record.id === "string" &&
  record.id.length > 0 && record.id.length <= 200 &&
  !["__proto__", "constructor", "prototype"].includes(record.id) &&
  ["initial_survey", "feedback"].includes(record.type);
const canonical = (value) => Array.isArray(value) ? value.map(canonical) : value && typeof value === "object"
  ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])])) : value;
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

export function sortJourneyRecords(records) {
  return [...records].sort((a, b) => (a.savedAt || "").localeCompare(b.savedAt || "") || a.id.localeCompare(b.id));
}

export function getSavedSurvey(records) {
  return [...records].reverse().find((record) => record.type === "initial_survey" && record.source !== "quick" && record.surveyAnswers) || null;
}

export function readJourneyCache(storage, ownerId = null) {
  if (ownerId) {
    const cache = JSON.parse(storage.getItem(accountStorageKey(ownerId)) || "null");
    if (!cache) return empty();
    return {
      records: Array.isArray(cache.records) ? cache.records.filter(validRecord) : [],
      revisions: cache.revisions || {},
      dirtyIds: Array.isArray(cache.dirtyIds) ? cache.dirtyIds : [],
      conflicts: Array.isArray(cache.conflicts) ? cache.conflicts : [],
    };
  }
  const history = JSON.parse(storage.getItem(JOURNEY_HISTORY_KEY) || "[]");
  const records = Array.isArray(history) ? history.filter(validRecord) : [];
  const saved = JSON.parse(storage.getItem(SAVED_SURVEY_KEY) || "null");
  if (validRecord(saved) && !records.some((record) => record.id === saved.id)) records.push(saved);
  return { ...empty(), records };
}

export function writeJourneyCache(storage, ownerId, cache) {
  if (ownerId) storage.setItem(accountStorageKey(ownerId), JSON.stringify(cache));
  else {
    storage.setItem(JOURNEY_HISTORY_KEY, JSON.stringify(cache.records));
    const survey = getSavedSurvey(cache.records);
    if (survey) storage.setItem(SAVED_SURVEY_KEY, JSON.stringify(survey));
  }
}

export function saveLocalRecord(cache, record, signedIn) {
  if (!validRecord(record)) throw new Error("invalid_journey_record");
  const exists = cache.records.some((item) => item.id === record.id);
  return {
    ...cache,
    records: exists ? cache.records.map((item) => item.id === record.id ? record : item) : [...cache.records, record],
    dirtyIds: signedIn ? [...new Set([...cache.dirtyIds, record.id])] : [],
  };
}

export function mergeCloudRecords(cache, rows) {
  const next = { ...cache, records: [...cache.records], revisions: { ...cache.revisions }, dirtyIds: [...cache.dirtyIds], conflicts: [] };
  for (const row of rows) {
    if (!validRecord(row.payload) || row.payload.id !== row.record_id) continue;
    const local = next.records.find((record) => record.id === row.record_id);
    const dirty = next.dirtyIds.includes(row.record_id);
    if (dirty && local && !equal(local, row.payload)) {
      if ((next.revisions[row.record_id] || 0) !== row.revision) next.conflicts.push(row);
      continue;
    }
    next.records = local ? next.records.map((record) => record.id === row.record_id ? row.payload : record) : [...next.records, row.payload];
    next.revisions[row.record_id] = row.revision;
    next.dirtyIds = next.dirtyIds.filter((id) => id !== row.record_id);
  }
  next.records = sortJourneyRecords(next.records);
  return next;
}

export function getPendingRecords(cache) {
  return cache.dirtyIds.filter((id) => !cache.conflicts.some((row) => row.record_id === id))
    .map((id) => ({ record_id: id, expected_revision: cache.revisions[id] || 0, payload: cache.records.find((record) => record.id === id) }))
    .filter((row) => row.payload);
}

export function acknowledgeCloudWrites(cache, sent, received) {
  const next = { ...cache, revisions: { ...cache.revisions }, dirtyIds: [...cache.dirtyIds] };
  for (const row of received) {
    const pending = sent.find((item) => item.record_id === row.record_id);
    if (!pending) continue;
    next.revisions[row.record_id] = row.revision;
    const current = cache.records.find((record) => record.id === row.record_id);
    // A newer edit made while uploading must remain queued.
    if (equal(current, pending.payload)) next.dirtyIds = next.dirtyIds.filter((id) => id !== row.record_id);
  }
  return next;
}

export function resolveCloudConflicts(cache, choice) {
  let next = { ...cache, records: [...cache.records], revisions: { ...cache.revisions }, dirtyIds: [...cache.dirtyIds] };
  for (const row of cache.conflicts) {
    next.revisions[row.record_id] = row.revision;
    if (choice === "cloud") {
      next.records = next.records.map((record) => record.id === row.record_id ? row.payload : record);
      next.dirtyIds = next.dirtyIds.filter((id) => id !== row.record_id);
    }
  }
  return { ...next, conflicts: [], records: sortJourneyRecords(next.records) };
}

export function importGuestRecords(cache, guestRecords) {
  return guestRecords.reduce((result, record) => {
    // Never overwrite existing account history during an import.
    return result.records.some((item) => item.id === record.id) ? result : saveLocalRecord(result, record, true);
  }, cache);
}

export function createJourneyRecordId(prefix) {
  const suffix = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}
