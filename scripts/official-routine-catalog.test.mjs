import assert from "node:assert/strict";
import { test } from "node:test";
import { extractOfficialListings, stores } from "./sync-official-routine-catalog.mjs";

test("an official sitemap keeps single product variants without copying promo listings or outside domains", () => {
  const source = `<urlset>
    <url><loc>https://numbuzin.com/product/1번-수딩세럼-50ml/42/</loc></url>
    <url><loc>https://numbuzin.com/product/1번-수딩세럼-100ml/43/</loc></url>
    <url><loc>https://numbuzin.com/product/1번-수딩세럼-기획세트/44/</loc></url>
    <url><loc>https://numbuzin.com/product/비밀링크-1번-수딩세럼-50ml/45/</loc></url>
    <url><loc>https://numbuzin.com/product/1번-수딩세럼-50ml-100ml/46/</loc></url>
    <url><loc>https://notnumbuzin.com/product/1번-수딩세럼-50ml/47/</loc></url>
    <url><loc>https://numbuzin.com/product/1번-수딩세럼-50ml-2개입/48/</loc></url>
    <url><loc>https://numbuzin.com/product/첫구매-4900원-수딩세럼-50ml/49/</loc></url>
  </urlset>`;
  const products = extractOfficialListings(source, "numbuzin", stores.numbuzin, true);
  assert.deepEqual(products.map(({ id, category, volume }) => [id, category, volume]), [
    ["lookup:numbuzin:42", "serum", "50ml"], ["lookup:numbuzin:43", "serum", "100ml"],
  ]);
  assert.ok(products.every(p => p.name === "넘버즈인 1번 수딩세럼" && !("fullIngredients" in p) && !("careProfile" in p)));
});

test("a product card keeps the brand name and rejects links that masquerade as the store", () => {
  const html = `<a href="/goods/goods_view.php?goodsNo=123&amp;src=ads"><strong class="item_name">수분 세럼 30ml</strong></a>
  <a href="https://www.manyo.co.kr@example.test/goods/goods_view.php?goodsNo=999"><strong class="item_name">유사 수분 세럼 30ml</strong></a>`;
  const [product, ...other] = extractOfficialListings(html, "manyo", stores.manyo);
  assert.deepEqual(other, []);
  assert.equal(product.name, "마녀공장 수분 세럼");
  assert.equal(product.officialUrl, "https://www.manyo.co.kr/goods/goods_view.php?goodsNo=123");
});

test("scheduled discovery honors wildcard robot exclusions and more specific allowed paths", async () => {
  const { allowsPublicCatalogPath } = await import("./sync-official-routine-catalog.mjs");
  const robots = "User-agent: AnotherBot\nAllow: /\n\nUser-agent: *\nDisallow: /\nAllow: /product/list\nDisallow: /product/list?preview=*";
  assert.equal(allowsPublicCatalogPath(robots, "/sitemap.xml"), false);
  assert.equal(allowsPublicCatalogPath(robots, "/product/list"), true);
  assert.equal(allowsPublicCatalogPath(robots, "/product/list?preview=1"), false);
});

test("JMsolution uses the official product title when the image alt text is generic", () => {
  const html = `<a href="/product/detail.html?product_no=10"><img alt="광채 세럼 제품 이미지"></a>
    <div class="name"><a href="/product/detail.html?product_no=10&amp;cate_no=649">
      <span class="title displaynone">상품명 :</span> <span>JMsolution 제이엠솔루션 히알루로닉 세럼 30ml</span>
    </a></div>`;
  const [product, ...other] = extractOfficialListings(html, "jmsolution", stores.jmsolution);
  assert.deepEqual(other, []);
  assert.equal(product.name, "제이엠솔루션 히알루로닉 세럼");
  assert.equal(product.volume, "30ml");
  assert.equal(product.officialUrl, "https://jmsolution.com/product/detail.html?product_no=10");
});

test("d'Alba distinguishes sunscreen mist and serum lotion from makeup and hand care", () => {
  const html = [
    "워터풀 에센스 선 미스트",
    "비타 토닝 세럼 로션",
    "글로우 핏 세럼 커버 슬림 쿠션",
    "화이트 트러플 아로마틱 핸드크림",
  ].map((name, i) => `<a href="/goods/goods_view.php?goodsNo=${i + 1}"><strong class="item_name">${name}</strong></a>`).join("");
  assert.deepEqual(extractOfficialListings(html, "dalba", stores.dalba).map(p => p.category), ["sunscreen", "moisturizer"]);
});
