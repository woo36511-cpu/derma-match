import { getRankedProductCandidates } from "./routineRecommendation";
import { OBSERVATION_KINDS, buildProductFollowUp, describeTightnessChange, getObservationKind } from "./moisturizerObservation";

jest.mock("../data/reviewedProductObservations.json", () => []);
const entries = require("../data/reviewedProductObservations.json");

test("reviewed records change eligible ranking by only the small allowed bonus", () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-11-12T00:00:00Z"));
  try {
    const context = { mainConcern: "none", basicOnly: true, isSensitive: false, observationKinds: ["cream", "serum", "cleanser"] };
    for (const [kind, config] of Object.entries(OBSERVATION_KINDS)) {
      const closeFit = Array.from({ length: 10 }, (_, i) => i + 1).map(level => {
        const ranked = getRankedProductCandidates(kind, level, context);
        const alternatives = ranked.slice(1).filter(p => p.hydrationLevel === level &&
          p.beginnerFriendly === ranked[0]?.beginnerFriendly && ranked[0]?.hydrationLevel === level);
        return { level, ranked, alternative: alternatives[0] };
      }).find(row => row.alternative);
      expect(closeFit).toBeDefined();
      const { level, ranked, alternative } = closeFit;
      const entry = { protocol: config.protocol, productId: alternative.id,
        formulaVerifiedAt: alternative.evidence.lastVerifiedAt, hydrationLevel: level, sensitive: false, reviewedOn: "2026-11-12" };
      for (const mismatch of [{ formulaVerifiedAt: "2025-01-01" }, { reviewedOn: "2026-01-01" }, { sensitive: true }, { protocol: "cheek-tightness-v1" }]) {
        entries.splice(0, 1, { ...entry, ...mismatch });
        expect(getRankedProductCandidates(kind, level, context)[0].id).toBe(ranked[0].id);
      }
      entries.splice(0, 1, entry);
      expect(getRankedProductCandidates(kind, level, { ...context, observationKinds: [] })[0].id).toBe(ranked[0].id);
      expect(getRankedProductCandidates(kind, level, context)[0].id).toBe(alternative.id);
      entries.length = 0;
    }
  } finally {
    entries.length = 0;
    jest.useRealTimers();
  }
});

test("legacy afternoon records keep their question and do not reinterpret missing days as zero", () => {
  const record = { moisturizerObservation: { protocol: "cheek-tightness-v1", baselineDays: 5, startedAt: "2026-11-01T00:00:00Z" } };
  const followUp = { days: 2, used: "existing", frequency: "daily", reaction: "none", otherChanges: "no", comfort: 1 };
  expect(getObservationKind(record.moisturizerObservation.protocol).question).toMatch(/오후에/);
  expect(buildProductFollowUp(record, { ...followUp, days: null }, "2026-11-15T00:00:00Z")).toBeNull();
  const updated = buildProductFollowUp(record, followUp, "2026-11-15T00:00:00Z").moisturizerObservation;
  expect(updated.followUp.comfort).toBeUndefined();
  expect(describeTightnessChange(updated, updated.followUp, "오후 볼 당김")).toBe("2일 · 3일 줄었지만 당김이 남아 있어요");
});
