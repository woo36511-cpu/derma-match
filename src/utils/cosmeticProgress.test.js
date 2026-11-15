import { getCosmeticNextStep } from "./cosmeticProgress";
import { getCosmeticObservationConfig } from "../data/productObservationGoals";

test("next action distinguishes no remaining symptom, partial improvement, no change and irritation", () => {
  const config = getCosmeticObservationConfig("dryness");
  const study = { baselineValue: 5, baselineComfort: 2, choice: "start" };
  const followUp = { reaction: "none", used: "recommended", frequency: "daily", useDays: "14_27", otherChanges: "no", comfort: 2 };
  const status = (value, changes = {}) => getCosmeticNextStep({ ...study, followUp: { ...followUp, value, ...changes } }, config).status;
  expect([0, 2, 5, 6].map(value => status(value))).toEqual(["resolved", "partial", "unchanged", "worse"]);
  expect(status(0, { reaction: "irritation" })).toBe("irritation");
  expect(status(0, { comfort: 3 })).toBe("worse");
  expect(status(0, { otherChanges: "yes" })).toBe("uncompared");
  expect(status(0, { used: "existing" })).toBe("uncompared");
  expect(getCosmeticNextStep({ ...study, earlyCheck: { reaction: "stopped_irritation" } }, config).status).toBe("irritation");
});
