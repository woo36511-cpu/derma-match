import { blackheadCosmetics, pharmacyOptions, sunscreenOption } from "../data/targetedCareProducts";
import { hasMildFacialBumps, mayAskAboutActives } from "../data/symptomQuestions";
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
  return assessment?.guidedCare && assessment.complete && !assessment.blockRoutine && !shouldPauseSensitiveCare(assessment.answers) &&
    (assessment.answers.barrier === "dry" || assessment.answers.basicRoutine === "neither");
}

const concernCare = {
  blackheads: { action: "검은 점을 짜거나 세게 문지르지 않아요.", observation: "막혀 보이는 점이 줄고 자극이 생기지 않는지" },
  breakouts: { action: "땀을 흘린 뒤에는 순하게 씻고, 돌기는 짜지 않아요.", observation: "새로 올라오는 트러블이 줄었는지" },
  oily: { action: "번들거리는 부위만 기름종이로 가볍게 눌러 닦아요.", observation: "오후에 어느 부위가 얼마나 번들거리는지" },
  wrinkles: { action: "외출할 때 자외선 차단을 챙겨요.", observation: "외출 전에 자외선 차단을 챙길 수 있었는지" },
  sensitive: { action: "자극이 느껴졌던 제품을 하나씩 확인해요.", observation: "어떤 제품을 썼을 때 불편함이 생기는지" },
  dry: { action: "세안 뒤 당김이 있다면 잘 맞던 보습제를 발라요.", observation: "당김이 언제 시작되고 얼마나 지속되는지" },
  none: { action: "지금 편안한 관리를 이어가요.", observation: "당김이나 따가움 없이 편안한지" },
  other: { action: "가장 불편한 부위와 달라진 점을 기록해요.", observation: "같은 부위가 계속 불편한지" },
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

function targetedPlan(answers) {
  const { concern, basicRoutine, barrier, surface, recentProduct } = answers;
  if (barrier !== "none" || surface !== "intact" || recentProduct !== "none") {
    if (concern === "blackheads" || concern === "breakouts") {
      return { productNote: "지금은 새 각질 제품이나 여드름 약을 더하지 말고, 기존 제품과 피부 반응부터 확인해요." };
    }
    return {};
  }

  if (concern === "blackheads" || hasMildFacialBumps(answers)) {
    if (!mayAskAboutActives(answers) || answers.currentActives !== "no") {
      if (concern === "blackheads" && answers.blackheadPattern !== "dark") {
        return {
          action: "코팩이나 압출은 쉬고, 점의 모양을 먼저 확인해요.",
          productNote: "점의 종류가 뚜렷하지 않거나 붉은 돌기가 섞여 있어요. 새 각질 제품을 더하기 전에 어느 부위에 어떤 돌기가 늘어나는지 확인해요.",
        };
      }
      return {
        action: "같은 부위에 쓰는 기능성 제품부터 확인해요.",
        productNote: answers.currentActives === "yes"
          ? "쓰고 있는 각질제거제·레티놀·여드름약의 제품명과 시작일을 적어두세요. 새 여드름약이나 각질제거제를 겹쳐 쓰지 않아요."
          : "지금 쓰는 제품을 약사에게 보여주거나 사용 여부를 확인한 뒤 설문을 다시 진행해요. 그 전에는 새 기능성 제품을 추가하지 않아요.",
      };
    }
    if (concern === "blackheads") {
      return {
        action: "블랙헤드 관리는 제품 한 가지부터 골라요.",
        cosmetics: blackheadCosmetics,
        pharmacy: pharmacyOptions.blackheads,
        productNote: "세안제·토너·리퀴드·약국 제품은 서로 대안이에요. 동시에 시작하거나 각질 제거제와 겹치지 말고, 따갑거나 붉어지면 새 제품을 중단해요.",
        recheck: "쓴 제품 하나와 시작일을 기록해요. 자극이 생기거나 악화하면 다른 제품을 추가하기 전에 다시 확인해요.",
      };
    }
    return {
      action: answers.area === "chin" ? "턱 트러블에 쓸 여드름약 후보를 약국에서 확인해요." : "트러블에 쓸 여드름약 후보를 약국에서 확인해요.",
      pharmacy: pharmacyOptions.breakouts,
      reason: "같은 부위에 막힌 피지가 있고, 가려움·통증·면도 자극이나 털구멍 중심 고름을 보고하지 않았어요. 여드름약을 확인할 단서예요.",
      productNote: "세안제와 보습제는 유지해요. 약사에게 턱이나 얼굴의 현재 상태와 쓰는 제품을 보여주고, 적합하다고 확인된 경우에만 한 가지를 시작해요.",
      recheck: "시작일과 새 돌기 수를 기록해요. 자극이 심해지거나 트러블이 빠르게 번지면 다른 약을 추가하지 말고 다시 확인해요.",
    };
  }
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
  const { concern, area, basicRoutine, afternoonSkin } = assessment.answers;
  const care = concern === "breakouts" && area === "chin"
    ? { ...concernCare.breakouts, observation: "턱에 새로 올라오는 돌기 수와 따가움이 달라지는지" }
    : concernCare[concern] ?? concernCare.other;
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
      reason: "답변에서 기본 관리를 바꿔야 할 뚜렷한 불편이 확인되지 않았어요.",
      ...targetedPlan(assessment.answers),
    };
  }

  const hasMoisturizer = ["both", "moisturizer"].includes(basicRoutine);
  const level = hydrationLevels[afternoonSkin] ?? null;
  const userContext = { level, isSensitive: false, goal: "보습" };
  const replacingMoisturizer = hasMoisturizer && assessment.answers.moisturizerFit === "insufficient";
  const product = level == null || (hasMoisturizer && !replacingMoisturizer) || basicRoutine === "unknown" ? null :
    sortProductsForRecommendation(basicMoisturizers, level, userContext)[0] ?? null;

  return {
    action: replacingMoisturizer ? "보습제만 바꿀 후보를 확인해요."
      : hasMoisturizer ? "지금 보습제를 세안 뒤에 발라보고 당김을 확인해요."
      : basicRoutine === "unknown" ? "세안 후 무엇을 바르고 있는지 먼저 확인해요."
      : "세안 후 보습제 한 가지만 먼저 써봐요.",
    keep: basicRoutine === "both" || basicRoutine === "cleanser" ? "편안하게 쓰던 세안제는 유지해요." : null,
    observation: "세안 뒤 당김이 줄고 새로 따갑지 않은지",
    concernTip: ["breakouts", "oily", "wrinkles"].includes(concern) ? care.action : null,
    reason: "세안 뒤 당김이 있다고 답했어요. 기초 제품을 한꺼번에 바꾸지 않고 보습부터 확인해요.",
    productNote: concern === "blackheads" ? "당김이 있는 동안은 새 각질 관리 제품을 더하지 않아요."
      : replacingMoisturizer ? "후보를 쓰기로 했다면 기존 보습제에 겹쳐 바르기보다 한 가지만 바꿔요. 같은 제품을 이미 쓰고 있다면 다시 구매할 필요는 없어요." : null,
    level, product, userContext,
  };
}
