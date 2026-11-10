import { observationQuestions } from "../data/observationSurvey";
import { ADAPTIVE_SURVEY_VERSION, ADAPTIVE_MEASUREMENT_VERSION, adaptiveValue, getAdaptiveObservationQuestions, resolveAdaptiveObservations, needsAdaptiveContext, resolveAdaptiveBase, recentEnvironmentOptions } from "../data/adaptiveObservationSurvey";
import { analyzeObservationSurvey } from "./analyzeObservationSurvey";

export function analyzeAdaptiveSkinSurvey(answers = {}) {
  const resolved = resolveAdaptiveObservations(answers);
  const encoded = Object.fromEntries(observationQuestions.map(question => [question.id, question.options.find(option => option.value === resolved[question.id])?.label]));
  // The contextual answers have already reconciled the original time/area mismatch.
  // Avoid reintroducing the old generic mismatch question when only one axis remains unknown.
  if (resolved.drynessTiming === "wash" && resolved.moisturizerUse === "persistent") encoded.moisturizerUse = undefined;
  if (resolved.drynessTiming === "persistent" && resolved.moisturizerUse === "comfortable") encoded.moisturizerUse = undefined;
  const profile = analyzeObservationSurvey(encoded);
  const visible = getAdaptiveObservationQuestions(answers);
  const refinements = visible.filter(question => question.supplemental && !question.contextOnly && answers[question.id]).map(question => ({ questionId: question.id, answer: answers[question.id] }));
  const oil = profile.skinState.oiliness, dry = profile.skinState.dryness;
  const oilKnown = oil !== null, dryKnown = dry !== null;
  const currentIrritation = profile.observationAssessment.currentIrritation || (adaptiveValue(answers, "surfaceObservation") === "unknown" && adaptiveValue(answers, "surfaceCheck") === "unknown" && adaptiveValue(answers, "surfaceComfort") === "stings");
  const surfaceKnown = ["normal", "flakes"].includes(resolved.surfaceObservation);
  const typeComplete = oilKnown && dryKnown;
  const canRecommendBasics = !currentIrritation && surfaceKnown && (oilKnown || dryKnown);
  const recentChange = resolved.skinChange !== "steady";
  const status = !typeComplete ? oilKnown || dryKnown ? "partial" : "guidance_only" : recentChange ? "provisional" : "ready";
  let skinType = resolved.observedOil === "tzone" ? "복합성 성향" : oil >= 5 && dry > 0 ? "유분·당김 동반" : oil >= 5 ? "지성 성향" : dry > 0 ? "건성 성향" : "중성 성향";
  if (!typeComplete) skinType = oilKnown ? oil >= 5 ? "유분 중심 관리부터 시작" : "가벼운 기본 관리부터 시작" : dryKnown && dry > 0 ? "당김 관리부터 시작" : "기본 관리부터 시작";
  const hydrationLevel = !canRecommendBasics ? null : typeComplete ? profile.hydrationLevel : oilKnown && oil >= 5 ? 7 : 5;
  const uncertainties = [];
  const nextObservations = [];
  if (!oilKnown) { uncertainties.push("유분 위치는 아직 구분하지 못했어요. 중성으로 간주하지 않고, 확인된 당김에 맞춰 관리해요."); nextObservations.push("평소 관리 후 오후에 코·이마와 볼 중 기름기가 느껴지는 곳을 확인해요."); }
  if (!dryKnown) { uncertainties.push("당김의 위치·지속 시간은 아직 확인 중이에요. 확인된 유분 특징만 제품 선택에 반영해요."); nextObservations.push("평소 세안 직후·보습 후·낮에 같은 부위의 당김이 어떻게 달라지는지 비교해요."); }
  if (!surfaceKnown && !currentIrritation) { uncertainties.push("현재 벗겨짐·자극 여부가 확인되지 않아 새 제품 선택은 남겨뒀어요."); nextObservations.push("새 제품을 더하기 전에 현재 따가움·벗겨짐·진물 여부를 확인해요."); }
  if (recentChange) uncertainties.push("최근 달라졌거나 일정하지 않은 상태예요. 현재 관찰한 특징을 기준으로 하고 평소 피부타입으로 확정하지 않아요.");
  if (profile.skinState.sensitivity === null) uncertainties.push("반복 자극 경험은 확인되지 않아 기본 후보는 자극을 적게 고려한 제품으로 좁혀요.");
  const evidence = [...profile.observationAssessment.evidence];
  if (currentIrritation && !profile.observationAssessment.currentIrritation) evidence.push("현재 따갑거나 화끈거리는 느낌 있음");
  const context = adaptiveValue(answers, "drynessContext");
  if (needsAdaptiveContext(resolveAdaptiveBase(answers)) && context !== "unknown") evidence.push(context === "area" ? "서로 다른 부위의 응답을 나눠 확인함" : context === "days" ? "서로 다른 날의 응답을 현재 상태와 나눠 확인함" : "보습 전후·현재 느낌을 다시 확인함");
  const careActions = currentIrritation
    ? ["따갑게 만든 새 제품은 쉬고, 편안했던 세안·보습으로 줄여요.", "헐거나 진물이 나거나 자극이 계속되면 상태 확인이 필요해요."]
    : [resolved.moisturizerUse === "comfortable" ? "현재 보습제가 편안하다면 유지해요. 토너·세럼을 반드시 추가할 필요는 없어요." : resolved.moisturizerUse === "none" ? "기본 제품이 없다면 세안제·보습제부터 살펴보고, 새 제품은 한 가지씩 추가해요." : "이미 편안하게 쓰던 기본 제품은 유지하고, 불편한 부위만 조절해요.",
      resolved.washResponse === "tight" ? "세안 직후 당긴다면 뜨거운 물·문지르기·잦은 세안을 줄이고 세안 후 보습을 이어가요." : "미지근한 물로 부드럽게 씻고, 확인하려고 보습을 끊거나 세안을 늘리지 않아요."];
  const environmentValue = visible.some(question => question.id === "recentEnvironment") ? adaptiveValue(answers, "recentEnvironment") : "unknown";
  const environmentLabel = recentEnvironmentOptions.find(([value]) => value === environmentValue)?.[1];
  const dryAreaLabel = { cheeks: "볼·입 주변", tzone: "이마·코 주변", whole: "얼굴 전반" }[resolved.drynessArea];
  const environmentContext = !["none", "unknown"].includes(environmentValue) && environmentLabel ? {
    value: environmentValue,
    label: environmentLabel,
    nextAction: currentIrritation ? "환경이 달라졌어도 지금은 자극 반응부터 살펴봐요."
      : resolved.skinChange === "product" ? "제품도 바뀌었다고 답했어요. 제품을 바꾼 시점과 환경이 달라진 시점을 나눠서 피부 반응을 비교해요."
      : ["dry_air", "cold_wind"].includes(environmentValue) && dryAreaLabel
        ? `${dryAreaLabel}의 당김이 노출이 적은 날에도 이어지는지 비교하고, 당기는 부위의 보습을 점검해요.`
        : "환경이 달라진 날과 평소에 같은 부위의 유분·당김이 달랐는지 비교해요.",
  } : null;
  const recommendationReason = currentIrritation ? careActions.join(" ")
    : !canRecommendBasics ? "피부타입 이름을 정하지 못해도 아래 기본 관리부터 이어갈 수 있어요. 확인된 답변과 추가 고민에 맞는 관리부터 보고, 새 기본 제품은 현재 편안함과 유분·당김을 확인한 뒤 골라요."
    : !typeComplete ? oilKnown && oil >= 5 ? "확인된 유분에 맞춰 가벼운 제형 후보를 보여드려요. 당김이 없는 피부라고 단정하지 않으며, 불편한 부위는 보습을 조절해요." : "피부타입을 확정하지 않고 무난한 보습감의 후보로 시작해요. 확인된 당김과 현재 제품 반응을 기준으로 필요한 부위만 조절해요."
    : profile.observationAssessment.recommendationReason;
  return { ...profile, surveyVersion: ADAPTIVE_SURVEY_VERSION, measurementVersion: ADAPTIVE_MEASUREMENT_VERSION,
    skinType, hydrationLevel, reasons: evidence, solution: recommendationReason,
    observationAssessment: { ...profile.observationAssessment, status, canRecommendBasics, canRecommendActives: canRecommendBasics && typeComplete && !recentChange,
      typeComplete, currentIrritation, recentChange, evidence, uncertainties, nextObservations, careActions, recommendationReason, refinements,
      resolvedObservations: resolved, ...(environmentContext ? { environmentContext } : {}), resolvedWithFollowUps: refinements.length > 0 },
  };
}
