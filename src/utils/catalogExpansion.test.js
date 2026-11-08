import additions from "../data/catalogExpansion.json";
import { products } from "../data/products";
import { cosmeticProductProfiles } from "../data/cosmeticAddOns";
import { getProductEvidenceStatus } from "./productEvidence";
import { getRankedProductCandidates } from "./routineRecommendation";
import { hasExfoliatingActive } from "./productCatalog";
import { getProductPurchaseLink } from "./productPurchaseLink";

test("expanded catalog has stable unique identities, actual full ingredients, photos and source-specific sales links", () => {
  expect(additions.map(p => p.id)).toEqual(Array.from({ length: 23 }, (_, i) => i + 52));
  expect(new Set(products.map(p => p.id)).size).toBe(products.length);
  for (const p of additions) {
    expect(getProductEvidenceStatus(p).eligible).toBe(true);
    expect(p.fullIngredients.length).toBeGreaterThan(10);
    expect(p.evidence.sources.some(s => s.sourceType.startsWith("official_domestic") && s.url.startsWith("https://"))).toBe(true);
    for (const ingredient of p.ingredients) expect(p.fullIngredients.some(full => full.toLowerCase().includes(ingredient.toLowerCase()))).toBe(true);
    expect(p.image).toBe(`/products/catalog-${p.id}.webp`);
    expect(p.imageSource.url).toMatch(/^https:\/\//);
    expect(p.price).toBeNull();
    expect(p.evidence.priceVerified).toBe(false);
    expect(p.purchaseSource.liveStockVerified).toBe(false);
    expect(getProductPurchaseLink(p).url).toBe(p.link);
    expect(getProductPurchaseLink(p).affiliate).toBe(false);
    expect(p.catalogAudit.careProfileNote).toContain("내부 평가");
  }
});

test("current formulas never inherit older advertised percentages or ingredients", () => {
  const onion=products.find(p=>p.id===69), soy=products.find(p=>p.id===63), barrier=products.find(p=>p.id===73);
  expect(onion.fullIngredients[0]).toBe("정제수");
  expect(onion.disclosedConcentrations).toContainEqual(expect.objectContaining({ name: "양파추출물", concentration: 1000, unit: "ppm" }));
  expect(onion.activeIngredients.find(i=>i.name==="판테놀").concentrationVerified).toBe(false);
  expect(soy.disclosedConcentrations).toContainEqual(expect.objectContaining({ name: "판테놀", concentration: 2550, unit: "ppm" }));
  expect(barrier.ingredients).not.toContain("시어버터");
  expect(onion.purchaseSource.provider).toBe("official");
  expect(products.find(p=>p.id===57).fullIngredients).toContain("세라마이드엔피(104ppm)");
});

test("specialized and botanical-oil candidates respect basic and sensitivity gates", () => {
  const pha=products.find(p=>p.id===54);
  expect(hasExfoliatingActive(pha)).toBe(true);
  for(let level=1;level<=10;level++) {
    for(const category of ["cleanser","toner","serum","cream"]) {
      const ids=getRankedProductCandidates(category,level,{basicOnly:true,isSensitive:true}).map(p=>p.id);
      expect(ids).not.toContain(54);
      expect(ids).not.toContain(59);
      expect(ids).not.toContain(61);
      expect(ids).not.toContain(69);
    }
  }
  expect(cosmeticProductProfiles[69].families).toContain("niacinamide");
  expect(cosmeticProductProfiles[69].goals).toEqual(["tone"]);
});
