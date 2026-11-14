const fs = require("node:fs");
const MIN_RATE_GAP = 0.08;
const MAX_REACTION_GAP = 0.03;
const MIN_ENROLLED = 50;

const keyFields = ["protocol", "product_id", "formula_verified_at", "hydration_level", "sensitive", "route", "area"];
const normalize = row => ({
  ...row, product_id: Number(row.product_id), hydration_level: Number(row.hydration_level),
});
const rate = (numerator, denominator) => numerator / denominator;

function getBandSignal(start, keep) {
  const valid = row => row?.enough_to_review === true && Number.isInteger(row.enrolled) &&
    Number.isInteger(row.comparable_follow_ups) && Number.isInteger(row.known_outcomes) && Number.isInteger(row.paired_discomfort) &&
    row.enrolled >= MIN_ENROLLED && row.comparable_follow_ups <= row.known_outcomes &&
    row.known_outcomes <= row.enrolled && row.comparable_follow_ups >= row.enrolled * 0.7 &&
    row.known_outcomes >= row.enrolled * 0.8 && row.paired_discomfort >= row.enrolled * 0.7 &&
    row.paired_discomfort <= row.enrolled && row.higher_discomfort <= row.paired_discomfort &&
    ["comparable_none_without_reaction_or_stop", "irritation_reported", "stopped_reported", "higher_discomfort"]
      .every(name => Number.isInteger(row[name]) && row[name] >= 0 && row[name] <= row.enrolled) &&
    row.comparable_none_without_reaction_or_stop <= row.comparable_follow_ups;
  if (!valid(start) || !valid(keep)) return false;
  const resolved = row => rate(row.comparable_none_without_reaction_or_stop, row.comparable_follow_ups);
  if (resolved(start) - resolved(keep) < MIN_RATE_GAP) return false;
  return ["irritation_reported", "stopped_reported", "higher_discomfort"].every(field =>
    rate(start[field], start.enrolled) - rate(keep[field], keep.enrolled) <= MAX_REACTION_GAP);
}

function reportGroups(report) {
  const groups = new Map();
  for (const raw of report.rows) {
    const row = normalize(raw);
    if (row.period_start !== report.periodStart || row.period_end !== report.periodEnd) throw new Error("Aggregate rows must carry their SQL report dates.");
    if (!Number.isInteger(row.product_id) || row.product_id < 1 || !Number.isInteger(row.hydration_level) ||
      row.hydration_level < 1 || row.hydration_level > 10 || typeof row.sensitive !== "boolean" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(row.formula_verified_at) ||
      !/^([a-z-]+)-v\d+$/.test(row.protocol) || !["basic", "support", "sebum", "texture", "tone", "lines"].includes(row.route) ||
      (row.protocol.startsWith("cosmetic-") && !["forehead", "cheeks", "nose", "chin", "tzone", "whole", "other"].includes(row.area)) ||
      (!row.protocol.startsWith("cosmetic-") && (row.route !== "basic" || row.area !== null)) ||
      !["start", "keep"].includes(row.choice) || !["lower", "higher"].includes(row.baseline_band)) continue;
    const key = JSON.stringify(keyFields.map(field => row[field]));
    const group = groups.get(key) ?? new Map();
    const groupKey = row.baseline_band + ":" + row.choice;
    group.set(groupKey, group.has(groupKey) ? null : row);
    groups.set(key, group);
  }
  return groups;
}

function proposeCosmeticFit(older, newer, now = Date.now()) {
  const day = value => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "") ? Date.parse(value) : NaN;
  const periodValid = report => Array.isArray(report?.rows) && day(report.periodStart) < day(report.periodEnd);
  if (!periodValid(older) || !periodValid(newer) || day(older.periodEnd) > day(newer.periodStart) ||
    day(newer.periodEnd) > now || now - day(newer.periodEnd) > 90 * 86400000) throw new Error("Two recent, non-overlapping cohort periods are required.");
  const a = reportGroups(older), b = reportGroups(newer);
  const supports = group => group && ["lower", "higher"].every(band => getBandSignal(group.get(band + ":start"), group.get(band + ":keep")));
  const candidates = [];
  for (const [key, group] of b) {
    if (!supports(group) || !supports(a.get(key))) continue;
    const [protocol, productId, formulaVerifiedAt, hydrationLevel, sensitive, route, area] = JSON.parse(key);
    candidates.push({ protocol, productId, formulaVerifiedAt, hydrationLevel, sensitive, route, area,
      evidencePeriodEnd: newer.periodEnd, reviewBasis: "repeated_consented_observation_v1" });
  }
  return candidates.sort((x, y) => x.productId - y.productId || x.protocol.localeCompare(y.protocol));
}

module.exports = { proposeCosmeticFit };
if (require.main === module) {
  const paths = process.argv.slice(2);
  if (paths.length !== 2) throw new Error("Usage: node scripts/review-cosmetic-fit.cjs older.json newer.json");
  const [older, newer] = paths.map(path => JSON.parse(fs.readFileSync(path, "utf8")));
  console.log(JSON.stringify({ reviewRequired: true, candidates: proposeCosmeticFit(older, newer) }, null, 2));
}
