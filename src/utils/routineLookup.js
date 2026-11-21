import lookup from "../data/routineLookupProducts.json";
import expansion from "../data/routineLookupExpansion.json";
import isFragranceProduct from "./isFragranceProduct.cjs";
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

const reviewedEntries = products.filter(product => categories[product.category]).map(product => ({
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
const pageIdentity = value => {
  try {
    const url = new URL(value);
    const sku = url.pathname.match(/^\/product\/[^/]+\/(\d+)(?:\/|$)/)?.[1] ?? url.searchParams.get("product_no") ??
      url.searchParams.get("goodsNo") ?? url.searchParams.get("branduid");
    return `${url.hostname.replace(/^(?:www|m)\./, "")}:${sku && /^\d+$/.test(sku) ? sku : `${url.pathname}${url.search}`}`;
  } catch { return null; }
};

const isSkincareListing = product => Object.hasOwn(routineLookupCategories, product.category) && !isFragranceProduct(product.name);
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
}].map(product => ({ ...product, allInOne: /올인원|allinone/.test(normalize(product.name)) }));
const entriesById = new Map(entries.map(product => [product.id, product]));

const index = entries.map(product => {
  const names = [product.name, ...(product.aliases ?? []), ...(product.volume ? [`${product.name} ${product.volume}`] : [])].map(normalize);
  const description = [...names, product.brandAlias && normalize(product.brandAlias),
    product.volume && normalize(product.volume)].filter(Boolean).join(" ");
  return { product, names, description };
});

export const routineLookupCount = entries.length;
export const officialExpansionCount = additional.length;

export function exactRoutineLookupProducts(name, category) {
  const key = normalize(name);
  return index.filter(item => item.product.category === category && item.names.includes(key)).map(item => item.product);
}

export function searchRoutineProducts(query, limit = 12, allInOneOnly = false) {
  const normalized = normalize(query);
  if (allInOneOnly && !normalized) {
    const matches = entries.filter(product => product.allInOne);
    return { total: matches.length, matches: matches.slice(0, limit) };
  }
  if (normalized.length < 2) return { total: 0, matches: [] };
  const tokens = query.normalize("NFKC").split(/\s+/).map(normalize).filter(Boolean);
  const ranked = index.flatMap(({ product, names, description }) => {
    if (allInOneOnly && !product.allInOne) return [];
    if (product.allInOne && ["올인원", "allinone"].includes(normalized)) return [{ product, nameRank: 2 }];
    const nameRank = Math.max(...names.map(name => name === normalized ? 3 : name.startsWith(normalized) ? 2 : name.includes(normalized) ? 1 : 0));
    if (!nameRank && !tokens.every(token => description.includes(token))) return [];
    return [{ product, nameRank }];
  }).sort((a, b) => b.nameRank - a.nameRank || Number(b.product.formulaVerified) - Number(a.product.formulaVerified) ||
    a.product.name.localeCompare(b.product.name, "ko"));
  return { total: ranked.length, matches: ranked.slice(0, limit).map(({ product }) => product) };
}

export function getRoutineLookupProduct(id) {
  return entriesById.get(getCanonicalRoutineProductId(backCompatLookupIds.get(id) ?? id)) ?? null;
}
