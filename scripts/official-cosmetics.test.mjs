import assert from "node:assert/strict";
import { test } from "node:test";
import { extractOfficialFormula, getOfficialCandidates, lookupOfficialFormula, parseOfficialLookupInput } from "../server/officialCosmetics.mjs";

const url = "https://www.manyo.co.kr/goods/goods_view.php?goodsNo=31";
const name = "마녀공장 예시 로션 60ml";
const query = parseOfficialLookupInput({ name, category: "moisturizer" });
const ingredients = "정제수, 나이아신아마이드(10,000ppm), 글리세린, 판테놀, 1,2-헥산다이올, 향료";
const page = (volume = "60ml", inci = ingredients) => `<table><tr><th>상품명</th><td>마녀공장 예시 로션</td></tr>
<tr><th>내용물의 용량 및 중량</th><td>${volume}</td></tr></table><div class="ingredients_cont">
<strong class="msg_btn">전성분</strong><div class="admin_msg"><div>${inci.replace("글리세린", "글리세</div><div>린")}</div><div>*TradeName™</div></div></div>`;
const result = html => new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
const results = `<a href="/goods/goods_view.php?goodsNo=31"><strong class="item_name">예시 로션 60ml</strong></a>
<a href="/goods/goods_view.php?goodsNo=32"><strong class="item_name">예시 로션 100ml</strong></a>
<a href="/goods/goods_view.php?goodsNo=33"><strong class="item_name">예시 로션 60ml 세트</strong></a>`;

test("official search picks the exact single product and reads the full declared list", async () => {
  const requests = [];
  const verified = await lookupOfficialFormula(query, async address => {
    requests.push(address);
    return result(address === url ? page() : results);
  });
  assert.deepEqual(verified.ingredients, ["정제수", "나이아신아마이드(10,000ppm)", "글리세린", "판테놀", "1,2-헥산다이올", "향료"]);
  assert.equal(verified.hydrationSignal, true);
  assert.equal(verified.sourceUrl, url);
  assert.equal(requests.length, 2);
  assert.equal(requests[1], url);
});

test("wrong size, bundles, ambiguous variants, incomplete and nonofficial sources cannot change the survey automatically", async () => {
  for (const html of [page("50ml"), page("60ml X 2"), page("60ml", "정제수, 글리세린 등"), `${page()}${page("60ml", ingredients.replace("판테놀", "스쿠알란"))}`])
    assert.equal(extractOfficialFormula(html, query, url), null);
  assert.equal(getOfficialCandidates(results, parseOfficialLookupInput({ name: "마녀공장 예시 로션", category: "moisturizer" }), url).length, 2);
  const requests = [];
  const answer = await lookupOfficialFormula({ ...query, sourceUrl: "https://www.manyo.co.kr.test/goods/goods_view.php?goodsNo=31" }, async address => {
    requests.push(address); return result("");
  });
  assert.equal(answer, null);
  assert.equal(new URL(requests[0]).hostname, "www.manyo.co.kr");
  assert.equal(parseOfficialLookupInput({ name: "다른브랜드 예시 로션", category: "moisturizer" }), null);
  assert.equal(parseOfficialLookupInput({ name, category: "moisturizer", volume: "100ml" }), null);
  const selectedListing = parseOfficialLookupInput({ name: "마녀공장 예시 로션", category: "moisturizer", volume: "100 ml" });
  assert.equal(extractOfficialFormula(page(), selectedListing, url), null);
});
