export const ROUTINE_INTAKE_VERSION = "routine-intake-v1";

const slots = ["cleanser", "toner", "serum", "cream", "sunscreen"];
const isOneOf = (value, choices) => choices.includes(value);

// Keep the bands used by this survey, without storing another copy of product names.
export function readRoutineSurveyContext(value) {
  if (value?.version !== ROUTINE_INTAKE_VERSION || !isOneOf(value.use, ["yes", "no", "skip"])) return null;
  const context = { version: ROUTINE_INTAKE_VERSION, use: value.use };
  if (value.use !== "yes") return context;
  for (const slot of slots) {
    const row = value[slot];
    if (!row) continue;
    const bands = slot === "cleanser" ? ["comfort", "other", "unknown"] : ["light", "balanced", "higher_hydration", "unknown"];
    context[slot] = { band: isOneOf(row.band, bands) ? row.band : "unknown",
      ...(row.fullerFinish === true && { fullerFinish: true }),
      ...(slot !== "cleanser" && row.listedHumectants === true && { listedHumectants: true }),
      reaction: isOneOf(row.reaction, ["heavy", "wash_tight", "moisture_tight"]) ? row.reaction : null };
  }
  if (isOneOf(value.serumPreference, ["keep", "compare"])) context.serumPreference = value.serumPreference;
  return context;
}

export const hasMoistureSupport = context => [context?.toner, context?.serum, context?.cream].some(row => row?.band === "higher_hydration" || row?.listedHumectants);
export const hasPossibleCoating = context => [context?.toner, context?.serum, context?.cream, context?.sunscreen].some(row => row?.fullerFinish || row?.reaction === "heavy");
