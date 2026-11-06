import { blackheadCosmetics, pharmacyOptions, sunscreenOption } from "../data/targetedCareProducts";
import { canPairMildBumpCare, getCareConcern, hasCalmClosedBumps, hasMildFacialBumps, hasRecentCosmetic, mayAskAboutActives } from "../data/symptomQuestions";
import { products } from "../data/products";
import { hasExfoliatingActive, isProductAvailable, isSpecializedTreatmentProduct } from "./productCatalog";
import { sortProductsForRecommendation } from "./recommendationScoring";

export const hydrationQuestion = {
  id: "afternoonSkin",
  q: "오후가 되면 피부가 보통 어떤가요?",
  options: [
    { label: "건조하고 당기는 느낌이 이어져요", value: "dry" },
    { label: "번들거리는데 속은 당겨요", value: "mixed" },
    { label: "번들거림이 더 신경 쓰여요", value: "oily" },
    { label: "대체로 편안해요", value: "comfortable" },
    { label: "잘 모르겠어요", value: "unknown" },
  ],
};

const shouldPauseSensitiveCare = answers => answers.concern === "sensitive" &&
  (["irritated", "unknown"].includes(answers.sensitiveCare) || answers.recentProduct !== "none");

export function needsHydrationQuestion(assessment) {
  return assessment?.guidedCare && assessment.complete && !assessment.blockRoutine && !shouldPauseSensitiveCare(assessment.answers) && !hasRecentCosmetic(assessment.answers) && !canPairMildBumpCare(assessment.answers) &&
    (assessment.answers.barrier === "dry" || assessment.answers.basicRoutine === "neither");
}

const concernCare = {
  blackheads: { action: "코팩·압출을 쉬고, 코를 순하게 씻어요.", actionDetail: "손끝과 순한 세안제로 코를 가볍게 씻고, 수건으로 눌러 닦아요. 당기거나 각질이 일어난다면 기존에 잘 맞던 보습제를 발라요.", observation: "막혀 보이는 점이 줄고 자극이 생기지 않는지" },
  breakouts: { action: "땀을 흘린 뒤에는 순하게 씻고, 돌기는 짜지 않아요.", actionDetail: "오늘은 돌기 위에 스크럽이나 필링을 쓰지 말고, 세안할 때 손끝으로 가볍게 씻어요.", observation: "새로 올라오는 트러블이 줄었는지" },
  oily: { action: "오후 번들거림은 기름종이로 가볍게 눌러요.", actionDetail: "이마·코처럼 번들거리는 곳에만 기름종이를 잠깐 대고 떼요. 번들거릴 때마다 다시 씻거나 문지르지 않아요.", observation: "오후에 어느 부위가 얼마나 번들거리는지" },
  wrinkles: { action: "아침에 보습하고, 외출 전에 선크림을 발라요.", actionDetail: "건조한 부위에는 잘 맞던 보습제를 바르고, 외출할 때는 노출되는 얼굴과 목에 선크림을 챙겨요.", observation: "건조해서 더 도드라져 보이던 잔주름이나 당김이 줄었는지" },
  marks: { action: "갈색 자국에는 아침에 자외선 차단부터 해요.", actionDetail: "외출 전에 얼굴의 노출 부위에 잘 맞던 SPF 30 이상 선크림을 발라요. 지금 따갑다면 새 미백 제품이나 필링을 더하지 않아요.", observation: "새 트러블이 생기는지와 기존 갈색 자국이 옅어지는지" },
  sensitive: { action: "따갑던 부위는 스크럽을 쉬고 가볍게 씻어요.", actionDetail: "미지근한 물로 문지르지 않고 씻고, 잘 맞던 보습제가 있다면 그 제품만 사용해요.", observation: "어떤 제품을 썼을 때 불편함이 생기는지" },
  dry: { action: "세안 뒤 피부가 살짝 촉촉할 때 보습제를 발라요.", observation: "당김이 언제 시작되고 얼마나 지속되는지" },
  none: { action: "지금 편안한 관리를 이어가요.", observation: "당김이나 따가움 없이 편안한지" },
  other: { action: "불편한 부위는 문지르지 말고 새 기능성 제품을 쉬어요.", actionDetail: "지금은 그 부위를 미지근한 물로 가볍게 씻어요. 건조함·따가움·돌기 중 가장 불편한 게 있다면 그 항목으로 바꿔 더 맞는 관리를 확인할 수 있어요.", editAnswer: "concern", observation: "건조함·따가움·돌기 중 무엇이 주된 불편인지" },
};

const hydrationLevels = { dry: 3, mixed: 5, oily: 7, comfortable: 5 };
const gentleBasics = products.filter(product => isProductAvailable(product) &&
  product.beginnerFriendly && product.sensitivitySafe && !hasExfoliatingActive(product) &&
  (!isSpecializedTreatmentProduct(product) || product.id === 38 || product.id === 34));
const basicMoisturizers = gentleBasics.filter(product => product.category === "cream");
const starterSlots = [
  ["cleanser", ["cleanser", "gel_cleanser", "cleansing_milk"]],
  ["toner", ["toner"]], ["serum", ["serum"]], ["cream", ["cream"]],
];

function beginnerPlan(answers, care) {
  const level = hydrationLevels[answers.afternoonSkin] ?? null;
  const matchingLevel = level ?? 5;
  const userContext = { level: matchingLevel, goal: "기초 관리" };
  const starterProducts = Object.fromEntries(starterSlots.map(([slot, categories]) => {
    const candidates = gentleBasics.filter(product => categories.includes(product.category));
    const minDistance = Math.min(...candidates.map(product => Math.abs(product.hydrationLevel - matchingLevel)));
    const closest = candidates.filter(product => Math.abs(product.hydrationLevel - matchingLevel) === minDistance);
    return [slot, sortProductsForRecommendation(closest, matchingLevel, userContext)[0]];
  }));
  return {
    action: "기초는 세안제와 크림부터 시작해요.",
    observation: "세안 후 당김·따가움이나 오후 번들거림이 달라지는지",
    concernTip: answers.concern === "none" ? null : care.action,
    reason: level == null
      ? "평소 세안제와 보습제를 거의 쓰지 않고 오후 상태도 확실하지 않다고 답했어요. 특정 피부타입으로 판단하지 않고 중간 보습감으로 시작할 후보를 보여줘요."
      : "평소 세안제와 보습제를 거의 쓰지 않는다고 답했어요. 오후에 느끼는 당김과 번들거림에 맞춰 후보를 골랐어요.",
    level, starterProducts, userContext,
  };
}

function catalogOption(id, type, guidance) {
  const product = products.find(item => item.id === id && isProductAvailable(item));
  if (!product) return null;
  return { type, name: product.name, guidance, source: product.evidence?.sources?.[0]?.url || product.link };
}

function targetedPlan(answers, priorTrial) {
  const { concern, basicRoutine, barrier, surface, recentProduct } = answers;
  const closedBumps = hasCalmClosedBumps(answers);
  const usesSalicylicAcid = concern === "blackheads" || closedBumps;
  if (concern === "blackheads" && answers.blackheadPattern === "even") return {
    action: "고르게 보이는 회색 점에는 코팩과 압출을 쉬어요.",
    actionDetail: "코는 미지근한 물과 순한 세안제로 가볍게 씻어요. 고른 회색 점은 피지선 필라멘트일 수 있어서 억지로 다 빼낼 필요는 없어요.",
    reason: "코에 크기가 비슷한 회색 점이 고르게 보인다고 답했어요.",
  };
  if (concern === "blackheads" && answers.blackheadPattern === "inflamed") return {
    action: "붉고 아픈 돌기에는 코팩이나 살리실산을 바르지 않아요.",
    actionDetail: "오늘은 그 부위를 짜지 말고 손끝으로 가볍게 씻어요. 붉은 돌기와 고름이 주된 문제라면 ‘트러블이나 좁쌀’ 경로에서 모양과 통증을 확인해요.",
    editAnswer: "concern",
  };
  if (concern === "blackheads" && answers.blackheadPattern === "unknown") return {
    action: "코팩은 쉬고 밝은 곳에서 점의 모양을 확인해요.",
    actionDetail: "검게 막힌 점인지, 크기가 고른 회색 점인지, 붉고 아픈 돌기인지 봐요. 확인한 답만 바꾸면 그에 맞는 관리를 볼 수 있어요.",
    editAnswer: "blackheadPattern",
  };
  if ((barrier !== "none" && !canPairMildBumpCare(answers)) || surface !== "intact" || recentProduct !== "none") {
    if (concern === "blackheads" || concern === "breakouts") return {
      productNote: "각질이 들뜨거나 자극이 있다면 그 부위의 스크럽과 각질 제거는 쉬고, 세안 뒤 잘 맞던 보습제를 발라요.",
    };
    return {};
  }

  if ((usesSalicylicAcid || hasMildFacialBumps(answers)) && mayAskAboutActives(answers)) {
    if (answers.currentActives === "yes") return {
      action: concern === "blackheads" ? "코팩과 압출은 쉬고, 쓰던 각질 제품에 하나 더 겹치지 않아요." : "턱이나 얼굴의 돌기 위에 스크럽을 쓰지 않아요.",
      actionDetail: "같은 부위에 쓰는 여드름약이나 각질 제품은 새로 겹치지 않아요. 새 화장품이 바를 때마다 따갑다면 그 제품만 쉬어요. 처방약은 기존 안내대로 써요.",
      editAnswer: "currentActives",
      reason: "같은 부위에 이미 여드름약이나 기능성 제품을 쓰고 있다고 답했어요.",
    };
    if (answers.currentActives !== "no") return {
      action: "바르는 제품 포장을 보고, 새 약을 더하기 전에 답을 확인해요.",
      actionDetail: "제품 앞면이나 성분표에 여드름약, AHA·BHA, 레티놀 표시가 있는지 찾아요. 순한 세안제와 보습제만 쓴다면 ‘쓰지 않아요’로 바꿔서 맞는 관리 후보를 볼 수 있어요.",
      editAnswer: "currentActives",
      reason: "같은 부위에 약이나 기능성 제품을 쓰는지 아직 확실하지 않아요.",
    };
    const pharmacy = closedBumps ? pharmacyOptions.closedBumps : usesSalicylicAcid ? pharmacyOptions.blackheads : pharmacyOptions.breakouts;
    if (priorTrial?.reaction === "worse" || priorTrial?.product === pharmacy.name) return {
      action: "이번에는 새 여드름약을 더하지 않아요.",
      actionDetail: "새로 시도한 제품은 쉬고, 당분간 돌기 위 스크럽과 각질 제거도 멈춰요. 세안은 가볍게 하고 잘 맞던 보습만 유지해요.",
      productNote: "같은 문제가 계속되거나 새 고름·통증이 늘면 제품을 바꿔가며 시험하기보다 진료로 원인을 확인해요.",
    };
    if (closedBumps) return {
      action: "붉지 않은 좁쌀에는 살리실산 제품 하나를 써볼 수 있어요.",
      actionDetail: "붉거나 아픈 곳이 아닌 막힌 좁쌀 부위에만 사용해요. 아래 제품을 고르면 같은 부위에 각질 제거제나 레티놀을 새로 겹치지 않아요.",
      reason: "살색·하얀 좁쌀과 막힌 피지가 함께 보이고, 가렵거나 아프지 않다고 답했어요.",
      pharmacy,
      recheck: "붉어지거나 자극이 생기면 중단해요. 설명서대로 여러 번 사용해도 나아지지 않으면 계속 덧바르지 말고, 막힌 면포인지 확인해 치료 방향을 정해요.",
    };
    if (concern === "blackheads") {
      return {
        action: "검게 막힌 점은 압출 대신 살리실산 제품 하나로 관리해요.",
        actionDetail: "약국 외용액과 살리실산 화장품은 대안이에요. 지금 쓰는 세안제와 바꿀지, 검은 점에만 쓰는 약국 제품을 고를지 하나만 골라요.",
        reason: "붉거나 아프지 않은 검게 막힌 점이 있고, 같은 부위에 다른 각질 제품을 쓰지 않는다고 답했어요.",
        cosmetics: blackheadCosmetics,
        pharmacy,
        productNote: "세안제·토너·리퀴드·약국 제품은 서로 대안이에요. 동시에 시작하거나 각질 제거제와 겹치지 말고, 따갑거나 붉어지면 새 제품을 중단해요.",
        recheck: "쓴 제품 하나와 시작일을 기록해요. 자극이 생기거나 악화하면 다른 제품을 추가하기 전에 다시 확인해요.",
      };
    }
    return {
      action: answers.area === "chin" ? "턱의 작은 붉은 뾰루지에만 애크논크림을 써볼 수 있어요." : "작은 붉은 뾰루지에만 애크논크림을 써볼 수 있어요.",
      actionDetail: "작고 붉은 뾰루지가 있을 때만 아래 제품을 봐요. 고름이 주로 보이거나 어떤 돌기인지 헷갈리면 새 약을 시험하지 말고 아래에서 양상을 비교해요.",
      pharmacy,
      reason: "같은 부위에 막힌 피지가 있고, 가려움·통증·면도 자극이나 털구멍 중심 고름을 보고하지 않았어요. 작은 붉은 뾰루지에 쓸 수 있는 후보를 골랐어요.",
      productNote: "세안제와 보습제는 유지해요. 새 여드름약은 한 가지로 시작하고, 같은 부위에 각질제거제나 다른 여드름약을 더하지 않아요.",
      recheck: "시작일과 새 돌기 수를 기록해요. 더 따갑거나 붉어지거나 좋아지지 않으면 중단하고 피부 상태를 다시 체크해요. 빠르게 번지거나 통증이 심해지면 진료받으세요.",
    };
  }
  if (concern === "breakouts" && answers.form === "pustules" && answers.comedones === "yes" && answers.follicular === "no" && answers.itch === "none") return {
    action: "고름 뾰루지가 주라면 염증성 여드름에 맞는 치료인지 확인해요.",
    actionDetail: "막힌 피지도 있지만 고름 뾰루지가 주된 상태예요. 고름이 있는 부위에 살리실산이나 새 각질 제품을 바르지 말고, 피부과에서는 ‘막힌 피지와 고름 뾰루지가 함께 난다’고 설명하고 염증성 여드름에 쓰는 치료가 맞는지 물어보세요.",
    reason: "고름과 면포가 함께 있어 염증성 여드름을 살펴볼 수 있지만, 이 답변만으로 원인을 확정할 수 없어요.",
    treatmentInfo: {
      text: "염증성 여드름으로 확인되면 벤조일퍼옥사이드가 포함된 치료 등 상태에 맞는 선택지를 검토할 수 있어요. 털구멍 중심의 고름이나 가려움이 뚜렷하다면 먼저 다른 원인을 구분해요.",
      source: "https://www.aad.org/member/clinical-quality/guidelines/acne",
    },
  };
  if (concern === "oily" && basicRoutine === "both" && answers.usesToner === "no") {
    const product = catalogOption(38, "선택 · 가벼운 토너", "세안제와 보습제가 편하다면 그대로 두세요. 가벼운 토너가 필요한 경우에만 보는 선택지예요.");
    return { cosmetics: product ? [product] : [] };
  }
  if (concern === "sensitive" && basicRoutine === "both" && answers.sensitiveCare === "comfortable_no_serum") {
    const product = catalogOption(25, "선택 · 진정 앰플", "현재 세안제와 보습제가 편하면 유지해요. 피부가 편안할 때 한 가지 보조 제품만 검토해요.");
    return { cosmetics: product ? [product] : [] };
  }
  if (concern === "wrinkles" && answers.usesSunscreen === "no") return { cosmetics: [sunscreenOption] };
  if (concern === "wrinkles" && answers.usesSunscreen === "yes") return { keep: "잘 맞던 선크림과 기초 관리는 유지해요." };
  if (concern === "wrinkles" && answers.usesSunscreen === "uncomfortable") {
    return { productNote: "불편했던 선크림은 억지로 계속 쓰지 말고, 어떤 반응이 있었는지 확인한 뒤 바꿀 후보를 좁혀요." };
  }
  return {};
}

export function buildFirstVisitPlan(assessment) {
  if (!assessment?.guidedCare || !assessment.complete || assessment.blockRoutine) return null;
  const { area, basicRoutine, afternoonSkin } = assessment.answers;
  const concern = getCareConcern(assessment.answers);
  const care = concern === "breakouts" && area === "chin"
    ? { ...concernCare.breakouts, observation: "턱에 새로 올라오는 돌기 수와 따가움이 달라지는지" }
    : concernCare[concern] ?? concernCare.other;
  if (hasRecentCosmetic(assessment.answers)) return {
    ...care,
    action: "바를 때마다 불편했던 새 화장품 한 가지만 쉬어요.",
    actionDetail: "반응이 분명한 제품이 없다면 아래 점검 순서로 바른 날짜와 피부가 달라진 날짜부터 비교해요.",
    productNote: "새 제품은 더하지 말고, 아래 순서로 바르기 시작한 날과 피부가 달라진 날을 비교해요.",
  };
  if (shouldPauseSensitiveCare(assessment.answers)) return {
    ...care,
    reason: "새 제품을 고르기 전에 따가움과 붉어짐이 언제 생기는지 확인해야 해요.",
    productNote: "피부 반응이 확인될 때까지 새 제품을 추가하지 않아요.",
  };
  if (basicRoutine === "neither") return beginnerPlan(assessment.answers, care);

  const maintenance = {
    both: "잘 맞던 세안제와 보습제는 유지해요.",
    cleanser: "편안하게 쓰던 세안제는 유지해요.",
    moisturizer: "편안하게 쓰던 보습제는 유지해요.",
    neither: "불편이 없다면 제품을 새로 추가할 필요는 없어요.",
    unknown: "지금 편안하게 쓰는 제품이 있다면 그대로 유지해요.",
  };
  if (!needsHydrationQuestion(assessment)) {
    return {
      ...care,
      keep: maintenance[basicRoutine],
      reason: null,
      ...targetedPlan({ ...assessment.answers, concern }, assessment.priorTrial),
    };
  }

  const hasMoisturizer = ["both", "moisturizer"].includes(basicRoutine);
  const level = hydrationLevels[afternoonSkin] ?? null;
  const userContext = { level, isSensitive: false, goal: "보습" };
  const replacingMoisturizer = hasMoisturizer && assessment.answers.moisturizerFit === "insufficient";
  const product = level == null || (hasMoisturizer && !replacingMoisturizer) || basicRoutine === "unknown" ? null :
    sortProductsForRecommendation(basicMoisturizers, level, userContext)[0] ?? null;

  return {
    action: replacingMoisturizer ? "세안 뒤 금방 당긴다면 보습제 한 가지만 바꿔봐요."
      : hasMoisturizer ? "지금 보습제를 세안 뒤에 발라보고 당김을 확인해요."
      : basicRoutine === "unknown" ? "세안 후 무엇을 바르고 있는지 먼저 확인해요."
      : "세안 후 보습제 한 가지만 먼저 써봐요.",
    actionDetail: "미지근한 물로 씻고, 피부가 살짝 촉촉할 때 보습제를 발라요.",
    keep: basicRoutine === "both" || basicRoutine === "cleanser" ? "편안하게 쓰던 세안제는 유지해요." : null,
    observation: "세안 뒤 당김이 줄고 새로 따갑지 않은지",
    concernTip: ["breakouts", "oily", "wrinkles"].includes(concern) ? care.action : null,
    reason: "세안 뒤 당김이 있다고 답했어요. 기초 제품을 한꺼번에 바꾸지 않고 보습부터 확인해요.",
    productNote: concern === "blackheads" ? "당김이 있는 동안은 새 각질 관리 제품을 더하지 않아요."
      : replacingMoisturizer ? "후보를 쓰기로 했다면 기존 보습제에 겹쳐 바르기보다 한 가지만 바꿔요. 같은 제품을 이미 쓰고 있다면 다시 구매할 필요는 없어요." : null,
    level, product, userContext,
  };
}
