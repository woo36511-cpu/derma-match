import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeOfficialFormula } from "./review-official-catalog-formulas.mjs";

test("ingredient signals require matching official product, size, and full ingredient text", () => {
  const product = { brand: "테스트", brandAlias: "TEST", name: "테스트 보습 세럼", volume: "30ml" };
  const html = `<table>
    <tr><th>제품명</th><td>TEST 보습 세럼</td></tr>
    <tr><th>내용물의 용량</th><td>30 ml</td></tr>
    <tr><th>전성분</th><td>정제수, 글리세린, 판테놀, 소듐하이알루로네이트, 나이아신아마이드</td></tr>
    </table>`;
  const result = analyzeOfficialFormula(html, product);
  assert.equal(result.status, "formula_analysis_ready_for_review");
  assert.equal(result.ingredients.length, 5);
  assert.deepEqual(result.ingredientSignals.map(item => item.ingredient), ["판테놀", "소듐하이알루로네이트", "나이아신아마이드"]);
  for (const page of [html.replace("30 ml", "50 ml"), html.replace("TEST 보습 세럼", "TEST 수분 세럼"), html.replace("전성분", "주요성분")]) {
    assert.deepEqual(analyzeOfficialFormula(page, product), { status: "full_formula_or_identity_unconfirmed" });
  }
});
