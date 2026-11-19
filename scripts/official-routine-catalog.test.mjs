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

test("a spaced sunscreen name is indexed while BB cream is excluded", () => {
  const html = [
    "틴티드 선 스크린",
    "이지에프 커버 비비 크림",
  ].map((name, i) => `<a href="/product/detail.html?product_no=${i + 1}"><img alt="${name}"></a>`).join("");
  assert.deepEqual(extractOfficialListings(html, "skinnlab", stores.skinnlab).map(p => [p.name, p.category]),
    [["스킨앤랩 틴티드 선 스크린", "sunscreen"]]);
});

test("MEDI-PEEL keeps domestic skincare and skips export, accessory, image and multipack records", () => {
  const slugs = ["히알루론산-레이어-물톡스-앰플-30ml", "해외전용-상품-피토-시카놀-토너",
    "딥-클렌징-해면", "메조-콜라겐-토너-제품-이미지", "클리어-폼-클렌저-20-120ml-11"];
  const sitemap = `<urlset>${slugs.map((slug, i) =>
    `<url><loc>https://www.medipeel.co.kr/product/${slug}/${i + 1}/</loc></url>`).join("")}</urlset>`;
  const listings = extractOfficialListings(sitemap, "medipeel", stores.medipeel, true);
  assert.deepEqual(listings.map(p => [p.id, p.category, p.volume]), [["lookup:medipeel:1", "serum", "30ml"]]);
});

test("JUMISO preserves decimals from the product title and excludes bundles", () => {
  const html = [
    ["retinal-01", "주미소 레티날 0.1 피디알엔 5000 크림 20ml"],
    ["아이템-토너", "[2개묶음] 토너 200ml"],
    ["세럼", "[흔적/모공케어] 나이아신아마이드 20 세럼 40ml"],
  ].map(([slug, name], i) => `<strong class="name"><a href="/product/${slug}/${i + 1}/">상품명 : ${name}</a></strong>`).join("");
  assert.deepEqual(extractOfficialListings(html, "jumiso", stores.jumiso).map(p => [p.name, p.volume]),
    [["주미소 레티날 0.1 피디알엔 5000 크림", "20ml"], ["주미소 나이아신아마이드 20 세럼", "40ml"]]);
});

test("Primera uses the official title and declared volume and indexes UV protectors as sunscreen", () => {
  const html = `<a href="/product/리페어링-세라캡슐-uv-프로텍터/90/">
    <img alt="Primera Repairing Cera-capsule UV Protector">
    <span class="title">리페어링 세라캡슐 UV 프로텍터</span>
    <ul><li rel="판매가">100원</li><li rel="용량">40ml</li></ul>
  </a><a href="/product/나이아-시카-워터리-크림-쿠션/89/">쿠션</a>`;
  assert.deepEqual(extractOfficialListings(html, "primera", stores.primera).map(p => [p.name, p.volume, p.category]),
    [["프리메라 리페어링 세라캡슐 UV 프로텍터", "40ml", "sunscreen"]]);
});

test("VT indexes plain Reedle Shots, drops promotions and preserves decimals from displayed titles", () => {
  const html = [
    [770, "리들샷 300"], [771, "[증정] 리들샷 700"], [773, "시카 레티 에이 에센스 0.3"],
  ].map(([id, name]) => `<a class="name" href="/product/detail.html?product_no=${id}">${name}</a>`).join("");
  assert.deepEqual(extractOfficialListings(html, "vt", stores.vt).map(p => [p.name, p.category]),
    [["브이티 리들샷 300", "serum"], ["브이티 시카 레티 에이 에센스 0.3", "serum"]]);
  const sitemap = '<urlset><url><loc>https://www.vt-cosmetics.com/product/시카-레티-에이-에센스-03/773/</loc></url></urlset>';
  assert.deepEqual(extractOfficialListings(sitemap, "vt", stores.vt, true), []);
});
