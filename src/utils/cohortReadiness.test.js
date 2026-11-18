import { getCohortReadiness } from "./cohortReadiness";

const version = "skin-product-internal-analysis-v2";
const make = i => ({
  accountKey: `account-${i}`,
  record: {
    id: `observation-${i}`, source: "skin_product_observation", assessmentOnly: true, savedAt: "2026-11-04T00:00:00Z",
    productObservation: {
      protocol: "serum-cheek-tightness-v1", productId: 5, formulaVerifiedAt: "2026-10-01", hydrationLevel: 6, sensitive: false,
      choice: "start", baselineDays: 5, analysisConsent: { version, grantedAt: "2026-10-20T00:00:00Z" },
      followUp: { days: 1, used: "recommended", frequency: "daily", reaction: "none", otherChanges: "no", elapsedDays: 14, recordedAt: "2026-11-04T00:00:00Z" },
    },
  },
});

test("readiness needs thirty distinct, consented and comparable accounts; revocation takes precedence", () => {
  const rows = Array.from({ length: 30 }, (_, i) => make(i));
  expect(getCohortReadiness(rows.map(row => ({ ...row, accountKey: "same" })))).toEqual({ readyGroups: 0 });
  expect(getCohortReadiness(rows)).toEqual({ readyGroups: 1 });
  const { accountKey, record } = rows[0];
  const revoked = { accountKey, record: { ...record, savedAt: "2026-11-05T00:00:00Z",
    productObservation: { ...record.productObservation, analysisConsent: null } } };
  expect(getCohortReadiness([revoked, ...rows])).toEqual({ readyGroups: 0 });
});
