export const COSMETIC_ADDON_VERSION = "optional-cosmetics-v2-catalog-20261109";
export const cosmeticGoals = [
  { value: "support", label: "보습·장벽 보완", detail: "기초의 보습감이 부족할 때 보완할 제품을 찾아요." },
  { value: "sebum", label: "유분감·모공 외관", detail: "번들거림과 모공이 도드라져 보이는 것이 신경 쓰여요." },
  { value: "texture", label: "블랙헤드·거친 피부결", detail: "붉거나 아프지 않은 막힌 피지·거친 결을 관리하고 싶어요." },
  { value: "tone", label: "피부톤·갈색 흔적", detail: "상처가 아문 뒤 남은 갈색 흔적과 피부톤을 관리하고 싶어요." },
  { value: "lines", label: "잔주름 관리", detail: "화장품으로 잔주름을 관리하고 싶어요." },
];
export const cosmeticActiveOptions = [
  { value: "none", label: "순한 세안·보습 제품만 써요" },
  { value: "acid", label: "AHA·BHA·PHA·살리실산 제품" },
  { value: "retinoid", label: "레티놀·레티날·레티노이드 제품" },
  { value: "niacinamide", label: "나이아신아마이드 기능성 제품" },
  { value: "vitaminC", label: "비타민 C 기능성 제품" },
  { value: "benzoyl", label: "파티마겔 등 벤조일퍼옥사이드" },
  { value: "medicine", label: "다른 여드름약·처방약" },
  { value: "unknown", label: "제품 성분을 잘 모르겠어요" },
];
const option = (value, label) => ({ value, label });
export function getCosmeticQuestions(answers = {}, carePlan = {}) {
  const questions = [{ id: "goal", q: "어떤 관리를 추가하고 싶나요?", options: cosmeticGoals }];
  if (!answers.goal) return questions;
  if (answers.goal === "texture" && carePlan.pharmacy && ["closed", "blackhead"].includes(carePlan.answers?.shape)) {
    questions.push({ id: "route", q: "이번에는 어떤 관리 후보를 볼까요?", options: [
      option("cosmetic_first", "이번에는 각질 관리 화장품 후보만 볼게요"),
      option("keep_medicine", "현재 약품 안내를 유지할게요"),
    ] });
  }
  questions.push({ id: "comfort", q: "추가 제품을 쓸 부위가 지금 편안한가요?", options: [
    option("comfortable", "따가움·벗겨짐 없이 편안해요"), option("dry", "조금 건조하지만 따갑지는 않아요"),
    option("irritated", "따갑거나 붉고 벗겨져요"), option("concerning", "붓기·통증이 심하거나 붉어짐이 빠르게 퍼져요"), option("unknown", "잘 모르겠어요"),
  ] });
  if (["irritated", "concerning"].includes(answers.comfort) || carePlan.blockNewBasics) return questions;
  questions.push({ id: "actives", q: "같은 부위에 이미 쓰는 약·기능성 성분을 골라주세요", multiple: true, options: cosmeticActiveOptions });
  if (answers.goal !== "support") questions.push(
    { id: "experience", q: "기능성 제품을 써본 경험은 어떤가요?", options: [option("new", "처음이거나 사용 경험이 적어요"), option("tolerated", "기능성 제품을 자극 없이 사용해봤어요"), option("reacted", "기능성 제품에 자극이 생긴 적이 있어요")] },
    { id: "special", q: "다음 중 해당하는 상황이 있나요?", options: [option("none", "성인이며 임신·임신 준비·수유에 해당하지 않아요"), option("restricted", "미성년자이거나 임신·임신 준비·수유 중이에요"), option("unknown", "잘 모르겠거나 별도 확인이 필요해요")] },
  );
  return questions;
}
export function cleanCosmeticAnswers(input = {}, carePlan = {}) {
  const result = {};
  for (const question of getCosmeticQuestions(input, carePlan)) {
    const answer = input[question.id];
    if (question.multiple) {
      const selected = Array.isArray(answer) ? [...new Set(answer)].filter(value => question.options.some(option => option.value === value)) : [];
      if (selected.includes("unknown") || (selected.includes("none") && selected.length > 1)) result[question.id] = ["unknown"];
      else if (selected.includes("none")) result[question.id] = ["none"];
      else if (selected.length) result[question.id] = selected;
    } else if (question.options.some(option => option.value === answer)) result[question.id] = answer;
  }
  return result;
}
export function isCosmeticComplete(input, carePlan = {}) {
  const answers = cleanCosmeticAnswers(input, carePlan);
  return getCosmeticQuestions(answers, carePlan).every(q => q.multiple ? answers[q.id]?.length > 0 : Boolean(answers[q.id]));
}

// Labels describe the product, not the presence of one ingredient alone.
export const cosmeticProductProfiles = {
  5: { goals: ["texture"], families: ["acid", "niacinamide"], intensity: "exfoliant", label: "각질 관리 화장품", source: "https://www.cosrx.co.kr/m/product_detail.html?brand_uid=1173596" },
  13: { goals: ["sebum"], families: ["niacinamide"], intensity: "high", label: "유분감 관리 화장품", source: "https://www.cosdebaha.co.kr/product/n-세럼-30ml/70/" },
  14: { goals: ["sebum"], families: ["niacinamide"], intensity: "high", label: "모공 외관 관리 화장품", source: "https://www.cosrx.co.kr/shop/shopdetail.html?branduid=1177564" },
  23: { goals: ["tone", "lines"], families: ["niacinamide"], intensity: "gentle", label: "미백·주름개선 기능성", source: "https://manyo.co.kr/goods/goods_view.php?goodsNo=1709" },
  24: { goals: ["support"], families: [], intensity: "support", label: "보습·장벽 보완 화장품" },
  25: { goals: ["support"], families: [], intensity: "support", label: "수분·진정 보조 화장품" },
  38: { goals: ["sebum"], families: [], intensity: "support", label: "산뜻한 유수분 관리 화장품" },
  45: { goals: ["support"], families: [], intensity: "support", label: "보습·장벽 보완 화장품" },
  47: { goals: ["support"], families: [], intensity: "support", label: "수분 보충 화장품" },
  49: { goals: ["texture"], families: ["acid"], intensity: "exfoliant", label: "각질 관리 화장품", source: "https://www.cosrx.co.kr/shop/shopdetail.html?branduid=191" },
  51: { goals: ["tone", "lines"], families: ["niacinamide"], intensity: "gentle", label: "미백·주름개선 기능성", source: "https://m.manyo.co.kr/goods/goods_view.php?goodsNo=1000000233" },
  57: { goals: ["support"], families: [], intensity: "support", label: "가벼운 젤 보습 보완" },
  58: { goals: ["support"], families: [], intensity: "support", label: "건조 부위 보습 보완" },
  63: { goals: ["support"], families: [], intensity: "support", label: "보습 마무리 비교 후보" },
  65: { goals: ["support"], families: [], intensity: "support", label: "수분 보충 세럼" },
  69: { goals: ["tone"], families: ["niacinamide"], intensity: "gentle", label: "피부톤 보완 화장품", source: "https://isntree.com/product/detail.html?product_no=36" },
};
