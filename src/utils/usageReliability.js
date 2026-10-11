import { buildFeedbackDataQuality, buildFeedbackConfounders } from "./feedbackAnalysis";

export const RELIABILITY_RULE_VERSION = "usage-record-v1";

function levelFor(score) {
  return score >= 0.8 ? "high" : score >= 0.55 ? "medium" : "low";
}

export function buildUsageReliability({
  feedbackAnswers = {}, actualProductUsage = [], skinComparison = null,
} = {}) {
  const quality = buildFeedbackDataQuality(feedbackAnswers);
  const confounders = buildFeedbackConfounders(feedbackAnswers);
  const reasons = [];
  if (!quality.complete) reasons.push("missing_context");
  if (!skinComparison?.complete) reasons.push("incomplete_comparison");
  if (confounders.confounderCount > 0) reasons.push("confounding_changes");

  const productReliability = actualProductUsage.map((record) => {
    const usage = record.actualUsage || {};
    const status = usage.status ?? record.usageStatus ?? "unknown";
    const neverUsed = status === "never_used";
    const missingFields = [];
    const knownStatus = ["consistent", "occasional", "stopped", "never_used"].includes(status);
    if (!knownStatus) missingFields.push("status");
    if (!neverUsed) {
      if (!["recommended", "less", "more"].includes(usage.amount)) missingFields.push("amount");
      if (!["daily", "twice_daily", "few_weekly", "rare"].includes(usage.frequency)) missingFields.push("frequency");
      if (!Number.isInteger(usage.durationDays) || usage.durationDays <= 0 || usage.durationDays > 3650) missingFields.push("durationDays");
      if (typeof usage.stoppedEarly !== "boolean") missingFields.push("stoppedEarly");
      if (usage.stoppedEarly && !["irritation", "no_benefit", "other"].includes(usage.stopReason)) missingFields.push("stopReason");
      if (typeof usage.irritationObserved !== "boolean") missingFields.push("irritationObserved");
      if (typeof usage.usedAsDirected !== "boolean") missingFields.push("usedAsDirected");
    }
    const inconsistent = status === "stopped" && usage.stoppedEarly === false;
    let score = quality.confidenceScore;
    if (missingFields.length > 0) score = Math.min(score, 0.5);
    if (!skinComparison?.complete) score = Math.min(score, 0.4);
    if (status === "occasional") score = Math.min(score, 0.65);
    if (status === "stopped" || usage.stoppedEarly === true) score = Math.min(score, 0.5);
    if (usage.frequency === "few_weekly") score = Math.min(score, 0.65);
    if (usage.frequency === "rare") score = Math.min(score, 0.35);
    if (usage.durationDays < 7) score = Math.min(score, 0.35);
    else if (usage.durationDays < 14) score = Math.min(score, 0.65);
    if (usage.usedAsDirected === false) score = Math.min(score, 0.65);
    if (!knownStatus || neverUsed || inconsistent) score = 0;
    score = Number(score.toFixed(2));
    return {
      productId: record.productId,
      category: record.category,
      status,
      score,
      level: levelFor(score),
      missingFields,
      inconsistent,
      exposureKnown: knownStatus && (neverUsed || !missingFields.includes("durationDays")),
      irritationObserved: usage.irritationObserved ?? null,
      stoppedEarly: usage.stoppedEarly ?? null,
    };
  });

  // Stopped products can still have influenced the interval. Only an explicit
  // never-used answer excludes a product from exposure attribution.
  const exposed = productReliability.filter((item) => item.status !== "never_used");
  if (productReliability.length === 0 || productReliability.some((item) => item.missingFields.length > 0)) {
    reasons.push("missing_product_usage");
  }
  if (exposed.length > 1) reasons.push("multiple_products");
  if (productReliability.some((item) => item.inconsistent)) reasons.push("inconsistent_usage");
  if (productReliability.some((item) => item.stoppedEarly)) reasons.push("stopped_early");

  let score = Math.min(quality.confidenceScore,
    ...exposed.map((item) => item.score));
  if (!skinComparison?.complete) score = Math.min(score, 0.4);
  if (exposed.length === 0) score = 0;
  const unknownProduct = productReliability.some((item) => item.status === "unknown");
  const productAttributionReady = exposed.length === 1 && !unknownProduct &&
    quality.complete && confounders.confounderCount === 0 &&
    skinComparison?.complete === true && exposed[0].level === "high";

  return {
    ruleVersion: RELIABILITY_RULE_VERSION,
    score: Number(score.toFixed(2)),
    level: levelFor(score),
    reasons,
    productReliability,
    usedProductCount: exposed.filter((item) => item.status !== "unknown").length,
    productAttributionReady,
    attributionScope: productAttributionReady ? "single_product_association" : "routine_observation",
    // A rule-based completeness score is not a causal estimate or clinical probability.
    automaticScoreAdjustmentReady: false,
  };
}
