const option = (label, value) => ({ label, value });
const unknown = option("잘 모르겠어요", "unknown");
const yesNo = [option("네", "yes"), option("아니요", "no"), unknown];

// These questions support triage and descriptions, never a microbiological diagnosis.
export const symptomQuestions = [
  { id: "breathing", q: "지금 숨쉬기·삼키기가 어렵거나 혀·목이 붓나요?", options: yesNo },
  { id: "infectionWarning", q: "지금 다음과 같은 급한 변화가 있나요?", options: [
    option("붉어짐·통증이 빠르게 번지면서 열·오한·몸살이 있어요", "spreading_fever"),
    option("눈 주위가 심하게 붓고 눈이 아프거나 시야가 달라졌어요", "eye"),
    option("붉어짐이나 통증이 갑자기 심해지거나 빠르게 번져요", "rapid"),
    option("해당되는 변화는 없어요", "none"), unknown,
  ] },
  { id: "eruption", q: "지금 오돌토돌한 돌기, 고름이 보이는 트러블, 또는 발진이 있나요?", options: yesNo },
  { id: "change", q: "평소와 비교해 지금 피부는 어떤가요?", options: [
    option("이번에 처음 생겼어요", "new"),
    option("평소와 비슷해요", "stable"), option("원래 있던 증상이 줄었어요", "improving"),
    option("원래 있던 증상이 더 심해졌어요", "worse"),
    option("제품을 쓴 뒤 따갑거나 화끈거리고 벗겨져요", "irritation"),
    option("관리해도 아직 효과를 모르겠어요", "no_effect"), unknown,
  ] },
  { id: "risk", q: "면역을 낮추는 치료 중이거나 감염 위험이 높다고 들은 적이 있나요?", help: "항암치료·면역억제제 사용, 조절되지 않는 당뇨 등이 해당해요. 잘 모르면 그대로 선택해주세요.", options: yesNo },
  { id: "surface", q: "피부 표면에 물집·진물·벗겨진 상처가 있나요?", options: [
    option("그런 변화는 없어요", "intact"), option("건조한 각질 정도만 있어요", "dry_flaky"),
    option("물집·진물·벗겨진 상처가 있어요", "damaged"), unknown,
  ] },
  { id: "barrier", q: "지금 건조함·당김·따가움도 있나요?", options: [
    option("건조하고 당기지만 많이 붉거나 따갑지는 않아요", "dry"),
    option("평소 보습제도 따갑거나 붉어져요", "stinging"),
    option("거의 없어요", "none"), unknown,
  ] },
  { id: "area", q: "돌기나 발진은 주로 어디에 있나요?", detail: true, options: [
    option("이마·머리카락 경계", "hairline"), option("볼·코·턱 등 얼굴", "face"),
    option("가슴·등·어깨", "trunk"), option("수염·면도·제모 부위", "shaved"),
    option("다른 부위 또는 여러 부위", "other"), unknown,
  ] },
  { id: "form", q: "지금 보이는 모습은 어느 쪽에 가깝나요?", detail: true, visual: true, options: [
    option("작은 붉은 돌기 위주예요", "papules"), option("작은 돌기에 하얗거나 노란 고름이 보여요", "pustules"),
    option("막힌 피지·붉은 돌기·고름 등 여러 모습이 섞여요", "mixed"),
    option("피부 깊이 크고 딱딱한 덩이가 만져져요", "deep"), unknown,
  ] },
  { id: "comedones", q: "같은 부위에 블랙헤드나 하얗게 막힌 피지도 보이나요?", detail: true, options: yesNo },
  { id: "uniform", q: "돌기들의 크기와 모양이 대체로 비슷한가요?", detail: true, options: yesNo },
  { id: "itch", q: "가려움은 어느 정도인가요?", detail: true, options: [
    option("거의 가렵지 않아요", "none"), option("약간 가려워요", "mild"),
    option("가려움이 꽤 심하거나 주된 불편함이에요", "strong"), unknown,
  ] },
  { id: "follicular", q: "돌기 가운데 털이 있거나 털구멍마다 생긴 것처럼 보이나요?", detail: true, options: yesNo },
  { id: "shaving", q: "면도·왁싱·제모 후 그 부위에 생기거나 반복되나요?", detail: true, options: yesNo },
  { id: "ingrown", q: "피부 안으로 말려 들어간 털이 보이나요?", detail: true, showIf: a => a.shaving === "yes", options: yesNo },
  { id: "sweat", q: "땀·더위·젖은 옷·마찰 뒤에 더 두드러지나요?", detail: true, options: yesNo },
  { id: "exposure", q: "최근 2개월 동안 항생제나 스테로이드를 사용했나요?", detail: true, help: "바르는 약과 먹는 약 모두 포함해요. 처방약은 임의로 중단하지 마세요.", options: [
    option("항생제", "antibiotic"), option("스테로이드", "steroid"), option("둘 다", "both"), option("둘 다 사용하지 않았어요", "none"), unknown,
  ] },
  { id: "pain", q: "통증이나 흉터는 어떤가요?", detail: true, options: [
    option("거의 아프지 않고 새 흉터도 없어요", "none"), option("누르면 조금 아파요", "mild"),
    option("가만히 있어도 심하게 아프거나 새 흉터가 생겨요", "severe"), unknown,
  ] },
  { id: "duration", q: "지금 증상이 얼마나 이어졌나요?", detail: true, options: [
    option("1주 미만", "under_week"), option("1~2주", "one_two_weeks"),
    option("2~6주", "two_six_weeks"), option("6주 이상 또는 자주 재발", "long"), unknown,
  ] },
  { id: "treatment", q: "이 증상을 위해 현재 사용 중인 것은 무엇인가요?", detail: true, options: [
    option("따로 사용하지 않아요", "none"), option("화장품만 사용해요", "cosmetic"),
    option("여드름용 약", "acne"), option("항생제", "antibiotic"),
    option("항진균제", "antifungal"), option("스테로이드 또는 여러 종류의 약", "other_medicine"), unknown,
  ] },
  { id: "treatmentDuration", q: "그 관리를 실제로 얼마나 지속했나요?", detail: true, showIf: a => a.treatment !== "none", options: [
    option("2주 미만", "under_two"), option("2~6주 미만", "two_six"),
    option("6~12주 미만", "six_twelve"), option("12주 이상", "twelve_plus"), unknown,
  ] },
  { id: "adherence", q: "안내받은 사용법과 빈도를 지켰나요?", detail: true, showIf: a => a.treatment !== "none", options: [
    option("대체로 지켰어요", "consistent"), option("쉬거나 양·횟수를 자주 바꿨어요", "inconsistent"), unknown,
  ] },
  { id: "gut", q: "최근 장 불편감은 어떤가요?", options: [
    option("딱히 불편하지 않아요", "none"), option("변비·복부팽만이 신경 쓰여요", "constipation_bloating"),
    option("묽은 변·설사가 신경 쓰여요", "loose"), option("기록하고 싶지 않거나 잘 모르겠어요", "unknown"),
  ] },
  { id: "vegetables", q: "평소 채소·과일을 얼마나 자주 곁들이나요?", options: [
    option("거의 먹지 않아요", "rare"), option("가끔 곁들여요", "sometimes"), option("대부분의 날에 곁들여요", "regular"), unknown,
  ] },
  { id: "probiotic", q: "현재 유산균 제품을 먹고 있나요?", options: [
    option("먹지 않아요", "none"), option("최근 새로 시작하거나 바꿨어요", "recent"), option("같은 제품을 계속 먹고 있어요", "ongoing"), unknown,
  ] },
  { id: "habit", q: "부담을 줄이면서 먼저 해볼 관리 하나를 고른다면?", help: "생활 관리는 보조 관리예요. 특정 식품·유산균으로 피부질환을 치료하거나 면역 상태를 진단하지 않아요.", options: [
    option("세안·보습을 단순하게 정리하기", "barrier"),
    option("수면·스트레스와 피부 반응 기록하기", "sleep"),
    option("간편한 채소를 한 끼에 곁들이기", "vegetables"),
    option("장 불편감·식사·유산균 사용을 기록하기", "gut"),
    option("지금은 추가하지 않고 상태만 기록하기", "observe"),
  ] },
];

export function getVisibleSymptomQuestions(answers = {}) {
  // Positive warning answers stop the questionnaire immediately.
  const stop = answers.breathing === "yes" ? 1 : ["spreading_fever", "eye", "rapid"].includes(answers.infectionWarning) ? 2 : answers.eruption === "yes" && answers.risk === "yes" ? 5 : null;
  if (stop) return symptomQuestions.slice(0, stop);
  return symptomQuestions.filter(q => (!q.detail || answers.eruption !== "no") && (!q.showIf || q.showIf(answers)));
}

export function cleanSymptomAnswers(answers) {
  const allowed = new Set(getVisibleSymptomQuestions(answers).map(q => q.id));
  return Object.fromEntries(Object.entries(answers).filter(([key, value]) => allowed.has(key) && symptomQuestions.find(q => q.id === key)?.options.some(o => o.value === value)));
}
