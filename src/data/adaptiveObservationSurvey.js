import { observationQuestions } from "./observationSurvey";

export const ADAPTIVE_SURVEY_VERSION = "adaptive-skin-v3";
export const ADAPTIVE_MEASUREMENT_VERSION = "adaptive-skin-axes-v3";
const q = (id, question, hint, options, visual) => ({ id, question, hint, visual, supplemental: true, options: options.map(([value, label]) => ({ value, label })) });
const unknown = ["unknown", "아직 구분하기 어려워요"];
const areas = [["none", "지금은 특별히 당기는 곳이 없어요"], ["cheeks", "볼·입 주변이 당겨요"], ["tzone", "이마·코 주변이 당겨요"], ["whole", "얼굴 전반이 당겨요"], unknown];
const timing = [["wash", "세안 직후뿐이고 이후에는 편안해요"], ["day", "낮에도 당김이 다시 느껴져요"], ["persistent", "보습제를 발라도 같은 부위가 계속 당겨요"], unknown];
export const recentEnvironmentOptions = [
  ["dry_air", "난방·냉방으로 건조한 실내에 오래 있었어요"],
  ["cold_wind", "추운 공기나 바람에 닿는 시간이 늘었어요"],
  ["heat_sweat", "더위·습기나 땀에 노출되는 시간이 늘었어요"],
  ["several", "이런 환경이 두 가지 이상 달라졌어요"],
  ["none", "환경은 평소와 비슷했어요"],
  unknown,
];
const recentEnvironmentQuestion = {
  ...q("recentEnvironment", "피부가 달라진 즈음에 생활 환경도 바뀌었나요?", "계절 이름보다 실제로 오래 머문 환경을 떠올려요. 제품을 바꾼 것과 환경이 달라진 것은 둘 다 있을 수 있어요.", recentEnvironmentOptions),
  contextOnly: true,
};
export const adaptiveSupportQuestions = [
  recentEnvironmentQuestion,
  q("changeAnchor", "가장 최근에 피부가 달라졌다고 느낀 계기가 있나요?", "정확한 날짜를 몰라도 괜찮아요. 평소와 비교해 떠오르는 경험으로 골라요.", [["steady", "최근 특별한 변화는 떠오르지 않아요"], ["product", "화장품을 추가하거나 바꾼 뒤 달라졌어요"], ["changed", "제품 변경과 상관없이 최근 불편해졌어요"], ["varies", "날마다 다른 편이에요"], unknown]),
  q("oilTouch", "광택과 별개로, 평소 오후에 기름기가 느껴지는 곳은 어디인가요?", "그림의 부위를 비교해요. 평소 가볍게 만졌을 때의 경험으로 답하고, 확인하려고 문지르거나 세안을 늘리지 않아요.", [["none", "코와 볼 모두 기름기가 거의 없어요"], ["tzone", "코·이마에는 기름기가 있고 볼에는 거의 없어요"], ["whole", "코·이마와 양쪽 볼 모두 기름기가 있어요"], unknown], "oil_regions"),
  q("drynessSensation", "여기서 ‘당김’은 피부가 팽팽하게 조이는 느낌이에요. 그런 경험이 있나요?", "기름져 보이는 것과 별개로 답해요. 단순히 모공이나 주름이 보인다는 뜻은 아니에요.", [["yes", "피부가 조여 보습을 하고 싶은 느낌이 있어요"], ["no", "그런 느낌은 없고 편안해요"], unknown], "dry_regions"),
  q("drynessLocation", "조이는 느낌이 드는 부위를 그림에서 비교해볼까요?", "유분이 있는 곳과 당기는 곳이 달라도 괜찮아요.", areas, "dry_regions"),
  q("tightnessAfterMoisturizer", "평소 로션·크림을 바른 뒤 그 부위의 당김은 어떤가요?", "일부러 보습을 미루지 말고 평소 경험을 떠올려요.", [["comfortable", "바르면 일단 편안해져요"], ["persistent", "발라도 계속 당겨요"], ["untried", "로션·크림을 쓰지 않아 비교하기 어려워요"], unknown]),
  q("drynessReturn", "보습 후 편안해진 뒤, 낮에 같은 부위가 다시 당기나요?", "보습 전과 후, 시간이 지난 뒤의 느낌을 나눠서 확인해요.", [["yes", "낮이 되면 다시 당겨요"], ["no", "그 뒤에도 대체로 편안해요"], unknown]),
  q("tightnessWithoutMoisturizer", "보습제를 쓰지 않는 평소에는 당김이 언제 느껴지나요?", "기존 세안·생활 중 겪은 느낌으로 골라요.", [["wash", "씻은 직후에만 잠깐 느껴져요"], ["day", "오후나 저녁에도 당김이 느껴져요"], unknown]),
  q("moisturizerIdentity", "세안 뒤 씻어내지 않고 남겨 바르는 로션·크림을 쓰나요?", "세안제·물로 씻어내는 팩과 구분해요. 안 쓴다는 이유만으로 피부가 손상됐다고 판단하지 않아요.", [["yes", "그런 로션이나 크림을 써요"], ["no", "그런 제품은 쓰지 않아요"], unknown]),
  q("moisturizerResponse", "그 로션·크림을 바른 부위에서 가장 가까운 느낌은 무엇인가요?", "따가움, 조이는 느낌, 단순한 끈적임을 나눠서 골라요.", [["comfortable", "당김·따가움 없이 편안해요"], ["persistent", "피부가 조이는 느낌이 남아요"], ["heavy", "피부는 편안한데 끈적이거나 무거워요"], ["stings", "따갑거나 화끈거리고 붉어져요"], unknown]),
  q("washSensation", "씻은 직후 얼굴이 화끈거리거나 따가웠던 경험이 있나요?", "보습을 바르기 전의 평소 경험이에요. 일부러 기다리거나 피부를 자극해 확인하지 않아요.", [["stings", "씻은 직후에도 따갑거나 화끈거려요"], ["comfortable", "당길 수는 있어도 따갑거나 화끈거리지는 않아요"], unknown]),
  q("reactionRecall", "제품을 바른 뒤 생긴 따가움·붉어짐을 떠올려볼까요?", "한 제품에서만 생겼는지, 서로 다른 제품에서도 반복됐는지 확인해요.", [["none", "현재 쓰는 제품에서는 그런 경험이 없어요"], ["one", "특정 제품 한 가지에서만 그랬어요"], ["repeated", "서로 다른 여러 제품에서 반복됐어요"], ["untried", "제품을 거의 쓰지 않아요"], unknown]),
  q("surfaceCheck", "피부 표면 그림과 비교하면 지금 어느 쪽에 가까운가요?", "그림은 특징을 이해하기 위한 예시예요. 여드름 한 개가 아니라 주변 피부 표면을 비교해요.", [["normal", "각질·벗겨짐이나 넓은 붉어짐은 없어요"], ["flakes", "하얗게 들뜨는 작은 각질이 보여요"], ["irritated", "벗겨지면서 주변까지 붉고 따가워요"], ["broken", "피부가 헐거나 진물이 나요"], unknown], "surface"),
  q("surfaceComfort", "눈으로 구분하기 어렵다면, 현재 불편한 느낌은 어떤가요?", "보이는 특징을 억지로 정하지 않고 지금 확인되는 불편함을 기록해요.", [["normal", "벗겨짐·진물 없이 편안해요"], ["stings", "따갑거나 화끈거려요"], ["broken", "헐거나 젖는 듯 진물이 나는 곳이 있어요"], unknown]),
  q("drynessContext", "당김과 보습 후 느낌이 다른 것은 어떤 상황인가요?", "부위·시간이 다른 답은 모순이 아니에요. 같은 부위에서 언제 느꼈는지를 나눠볼게요.", [["before_after", "바르기 전에는 당기고, 보습 후에는 편안해져요"], ["area", "볼과 이마·코처럼 서로 다른 부위 이야기예요"], ["days", "서로 다른 날의 상태를 답했어요"], ["persistent", "같은 부위가 보습 후에도 계속 당겨요"], ["comfortable", "지금 같은 부위를 보면 당김 없이 편안해요"], unknown]),
  q("contextDryArea", "지금 기준으로 실제 당기는 부위는 어디인가요?", "앞의 답변보다 지금 확인한 부위와 느낌을 우선할게요.", areas, "dry_regions"),
  q("contextDryTiming", "방금 고른 부위의 당김은 언제 느껴지나요?", "다른 부위나 다른 날의 느낌과 나누어 답해요.", timing),
  q("contextReturn", "보습 후 편안해진 같은 부위가 낮에 다시 당기나요?", "보습 후 계속 편안한지, 시간이 지나 다시 당기는지 나눠봐요.", [["yes", "시간이 지나면 다시 당겨요"], ["no", "그 뒤에도 대체로 편안해요"], unknown]),
];
const questionsById = Object.fromEntries([...observationQuestions, ...adaptiveSupportQuestions].map(item => [item.id, item]));
export const adaptiveObservationQuestions = observationQuestions.map(question => ({ ...question }));
export function adaptiveValue(answers, id) {
  return questionsById[id]?.options.find(option => option.label === answers?.[id])?.value ?? "unknown";
}
const hasArea = value => ["cheeks", "tzone", "whole"].includes(value);

// Raw answers remain intact. Refinements only resolve the item that actually needed help.
export function resolveAdaptiveBase(answers = {}) {
  const v = id => adaptiveValue(answers, id);
  const result = Object.fromEntries(observationQuestions.map(item => [item.id, v(item.id)]));
  if (result.skinChange === "unknown") result.skinChange = v("changeAnchor");
  if (["unknown", "coating"].includes(result.observedOil)) result.observedOil = v("oilTouch");
  if (result.drynessArea === "unknown") result.drynessArea = v("drynessSensation") === "no" ? "none" : v("drynessSensation") === "yes" ? v("drynessLocation") : "unknown";
  if (hasArea(result.drynessArea) && result.drynessTiming === "unknown") {
    const after = v("tightnessAfterMoisturizer");
    result.drynessTiming = after === "persistent" ? "persistent" : after === "comfortable" ? v("drynessReturn") === "yes" ? "day" : v("drynessReturn") === "no" ? "wash" : "unknown" : after === "untried" ? v("tightnessWithoutMoisturizer") : "unknown";
  }
  if (result.moisturizerUse === "unknown") result.moisturizerUse = v("moisturizerIdentity") === "no" ? "none" : v("moisturizerIdentity") === "yes" ? v("moisturizerResponse") : "unknown";
  if (result.washResponse === "unknown") result.washResponse = v("washSensation");
  if (result.reactionPattern === "unknown") result.reactionPattern = v("reactionRecall");
  if (result.surfaceObservation === "unknown") result.surfaceObservation = v("surfaceCheck") !== "unknown" ? v("surfaceCheck") : ["normal", "broken"].includes(v("surfaceComfort")) ? v("surfaceComfort") : "unknown";
  return result;
}
export function needsAdaptiveContext(resolved) {
  return (resolved.drynessArea === "none" && resolved.moisturizerUse === "persistent") ||
    (hasArea(resolved.drynessArea) && ((resolved.drynessTiming === "persistent" && ["comfortable", "none"].includes(resolved.moisturizerUse)) || (resolved.drynessTiming === "wash" && resolved.moisturizerUse === "persistent")));
}
export function resolveAdaptiveObservations(answers = {}) {
  const result = resolveAdaptiveBase(answers), v = id => adaptiveValue(answers, id);
  if (!needsAdaptiveContext(result)) return result;
  const context = v("drynessContext");
  if (context === "comfortable") return { ...result, drynessArea: "none", drynessTiming: "unknown", moisturizerUse: result.moisturizerUse === "none" ? "none" : "comfortable" };
  const contextArea = hasArea(result.drynessArea) ? result.drynessArea : v("contextDryArea");
  if (context === "before_after") return { ...result, drynessArea: contextArea, drynessTiming: v("contextReturn") === "yes" ? "day" : v("contextReturn") === "no" ? "wash" : "unknown", moisturizerUse: "comfortable" };
  const area = v("contextDryArea");
  if (context === "persistent") return { ...result, drynessArea: hasArea(result.drynessArea) ? result.drynessArea : area, drynessTiming: "persistent", moisturizerUse: "persistent" };
  return { ...result, skinChange: context === "days" ? "varies" : result.skinChange, drynessArea: area, drynessTiming: hasArea(area) ? v("contextDryTiming") : "unknown" };
}
export function getAdaptiveObservationQuestions(answers = {}) {
  const result = [], v = id => adaptiveValue(answers, id), base = resolveAdaptiveBase(answers);
  const add = id => { if (!result.some(item => item.id === id)) result.push(questionsById[id]); };
  for (const core of adaptiveObservationQuestions) {
    if (core.id === "drynessTiming" && !hasArea(base.drynessArea)) continue;
    result.push(core);
    if (!answers[core.id]) continue;
    if (core.id === "skinChange") {
      if (v(core.id) === "unknown") add("changeAnchor");
      if (["product", "changed", "varies"].includes(base.skinChange)) add("recentEnvironment");
    }
    if (core.id === "observedOil" && ["unknown", "coating"].includes(v(core.id))) add("oilTouch");
    if (core.id === "drynessArea" && v(core.id) === "unknown") { add("drynessSensation"); if (v("drynessSensation") === "yes") add("drynessLocation"); }
    if (core.id === "drynessTiming" && v(core.id) === "unknown") {
      add("tightnessAfterMoisturizer");
      if (v("tightnessAfterMoisturizer") === "comfortable") add("drynessReturn");
      if (v("tightnessAfterMoisturizer") === "untried") add("tightnessWithoutMoisturizer");
    }
    if (core.id === "moisturizerUse" && v(core.id) === "unknown") { add("moisturizerIdentity"); if (v("moisturizerIdentity") === "yes") add("moisturizerResponse"); }
    if (core.id === "washResponse" && v(core.id) === "unknown") add("washSensation");
    if (core.id === "reactionPattern" && v(core.id) === "unknown") add("reactionRecall");
    if (core.id === "surfaceObservation" && v(core.id) === "unknown") { add("surfaceCheck"); if (answers.surfaceCheck && v("surfaceCheck") === "unknown") add("surfaceComfort"); }
  }
  if (needsAdaptiveContext(base)) {
    add("drynessContext");
    if (!answers.drynessContext) return result;
    const context = v("drynessContext"), area = v("contextDryArea");
    if (context === "before_after" && hasArea(base.drynessArea)) add("contextReturn");
    else if (context !== "comfortable") {
      if (context !== "persistent" || !hasArea(base.drynessArea)) add("contextDryArea");
      if (!["persistent", "before_after"].includes(context) && hasArea(area)) add("contextDryTiming");
      if (context === "before_after" && hasArea(area)) add("contextReturn");
    }
  }
  return result;
}
export function cleanAdaptiveObservationAnswers(answers = {}) {
  const visible = getAdaptiveObservationQuestions(answers);
  return Object.fromEntries(visible.filter(question => question.options.some(option => option.label === answers[question.id])).map(question => [question.id, answers[question.id]]));
}
