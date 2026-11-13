import { getProductById, hasExfoliatingActive } from "./productCatalog";
import { getRankedProductCandidates } from "./routineRecommendation";
import { getRoutineLookupProduct, routineLookupCategories } from "./routineLookup";

export const CURRENT_ROUTINE_LIMIT = 12;
const keyPrefix = "dearsince_current_routine_v1:";
const option = (value, label) => ({ value, label });
const comfortable = option("comfortable", "특별히 불편하지 않아요");
const irritation = option("irritation", "쓰고 나서 따갑거나 붉어져요");
const unsure = option("unsure", "이 제품 때문인지는 모르겠어요");
const heavy = option("heavy", "바른 직후부터 무겁거나 끈적여요");
const laterOil = option("later_oil", "바를 땐 편안하고 오후에만 번들거려요");

export function getRoutineReactionOptions(category) {
  const options = category === "cleanser" ? [option("wash_tight", "세안 직후 당겨요")]
    : category === "moisturizer" ? [heavy, option("moisture_tight", "발라도 당김이 남아요"), laterOil]
    : [heavy, laterOil];
  return [comfortable, ...options, irritation, unsure];
}

export function makeCurrentRoutineEntry(product) {
  return { id: product.id, reaction: null };
}

export function makeManualRoutineEntry(name, category) {
  const cleaned = name.trim().replace(/\s+/g, " ").slice(0, 100);
  if (cleaned.length < 2 || !Object.hasOwn(routineLookupCategories, category)) return null;
  return { id: `manual:${category}:${cleaned.normalize("NFKC").toLowerCase()}`, name: cleaned, category, reaction: null };
}

export function getCurrentRoutineProduct(entry) {
  if (typeof entry?.id === "string" && entry.id.startsWith("manual:")) {
    const manual = typeof entry.name === "string" && makeManualRoutineEntry(entry.name, entry.category);
    if (!manual || manual.id !== entry.id) return null;
    return { id: manual.id, name: manual.name, category: manual.category, manual: true };
  }
  return getRoutineLookupProduct(entry?.id);
}

export function readCurrentRoutine(storage, ownerId) {
  const raw = JSON.parse(storage.getItem(keyPrefix + ownerId) || "[]");
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  return raw.flatMap(entry => {
    const product = getCurrentRoutineProduct(entry);
    if (!product || seen.has(product.id)) return [];
    seen.add(product.id);
    const reaction = getRoutineReactionOptions(product.category).some(option => option.value === entry.reaction) ? entry.reaction : null;
    return [{ ...(product.manual ? makeManualRoutineEntry(product.name, product.category) : makeCurrentRoutineEntry(product)), reaction }];
  }).slice(0, CURRENT_ROUTINE_LIMIT);
}

export function writeCurrentRoutine(storage, ownerId, entries) {
  storage.setItem(keyPrefix + ownerId, JSON.stringify(entries));
}

export function getSurveyRoutineReaction(category, profile) {
  const observed = profile?.observationAssessment?.resolvedObservations;
  if (category === "cleanser") return { comfortable: "comfortable", tight: "wash_tight", stings: "irritation" }[observed?.washResponse];
  if (category === "moisturizer") return { comfortable: "comfortable", persistent: "moisture_tight", heavy: "heavy", stings: "irritation" }[observed?.moisturizerUse];
  return undefined;
}

const conclusions = {
  comfortable: { rank: 3, label: "유지", text: "지금 사용하면서 불편하지 않았다면 이 제품은 그대로 써도 돼요." },
  wash_tight: { rank: 1, label: "점검", text: "세안 직후 당김이 반복되는지 먼저 확인해요. 세안제 탓으로 바로 단정하지 않아요.", alternative: true },
  moisture_tight: { rank: 1, label: "점검", text: "바른 뒤에도 같은 부위가 당기는지 확인해요. 반복된다면 보습감이 다른 후보를 비교해볼 수 있어요.", alternative: true },
  heavy: { rank: 1, label: "점검", text: "바른 직후 무거운 부위와 사용량을 확인해요. 그래도 불편하다면 가벼운 제형을 비교해요.", alternative: true },
  later_oil: { rank: 2, label: "관찰", text: "오후에 번들거리는 부위만 따로 확인해요. 이 답만으로 편안했던 제품을 바꿀 필요는 없어요." },
  irritation: { rank: 0, label: "자극 먼저 확인", text: "지금은 새 제품을 더하지 말고, 언제 어떤 제품을 썼을 때 불편했는지부터 확인해요." },
  unsure: { rank: 2, label: "관찰", text: "불편했던 부위와 바른 직후인지 시간이 지난 뒤인지를 먼저 확인해요." },
};
export function getRoutineConclusion(reaction) {
  return conclusions[reaction] ?? { rank: 2, label: "확인 전", text: "평소 쓸 때 어떤 느낌이었는지 골라주세요." };
}

function getReplacementCategory(product) {
  if (product.category === "moisturizer" && !/스팟|레티놀|트러블|잡티|브라이트닝|retinol|spot/i.test(product.name)) return "cream";
  if (product.category === "cleanser" && !/오일|밤|밀크|워터|패드|티슈|파우더|oil|balm|milk|water/i.test(product.name)) return "cleanser";
  return null;
}
export function getRoutineReplacement({ entry, product, entries, profile, safetyBlocked }) {
  if (!getRoutineConclusion(entry.reaction).alternative) return null;
  const category = getReplacementCategory(product);
  if (!category) return { status: "unsupported" };
  if (safetyBlocked || entries.some(item => item.reaction === "irritation") || profile?.observationAssessment?.currentIrritation) {
    return { status: "blocked" };
  }
  if (!profile?.observationAssessment?.canRecommendBasics || !Number.isFinite(profile.hydrationLevel)) return { status: "needs_profile" };
  const careNeeds = { ...profile.careNeeds };
  if (entry.reaction === "heavy") careNeeds.lightTextureNeed = Math.max(careNeeds.lightTextureNeed || 0, 8);
  if (entry.reaction === "moisture_tight") careNeeds.hydrationNeed = Math.max(careNeeds.hydrationNeed || 0, 8);
  const targetLevel = entry.reaction === "heavy" ? Math.max(6, profile.hydrationLevel)
    : ["moisture_tight", "wash_tight"].includes(entry.reaction) ? Math.min(5, profile.hydrationLevel)
    : profile.hydrationLevel;
  const excludedIds = new Set(entries.map(item => item.id));
  const candidate = getRankedProductCandidates(category, targetLevel, {
    mainConcern: "none", basicOnly: true,
    isSensitive: profile.observationAssessment.isSensitive ?? true,
    skinType: profile.skinType, careNeeds,
  }).find(item => !excludedIds.has(item.id) && !hasExfoliatingActive(item) &&
    (category !== "cleanser" || ["cleanser", "gel_cleanser"].includes(item.category)) &&
    (entry.reaction !== "heavy" || item.careProfile?.lightweightFit >= 7));
  return candidate ? { status: "candidate", product: getRoutineLookupProduct(candidate.id), description: candidate.description } : { status: "no_candidate" };
}


export function getSerumRoutineSummary(entries = [], declared = false) {
  const serums = entries.filter(entry => getCurrentRoutineProduct(entry)?.category === "serum");
  const hasIrritation = serums.some(entry => entry.reaction === "irritation");
  const keep = serums.filter(entry => ["comfortable", "later_oil"].includes(entry.reaction));
  const knownSerumFamilies = [...new Set(serums.flatMap(entry => {
    const product = getCurrentRoutineProduct(entry);
    const formula = getProductById(product?.id);
    const confirmed = product?.formulaVerified ? formula?.fullIngredients ?? [] : [];
    const names = [product?.name ?? "", ...confirmed];
    return Object.entries({
      niacinamide: /나이아신|niacinamide/i,
      vitaminC: /비타민\s*(?:씨|c)|vitamin\s*c|아스코빅애씨드|아스코빌글루코사이드|ascorbic acid/i,
      retinoid: /레티놀|레티날|레틴알|retinol|retinal|retinoid|하이드록시피나콜론레티노에이트/i,
      pdrn: /pdrn|피디알엔|소듐디엔에이|하이드롤라이즈드디엔에이/i,
      peptide: /펩타이드|peptide/i,
      acid: /\b(?:aha|bha|pha|lha)\b|살리실릭애씨드|살리실레이트|글라이콜릭애씨드|만델릭애씨드|글루코노락톤/i,
    }).filter(([, pattern]) => names.some(name => pattern.test(name))).map(([family]) => family);
  }))];
  return { keep, hasIrritation, skipBasicSerum: hasIrritation || keep.length > 0 || declared, knownSerumFamilies };
}


export function getComfortableRoutineSlots(entries = []) {
  const slots = { cleanser: "cleanser", moisturizer: "cream", toner: "toner" };
  const bySlot = {};
  for (const entry of entries) {
    const product = getCurrentRoutineProduct(entry);
    const slot = slots[product?.category];
    if (!slot) continue;
    // A makeup-removal oil, balm or water is not the same slot as the ordinary face wash.
    if (slot === "cleanser" && /오일|밤|워터|티슈|패드|oil|balm|water/i.test(product.name)) continue;
    (bySlot[slot] ??= []).push({ name: product.name, reaction: entry.reaction });
  }
  return Object.fromEntries(Object.entries(bySlot).filter(([, rows]) =>
    rows.every(row => ["comfortable", "later_oil"].includes(row.reaction)),
  ).map(([slot, rows]) => [slot, rows.map(row => row.name)]));
}
