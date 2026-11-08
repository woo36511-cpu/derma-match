import { OBSERVATION_SURVEY_VERSION, OBSERVATION_MEASUREMENT_VERSION, observationValue, needsDrynessClarification } from "../data/observationSurvey";

// These are ordinal recommendation signals, not measured sebum/water or validated diagnostics.
export function analyzeObservationSurvey(answers = {}) {
  const value = id => observationValue(answers, id);
  const oil = value("observedOil"), dry = value("drynessArea"), reaction = value("reactionPattern"), surface = value("surfaceObservation");
  const change = value("skinChange"), moisturizer = value("moisturizerUse");
  const clarification = needsDrynessClarification(answers);
  const unresolved = clarification && !["persistent", "comfortable"].includes(value("drynessClarification"));
  const timing = clarification && !unresolved ? value("drynessClarification") : value("drynessTiming");
  const oiliness = ({ none: 0, tzone: 5, whole: 9 })[oil] ?? null;
  const dryness = dry === "none" ? 0 : ["cheeks", "whole", "tzone"].includes(dry) && !unresolved
    ? timing === "wash" || timing === "comfortable" ? 3 : timing === "day" ? 6 : timing === "persistent" ? 8 : null : null;
  const sensitivity = ({ none: 0, repeated: 8 })[reaction] ?? null;
  const barrierStress = ({ normal: 0, flakes: 4, irritated: 8, broken: 10 })[surface] ?? null;
  const currentIrritation = value("washResponse") === "stings" || moisturizer === "stings" || ["irritated", "broken"].includes(surface);
  const enough = oiliness !== null && dryness !== null && surface !== "unknown";
  const recentChange = change !== "steady";
  const status = unresolved ? "inconsistent" : !enough ? "insufficient" : recentChange ? "provisional" : "ready";
  const canRecommendBasics = enough && !unresolved && !currentIrritation;
  let skinType = "피부 성향 판단 보류";
  if (enough && !unresolved) skinType = oil === "tzone" ? "복합성 성향" : oil === "whole" && dryness > 0 ? "유분·당김 동반" : oil === "whole" ? "지성 성향" : dryness > 0 ? "건성 성향" : "중성 성향";
  const hydrationLevel = canRecommendBasics ? oiliness >= 5 && dryness >= 6 ? 5 : oiliness >= 5 ? 7 : dryness >= 6 ? 3 : 5 : null;
  const skinState = { dryness, oiliness, sensitivity, barrierStress, dehydration: null, cloggedPores: null, acneActivity: null, inflammation: null };
  const signal = value => value ?? 0;
  const careNeeds = {
    hydrationNeed: signal(dryness) * 0.8 + signal(barrierStress) * 0.2,
    lightTextureNeed: signal(oiliness) * 0.9,
    soothingNeed: signal(sensitivity) * 0.7 + signal(barrierStress) * 0.3,
    barrierCareNeed: signal(barrierStress) * 0.6 + signal(dryness) * 0.25 + signal(sensitivity) * 0.15,
    congestionCareNeed: 0, inflammationCareNeed: 0,
  };
  const evidence = [];
  if (oiliness !== null) evidence.push(oil === "none" ? "오후 기름기가 거의 없음" : oil === "tzone" ? "이마·코에 유분, 볼에는 적음" : "얼굴 전반에 유분");
  if (dryness !== null) evidence.push(dryness === 0 ? "당김 없음" : `${dry === "whole" ? "얼굴 전반" : dry === "cheeks" ? "볼·입 주변" : "이마·코"} 당김 · ${dryness >= 6 ? "낮에도 지속" : "보습 후 또는 시간이 지나면 완화"}`);
  if (reaction === "repeated") evidence.push("여러 제품에서 자극이 반복됨");
  if (reaction === "one") evidence.push("특정 제품에서만 반응 · 전반적 민감성으로 단정하지 않음");
  if (reaction === "none") evidence.push("현재 사용 제품에서 자극 경험 없음");
  if (value("washResponse") === "tight") evidence.push("세안 직후 당김 · 세안 강도도 함께 조절");
  if (surface === "flakes") evidence.push("눈에 보이는 각질 있음");
  if (currentIrritation) evidence.push("현재 따가움 또는 피부 표면 손상 응답");
  const uncertainties = [];
  if (oiliness === null) uncertainties.push("오후 유분 위치를 확인하지 못했어요.");
  if (dryness === null) uncertainties.push("당김의 위치·지속 시간을 확인하지 못했어요.");
  if (surface === "unknown") uncertainties.push("현재 벗겨짐·자극 여부를 확인하지 못했어요.");
  if (unresolved) uncertainties.push("보습 후 당김 답변이 달라 피부 성향을 정하지 않았어요.");
  if (recentChange) uncertainties.push("최근 변했거나 일정하지 않은 상태라 평소 피부타입으로 확정하지 않아요.");
  if (sensitivity === null) uncertainties.push("반복 자극 성향은 확인되지 않아 기본 후보는 자극을 적게 고려한 제품으로 좁혀요.");
  const recommendationReason = !canRecommendBasics
    ? currentIrritation ? "지금은 새 제품을 더하기보다 따가웠던 새 제품을 쉬고 편안했던 세안·보습으로 줄여요. 헐거나 진물이 나거나 자극이 계속되면 상태 확인이 필요해요." : "확인되지 않은 답을 중성으로 바꾸지 않았어요. 평소 관찰한 뒤 피부타입 답변을 보완하면 기본 제품 후보를 보여드려요. 기다리는 동안 잘 맞는 세안·보습은 유지해요."
    : oiliness >= 5 && dryness >= 6 ? "유분과 지속되는 당김을 함께 고려해 가벼운 보습을 우선해요. 유분이 보인다고 보습을 빼지는 않아요."
    : oiliness >= 5 ? "유분이 보이는 부위를 고려해 가벼운 제형을 우선해요."
    : dryness >= 6 ? "지속되는 당김을 고려해 보습을 유지하는 제형을 우선해요." : "심한 당김이나 전반적인 유분 응답이 없어 무난한 보습감을 기준으로 후보를 골라요.";
  return {
    surveyVersion: OBSERVATION_SURVEY_VERSION, measurementVersion: OBSERVATION_MEASUREMENT_VERSION,
    scores: { dry: dryness, oil: oiliness, sensitivity, barrier: barrierStress }, skinState, careNeeds, skinType, hydrationLevel,
    mainIssue: "none", issueLabel: "추가 고민에서 확인", lifestyleTags: [], lifestyleConfounders: null, lifestyleAdvice: [], solution: recommendationReason, reasons: evidence,
    observationAssessment: { status, canRecommendBasics, currentIrritation, recentChange, evidence, uncertainties, recommendationReason, moisturizerUse: moisturizer, isSensitive: sensitivity === null || sensitivity >= 5, clinicalValidation: "not_validated" },
  };
}
