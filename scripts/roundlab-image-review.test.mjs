import test from "node:test";
import assert from "node:assert/strict";
import { addImageReviews, extractIngredientExcerpt } from "./roundlab-image-review.mjs";

test("requires an ingredient header and stops before unrelated information", () => {
  assert.equal(extractIngredientExcerpt("정제수, 판테놀, 글리세린, 베타인"), null);
  assert.equal(extractIngredientExcerpt("전 성 분\n정제수, 판테놀, 글리세린, 베타인\n사용 시 주의사항"), "정제수, 판테놀, 글리세린, 베타인");
});

test("OCR keeps its source and does not verify a formula or reuse an outdated image", async () => {
  const url = "https://gi.esmplus.com/roundlab/DOKDO/DT200/DT200_3.jpg";
  const input = { products: { toner: { state: "needs_review", versions: [], detailImages: ["https://example.com/detail.jpg", url] } } };
  const options = { ocr: async () => "전성분\n정제수, 판테놀, 글리세린, 베타인",
    fetcher: async image => { assert.equal(image.href, url); return new Response("sample", { headers: { "content-type": "image/jpeg" } }); } };
  const first = await addImageReviews(input, options);
  const row = first.products.toner;
  assert.equal(row.state, "needs_review");
  assert.deepEqual(row.versions, []);
  assert.equal(row.imageReview.candidate.imageUrl, url);
  assert.equal(row.imageReview.status, "pending_human_review");
  const changed = await addImageReviews(first, { fetcher: async () => new Response("different", { headers: { "content-type": "image/jpeg" } }),
    ocr: async () => "" });
  assert.equal(changed.products.toner.imageReview.candidate, undefined);
});
