import { cleanSymptomAnswers, getVisibleSymptomQuestions, hasBreakoutDetails } from "../data/symptomQuestions";
import { getBreakoutFirstCare } from "./breakoutFirstCare";

export const SYMPTOM_RULE_VERSION = "skin-care-v5";
export const symptomSources = [
  { label: "AAD · 여드름과 비슷해 보이는 모낭염", url: "https://www.aad.org/public/diseases/a-z/folliculitis/" },
  { label: "DermNet · 말라세지아 모낭염 설명·임상사진", url: "https://dermnetnz.org/topics/malassezia-folliculitis" },
  { label: "Mayo Clinic · 모낭염 종류·진료 신호", url: "https://www.mayoclinic.org/diseases-conditions/folliculitis/symptoms-causes/syc-20361634" },
  { label: "NICE · 여드름 치료 평가 시점", url: "https://www.nice.org.uk/guidance/ng198/chapter/Recommendations" },
];

export function assessSymptoms(input = {}, { guided = false } = {}) {
  const a = cleanSymptomAnswers(input, { guided });
  const questions = getVisibleSymptomQuestions(a, { guided });
  const complete = questions.every(q => q.options.some(o => o.value === a[q.id]));
  const result = {
    ...(guided && { guidedCare: true }),
    ruleVersion: SYMPTOM_RULE_VERSION, answers: a, complete, candidates: [], reasons: [],
    urgency: "review", blockRoutine: true, allowMedicationRecommendation: false,
    title: "답변을 조금 더 확인해야 해요", nextAction: "빠진 답변을 확인하고 결과를 다시 봐주세요.",
    reviewTiming: "악화하면 예정된 체크 날짜까지 기다리지 마세요.",
    diagnosticStatus: "not_diagnosed", clinicalValidation: "not_validated",
  };
  if (a.concern === "sudden") return { ...result, urgency: "urgent", title: "갑자기 붓거나 두드러기가 나면 새 제품은 쉬어요", nextAction: "방금 새로 바른 화장품은 더 사용하지 마세요. 숨쉬기·삼키기가 어렵거나 혀·목이 붓는다면 즉시 119에 연락하고, 눈 주위 붓기와 함께 눈 통증이나 시야 변화가 있으면 바로 진료받으세요." };
  if (a.change === "rapid") return { ...result, urgency: "urgent", title: "오늘 바로 의료 평가가 필요해요", nextAction: "붉어짐이 빠르게 번지거나 통증이 갑자기 심해졌다면 새 제품을 시험하지 말고 바로 진료받으세요." };
  if (!complete) return result;

  const add = (key, label, reasons, limitation) => result.candidates.push({ key, label, reasons, limitation });
  const breakout = hasBreakoutDetails(a);
  const follicular = a.follicular === "yes";
  const itchyUniform = breakout && a.uniform === "yes" && ["mild", "strong"].includes(a.itch) && a.comedones === "no";
  if (breakout && a.comedones === "yes") add("acne", "여드름 양상", ["블랙헤드·화이트헤드 같은 막힌 피지가 함께 보인다고 답했어요.", ...(a.form === "mixed" ? ["서로 다른 형태의 병변이 섞여 있어요."] : [])], "면포가 있어도 다른 피부 문제가 함께 생길 수 있어요.");
  if (itchyUniform) add("malassezia", "말라세지아(효모·진균성) 모낭염 가능성", ["크기·모양이 비슷하고 가려운 돌기라고 답했어요.", "같은 부위의 면포는 보이지 않는다고 답했어요.", ...(["trunk", "hairline"].includes(a.area) ? ["가슴·등 또는 이마·머리카락 경계에 나타나요."] : [])], "세균성 모낭염·약물성 발진도 비슷할 수 있어요. 설문이나 사진만으로 진균을 확인할 수 없어요.");
  if (breakout && follicular && ["pustules", "mixed"].includes(a.form)) add("folliculitis", "세균성 등을 포함한 모낭염 가능성", ["털구멍 중심으로 고름이 있는 돌기가 보인다고 답했어요."], "고름이 있다고 세균성으로 확정할 수 없고, 원인균이나 항생제 적합성도 알 수 없어요.");
  if (breakout && a.shaving === "yes") add("shaving", "면도·제모 자극 / 인그로운 헤어 가능성", ["면도·제모 후 같은 부위에 생기거나 반복돼요.", ...(a.ingrown === "yes" ? ["안으로 말려 들어간 털이 보인다고 답했어요."] : [])], "면도 자극과 감염이 함께 있을 수 있어요. 면도 이력만으로 감염을 배제하지 않아요.");
  if (a.facialRedness === "yes") add("demodex", "주사 또는 모낭충 관련 상태와 겹치는 단서", ["볼·코 주변이 반복해서 붉어지고 막힌 피지는 없다고 답했어요."], "주사와 모낭충 관련 상태는 설문만으로 구분할 수 없어요.");
  if (a.change === "irritation") add("irritation", "제품 자극 / 피부염 가능성", ["제품 사용 뒤 따가움·화끈거림·벗겨짐이 있다고 답했어요."], "사용 시점이 겹친다는 이유만으로 특정 제품이나 알레르기가 원인이라고 확정할 수 없어요.");

  if (a.pain === "severe" || a.form === "deep" || a.surface === "damaged") {
    return { ...result, urgency: "clinic", title: "새 약을 추가하기 전에 진료로 확인하세요", nextAction: "깊은 덩이·심한 통증·흉터·물집·진물이 있다면 자가 관리만 반복하지 말고 가까운 시일 안에 진료받으세요." };
  }
  const unknownSafety = [a.eruption, a.change, a.surface, a.barrier].includes("unknown");
  if (unknownSafety) return { ...result, title: "안전 신호가 불확실해 상태 확인이 먼저예요", nextAction: "오늘은 새 제품을 바르지 말고, 밝은 곳에서 붉어짐·물집·진물이 있는지 다시 확인해요. 붉어짐이 빠르게 번지거나 통증이 갑자기 심해지면 바로 진료받으세요." };

  const notClearAcne = result.candidates.some(c => ["malassezia", "folliculitis", "shaving", "demodex"].includes(c.key));
  const persistent = ["two_six_weeks", "long"].includes(a.duration);
  if (notClearAcne && persistent) return {
    ...result, urgency: "clinic", title: "반복·지속되는 돌기는 진료로 원인을 확인해요",
    nextAction: guided
      ? (a.change === "irritation" || a.barrier === "stinging"
        ? "따가웠던 새 화장품을 쉬고 자극 부위를 문지르지 않아요. 돌기가 반복되거나 오래 이어졌으니 치료 방향은 진료에서 확인해요."
        : `오늘은 이렇게 관리해요. ${getBreakoutFirstCare(result.candidates).action} 반복되거나 오래 이어졌으니 치료 방향은 진료에서 확인해요.`)
      : "지속되는 증상은 약을 차례로 바꾸기보다 진료로 원인을 확인해요.",
  };
  if (a.change === "worse" || a.change === "irritation" || a.barrier === "stinging") return { ...result, urgency: "pharmacy", title: "새 제품보다 악화·자극 원인 확인이 먼저예요", nextAction: guided && a.barrier === "stinging"
    ? "새 기능성 제품은 추가하지 말고, 편안했던 세안·보습만 유지해요. 최근 추가한 화장품이 따가웠다면 잠시 쉬고, 다음에는 따가움과 붉어짐이 줄었는지 확인해요. 악화가 이어지면 상담받으세요."
    : "오늘은 최근 추가한 화장품 중 따가웠던 제품과 스크럽을 쉬고, 불편한 부위를 손끝으로 가볍게 씻어요. 붉어짐이 퍼지거나 통증이 늘면 진료받으세요." };
  const uncertainFeatures = breakout && ["form", "comedones", "uniform", "itch", "follicular", "shaving", "pain", "duration", "facialRedness"].some(k => a[k] === "unknown");
  if (notClearAcne || uncertainFeatures || (breakout && result.candidates.length === 0)) {
    if (guided) {
      const care = getBreakoutFirstCare(result.candidates);
      return { ...result, urgency: "pharmacy", title: care.title, nextAction: care.action, breakoutCare: care };
    }
    return { ...result, urgency: "pharmacy", title: "트러블이 가라앉는지 먼저 살펴봐요", nextAction: "각질 제거제나 새 제품을 추가하기 전에 가려움·새 돌기·면도와의 관계를 기록해보세요. 계속 번지거나 호전되지 않으면 상담받으세요." };
  }

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
    ? { blocked: true, reason: "지금은 새 제품으로 바꾸지 않아요. 새로 추가한 화장품이 따갑거나 붉어졌다면 잠시 쉬고, 언제부터 새 돌기나 자극이 늘었는지 기록해요. 증상 확인에서 변화한 답을 다시 골라주세요." }
    : safety;
}
