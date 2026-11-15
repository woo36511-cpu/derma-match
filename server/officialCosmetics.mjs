import parse5 from "parse5";

const brands = {
  아누아: { host: "anua.kr", hosts: ["anua.kr", "www.anua.kr"], search: "/product/search.html", detail: "/product/detail.html", idParam: "product_no" },
  마녀공장: { host: "www.manyo.co.kr", hosts: ["manyo.co.kr", "m.manyo.co.kr", "www.manyo.co.kr"], search: "/goods/goods_search.php", detail: "/goods/goods_view.php", idParam: "goodsNo" },
};
const categories = { cleanser: /클렌저|클렌징|워시|클렌져/u, toner: /토너|스킨$/u, serum: /세럼|에센스|앰플/u, moisturizer: /크림|로션|모이스처라이저/u };
const nonSingle = /(?:[0-9]\s*(?:ml|g)[^a-z\d]*[x×*+]\s*\d)|\d\s*개입|세트|기획|증정|듀오|리필|본품\s*\+|택\s*1/iu;
const normalize = value => String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const squash = value => String(value ?? "").replace(/[\u200b\u00ad]/g, "").replace(/\s+/g, " ").trim();
const size = /\s*(\d+(?:\.\d+)?)\s*(ml|g)\s*$/iu;
const namePart = name => squash(name).replace(/^상품명\s*[:：]?\s*/u, "").replace(size, "").trim();
const nameKey = (name, brand) => normalize(namePart(name).replace(new RegExp(`^${brand}\\s*`, "u"), ""));
const amount = value => { const match = squash(value).match(/^(\d+(?:\.\d+)?)\s*(ml|g)(?:\s*\/\s*\d+(?:\.\d+)?\s*fl\.?(?:\s*)oz\.?)?$/iu); return match && `${Number(match[1])}${match[2].toLowerCase()}`; };
const inputSize = name => { const match = squash(name).match(size); return match && `${Number(match[1])}${match[2].toLowerCase()}`; };

export function parseOfficialLookupInput(input) {
  const name = typeof input?.name === "string" ? squash(input.name.normalize("NFKC")) : "";
  const category = input?.category;
  const brand = Object.keys(brands).find(key => name.startsWith(key));
  if (!brand || !Object.hasOwn(categories, category) || !categories[category].test(namePart(name)) || name.length > 100 || nonSingle.test(name) ||
    !/^[\p{L}\p{N}\p{M} %.,()&·\-/]+$/u.test(name)) return null;
  const key = nameKey(name, brand);
  const typedSize = inputSize(name), catalogueSize = typeof input.volume === "string" ? amount(input.volume) : null;
  if (typedSize && catalogueSize && typedSize !== catalogueSize) return null;
  return key.length >= 4 ? { name, category, brand, key, amount: typedSize ?? catalogueSize,
    sourceUrl: typeof input.sourceUrl === "string" ? input.sourceUrl.slice(0, 512) : "" } : null;
}

const children = node => node?.childNodes ?? [];
function* walk(node) {
  if (!node || ["#comment", "script", "style", "template", "noscript"].includes(node.nodeName)) return;
  yield node;
  for (const child of children(node)) yield* walk(child);
}
const attribute = (node, name) => node?.attrs?.find(attr => attr.name === name)?.value;
const hasClass = (node, name) => (attribute(node, "class") ?? "").split(/\s+/).includes(name);
const first = (node, predicate) => Array.from(walk(node)).find(predicate);
const rawContent = node => Array.from(walk(node)).map(x => x.nodeName === "#text" ? x.value : x.nodeName === "br" ? " " : "").join("");
const content = node => squash(rawContent(node));
const collectUnique = values => [...new Set(values.filter(Boolean))];

function getProductUrl(raw, brand, base) {
  if (!raw || raw.length > 512) return null;
  const vendor = brands[brand];
  try {
    const url = new URL(raw, base);
    if (url.protocol !== "https:" || url.username || url.password || url.port || !vendor.hosts.includes(url.hostname)) return null;
    const cafeMatch = brand === "아누아" && url.pathname.match(/^\/product\/[^/]+\/(\d+)(?:\/|$)/u);
    const id = url.pathname === vendor.detail ? url.searchParams.get(vendor.idParam) : cafeMatch?.[1];
    if (!/^\d{1,12}$/.test(id ?? "")) return null;
    return `https://${vendor.host}${vendor.detail}?${vendor.idParam}=${id}`;
  } catch { return null; }
}

export function getOfficialCandidates(html, query, url) {
  const dom = parse5.parse(html);
  const urls = collectUnique(Array.from(walk(dom)).flatMap(node => {
    if (node.nodeName !== "a") return [];
    const title = content(first(node, child => hasClass(child, "item_name"))) || content(node);
    if (!title || nonSingle.test(title) || nameKey(title, query.brand) !== query.key ||
        (query.amount && inputSize(title) && inputSize(title) !== query.amount)) return [];
    return [getProductUrl(attribute(node, "href"), query.brand, url)];
  }));
  return urls.length <= 3 ? urls : [];
}

function getProductFields(dom, brand) {
  const fields = { name: [], amount: [], ingredients: [] };
  if (brand === "아누아") {
    for (const node of walk(dom)) {
      if (!hasClass(node, "info-row")) continue;
      const label = content(first(node, e => hasClass(e, "info-label")));
      const valueNode = first(node, e => hasClass(e, "info-content"));
      const value = content(valueNode);
      if (label === "제품명") fields.name.push(value);
      if (label === "내용물의 용량 또는 중량") fields.amount.push(value);
      if (/^화장품법에 따라\s*기재해야 하는 모든 성분$/.test(label) && hasClass(valueNode, "ingredients")) fields.ingredients.push(value);
    }
  } else {
    for (const node of walk(dom)) {
      if (node.nodeName === "tr") {
        const row = children(node).filter(x => ["th", "td"].includes(x.nodeName));
        if (row.length !== 2 || row[0].nodeName !== "th") continue;
        const label = content(row[0]);
        if (label === "상품명") fields.name.push(content(row[1]));
        if (label === "내용물의 용량 및 중량") fields.amount.push(content(row[1]));
      } else if (hasClass(node, "ingredients_cont") && content(first(node, e => hasClass(e, "msg_btn"))) === "전성분") {
        const body = first(node, e => hasClass(e, "admin_msg"));
        const blocks = children(body).filter(el => el.nodeName === "div" || el.nodeName === "p").map(rawContent).filter(text => text.trim());
        // The brand wraps by character count and can split an ingredient name across two elements.
        while (/^\*[A-Za-z][A-Za-z0-9 /-]{0,45}[™®]?$/.test(blocks.at(-1)?.trim() ?? "")) blocks.pop();
        fields.ingredients.push(squash(blocks.length ? blocks.join("") : rawContent(body)));
      }
    }
  }
  return Object.fromEntries(Object.entries(fields).map(([key, values]) => [key, collectUnique(values)]));
}

const splitIngredients = input => {
  if (!input || input.length > 8500 || /일부 성분|주요 성분|전성분은|별도 표기|기타 성분|외 다수|버전별|리뉴얼|(?:외|등)\s*$|[;\r\n]/u.test(input)) return [];
  const parts = [];
  let start = 0, brackets = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === "(") brackets++;
    if (c === ")") brackets--;
    if (brackets < 0) return [];
    if (c === "," && brackets === 0 && !( /\d/.test(input[i - 1] ?? "") && /\d/.test(input[i + 1] ?? ""))) {
      parts.push(input.slice(start, i).trim()); start = i + 1;
    }
  }
  if (brackets) return [];
  parts.push(input.slice(start).trim());
  return parts.length >= 5 && parts.length <= 135 && parts.every(i => i.length >= 2 && i.length < 100 && /^[*\p{L}\p{N}/+()\-,. %·]+$/u.test(i)) ? parts : [];
};

const humectants = [/^글리세린$/u, /^(?:소듐)?하이알루로(?:닉애씨드|네이트)$/u, /^판테놀$/u, /^베타인$/u, /^트레할로오스$/u, /^하이드록시에틸우레아$/u];
export function extractOfficialFormula(html, query, sourceUrl, now = new Date()) {
  const fields = getProductFields(parse5.parse(html), query.brand);
  if (fields.name.length !== 1 || fields.amount.length !== 1 || fields.ingredients.length !== 1) return null;
  const [label] = fields.name, [volume] = fields.amount;
  const selectedAmount = amount(volume);
  const list = splitIngredients(fields.ingredients[0]);
  if (nonSingle.test(label) || nameKey(label, query.brand) !== query.key || !selectedAmount || (query.amount && query.amount !== selectedAmount) || !list.length) return null;
  // Presence only; ingredient order or a sales claim never creates an efficacy or hydration-strength score.
  const hydrationSignal = query.category !== "cleanser" && list.some(entry => humectants.some(pattern => pattern.test(entry.replace(/^\*+|\s*\([^)]*\)\s*$/gu, "").trim())));
  return { name: query.name, category: query.category, sourceUrl, checkedAt: now.toISOString(), hydrationSignal, volume: selectedAmount, ingredients: list };
}

async function fetchHtml(url, fetcher, signal) {
  const response = await fetcher(url, { redirect: "error", signal, headers: { Accept: "text/html", "Accept-Language": "ko-KR,ko;q=0.9" } });
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html") || !response.body) return "";
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let html = "", bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return html + decoder.decode();
      bytes += value.byteLength;
      if (bytes > 2_000_000) return "";
      html += decoder.decode(value, { stream: true });
    }
  } finally { await reader.cancel().catch(() => {}); }
}

export async function lookupOfficialFormula(query, fetcher = fetch) {
  const vendor = brands[query.brand], signal = AbortSignal.timeout(5500);
  const given = getProductUrl(query.sourceUrl, query.brand);
  const site = new URL(`https://${vendor.host}${vendor.search}`);
  site.searchParams.set("keyword", namePart(query.name).replace(new RegExp(`^${query.brand}\\s*`, "u"), "").trim());
  try {
    const urls = given ? [given] : getOfficialCandidates(await fetchHtml(site.href, fetcher, signal), query, site.href);
    if (urls.length !== 1) return null;
    return extractOfficialFormula(await fetchHtml(urls[0], fetcher, signal), query, urls[0]);
  } catch { return null; }
}
