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
