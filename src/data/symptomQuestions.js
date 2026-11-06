const option = (label, value) => ({ label, value });
const unknown = option("잘 모르겠어요", "unknown");
const yesNo = [option("네", "yes"), option("아니요", "no"), unknown];
const hasActiveConcern = a => ["breakouts", "sensitive", "sudden", "other"].includes(a.concern);

export const hasBreakoutDetails = a => a.concern === "breakouts" ||
  (a.concern === "other" && ["yes", "unknown"].includes(a.eruption));

// These questions support triage and descriptions, never a microbiological diagnosis.
export const symptomQuestions = [
  { id: "concern", q: "지금 가장 불편한 피부 상태는 무엇인가요?", options: [
    option("트러블이나 좁쌀이 올라와요", "breakouts"),
    option("건조하고 당겨요", "dry"),
    option("번들거림이나 피지가 신경 쓰여요", "oily"),
    option("따갑거나 붉어져요", "sensitive"),
    option("갑자기 붓거나 두드러기가 났어요", "sudden"),
    option("특별한 고민 없이 기본 관리가 궁금해요", "none"),
    option("다른 고민이 있거나 잘 모르겠어요", "other"),
  ] },
  { id: "breathing", q: "지금 숨쉬기·삼키기가 어렵거나 혀·목이 붓나요?", showIf: a => a.concern === "sudden", options: yesNo },
  { id: "eyeWarning", q: "눈 주위가 붓고, 눈이 아프거나 시야가 달라졌나요?", showIf: a => a.concern === "sudden", options: yesNo },
  { id: "eruption", q: "지금 오돌토돌한 돌기, 고름이 보이는 트러블, 또는 발진이 있나요?", showIf: a => a.concern === "other", options: yesNo },
  { id: "change", q: "평소와 비교해 지금 피부는 어떤가요?", showIf: hasActiveConcern, options: [
    option("이번에 처음 생겼어요", "new"),
    option("평소와 비슷해요", "stable"), option("원래 있던 증상이 줄었어요", "improving"),
    option("원래 있던 증상이 더 심해졌어요", "worse"),
    option("제품을 쓴 뒤 따갑거나 화끈거리고 벗겨져요", "irritation"),
    option("붉어짐이 빠르게 번지거나 통증이 갑자기 심해졌어요", "rapid"), unknown,
  ] },
  { id: "surface", q: "피부 표면에 물집·진물·벗겨진 상처가 있나요?", showIf: a => !!a.concern && a.concern !== "none", options: [
    option("그런 변화는 없어요", "intact"), option("건조한 각질 정도만 있어요", "dry_flaky"),
    option("물집·진물·벗겨진 상처가 있어요", "damaged"), unknown,
  ] },
  { id: "barrier", q: "지금 건조함·당김·따가움도 있나요?", options: [
    option("건조하고 당기지만 많이 붉거나 따갑지는 않아요", "dry"),
    option("평소 보습제도 따갑거나 붉어져요", "stinging"),
    option("거의 없어요", "none"), unknown,
  ] },
  { id: "duration", q: "지금 증상이 얼마나 이어졌나요?", detail: true, options: [
    option("1주 미만", "under_week"), option("1~2주", "one_two_weeks"),
    option("2~6주", "two_six_weeks"), option("6주 이상 또는 자주 재발", "long"), unknown,
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
  { id: "itch", q: "가려움은 어느 정도인가요?", detail: true, options: [
    option("거의 가렵지 않아요", "none"), option("약간 가려워요", "mild"),
    option("가려움이 꽤 심하거나 주된 불편함이에요", "strong"), unknown,
  ] },
  { id: "uniform", q: "돌기들의 크기와 모양이 대체로 비슷한가요?", detail: true, showIf: a => ["mild", "strong"].includes(a.itch), options: yesNo },
  { id: "follicular", q: "고름이 있는 돌기가 털구멍 중심으로 보이나요?", detail: true, showIf: a => ["pustules", "mixed"].includes(a.form), options: yesNo },
  { id: "shaving", q: "면도·왁싱·제모 후 그 부위에 생기거나 반복되나요?", detail: true, options: yesNo },
  { id: "ingrown", q: "피부 안으로 말려 들어간 털이 보이나요?", detail: true, showIf: a => a.shaving === "yes", options: yesNo },
  { id: "pain", q: "통증이나 흉터는 어떤가요?", detail: true, options: [
    option("거의 아프지 않고 새 흉터도 없어요", "none"), option("누르면 조금 아파요", "mild"),
    option("가만히 있어도 심하게 아프거나 새 흉터가 생겨요", "severe"), unknown,
  ] },
  { id: "recentProduct", q: "이 부위에 최근 바꿔 쓰거나 새로 바른 제품이 있나요?", showIf: a => !!a.concern && a.concern !== "none", help: "이미 처방받아 바르는 제품이 있다면 해당 항목을 먼저 골라주세요.", options: [
    option("바꾼 제품은 없어요", "none"), option("세안제나 클렌징 제품", "cleanser"),
    option("보습제나 선크림", "moisturizer"), option("각질 제거제나 기능성 화장품", "active"),
    option("그 밖의 제품 또는 여러 제품", "other"), option("처방받은 제품을 바르고 있어요", "prescribed"), unknown,
  ] },
  { id: "habit", q: "부담을 줄이면서 먼저 해볼 관리 하나를 고른다면?", options: [
    option("세안·보습을 단순하게 정리하기", "barrier"),
    option("최근 바꾼 화장품을 하나씩 점검하기", "products"),
    option("지금은 추가하지 않고 상태만 기록하기", "observe"),
  ] },
];

export function isImmediateStopAnswer(id, value) {
  return ((id === "breathing" || id === "eyeWarning") && value === "yes") ||
    (id === "change" && value === "rapid");
}

export function getVisibleSymptomQuestions(answers = {}) {
  const visible = symptomQuestions.filter(q => (!q.detail || hasBreakoutDetails(answers)) && (!q.showIf || q.showIf(answers)));
  const stop = visible.findIndex(q => isImmediateStopAnswer(q.id, answers[q.id]));
  return stop < 0 ? visible : visible.slice(0, stop + 1);
}

export function cleanSymptomAnswers(answers) {
  const allowed = new Set(getVisibleSymptomQuestions(answers).map(q => q.id));
  return Object.fromEntries(Object.entries(answers).filter(([key, value]) => allowed.has(key) && symptomQuestions.find(q => q.id === key)?.options.some(o => o.value === value)));
}
