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

test("NEEDLY excludes pad accessories and categorizes moisture sun and essence lotion", () => {
  const names = ["마이 패드 케이스", "마일드 멀티 코튼 패드 100매",
    "비건 마일드 모이스처 선 50ml", "pH 밸런싱 에센스 로션 145ml"];
  const html = names.map((name, i) => `<a href="/product/detail.html?product_no=${i + 1}"><img alt="${name}"></a>`).join("");
  assert.deepEqual(extractOfficialListings(html, "needly", stores.needly).map(p => [p.category, p.volume]),
    [["sunscreen", "50ml"], ["moisturizer", "145ml"]]);
});

test("Bonajour parses the official product title and ignores marketing image labels", () => {
  const html = '<a href="/product/크림/24/"><img alt="보나쥬르 수분크림,그린티크림"></a>' +
    '<strong class="name"><a href="/product/크림/24/"><span>[속건조 수분크림] 비건 그린티 워터크림 100ml</span></a></strong>' +
    '<strong class="name"><a href="/product/크림/25/">쑥 크림 카밍 팩 55g</a></strong>';
  assert.deepEqual(extractOfficialListings(html, "bonajour", stores.bonajour).map(p => [p.id, p.name, p.volume]),
    [["lookup:bonajour:24", "보나쥬르 비건 그린티 워터크림", "100ml"]]);
});

test("Dr.Ceuracle reads the product title without taglines and rejects cleansing bundles", () => {
  const card = (id, title) => `<a href="../goods/goods_view.php?goodsNo=${id}"><em>토너 증정</em><strong class="prdName">${title}</strong></a>`;
  const html = card(100, "프로 밸런스<br>모닝 엔자임 워시 50g") +
    card(200, "5알파 클렌징 2종 SET") +
    card(201, "비건 콤부차 티 비비 SPF30 PA++") +
    '<a href="../goods/goods_view.php?goodsNo=300"><img alt="클렌징 젤"></a>';
  assert.deepEqual(extractOfficialListings(html, "drceuracle", stores.drceuracle).map(p => [p.name, p.volume, p.category]),
    [["닥터슈라클 프로 밸런스 모닝 엔자임 워시", "50g", "cleanser"]]);
});

test("Lagom indexes titled skincare singles and excludes bundles and accessories", () => {
  const card = (id, title) => `<strong class="name"><a href="/product/detail.html?product_no=${id}">${title}</a></strong>`;
  const html = card(1, "[블프] 브라이트닝 톤업 선 50ml") +
    card(2, "[이사배 PICK] 마이크로 폼 클렌저 150ml 더블 SET") +
    card(3, "클렌징 브러쉬") +
    card(4, "[이사배 PICK]오트 미셀라 클렌징 밀크 200ml");
  assert.deepEqual(extractOfficialListings(html, "lagom", stores.lagom).map(p => [p.name, p.category, p.volume]),
    [["라곰 브라이트닝 톤업 선", "sunscreen", "50ml"], ["라곰 오트 미셀라 클렌징 밀크", "cleanser", "200ml"]]);
});

test("S.Nature uses the visible title and retains the pad count when liquid volume is also shown", () => {
  const card = (id, title) => `<a class="df-prl-name" href="/product/detail.html?product_no=${id}"><strong>상품명 :</strong> <span>${title}</span></a>`;
  const html = card(1, "아쿠아 오아시스 판테알란 카밍패드 60매 (190ml)") +
    card(2, "아쿠아 콜라겐 펩타이드 NAD+ 앰플 50ml") +
    card(3, "아쿠아 스쿠알란 수분크림 60ml+세럼 50ml 2종세트");
  assert.deepEqual(extractOfficialListings(html, "snature", stores.snature).map(p => [p.category, p.volume]),
    [["toner", "60매"], ["serum", "50ml"]]);
});

test("P.CALM classifies Ampoule Shot Cream as moisturizer and excludes cotton accessories", () => {
  const card = (id, title) => `<span class="name"><a href="/product/detail.html?product_no=${id}">상품명 : ${title}</a></span>`;
  assert.deepEqual(extractOfficialListings(card(1, "피캄 레티놀라겐 앰플 샷 크림") +
    card(2, "피캄 토너팩 화장솜 80컷"), "pcalm", stores.pcalm).map(p => p.category), ["moisturizer"]);
});

test("Biodance indexes branded cream titles while rejecting toner bundles and accessories", () => {
  const card = (id, title) => `<div class="name"><a href="/product/detail.html?product_no=${id}">${title}</a></div>`;
  assert.deepEqual(extractOfficialListings(card(1, "[공식몰 1등 크림✨] 스킨 글로우 에센스 크림") +
    card(2, "시너지 토너+파하 토너") + card(3, "코튼 패드"), "biodance", stores.biodance)
    .map(p => [p.name, p.category]), [["바이오던스 스킨 글로우 에센스 크림", "moisturizer"]]);
});

test("the two catalog sources read product card titles and preserve skincare variants", () => {
  const card = (id, name) => `<p class="name"><a href="/product/detail.html?product_no=${id}"><span>상품명 :</span>${name}</a></p>`;
  assert.deepEqual(extractOfficialListings(card(1, "헬프미 시카밍 닥토패드") + card(2, "닥토패드 리필 60매"),
    "onedaysyou", stores.onedaysyou).map(p => p.name), ["원데이즈유 헬프미 시카밍 닥토패드"]);
  assert.deepEqual(extractOfficialListings(card(1, "[진정토너]온그리디언츠 밸런싱 스킨 소프너 250ml") +
    card(2, "[각질패드]온그리디언츠 리바이탈라이징 토너패드 60ea") +
    card(3, "[속광장벽]온그리디언츠 로션 4ml+크림 5ml"),
    "ongredients", stores.ongredients).map(p => [p.category, p.volume]),
  [["toner", "250ml"], ["toner", "60매"]]);
});

test("US cleanser sources keep official names, market and product URLs without importing body washes", () => {
  const cerave = '<template slot="face"><a class="results__card-front" href="/skincare/cleansers/cream-cleanser"><h3>Hydrating Cream Cleanser</h3></a></template>';
  assert.deepEqual(extractOfficialListings(cerave, "ceraveus", stores.ceraveus), [{
    id: "lookup:ceraveus:cream-cleanser", name: "세라비 Hydrating Cream Cleanser", brand: "세라비", brandAlias: "CeraVe",
    category: "cleanser", officialUrl: "https://www.cerave.com/skincare/cleansers/cream-cleanser", sourceMarket: "US",
  }]);
  const card = (path, name) => `<h2 class="c-product-tile__name"><a href="/our-products/${path}.html">${name}</a></h2>`;
  const html = card("face/face-wash/wash", "Purifying Face Wash") + card("body/body-wash/wash", "Face and Body Wash");
  assert.deepEqual(extractOfficialListings(html, "larocheposayus", stores.larocheposayus).map(p => p.name),
    ["라로슈포제 Purifying Face Wash"]);
});

test("Banila uses product card names and excludes cleansing accessories", () => {
  const card = (id, name) => `<a href="/product/detail.html?product_no=${id}"><p class="name">${name}</p></a>`;
  assert.deepEqual(extractOfficialListings(card(1, "정한PICK💗 클린 잇 제로 클렌징밤 100ml") + card(2, "핑크 세안밴드"),
    "banila", stores.banila).map(p => [p.name, p.volume]), [["바닐라코 클린 잇 제로 클렌징밤", "100ml"]]);
});

test("B.LAB reads the English cleanser title from its Korean official catalog", () => {
  const card = (id, name) => `<p class="name"><a href="/product/detail.html?product_no=${id}">${name}</a></p>`;
  const listings = extractOfficialListings(card(123, "[ 8 : 2 ] Matcha Hydrating Foam Cleanser") +
    card(150, "Matcha Airyfit Sun Stick"), "blab", stores.blab);
  assert.deepEqual(listings.map(p => [p.id, p.name, p.category]),
    [["lookup:blab:123", "비랩 Matcha Hydrating Foam Cleanser", "cleanser"],
      ["lookup:blab:150", "비랩 Matcha Airyfit Sun Stick", "sunscreen"]]);
});

test("Sidmool distinguishes ampoule soaps and creams from serums", () => {
  const card = (id, name) => `<a href="/shop/shopdetail.html?branduid=${id}"><span class="prd-name">${name}</span></a>`;
  assert.deepEqual(extractOfficialListings(card(1, "병풀 앰플 솝 100ml") +
    card(2, "카렌듈라 앰플 수분크림 80ml"), "sidmool", stores.sidmool).map(p => p.category),
    ["cleanser", "moisturizer"]);
});

test("Kaine uses a standalone volume in the product summary", () => {
  const card = '<a href="/product/로즈마리-젤-클렌저/15/"><strong class="name">상품명 : 로즈마리 젤 클렌저</strong><ul><li>상품요약정보 : 150ml</li></ul></a>';
  assert.deepEqual(extractOfficialListings(card, "kaine", stores.kaine).map(p => [p.name, p.volume]),
    [["카이네 로즈마리 젤 클렌저", "150ml"]]);
});

test("Heimish matches thumbnail links to their titled product card", () => {
  const html = '<ul><li id="anchorBoxId_30"><a name="anchorBoxName_30" href="/product/detail.html?product_no=30"><img alt="제품 이미지"></a><div class="name"><a href="#none">말차바이옴 토너 150ml</a></div></li></ul>';
  assert.deepEqual(extractOfficialListings(html, "heimish", stores.heimish).map(p => [p.name, p.volume]),
    [["헤이미쉬 말차바이옴 토너", "150ml"]]);
});

test("Frankly uses the product card title and lazy-loaded image", () => {
  const html = `<li id="anchorBoxId_106">
    <a href="/product/pdrn-바운스-볼-크림/106/"><img alt="프랭클리 PDRN 크림" src="/empty.png" data-src="/web/product/cream.jpg"></a>
    <strong class="name"><span>상품명 :</span> PDRN 바운스 볼 크림</strong>
  </li>`;
  const [product] = extractOfficialListings(html, "frankly", stores.frankly);
  assert.equal(product.name, "프랭클리 PDRN 바운스 볼 크림");
  assert.equal(product.image, "https://www.frankly.co.kr/web/product/cream.jpg");
});

test("Klairs skips accessory and multi-unit cards", () => {
  const html = ["토너 짝꿍 반반솜", "수딩 세럼X2", "서플 프레퍼레이션 페이셜 토너 180ml"]
    .map((name, index) => `<li id="anchorBoxId_${index}"><a href="/product/item/${index}/">
      <img alt="${name}" src="/web/product/item.jpg"></a><strong class="name">${name}</strong></li>`).join("");
  assert.deepEqual(extractOfficialListings(html, "klairs", stores.klairs).map(p => p.volume), ["180ml"]);
});

test("Etude keeps the named 2x barrier cream and excludes multipacks", () => {
  const html = ["순정 2x 베리어 보습 크림 60ml", "순정 클렌저 150ml x 2"].map((name, index) =>
    `<div class="product-grid-item post-${index + 1}">
      <h3 class="wd-entities-title"><a href="/shop/category/skin-care/item-${index}/">${name}</a></h3>
    </div>`).join("");
  assert.deepEqual(extractOfficialListings(html, "etude", stores.etude).map(p => [p.name, p.volume]),
    [["에뛰드 순정 2x 베리어 보습 크림", "60ml"]]);
});

test("Papa Recipe reads the product card title and image without image alt text", () => {
  const html = `<div class="sp__product_box_247">
    <p class="sp__product_image"><img src="/web/product/cleanser.jpg"></p>
    <div><div class="sp__product_title_247">
      <a href="/product/cleanser/986/">블레미쉬 효소 파우더 클렌저 50g</a>
    </div></div>
  </div>`;
  const [product] = extractOfficialListings(html, "paparecipe", stores.paparecipe);
  assert.equal(product.name, "파파레서피 블레미쉬 효소 파우더 클렌저");
  assert.equal(product.volume, "50g");
  assert.equal(product.image, "https://www.paparecipe.com/web/product/cleanser.jpg");
});

test("So Natural reads the title and product thumbnail while excluding cream masks", () => {
  const html = ["픽스 리무버 올 데이 클렌징 오일", "살버터 글로우 크림 팩 10매"]
    .map((name, index) => `<div>
      <a class="figure" href="/shop/shopdetail.html?branduid=${index}"><img src="/shopimages/photo.jpg"></a>
      <a class="title" href="/shop/shopdetail.html?branduid=${index}"><span>${name}</span></a>
    </div>`).join("");
  assert.deepEqual(extractOfficialListings(html, "sonatural", stores.sonatural).map(p => [p.category, p.image]),
    [["cleanser", "https://www.sonatural.co.kr/shopimages/photo.jpg"]]);
});
