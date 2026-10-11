import { products } from "../data/products";
import { starterRoutineByLevel } from "../data/routines";

export function getProductById(id) {
  return products.find((product) => product.id === id);
}

export function getRoutineProducts(level) {
  const routineData = starterRoutineByLevel[level];
  if (!routineData) return null;

  const routineIds = routineData.products;

  return {
    label: routineData.label,
    description: routineData.description,
    focus: routineData.focus,
    products: {
      cleanser: getProductById(routineIds.cleanser),
      toner: getProductById(routineIds.toner),
      serum: getProductById(routineIds.serum),
      cream: getProductById(routineIds.cream),
    },
  };
}

export function getCategoryLabel(key) {
  const map = {
    cleanser: "클렌저",
    toner: "토너",
    serum: "세럼",
    cream: "크림",

    cleansing_oil: "클렌징 오일",
    cleansing_milk: "클렌징 밀크",
    gel_cleanser: "젤 클렌저",
    bha_cleanser: "BHA 클렌저",
    enzyme_cleanser: "효소 클렌저",
  };

  return map[key] || key;
}

export function isProductAvailable(product) {
  return !!product && product.isAvailable !== false;
}

export function isValidProductLink(link) {
  return !!link && link !== "#";
}

export function hasExfoliatingActive(product) {
  if (!product) return false;

  const ingredients = product.ingredients || [];
  const activeIngredients = product.activeIngredients || [];
  const shortKeywordPattern = /(^|[^a-z])(aha|bha|pha|lha)([^a-z]|$)/;
  const exfoliatingKeywords = [
    "베타인살리실레이트",
    "salicylic acid",
    "살리실릭애씨드",
    "살리실산",
    "glycolic acid",
    "글라이콜릭애씨드",
    "mandelic acid",
    "만델릭애씨드",
    "gluconolactone",
    "글루코노락톤",
    "capryloyl salicylic acid",
    "카프릴로일살리실릭애씨드",
  ];

  const names = [
    ...ingredients,
    ...activeIngredients.map((ingredient) => ingredient.name),
  ];

  return names.some((ingredient) => {
    const normalized = String(ingredient).toLowerCase();

    return (
      shortKeywordPattern.test(normalized) ||
      exfoliatingKeywords.some((keyword) => normalized.includes(keyword))
    );
  });
}

export function isSpecializedTreatmentProduct(product) {
  if (!product) return false;

  const concerns = product.concerns || [];

  const specializedConcerns = [
    "acne",
    "closed_comedones",
    "blackhead",
    "pores",
    "sebum",
    "deadskin",
  ];

  return (
    hasExfoliatingActive(product) ||
    specializedConcerns.some((concern) => concerns.includes(concern))
  );
}

export function isProductAllowedForContext(
  product,
  category,
  userContext = {},
) {
  if (!isProductAvailable(product)) {
    return false;
  }

  const { inflammationCareNeed = 0, soothingNeed = 0 } =
    userContext.careNeeds || {};

  const isLeaveOn = ["toner", "serum", "cream"].includes(category);

  // AHA/BHA 같은 각질 기능성은
  // 기본 루틴이 아니라 별도 치료/옵션 단계에서 다룸
  if (isLeaveOn && hasExfoliatingActive(product)) {
    return false;
  }

  // 염증/민감 필요도가 매우 높은 경우에는
  // 민감 안전 표기가 없는 leave-on 제품도 기본 후보에서 제외
  if (
    isLeaveOn &&
    (inflammationCareNeed >= 8 || soothingNeed >= 9) &&
    !product.sensitivitySafe
  ) {
    return false;
  }

  return true;
}
