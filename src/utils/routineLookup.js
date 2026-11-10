import lookup from "../data/routineLookupProducts.json";
import { products } from "../data/products";

export const routineLookupCategories = {
  cleanser: "세안제·클렌징",
  moisturizer: "로션·크림",
  toner: "토너·패드·미스트",
  serum: "세럼·앰플·에센스",
  sunscreen: "자외선 차단제",
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
};
const normalize = text => text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const entries = [
  ...products.filter(product => categories[product.category]).map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    brandAlias: brandAliases[product.brand],
    category: categories[product.category],
    volume: product.volume,
    image: product.image,
    officialUrl: product.evidence?.sources?.find(source =>
      source.sourceType === "official_domestic_product_page" && source.url?.startsWith("https://"),
    )?.url,
    formulaVerified: product.evidence?.domesticFormulaVerified === true &&
      product.evidence?.fullIngredientsVerified === true && product.fullIngredients?.length > 0,
  })),
  ...lookup.products.map(product => ({ ...product, formulaVerified: false })),
];

const index = entries.map(product => {
  const names = [product.name, ...(product.aliases ?? [])].map(normalize);
  const description = [...names, product.brandAlias && normalize(product.brandAlias),
    product.volume && normalize(product.volume)].filter(Boolean).join(" ");
  return { product, names, description };
});

export const routineLookupCount = entries.length;

export function searchRoutineProducts(query, limit = 12) {
  const normalized = normalize(query);
  if (normalized.length < 2) return { total: 0, matches: [] };
  const tokens = query.normalize("NFKC").split(/\s+/).map(normalize).filter(Boolean);
  const ranked = index.flatMap(({ product, names, description }) => {
    const nameRank = Math.max(...names.map(name => name === normalized ? 3 : name.startsWith(normalized) ? 2 : name.includes(normalized) ? 1 : 0));
    if (!nameRank && !tokens.every(token => description.includes(token))) return [];
    return [{ product, nameRank }];
  }).sort((a, b) => b.nameRank - a.nameRank || a.product.name.localeCompare(b.product.name, "ko"));
  return { total: ranked.length, matches: ranked.slice(0, limit).map(({ product }) => product) };
}

export function getRoutineLookupProduct(id) {
  return entries.find(product => product.id === id) ?? null;
}
