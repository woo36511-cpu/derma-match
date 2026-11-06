const option = (label, value) => ({ label, value });
const unknown = option("잘 모르겠어요", "unknown");
const yesNo = [option("네", "yes"), option("아니요", "no"), unknown];
const hasActiveConcern = a => ["breakouts", "blackheads", "sensitive", "sudden", "other"].includes(a.concern);

export const hasMildFacialBumps = a => a.concern === "breakouts" &&
  a.form === "papules" && a.comedones === "yes" && a.itch === "none" &&
  a.shaving === "no" && a.pain === "none" && ["face", "chin", "hairline"].includes(a.area);
const comfortableRoutine = a => a.basicRoutine === "both" && a.barrier === "none" &&
  a.surface === "intact" && ["new", "stable", "improving"].includes(a.change) && a.recentProduct === "none";
export const mayAskAboutActives = a => comfortableRoutine(a) &&
  (a.blackheadPattern === "dark" || hasMildFacialBumps(a));

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
  { id: "basicRoutine", guidedOnly: true, q: "평소에 세안제나 보습제를 쓰나요?", options: [
    option("세안제와 보습제를 둘 다 써요", "both"),
    option("세안제만 써요", "cleanser"),
    option("보습제만 써요", "moisturizer"),
    option("둘 다 거의 안 써요", "neither"), unknown,
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
  { id: "blackheadPattern", guidedOnly: true, q: "신경 쓰이는 모공은 어떤 모습인가요?", showIf: a => a.concern === "blackheads", options: [
    option("붉거나 아프지 않고 검게 막힌 점이 보여요", "dark"),
    option("코에 작은 회색 점이 비슷한 크기로 고르게 보여요", "even"),
    option("붉고 아프거나 고름이 있는 돌기도 있어요", "inflamed"), unknown,
  ] },
  { id: "currentActives", guidedOnly: true, q: "그 부위에 각질 제거제, 레티놀, 여드름 약을 이미 쓰고 있나요?", showIf: mayAskAboutActives, options: [
    option("쓰고 있어요", "yes"), option("쓰지 않아요", "no"), unknown,
  ] },
  { id: "moisturizerFit", guidedOnly: true, q: "세안 뒤 보습제를 발라도 당김이 이어지나요?", showIf: a => a.concern === "dry" && a.barrier === "dry" && ["both", "moisturizer"].includes(a.basicRoutine) && a.surface === "intact" && a.recentProduct === "none", options: [
    option("바른 뒤에도 금방 다시 당겨요", "insufficient"), option("세안 뒤에는 잘 안 발라요", "irregular"), unknown,
  ] },
  { id: "sensitiveCare", guidedOnly: true, q: "지금 따갑거나 붉은지, 진정 세럼을 쓰는지 확인할게요.", showIf: a => a.concern === "sensitive" && a.barrier === "none" && a.surface === "intact" && a.recentProduct === "none" && ["stable", "improving"].includes(a.change), options: [
    option("지금은 편안하고 진정 세럼을 안 써요", "comfortable_no_serum"),
    option("지금은 편안하고 쓰는 진정 세럼이 있어요", "comfortable_with_serum"),
    option("지금도 따갑거나 붉어요", "irritated"), unknown,
  ] },
  { id: "usesToner", guidedOnly: true, q: "이미 쓰고 있는 토너가 있나요?", showIf: a => a.concern === "oily" && a.barrier === "none" && a.basicRoutine === "both" && a.surface === "intact" && a.recentProduct === "none", options: yesNo },
  { id: "usesSunscreen", guidedOnly: true, q: "외출할 때 잘 맞는 선크림을 쓰고 있나요?", showIf: a => a.concern === "wrinkles" && a.barrier === "none" && a.basicRoutine !== "neither" && a.surface === "intact" && a.recentProduct === "none", options: [
    option("잘 맞는 선크림을 쓰고 있어요", "yes"), option("쓰는 선크림이 없어요", "no"),
    option("쓰는 제품이 있지만 따갑거나 불편해요", "uncomfortable"), unknown,
  ] },
  { id: "habit", legacyOnly: true, q: "부담을 줄이면서 먼저 해볼 관리 하나를 고른다면?", options: [
    option("세안·보습을 단순하게 정리하기", "barrier"),
    option("최근 바꾼 화장품을 하나씩 점검하기", "products"),
    option("지금은 추가하지 않고 상태만 기록하기", "observe"),
  ] },
];

export function isImmediateStopAnswer(id, value) {
  return ((id === "breathing" || id === "eyeWarning") && value === "yes") ||
    (id === "change" && value === "rapid");
}

export function getVisibleSymptomQuestions(answers = {}, { guided = false } = {}) {
  const visible = symptomQuestions
    .filter(q => (!q.guidedOnly || guided) && (!q.legacyOnly || !guided) &&
      (!q.detail || hasBreakoutDetails(answers)) && (!q.showIf || q.showIf(answers)))
    .map(q => {
      if (!guided) return q;
      if (q.id === "barrier") return { ...q, q: "세안 후나 평소 보습제를 바를 때 피부가 어때요?" };
      if (q.id === "area") return { ...q, options: [
        ...q.options.slice(0, 1), option("턱·턱선", "chin"), option("볼·코 등 얼굴의 다른 부위", "face"), ...q.options.slice(2),
      ] };
      if (q.id !== "concern") return q;
      return { ...q, options: [
        q.options[0], option("블랙헤드처럼 검게 막힌 모공이 신경 쓰여요", "blackheads"),
        ...q.options.slice(1, 5), option("잔주름이 신경 쓰여요", "wrinkles"), ...q.options.slice(5),
      ] };
    });
  const stop = visible.findIndex(q => isImmediateStopAnswer(q.id, answers[q.id]));
  return stop < 0 ? visible : visible.slice(0, stop + 1);
}

export function cleanSymptomAnswers(answers, options) {
  return Object.fromEntries(getVisibleSymptomQuestions(answers, options)
    .filter(q => q.options.some(o => o.value === answers[q.id]))
    .map(q => [q.id, answers[q.id]]));
}
