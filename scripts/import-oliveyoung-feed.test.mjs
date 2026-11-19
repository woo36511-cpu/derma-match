import test from "node:test";
import assert from "node:assert/strict";
import { prepareRetailDiscovery } from "./import-oliveyoung-feed.mjs";

test("only exact single products link; bundles and unknown sizes cannot borrow a review", () => {
  const base = { goodsNo: "A000000125507", name: "라운드랩 1025 독도 토너 200ml", kind: "single", brand: "라운드랩", volumeMl: 200 };
  const run = row => prepareRetailDiscovery({ products: [row] }, { "lookup:roundlab:22": { catalogId: 1 } }).products[0];
  assert.equal(run(base).catalogId, 1);
  assert.equal(run({ ...base, name: base.name + " 기획 (+50ml)" }).status, "bundle_review");
  assert.equal(run({ ...base, volumeMl: 500 }).status, "needs_brand_review");
  assert.throws(() => prepareRetailDiscovery({ products: [base, base] }, {}));
});
