// Match declared families; citric acid and other pH adjusters alone are not exfoliant evidence.
const families = {
  niacinamide: /나이아신|niacinamide|니코틴아마이드/i,
  vitaminC: /비타민\s*(?:씨|c)|vitamin\s*c|아스코빅애씨드|아스코빌글루코사이드|아스코빌포스페이트|ascorbic acid|ascorbyl glucoside/i,
  retinoid: /레티놀|레티날|레틴알|retinol|retinal|retinoid|하이드록시피나콜론레티노에이트/i,
  pdrn: /pdrn|피디알엔|소듐디엔에이|하이드롤라이즈드디엔에이/i,
  peptide: /펩타이드|peptide/i,
  acid: /(^|[^a-z])(?:aha|bha|pha|lha)([^a-z]|$)|살리실릭애씨드|살리실산|살리실레이트|글라이콜릭애씨드|만델릭애씨드|글루코노락톤|salicylic acid|glycolic acid|mandelic acid|gluconolactone/i,
  benzoyl: /벤조일퍼옥사이드|과산화벤조일|benzoyl peroxide/i,
};
const familyCache = new WeakMap();
const intensiveFamilies = ["acid", "retinoid", "benzoyl"];

export const hasIntensiveActives = list => list.some(family => intensiveFamilies.includes(family));

export function getIngredientFamilies(product) {
  if (!product) return [];
  if (familyCache.has(product)) return familyCache.get(product);
  const verified = product.evidence?.domesticFormulaVerified && product.evidence?.fullIngredientsVerified;
  const names = [product.name ?? "", ...(verified ? product.fullIngredients ?? [] : [])];
  const result = Object.entries(families).filter(([, pattern]) => names.some(name => pattern.test(name))).map(([family]) => family);
  familyCache.set(product, result);
  return result;
}

export function getCompatibilityRisk(candidateFamilies, currentFamilies, intensive = false) {
  const current = new Set(currentFamilies);
  if (candidateFamilies.some(family => current.has(family))) return "overlap";
  if ((intensive || hasIntensiveActives(candidateFamilies)) &&
    [...intensiveFamilies, "vitaminC", "medicine"].some(family => current.has(family))) return "stacking";
  return null;
}
