import test from "node:test";
import assert from "node:assert/strict";
import { readRoundLabFormula, watchRoundLab } from "./watch-roundlab-catalog.mjs";

const list = '<a href="/product/독도-토너-200ml/22/">독도 토너 200ml</a>';
const formula = ingredients => `<table><tr><th>제품명</th><td>독도 토너</td></tr><tr><th>내용물의 용량 또는 중량</th><td>200 ml</td></tr><tr><th>전성분</th><td>${ingredients}</td></tr></table>`;
const initial = "정제수, 글리세린, 판테놀, 베타인, 알란토인";
const options = body => ({
  sources: ["https://roundlab.co.kr/list"],
  fetcher: async url => new Response(url.pathname === "/list" ? list : body),
});
test("only an exact official name and size with a labeled full list is captured", () => {
  const product = { name: "라운드랩 독도 토너", volume: "200ml" };
  assert.ok(readRoundLabFormula(formula(initial), product));
  assert.equal(readRoundLabFormula(formula(initial), { ...product, volume: "500ml" }), null);
  assert.equal(readRoundLabFormula(formula("상세페이지 참조"), product), null);
  assert.equal(readRoundLabFormula(formula(initial).replace("전성분", "주요 성분"), product), null);
});
test("new listings, changed formula and missing formula do not erase recorded versions", async () => {
  const first = await watchRoundLab(options(formula(initial)));
  const key = "lookup:roundlab:22";
  assert.equal(first.products[key].versions.length, 1);
  const same = await watchRoundLab({ ...options(formula(initial)), previous: first });
  assert.deepEqual(same.events, []);
  const changed = await watchRoundLab({ ...options(formula(initial.replace("베타인", "프로판다이올"))), previous: same });
  assert.deepEqual(changed.events, [{ id: key, type: "formula_changed" }]);
  const missing = await watchRoundLab({ ...options("<p>성분표 이미지</p>"), previous: changed });
  assert.equal(missing.products[key].state, "needs_review");
  assert.equal(missing.products[key].versions.length, 2);
  await assert.rejects(watchRoundLab({ ...options(""), fetcher: async () => new Response("", { status: 503 }), previous: missing }));
});
