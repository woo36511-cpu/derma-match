import { collectPersonalProductFeedback } from "./personalProductFeedback";
import { getObservationKind, getObservationStudy, isProductObservation, makeAnalysisConsent } from "./moisturizerObservation";

// Offline readiness check. Inputs must be current saved records from authenticated accounts.
export function getCohortReadiness(rows, now = Date.now()) {
  const latest = new Map();
  for (const { accountKey, record } of rows) {
    if (typeof accountKey !== "string" || !accountKey.trim() || !record?.id || !isProductObservation(record)) continue;
    const savedAt = Date.parse(record.savedAt);
    if (!Number.isFinite(savedAt) || savedAt > now) continue;
    const key = JSON.stringify([accountKey, record.id]);
    if (!latest.has(key) || latest.get(key).savedAt <= savedAt) latest.set(key, { record, accountKey, savedAt });
  }
  const groups = new Map();
  for (const { record, accountKey } of latest.values()) {
    const study = getObservationStudy(record);
    if (!getObservationKind(study?.protocol) || !study?.analysisConsent || !study.formulaVerifiedAt ||
        !Number.isInteger(study.hydrationLevel) || study.hydrationLevel < 1 || study.hydrationLevel > 10 || typeof study.sensitive !== "boolean") continue;
    const grant = study.analysisConsent;
    const grantedAt = Date.parse(grant.grantedAt);
    if (!Number.isFinite(grantedAt) || grantedAt > now ||
        grant.version !== makeAnalysisConsent(true, true, grant.grantedAt, study.protocol).version) continue;
    const comparison = collectPersonalProductFeedback([record]).comparisons.get(study.productId)?.[0];
    if (!comparison || comparison.recordedAt > now) continue;
    const key = JSON.stringify([study.productId, study.formulaVerifiedAt, study.protocol, comparison.route, comparison.area, study.hydrationLevel, study.sensitive]);
    const people = groups.get(key) ?? new Map();
    const previous = people.get(accountKey);
    if (!previous || previous.recordedAt < comparison.recordedAt) people.set(accountKey, comparison);
    groups.set(key, people);
  }
  // Report readiness only. No participant IDs, small cohort counts, or rank adjustments are returned.
  return { readyGroups: [...groups.values()].filter(people => people.size >= 30).length };
}
