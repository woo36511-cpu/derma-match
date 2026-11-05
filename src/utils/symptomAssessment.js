import { cleanSymptomAnswers, getVisibleSymptomQuestions } from "../data/symptomQuestions";

export const SYMPTOM_RULE_VERSION = "symptom-triage-v1";
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
  if (["spreading_fever", "eye", "rapid"].includes(a.infectionWarning)) return { ...result, urgency: "urgent", title: "오늘 바로 의료 평가가 필요해요", nextAction: "빠르게 번지는 붉어짐·통증, 발열·오한 또는 눈 주위 증상은 다른 제품을 시험하며 기다리지 말고 즉시 진료받으세요." };
  if (!complete) return result;

  const add = (key, label, reasons, limitation) => result.candidates.push({ key, label, reasons, limitation });
  const follicular = a.follicular === "yes";
  const itchyUniform = a.eruption !== "no" && a.uniform === "yes" && ["mild", "strong"].includes(a.itch) && a.comedones === "no";
  if (a.eruption !== "no" && a.comedones === "yes") add("acne", "여드름 양상", ["블랙헤드·화이트헤드 같은 막힌 피지가 함께 보인다고 답했어요.", ...(a.form === "mixed" ? ["서로 다른 형태의 병변이 섞여 있어요."] : [])], "면포가 있어도 다른 피부 문제가 함께 생길 수 있어요.");
  if (itchyUniform) add("malassezia", "말라세지아(효모·진균성) 모낭염 가능성", ["크기·모양이 비슷하고 가려운 돌기라고 답했어요.", "같은 부위의 면포는 보이지 않는다고 답했어요.", ...(["trunk", "hairline"].includes(a.area) ? ["가슴·등 또는 이마·머리카락 경계에 나타나요."] : [])], "세균성 모낭염·약물성 발진도 비슷할 수 있어요. 설문이나 사진만으로 진균을 확인할 수 없어요.");
  if (a.eruption !== "no" && follicular && ["pustules", "mixed"].includes(a.form)) add("folliculitis", "세균성 등을 포함한 모낭염 가능성", ["털구멍 중심으로 고름이 있는 돌기가 보인다고 답했어요."], "고름이 있다고 세균성으로 확정할 수 없고, 원인균이나 항생제 적합성도 알 수 없어요.");
  if (a.eruption !== "no" && a.shaving === "yes") add("shaving", "면도·제모 자극 / 인그로운 헤어 가능성", ["면도·제모 후 같은 부위에 생기거나 반복돼요.", ...(a.ingrown === "yes" ? ["안으로 말려 들어간 털이 보인다고 답했어요."] : [])], "면도 자극과 감염이 함께 있을 수 있어요. 면도 이력만으로 감염을 배제하지 않아요.");
  if (a.change === "irritation") add("irritation", "제품 자극 / 피부염 가능성", ["제품 사용 뒤 따가움·화끈거림·벗겨짐이 있다고 답했어요."], "사용 시점이 겹친다는 이유만으로 특정 제품이나 알레르기가 원인이라고 확정할 수 없어요.");

  if (a.pain === "severe" || a.form === "deep" || a.surface === "damaged" || (a.risk === "yes" && a.eruption !== "no")) {
    return { ...result, urgency: "clinic", title: "새 약을 추가하기 전에 진료로 확인하세요", nextAction: "깊은 덩이·심한 통증·흉터·물집·진물 또는 감염에 취약한 상태에서는 자가 관리만 반복하지 말고 가까운 시일 안에 진료받으세요." };
  }
  const unknownSafety = [a.breathing, a.infectionWarning, a.risk, a.eruption, a.change, a.surface, a.barrier].includes("unknown");
  if (unknownSafety) return { ...result, title: "안전 신호가 불확실해 상태 확인이 먼저예요", nextAction: "모르는 답을 억지로 추정하지 마세요. 현재 상태를 약사나 의료진에게 보여주고 확인하세요. 호흡곤란이나 급한 변화가 의심되면 즉시 의료 도움을 받으세요." };

  const notClearAcne = result.candidates.some(c => ["malassezia", "folliculitis", "shaving"].includes(c.key));
  const persistent = ["two_six_weeks", "long"].includes(a.duration);
  if ((notClearAcne && persistent) || (a.change === "no_effect" && a.treatmentDuration === "twelve_plus")) return { ...result, urgency: "clinic", title: "반복·지속되는 증상의 원인을 확인하세요", nextAction: "지속되는 모낭염 의심 증상이나 충분히 관리해도 호전이 없는 경우에는 약을 차례로 바꾸기보다 진료로 원인을 확인하세요. 진료가 곧 배양검사를 뜻하는 것은 아니에요." };
  if (a.change === "worse" || a.change === "irritation" || a.barrier === "stinging") return { ...result, urgency: "pharmacy", title: "새 제품보다 악화·자극 원인 확인이 먼저예요", nextAction: "최근 추가한 비처방 제품이 자극을 일으킨다면 사용을 멈추고 약사에게 상태와 사용 이력을 보여주세요. 처방약 변경은 처방한 의료진과 상의하세요. 악화가 이어지면 진료받으세요." };
  const uncertainFeatures = a.eruption !== "no" && ["form", "comedones", "uniform", "itch", "follicular", "shaving", "exposure", "pain", "duration", "treatment"].some(k => a[k] === "unknown");
  if (notClearAcne || uncertainFeatures || (a.eruption !== "no" && result.candidates.length === 0)) return { ...result, urgency: "pharmacy", title: "비슷한 증상의 원인을 먼저 구별해야 해요", nextAction: "약국에서 현재 병변과 가려움·면도·사용 약 이력을 함께 확인하세요. 항생제·항진균제·스테로이드를 임의로 번갈아 쓰지 마세요. 구별이 어렵거나 1~2주 내 호전이 없으면 진료받으세요." };

  const treatmentUnclear = ["unknown", "antibiotic", "antifungal", "other_medicine"].includes(a.treatment);
  if (treatmentUnclear) return { ...result, urgency: "pharmacy", title: "기존 치료와 겹치지 않는지 먼저 확인하세요", nextAction: "사용 중인 약의 이름·기간·반응을 약사나 처방한 의료진에게 알려주세요. 효과 부족만으로 다른 종류의 약을 자동 선택하지 않아요." };
  return { ...result, urgency: "self_care", blockRoutine: false, title: a.eruption === "no" ? "기본 피부 관리 설문을 이어갈 수 있어요" : "여드름 가능성을 포함해 기본 관리를 이어가세요", nextAction: "새 화장품은 여러 개를 동시에 바꾸지 말고, 순한 세안과 편안한 보습을 중심으로 관리하세요. 약국에서는 현재 병변이 여드름에 맞는지와 일반의약품 사용 가능 여부를 확인하세요.", reviewTiming: a.eruption === "no" ? "2주 체크는 피부 반응을 기록하는 시점이에요. 악화하면 언제든 다시 확인하세요." : "2주에는 자극·악화·사용 상태를 확인해요. 여드름 치료 효과는 6~8주가 걸릴 수 있고 첫 치료 평가는 보통 12주에 해요. 악화하면 기다리지 마세요." };
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
