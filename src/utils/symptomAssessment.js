import { cleanSymptomAnswers, getVisibleSymptomQuestions, hasBreakoutDetails } from "../data/symptomQuestions";

export const SYMPTOM_RULE_VERSION = "skin-care-v3";
export const symptomSources = [
  { label: "AAD · 여드름과 비슷해 보이는 모낭염", url: "https://www.aad.org/public/diseases/a-z/folliculitis/" },
  { label: "DermNet · 말라세지아 모낭염 설명·임상사진", url: "https://dermnetnz.org/topics/malassezia-folliculitis" },
  { label: "Mayo Clinic · 모낭염 종류·진료 신호", url: "https://www.mayoclinic.org/diseases-conditions/folliculitis/symptoms-causes/syc-20361634" },
  { label: "NICE · 여드름 치료 평가 시점", url: "https://www.nice.org.uk/guidance/ng198/chapter/Recommendations" },
];

export function assessSymptoms(input = {}) {
  const a = cleanSymptomAnswers(input);
  const questions = getVisibleSymptomQuestions(a);
  const complete = questions.every(q => q.options.some(o => o.value === a[q.id]));
  const result = {
    ruleVersion: SYMPTOM_RULE_VERSION, answers: a, complete, candidates: [], reasons: [],
    urgency: "review", blockRoutine: true, allowMedicationRecommendation: false,
    title: "답변을 조금 더 확인해야 해요", nextAction: "빠진 답변을 확인하고 결과를 다시 봐주세요.",
    reviewTiming: "악화하면 예정된 체크 날짜까지 기다리지 마세요.",
    diagnosticStatus: "not_diagnosed", clinicalValidation: "not_validated",
  };
  if (a.breathing === "yes") return { ...result, urgency: "emergency", title: "설문보다 응급 도움을 먼저 받으세요", nextAction: "지금 호흡·삼킴 곤란이나 혀·목 붓기가 있다면 119 또는 가까운 응급실에 즉시 도움을 요청하세요." };
  if (a.eyeWarning === "yes" || a.change === "rapid") return { ...result, urgency: "urgent", title: "오늘 바로 의료 평가가 필요해요", nextAction: "빠르게 번지는 붉어짐, 갑자기 심해진 통증 또는 눈 주위 증상이 있다면 새 제품을 시험하지 말고 바로 진료받으세요." };
  if (!complete) return result;

  const add = (key, label, reasons, limitation) => result.candidates.push({ key, label, reasons, limitation });
  const breakout = hasBreakoutDetails(a);
  const follicular = a.follicular === "yes";
  const itchyUniform = breakout && a.uniform === "yes" && ["mild", "strong"].includes(a.itch) && a.comedones === "no";
  if (breakout && a.comedones === "yes") add("acne", "여드름 양상", ["블랙헤드·화이트헤드 같은 막힌 피지가 함께 보인다고 답했어요.", ...(a.form === "mixed" ? ["서로 다른 형태의 병변이 섞여 있어요."] : [])], "면포가 있어도 다른 피부 문제가 함께 생길 수 있어요.");
  if (itchyUniform) add("malassezia", "말라세지아(효모·진균성) 모낭염 가능성", ["크기·모양이 비슷하고 가려운 돌기라고 답했어요.", "같은 부위의 면포는 보이지 않는다고 답했어요.", ...(["trunk", "hairline"].includes(a.area) ? ["가슴·등 또는 이마·머리카락 경계에 나타나요."] : [])], "세균성 모낭염·약물성 발진도 비슷할 수 있어요. 설문이나 사진만으로 진균을 확인할 수 없어요.");
  if (breakout && follicular && ["pustules", "mixed"].includes(a.form)) add("folliculitis", "세균성 등을 포함한 모낭염 가능성", ["털구멍 중심으로 고름이 있는 돌기가 보인다고 답했어요."], "고름이 있다고 세균성으로 확정할 수 없고, 원인균이나 항생제 적합성도 알 수 없어요.");
  if (breakout && a.shaving === "yes") add("shaving", "면도·제모 자극 / 인그로운 헤어 가능성", ["면도·제모 후 같은 부위에 생기거나 반복돼요.", ...(a.ingrown === "yes" ? ["안으로 말려 들어간 털이 보인다고 답했어요."] : [])], "면도 자극과 감염이 함께 있을 수 있어요. 면도 이력만으로 감염을 배제하지 않아요.");
  if (a.change === "irritation") add("irritation", "제품 자극 / 피부염 가능성", ["제품 사용 뒤 따가움·화끈거림·벗겨짐이 있다고 답했어요."], "사용 시점이 겹친다는 이유만으로 특정 제품이나 알레르기가 원인이라고 확정할 수 없어요.");

  if (a.pain === "severe" || a.form === "deep" || a.surface === "damaged") {
    return { ...result, urgency: "clinic", title: "새 약을 추가하기 전에 진료로 확인하세요", nextAction: "깊은 덩이·심한 통증·흉터·물집·진물이 있다면 자가 관리만 반복하지 말고 가까운 시일 안에 진료받으세요." };
  }
  const unknownSafety = [a.breathing, a.eyeWarning, a.eruption, a.change, a.surface, a.barrier].includes("unknown");
  if (unknownSafety) return { ...result, title: "안전 신호가 불확실해 상태 확인이 먼저예요", nextAction: "모르는 답을 억지로 추정하지 마세요. 현재 상태를 약사나 의료진에게 보여주고 확인하세요. 호흡곤란이나 급한 변화가 의심되면 즉시 의료 도움을 받으세요." };

  const notClearAcne = result.candidates.some(c => ["malassezia", "folliculitis", "shaving"].includes(c.key));
  const persistent = ["two_six_weeks", "long"].includes(a.duration);
  if (notClearAcne && persistent) return { ...result, urgency: "clinic", title: "반복·지속되는 증상의 원인을 확인하세요", nextAction: "지속되는 모낭염 의심 증상이나 충분히 관리해도 호전이 없는 경우에는 약을 차례로 바꾸기보다 진료로 원인을 확인하세요. 진료가 곧 배양검사를 뜻하는 것은 아니에요." };
  if (a.concern === "sudden") return { ...result, urgency: "pharmacy", title: "지금은 새 제품을 쉬어가세요", nextAction: "갑자기 붓거나 두드러기가 생긴 상태에서는 새 제품을 시험하지 마세요. 붓기가 심해지거나 숨쉬기·삼키기가 어려워지면 즉시 도움을 받으세요." };
  if (a.change === "worse" || a.change === "irritation" || a.barrier === "stinging") return { ...result, urgency: "pharmacy", title: "새 제품보다 악화·자극 원인 확인이 먼저예요", nextAction: "최근 추가한 화장품이 따갑게 느껴졌다면 그 제품을 잠시 쉬고 피부가 어떻게 달라지는지 기록해보세요. 악화가 이어지면 상담받으세요." };
  const uncertainFeatures = breakout && ["form", "comedones", "uniform", "itch", "follicular", "shaving", "pain", "duration"].some(k => a[k] === "unknown");
  if (notClearAcne || uncertainFeatures || (breakout && result.candidates.length === 0)) return { ...result, urgency: "pharmacy", title: "트러블이 가라앉는지 먼저 살펴봐요", nextAction: "각질 제거제나 새 제품을 추가하기 전에 가려움·새 돌기·면도와의 관계를 기록해보세요. 계속 번지거나 호전되지 않으면 상담받으세요." };

  if (a.recentProduct === "prescribed") return { ...result, urgency: "pharmacy", title: "기존에 바르던 제품 안내를 우선하세요", nextAction: "처방받은 제품을 쓰는 부위에 새 기능성 화장품을 겹쳐 쓰기 전에 기존 안내를 확인하세요." };
  return { ...result, urgency: "self_care", blockRoutine: false, title: "지금 피부에 맞는 기본 관리", nextAction: "새 제품은 한 번에 하나씩 바꾸고, 이미 편안하게 쓰던 제품은 유지해도 좋아요.", reviewTiming: "2주 체크에서는 편안함과 자극, 새 트러블의 변화를 비교해요. 악화하면 날짜를 기다리지 말고 다시 확인하세요." };
}

export function getRoutineSafety(assessment, issueGuide = null) {
  if (!assessment?.complete || assessment.ruleVersion !== SYMPTOM_RULE_VERSION) return { blocked: true, reason: "현재 증상 확인이 필요해요. 예전 기록은 그대로 보존되며 재설문으로 지금 상태를 확인할 수 있어요." };
  if (assessment.blockRoutine) return { blocked: true, reason: assessment.nextAction };
  if (issueGuide?.careLevel === "clinic_priority") return { blocked: true, reason: issueGuide.summary };
  return { blocked: false, reason: "" };
}

export function applyRoutineSafety(routine, safety) {
  return safety.blocked ? { ...routine, products: {} } : routine;
}

export function feedbackNeedsSymptomReview(answers = {}) {
  return (answers.trouble?.value ?? 0) > 0 || (answers.clogged?.value ?? 0) >= 2 ||
    ["자주 따갑거나 붉어짐", "바르면 바로 불편함"].includes(answers.irritation?.label);
}

export function getFeedbackRoutineSafety(assessment, answers = {}) {
  const safety = getRoutineSafety(assessment);
  return !safety.blocked && feedbackNeedsSymptomReview(answers)
    ? { blocked: true, reason: "사용 후 피드백에서 트러블 증가·악화 또는 자극 신호를 답했어요. 증상 확인 답변과 함께 약사나 의료진에게 현재 상태와 사용 이력을 보여주고, 새 제품을 자동으로 바꾸기 전에 원인을 확인하세요." }
    : safety;
}
