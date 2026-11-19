import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const normalize = value => String(value).normalize("NFKC").replace(/\s+/gu, " ").trim();
const exactDokdo = /^라운드랩 1025 독도 토너 (200|500)\s*ml$/iu;

export function prepareRetailDiscovery(feed, approvals) {
  if (!feed || !Array.isArray(feed.products)) throw new Error("Expected a retailer discovery feed");
  const byId = new Map();
  for (const input of feed.products) {
    if (!input || !/^A\d{12}$/.test(input.goodsNo ?? "") || typeof input.name !== "string" ||
        typeof input.brand !== "string" || !input.brand.trim() || input.name.length > 160 ||
        !["single", "bundle", "unknown"].includes(input.kind)) throw new Error("Invalid Olive Young listing");
    const name = normalize(input.name);
    if (!name || byId.has(input.goodsNo)) throw new Error("Empty or duplicate Olive Young listing");
    const isBundle = input.kind === "bundle" || /기획|세트|증정|\+/u.test(name);
    const match = !isBundle && input.kind === "single" && input.brand === "라운드랩" && name.match(exactDokdo);
    const lookupId = match && Number(match[1]) === input.volumeMl ? `lookup:roundlab:${match[1] === "200" ? "22" : "14"}` : null;
    const review = lookupId && approvals[lookupId];
    byId.set(input.goodsNo, { goodsNo: input.goodsNo, name, brand: normalize(input.brand),
      listingUrl: `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${input.goodsNo}`,
      status: isBundle ? "bundle_review" : review ? "linked_to_brand_review" : "needs_brand_review",
      ...(review && { officialLookupId: lookupId, brandReviewDate: review.reviewedAt, ingredientCount: review.reviewedIngredientCount,
        ...(review.catalogId && { catalogId: review.catalogId }) }) });
  }
  return { coverage: feed.coverage ?? "provided_feed_only", asOf: feed.asOf ?? null, products: [...byId.values()] };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const [input = "data/oliveyoung-discovery-seed.json", output = "/tmp/oliveyoung-discovery.json"] = process.argv.slice(2);
  const read = path => readFile(path, "utf8").then(JSON.parse);
  const feedUrl = process.env.OLIVEYOUNG_APPROVED_FEED_URL;
  let feed;
  if (feedUrl) {
    try {
      const source = new URL(feedUrl);
      if (source.protocol !== "https:" || source.username || source.password || source.hash) throw new Error();
      const response = await fetch(source, { redirect: "error", signal: AbortSignal.timeout(20000) });
      if (!response.ok || !response.body) throw new Error();
      const reader = response.body.getReader();
      const chunks = [];
      let size = 0;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 12_000_000) { await reader.cancel(); throw new Error(); }
        chunks.push(value);
      }
      feed = { ...JSON.parse(Buffer.concat(chunks).toString("utf8")), coverage: "configured_authorized_feed" };
    } catch { throw new Error("Approved Olive Young feed could not be loaded"); }
  } else feed = await read(input);
  const report = prepareRetailDiscovery(feed, await read(new URL("../data/roundlab-image-approvals.json", import.meta.url)));
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report.products.reduce((counts, item) => ({ ...counts, [item.status]: (counts[item.status] ?? 0) + 1 }), {})));
}
