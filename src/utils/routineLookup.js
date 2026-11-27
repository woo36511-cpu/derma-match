import { isDiscontinued, pageIdentity } from "./discontinuedProducts";
import lookup from "../data/routineLookupProducts.json";
import officialProductPhotos from "../data/officialProductPhotos.json";
import expansion from "../data/routineLookupExpansion.json";
import isFragranceProduct from "./isFragranceProduct.js";
import { products } from "../data/products";

export const routineLookupCategories = {
  cleanser: "세안제·클렌징",
  moisturizer: "로션·크림",
  toner: "토너·패드·미스트",
  serum: "세럼·앰플·에센스",
  sunscreen: "자외선 차단제",
  mask: "마스크팩",
  lipCare: "립케어",
};

const categories = {
  cleanser: "cleanser", cleansing_oil: "cleanser", cleansing_milk: "cleanser",
  gel_cleanser: "cleanser", bha_cleanser: "cleanser", enzyme_cleanser: "cleanser",
  cream: "moisturizer", toner: "toner", serum: "serum",
};
const brandAliases = {
  "라운드랩": "Round Lab", "코스알엑스": "COSRX", "아누아": "Anua", "스킨1004": "SKIN1004",
  "마녀공장": "ma:nyo", "토리든": "Torriden", "에스트라": "Aestura", "세타필": "Cetaphil",
  "일리윤": "Illiyoon", "닥터지": "Dr.G", "이즈앤트리": "Isntree", "피지오겔": "Physiogel",
  "에뛰드": "Etude", "라로슈포제": "La Roche-Posay", "이니스프리": "Innisfree",
  "퓨리토": "Purito", "바이오더마": "Bioderma",
};
const normalize = text => text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const legacyIds = new Map(products.flatMap(product =>
  (product.legacyLookupIds ?? []).map(id => [id, product.id]),
));

export function getCanonicalRoutineProductId(id) {
  return legacyIds.get(id) ?? id;
}

const reviewedEntries = products.filter(product => categories[product.category] && !isDiscontinued(product)).map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    brandAlias: brandAliases[product.brand],
    category: categories[product.category],
    volume: product.volume,
    aliases: product.aliases,
    image: product.image,
    officialUrl: product.evidence?.sources?.find(source =>
      source.sourceType === "official_domestic_product_page" && source.url?.startsWith("https://"),
    )?.url,
    formulaVerified: product.evidence?.domesticFormulaVerified === true &&
      product.evidence?.fullIngredientsVerified === true && product.fullIngredients?.length > 0,
  }));

const identity = product => [product.brand, product.category, normalize(product.name), normalize(product.volume ?? "")].join(":");
const isSkincareListing = product => !isDiscontinued(product) && Object.hasOwn(routineLookupCategories, product.category) && !isFragranceProduct(product.name);
const baseLookup = lookup.products.filter(product => isSkincareListing(product) && !legacyIds.has(product.id)).map(product => ({ ...product, formulaVerified: false }));
const base = [...reviewedEntries, ...baseLookup];
const namesInBase = new Set(base.map(identity));
const urlsInBase = new Set(base.map(product => pageIdentity(product.officialUrl)).filter(Boolean));
const primaryByPage = new Map(base.flatMap(product => {
  const key = pageIdentity(product.officialUrl);
  return key ? [[key, product]] : [];
}).reverse());
const backCompatLookupIds = new Map();
const additional = [];
for (const product of expansion.products) {
  if (!isSkincareListing(product) || legacyIds.has(product.id)) continue;
  const url = pageIdentity(product.officialUrl);
  const onSamePage = url && urlsInBase.has(url) ? primaryByPage.get(url) : null;
  if (onSamePage && (!onSamePage.volume || !product.volume || normalize(onSamePage.volume) === normalize(product.volume))) {
    backCompatLookupIds.set(product.id, onSamePage.id);
    continue;
  }
  if (namesInBase.has(identity(product))) {
    const matching = base.find(entry => identity(entry) === identity(product));
    if (matching) backCompatLookupIds.set(product.id, matching.id);
    continue;
  }
  additional.push({ ...product, formulaVerified: false, listingOnly: true });
}
const entries = [...base, ...additional, {
  id: "lookup:iope:37", name: "아이오페 맨 올데이 퍼펙트 올인원", brand: "아이오페",
  brandAlias: "IOPE", category: "moisturizer", volume: "120ml", listingOnly: true,
  officialUrl: "https://iope.com/product/detail.html?product_no=37",
}].map(product => ({ ...product, image: product.image || officialProductPhotos[product.id], allInOne: /올인원|allinone/.test(normalize(product.name)) }));
const entriesById = new Map(entries.map(product => [product.id, product]));

const searchWords = text => text.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

const index = entries.map(product => {
  const labels = [product.name, ...(product.aliases ?? [])];
  const names = [...labels, ...(product.volume ? [`${product.name} ${product.volume}`] : [])].map(normalize);
  const brands = [product.brand, product.brandAlias, brandAliases[product.brand]].filter(Boolean);
  const searchLabels = [...labels, ...brands, product.volume ?? ""];
  const description = [...names, ...searchLabels.map(normalize)].join(" ");
  const productName = normalize(product.name);
  const localBrand = normalize(product.brand ?? "");
  const shortName = localBrand && productName.startsWith(localBrand) ? productName.slice(localBrand.length) : productName;
  const brandNames = brands.map(normalize);

  const words = [...new Set(searchLabels.flatMap(searchWords))];
  return { product, names, description, brandNames, shortName, words };
});

function isOneEditAway(query, word) {
  if (query.length < 3 || /\d/.test(query) || /\d/.test(word) || Math.abs(query.length - word.length) > 1) return false;
  const shorter = query.length <= word.length ? query : word;
  const longer = query.length <= word.length ? word : query;
  let index = 0;
  while (index < shorter.length && shorter[index] === longer[index]) index += 1;
  return shorter.length === longer.length
    ? shorter.slice(index + 1) === longer.slice(index + 1)
    : shorter.slice(index) === longer.slice(index + 1);
}

export const routineLookupCount = entries.length;
export const officialExpansionCount = additional.length;

export function exactRoutineLookupProducts(name, category) {
  const key = normalize(name);
  return index.filter(item => item.product.category === category && item.names.includes(key)).map(item => item.product);
}

export function searchRoutineProducts(query, limit = 12, allInOneOnly = false, categories) {
  const normalized = normalize(query);
  if (allInOneOnly && !normalized) {
    const matches = entries.filter(product => product.allInOne && (!categories || categories.includes(product.category)));
    return { total: matches.length, matches: matches.slice(0, limit) };
  }
  if (normalized.length < 2) return { total: 0, matches: [] };
  const tokens = query.normalize("NFKC").trim().split(/\s+/).map(normalize).filter(Boolean);
  const ranked = index.flatMap(({ product, names, description, brandNames, shortName, words }) => {
    if ((categories && !categories.includes(product.category)) || (allInOneOnly && !product.allInOne)) return [];
    if (product.allInOne && ["올인원", "allinone"].includes(normalized)) return [{ product, nameRank: 2 }];
    const nameRank = Math.max(...names.map(name => name === normalized ? 3 : name.startsWith(normalized) ? 2 : name.includes(normalized) ? 1 : 0));
    if (nameRank) return [{ product, nameRank: nameRank + 2 }];
    const compactMatch = brandNames.some(brand => {
      const fragment = normalized.startsWith(brand) ? normalized.slice(brand.length)
        : normalized.endsWith(brand) ? normalized.slice(0, -brand.length) : "";
      return fragment.length >= 2 && shortName.includes(fragment);
    });
    if (compactMatch || tokens.every(token => description.includes(token)))
      return [{ product, nameRank: 2 }];
    const unmatched = tokens.filter(token => !description.includes(token));
    if (unmatched.length === 1 && words.some(word => isOneEditAway(unmatched[0], word)))
      return [{ product, nameRank: 1 }];
    return [];
  }).sort((a, b) => b.nameRank - a.nameRank || Number(b.product.formulaVerified) - Number(a.product.formulaVerified) ||
    a.product.name.localeCompare(b.product.name, "ko"));
  const exact = ranked.filter(item => item.nameRank > 1);
  const matches = exact.length ? exact : ranked;
  return { total: matches.length, matches: matches.slice(0, limit).map(({ product }) => product) };
}

export function getRoutineLookupProduct(id) {
  return entriesById.get(getCanonicalRoutineProductId(backCompatLookupIds.get(id) ?? id)) ?? null;
}
