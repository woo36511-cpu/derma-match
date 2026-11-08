import { createJourneyRecordId } from "./journeyStorage";
import { buildSkinMeasurement } from "./skinStateMeasurement";
import { buildProductUsagePlan } from "./productUsagePlan";
import { snapshotCosmeticAddOn } from "./cosmeticAddOnPlan";
import { SIMPLE_CARE_VERSION } from "./simpleCarePlan";

export function buildSimpleSkinRecord(surveyAnswers, profile, routine, plan, previous = null, cosmeticPlan = null) {
  const savedAt = new Date().toISOString();
  const mainConcern = plan.answers.concern === "acne"
    ? plan.answers.shape === "blackhead" ? "blackhead_sebum" : plan.answers.shape === "closed" ? "closed_comedones" : "inflammatory_acne"
    : plan.answers.concern === "folliculitis" ? "folliculitis" : "none";
  return {
    id: previous?.id ?? createJourneyRecordId("survey"),
    journeyId: previous?.journeyId ?? createJourneyRecordId("journey"),
    source: "simple", type: "initial_survey", journeySchemaVersion: 3, savedAt,
    surveyAnswers, mainConcern, issueAnswers: {},
    additionalCare: plan.answers,
    ...(cosmeticPlan?.complete ? { cosmeticAddOn: snapshotCosmeticAddOn(cosmeticPlan) } : {}),
    symptomAssessment: {
      ruleVersion: SIMPLE_CARE_VERSION, complete: plan.complete, blockRoutine: plan.blockNewBasics,
      allowMedicationRecommendation: Boolean(plan.pharmacy), diagnosticStatus: "not_diagnosed",
      clinicalValidation: "not_validated", answers: plan.answers, title: plan.title, nextAction: plan.detail,
    },
    skinMeasurement: buildSkinMeasurement(profile.skinState, savedAt),
    result: {
      skinType: profile.skinType, hydrationLevel: profile.hydrationLevel, scores: profile.scores,
      skinState: profile.skinState, careNeeds: profile.careNeeds, lifestyleTags: profile.lifestyleTags,
      lifestyleConfounders: profile.lifestyleConfounders,
    },
    routine: Object.fromEntries(Object.entries(routine.products).map(([key, product]) => [key, product?.id ?? null])),
    productUsagePlan: buildProductUsagePlan(routine.products, profile.skinType, savedAt),
  };
}
