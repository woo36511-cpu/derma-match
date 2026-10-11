// Increment when survey scoring or normalization changes. Scores describe
// self-reported signals, not measured skin condition or a diagnosis.
export const SKIN_MEASUREMENT_VERSION = "survey-8-axis-v1";

export const SKIN_STATE_AXES = [
  { key: "dryness", label: "건조함" },
  { key: "oiliness", label: "번들거림" },
  { key: "dehydration", label: "속당김" },
  { key: "sensitivity", label: "민감 반응" },
  { key: "barrierStress", label: "장벽 부담" },
  { key: "cloggedPores", label: "모공 막힘" },
  { key: "acneActivity", label: "트러블 활동" },
  { key: "inflammation", label: "붉은 트러블" },
];

export function normalizeSkinState(state = null) {
  return Object.fromEntries(
    SKIN_STATE_AXES.map(({ key }) => {
      const value = state?.[key];
      return [key, typeof value === "number" && Number.isFinite(value) &&
        value >= 0 && value <= 10 ? value : null];
    }),
  );
}

export function buildSkinMeasurement(state, measuredAt, source = "survey") {
  return {
    schemaVersion: 1,
    measurementVersion: SKIN_MEASUREMENT_VERSION,
    scale: { min: 0, max: 10, higherMeans: "more_reported_signals" },
    measuredAt: measuredAt ?? null,
    source,
    values: normalizeSkinState(state),
  };
}

export function getRecordSkinMeasurement(record) {
  const stored = record?.type === "feedback"
    ? record.outcome?.skinComparison?.after
    : record?.skinMeasurement;
  if (stored) return stored;
  // Version 2 records used the same survey and normalization.
  const state = record?.type === "feedback"
    ? record.outcome?.followUpSkinState
    : record?.result?.skinState;
  return buildSkinMeasurement(state, record?.savedAt, state ? "legacy_survey" : "unmeasured");
}

export function buildSkinComparison(before, after, baselineRecordId = null) {
  const sameVersion = before?.measurementVersion === after?.measurementVersion;
  const beforeValues = normalizeSkinState(before?.values);
  const afterValues = normalizeSkinState(after?.values);
  const delta = Object.fromEntries(SKIN_STATE_AXES.map(({ key }) => [
    key,
    sameVersion && beforeValues[key] !== null && afterValues[key] !== null
      ? afterValues[key] - beforeValues[key] : null,
  ]));
  const comparableAxisCount = Object.values(delta).filter((value) => value !== null).length;
  return {
    schemaVersion: 1,
    baselineRecordId,
    before,
    after,
    delta,
    comparableAxisCount,
    complete: comparableAxisCount === SKIN_STATE_AXES.length,
    comparisonStatus: !sameVersion ? "version_mismatch" : comparableAxisCount === 8
      ? "complete" : comparableAxisCount > 0 ? "partial" : "unmeasured",
  };
}

export function getRecordSkinComparison(record, previousRecord = null) {
  if (record?.outcome?.skinComparison) return record.outcome.skinComparison;
  const before = record?.outcome?.baselineSkinState
    ? buildSkinMeasurement(record.outcome.baselineSkinState, previousRecord?.savedAt, "legacy_survey")
    : getRecordSkinMeasurement(previousRecord);
  return buildSkinComparison(before, getRecordSkinMeasurement(record), previousRecord?.id ?? null);
}
