import test from "node:test";
import assert from "node:assert/strict";
import { addImageReviews, extractIngredientExcerpt, reconcileImageApprovals } from "./roundlab-image-review.mjs";

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

test("changes at an approved source require another review", async () => {
  const imageUrl = "https://gi.esmplus.com/roundlab/DOKDO/DT200/DT200_3.jpg";
  const snapshot = { products: { toner: { listing: { volume: "200ml" }, detailImages: [imageUrl], versions: [] } } };
  const approvals = { toner: { volume: "200ml", imageUrl, imageSha256: "0967115f2813a3541eaef77de9d9d5773f1c0c04314b0bbfe4ff3b3b1c55b5d5" } };
  const fetcher = async () => new Response("changed", { headers: { "content-type": "image/jpeg" } });
  const changed = await reconcileImageApprovals(snapshot, approvals, { fetcher });
  assert.equal(changed.imageApprovalChecks.toner.status, "image_changed_needs_review");
  assert.deepEqual(changed.products.toner.versions, []);
  approvals.toner.imageSha256 = changed.imageApprovalChecks.toner.currentImageSha256;
  assert.equal((await reconcileImageApprovals(snapshot, approvals, { fetcher })).imageApprovalChecks.toner.status, "matches_reviewed_image");
  snapshot.products.toner.listing.volume = "500ml";
  assert.equal((await reconcileImageApprovals(snapshot, approvals, { fetcher })).imageApprovalChecks.toner.status, "source_not_confirmed");
});
