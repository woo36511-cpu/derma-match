import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import parse5 from "parse5";

const exec = promisify(execFile);
const cafe = (brand, alias, domain, paths = []) => ({ brand, alias, domain, type: "cafe", paths: [["site", "/sitemap.xml"], ["home", "/"], ...paths] });
const godo = (brand, alias, domain) => ({ brand, alias, domain, type: "godo", paths: [1, 2, 3, 4].map(n => [`list${n}`, `/goods/goods_search.php?page=${n}&pageNum=60`]) });
export const stores = {
  dewytree: cafe("듀이트리", "DEWYTREE", "www.dewytree.com", [["list", "/category/product/64/"]]),
  skinnlab: cafe("스킨앤랩", "SKIN&LAB", "www.skinnlab.com", [["list", "/product/list.html?cate_no=72"]]),
  pyunkangyul: cafe("편강율", "Pyunkang Yul", "pyunkangyul.com",
    [227, 231, 186].map(category => [`list${category}`, `/product/list_thumb.html?cate_no=${category}`])),
  skinfood: { brand: "스킨푸드", alias: "SKINFOOD", domain: "www.theskinfood.com", type: "makeshop", encoding: "utf-8",
    paths: [1, 2, 3, 4, 5, 6, 7, 8].map(page => [`list${page}`, `/shop/shopbrand.html?type=Y&xcode=060&mcode=001&sort=regdate&page=${page}`]) },
  jmsolution: { brand: "제이엠솔루션", alias: "JMsolution", domain: "jmsolution.com", type: "cafe",
    paths: [1, 2, 3, 4].map(page => [`list${page}`, `/product/list.html?cate_no=649&page=${page}`]) },
  dalba: { brand: "달바", alias: "d'Alba", domain: "www.dalba.co.kr", type: "godo",
    paths: ["001010", "001021", "001002", "001003", "001005", "001006"]
      .map(category => [category, `/goods/goods_list.php?cateCd=${category}&pageNum=60`]) },
  aromatica: cafe("아로마티카", "AROMATICA", "www.aromatica.co.kr", [["skin", "/category/%EC%8A%A4%ED%82%A8/858/"]]),
  tiam: cafe("티암", "TIA'M", "tiam.co.kr", [["shop", "/category/shop/24/"]]),
  skinrxlab: cafe("스킨알엑스랩", "SKINRx LAB", "skinrxlab.com", [["list", "/product/list.html?cate_no=23"]]),
  tocobo: cafe("토코보", "TOCOBO", "tocobo.co.kr", [24, 43, 61, 64].map(cate => [`list${cate}`, `/product/list.html?cate_no=${cate}`])),
  beautyofjoseon: cafe("조선미녀", "Beauty of Joseon", "beautyofjoseon.co.kr",
    [1, 2, 3].map(page => [`skin${page}`, `/product/list.html?cate_no=71&page=${page}`])),
  mixsoon: cafe("믹순", "mixsoon", "mixsoon.co.kr"),
  mediheal: cafe("메디힐", "MEDIHEAL", "www.medihealshop.com", [["skin", "/product/list.html?cate_no=97"], ["new", "/product/list.html?cate_no=92"]]),
  roundlab: cafe("라운드랩", "Round Lab", "roundlab.co.kr"),
  cosrx: cafe("코스알엑스", "COSRX", "www.cosrx.co.kr"),
  anua: cafe("아누아", "Anua", "anua.kr", [["list", "/product/list.html?cate_no=83"],
    ...[["search", "세럼"], ["toners", "토너"], ["creams", "크림"], ["washes", "클렌징"], ["sunscreen", "선크림"]]
      .map(([key, keyword]) => [key, `/product/search.html?keyword=${encodeURIComponent(keyword)}`])]),
  skin1004: cafe("스킨1004", "SKIN1004", "www.skin1004korea.com", [["list", "/product/list.html?cate_no=13"]]),
  manyo: godo("마녀공장", "ma:nyo", "www.manyo.co.kr"),
  torriden: godo("토리든", "Torriden", "torriden.com"),
  isntree: cafe("이즈앤트리", "Isntree", "isntree.com", [["list", "/product/list.html?cate_no=42"]]),
  illiyoon: cafe("일리윤", "Illiyoon", "www.illiyoon.com"),
  celimax: cafe("셀리맥스", "celimax", "celimax.co.kr"),
  cellfusionc: cafe("셀퓨전씨", "Cell Fusion C", "cellfusionc.co.kr"),
  rovectin: cafe("로벡틴", "Rovectin", "rovectin.co.kr"),
  numbuzin: cafe("넘버즈인", "numbuzin", "numbuzin.com"),
  medicube: cafe("메디큐브", "medicube", "themedicube.co.kr"),
  abib: cafe("아비브", "Abib", "abib.com"),
  benton: cafe("벤튼", "Benton", "bentoncosmetic.com"),
  beplain: { brand: "비플레인", alias: "beplain", domain: "beplain.co.kr", type: "makeshop", paths: [["home", "/"], ["list", "/shop/shopbrand.html?xcode=016&type=Y"]] },
  innisfree: { brand: "이니스프리", alias: "innisfree", domain: "www.innisfree.com", type: "innisfree",
    paths: [["list", "/kr/ko/dp/product-list/skincare?tp=1&pageNo=1"],
      ...[["skin2", "skincare", 2], ["skin3", "skincare", 3], ["sun", "suncare", 1], ["wash", "cleansing", 1]]
        .map(([key, section, page]) => [key, `/kr/ko/dp/product-list/${section}?tp=1&pageNo=${page}`])] },
  aestura: { brand: "에스트라", alias: "Aestura", domain: "www.aestura.com", type: "aestura", paths: [["list", "/web/product/list.do"]] },
  blancdoux: cafe("더랩바이블랑두", "the lab by blanc doux", "blancdoux.com", [["list", "/product/list.html?cate_no=4"]]),
  neogen: cafe("네오젠", "NEOGEN", "www.neogenlab.co.kr"),
  drdifferent: cafe("닥터디퍼런트", "Dr.Different", "drdifferent.com"),
  sioris: cafe("시오리스", "SIORIS", "sioris.co.kr"),
  tirtir: cafe("티르티르", "TIRTIR", "tirtir.co.kr"),
  hanyul: cafe("한율", "HANYUL", "www.hanyul.com"),
  imfrom: cafe("아임프롬", "I'm From", "www.imfrom.co.kr",
    [1, 2, 3].map(page => [`list${page}`, `/product/list.html?cate_no=166&page=${page}`])),
};

const skip = /세트|증정|기획|사은품|\d\s*개\s*묶음|(?:묶음|샘플|리필|공병|랜덤|체험용|테스터|키트|미니어처|미니어쳐)|\d\s*종|\d\s*[+×]\s*\d|^(?:11|12|21|22)(?=[^\d])|(?:\dml\s*\+)|바디|헤어|샴푸|여성청결|탑투토|탑 투 토|립\s*(?:밤|마스크|글로스|오일|에센스|세럼)|아이\s*(?:크림|패치|세럼)|팔레트|쿠션팩트|커버\s*(?:팩트|(?:슬림\s*)?쿠션)|핸드\s*크림|메이크업베이스|(?:비비|BB)\s*크림|파운데이션|브러시|사용권|교환권|탈취제|트리트먼트|치약|향수|연고|비밀|특가|공구|공동구매|vip샵|비매품|환불무료|환불 무료|(?:사용|유통)\s*기한|선착순|첫\s*구매|(?:[2-9]|\d{2,})\s*(?:개입|팩)(?!\p{L})|구매전용|이벤트|쿠폰|얼리버드|온리딜|블프|블랙프라이데이|프로모션|아울렛|클리어런스|판매종료|판매 종료/iu;
const volumePattern = /(\d+(?:\.\d+)?)\s*(ml|g|매입|매)(?=$|[^a-zA-Z0-9])/giu;
const normalize = value => String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const entryKey = (product, ignoreVolume = false) => {
  const core = String(product.name).replaceAll(volumePattern, "").trim();
  return [normalize(product.brand), product.category, normalize(core), ignoreVolume ? "" : normalize(product.volume)].join(":");
};
const hostKey = h => h.replace(/^(?:m|www)\./i, "");

function classify(name) {
  if (/선크림|선 크림|썬크림|썬 크림|[선썬]\s*스크린|선세럼|선 세럼|선스틱|선 스틱|선쿠션|선 쿠션|선플루이드|선로션|선젤|선 젤|선밤|선\s*미스트|유브이|spf\s*\d/i.test(name)) return "sunscreen";
  if (/클렌|클랜|세안|페이셜워시|페이셜 워시|앰플 폼|약산성 폼|필링젤|필링 젤|필링패드|필링 패드/u.test(name)) return "cleanser";
  if (/수면팩|마스크|모델링팩|모델링 팩|세럼팩|세럼 팩|(?:수분|진정)팩/u.test(name)) return null;
  if (/토너|패드|미스트|스킨토너|스킨$/u.test(name)) return "toner";
  if (/세럼\s+로션|올인원\s+멀티밤/u.test(name)) return "moisturizer";
  if (/세럼|앰플|에센스|세럼오일/u.test(name)) return "serum";
  if (/크림|로션|모이스[처쳐]|에멀전|수딩젤|수딩 젤|젤크림|수딩겔/u.test(name)) return "moisturizer";
  return null;
}

function makeCandidate(storeKey, store, nameInput, url, id, image) {
  let name = nameInput.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (skip.test(name) || /\b[2345]\s*[xX]\b|[\d.]\s*(?:ml|g)\s*[xX×*]|\bset\b/i.test(name)) return null;
  name = name.replace(/^\s*(?:\[(?:NEW|대용량|단품|정품|비건|한정)\]\s*)+/iu, "");
  name = name.replace(/^\[(리뉴얼(?: 출시)?)\]\s*/u, "$1 ");
  if (/^\[|^[#?!+]|\ufffd|\u0000|https?:|선택옵션|프로모션|격리종료/u.test(name) || name.length > 110 || !/[가-힣]/.test(name)) return null;
  const volumes = Array.from(name.matchAll(volumePattern)).map(([, number, unit]) => `${Number(number)}${unit.toLowerCase().replace("매입", "매")}`);
  if (new Set(volumes).size > 1) return null;
  const volume = volumes[0];
  name = name.replaceAll(volumePattern, " ").replace(/[ ]{2,}/g, " ").replace(/\(\s*\)|^\s*[:–-]\s*|\s*[:–-]\s*$/g, "").trim();
  if (name.length < 4 || !/[가-힣]/.test(name)) return null;
  const category = classify(name);
  if (!category) return null;
  if (!normalize(name).startsWith(normalize(store.brand))) name = `${store.brand} ${name}`;
  return { id: `lookup:${storeKey}:${id}`, name, brand: store.brand, brandAlias: store.alias, category,
    ...(volume && { volume }), officialUrl: url, ...(image && { image }) };
}

const children = n => n?.childNodes ?? [];
function* walk(n) {
  if (!n || ["#comment", "script", "style", "template", "noscript"].includes(n.nodeName)) return;
  yield n;
  for (const child of children(n)) yield* walk(child);
}
const attr = (node, key) => node?.attrs?.find(x => x.name === key)?.value;
const textOf = node => Array.from(walk(node)).map(n => n.value ?? (n.nodeName === "br" ? " " : "")).join("").trim();
const urlWithHost = (input, host, sitemap) => {
  try {
    const u = new URL(input, `https://${host}/`);
    if (!u.username && !u.password && !u.port && hostKey(u.hostname) === hostKey(host)) {
      if (sitemap && u.protocol === "http:") u.protocol = "https:";
      if (u.protocol === "https:") return u;
    }
    return null;
  } catch { return null; }
};
const imageUrl = (input, host) => {
  if (!input || input.startsWith("data:")) return null;
  try {
    const u = new URL(input, `https://${host}`);
    return u.protocol === "https:" && !u.username && !u.password &&
      (hostKey(u.hostname) === hostKey(host) || /(?:^|\.)cafe24img\.com$|^godomall\.speedycdn\.net$|(?:^|\.)makeshop\.co\.kr$|^inm-cdn\.innisfree\.com$/.test(u.hostname)) ? u.origin + u.pathname : null;
  } catch { return null; }
};

function extractInnisfree(source, storeKey, store) {
  // Nuxt publishes plain indexed JSON alongside the official product-list page.
  const encoded = source.match(/<script\b[^>]*\bid="__NUXT_DATA__"[^>]*>([^<]+)<\/script>/)?.[1];
  if (!encoded) return [];
  try {
    const entries = JSON.parse(encoded);
    if (!Array.isArray(entries)) return [];
    return entries.flatMap(row => {
      if (!row || typeof row !== "object" || Array.isArray(row) || entries[row.inmPrdClCd] !== "1") return [];
      const id = entries[row.inmPrdNo], name = entries[row.prdNm];
      if (!/^\d{4,10}$/.test(id ?? "") || typeof name !== "string") return [];
      const candidate = makeCandidate(storeKey, store, name, `https://${store.domain}/kr/ko/dp/product/${id}`, id,
        imageUrl(entries[row.bscsImgUrl], store.domain));
      return candidate ? [candidate] : [];
    });
  } catch { return []; }
}

export function extractOfficialListings(source, storeKey, store, sitemap = false) {
  if (store.type === "innisfree") return extractInnisfree(source, storeKey, store);
  const candidates = [];
  const tree = Array.from(walk(parse5.parse(source)));
  if (store.type === "aestura") return tree.flatMap(node => {
    const name = attr(node, "prdnm"), id = attr(node, "prdseq");
    if (node.nodeName !== "a" || !name || !/^\d{1,12}$/.test(id ?? "") || /의약품|의료기기|의약외품/.test(attr(node, "catcd2ndnm") ?? "")) return [];
    const candidate = makeCandidate(storeKey, store, name, `https://${store.domain}/web/product/view.do?prdSeq=${id}`, id);
    return candidate ? [candidate] : [];
  });
  for (const node of tree) {
    if (sitemap ? node.nodeName !== "loc" : node.nodeName !== "a") continue;
    const url = urlWithHost(sitemap ? textOf(node) : attr(node, "href"), store.domain, sitemap);
    if (!url) continue;
    const descendants = sitemap ? [] : Array.from(walk(node));
    const img = descendants.find(child => child.nodeName === "img" && attr(child, "alt"));
    const display = descendants.find(child => /(?:^|\s)(?:item_name|prd-name)(?:\s|$)/.test(attr(child, "class") ?? ""));
    const image = imageUrl(attr(img, "src"), store.domain);
    let rawName = textOf(display) || attr(img, "alt") || "", id, sourceUrl;
    if (storeKey === "jmsolution") {
      if (!/(?:^|\s)name(?:\s|$)/.test(attr(node.parentNode, "class") ?? "")) continue;
      rawName = textOf(node).replace(/^상품명\s*:\s*/u, "").replace(/^JMsolution\s+(?=제이엠솔루션)/iu, "");
    }
    if (store.type === "cafe") {
      const m = url.pathname.match(/^\/product\/([^/]+)\/(\d+)(?:\/|$)/);
      if (!m) {
        const numericId = url.searchParams.get("product_no");
        if (sitemap || url.pathname !== "/product/detail.html" || !/^\d{1,12}$/.test(numericId ?? "") ||
          !rawName || !/[가-힣]/.test(rawName)) continue;
        id = numericId;
        sourceUrl = `https://${store.domain}/product/detail.html?product_no=${id}`;
      } else {
        id = m[2];
        let slug;
        try { slug = decodeURIComponent(m[1]).replace(/-/g, " "); } catch { continue; }
        // Product links can contain image alt text like “thumb.” The official slug still carries the readable listing name.
        if (!/[가-힣]/.test(rawName) || rawName.length > 110 || /제품 이미지|제품 사진|사용감|돕는|상세 이미지/.test(rawName)) rawName = slug;
        sourceUrl = `https://${store.domain}/product/${m[1]}/${id}/`;
      }
    } else {
      const [path, key] = store.type === "godo" ? ["/goods/goods_view.php", "goodsNo"] : ["/shop/shopdetail.html", "branduid"];
      if (url.pathname !== path || !/^\d{1,12}$/.test(url.searchParams.get(key) ?? "")) continue;
      id = url.searchParams.get(key);
      sourceUrl = `https://${store.domain}${path}?${key}=${id}`;
    }
    if (rawName) {
      const candidate = makeCandidate(storeKey, store, rawName, sourceUrl, id, image);
      if (candidate) candidates.push(candidate);
    }
  }
  return candidates;
}

const decodeBody = (buffer, store) => new TextDecoder(store.encoding ?? (store.type === "makeshop" ? "euc-kr" : "utf-8")).decode(buffer);

export function allowsPublicCatalogPath(robots, path) {
  let agents = [], directives = false;
  const rules = [];
  for (const line of robots.split(/\r?\n/)) {
    const match = line.split("#")[0].trim().match(/^(user-agent|allow|disallow|crawl-delay)\s*:\s*(.*)$/i);
    if (!match) continue;
    const [, rawType, value] = match;
    const type = rawType.toLowerCase();
    if (type === "user-agent") {
      if (directives) { agents = []; directives = false; }
      agents.push(value.toLowerCase());
    } else {
      directives = true;
      if (agents.includes("*") && value && type !== "crawl-delay") {
        const end = value.endsWith("$");
        const literal = end ? value.slice(0, -1) : value;
        const pattern = literal.split("*").map(x => x.replace(/[|\\{}()[\]^$+?.]/g, "\\$&")).join(".*");
        if (new RegExp("^" + pattern + (end ? "$" : "")).test(path)) rules.push({ type, length: literal.replaceAll("*", "").length });
      }
    }
  }
  rules.sort((a, b) => b.length - a.length || Number(b.type === "allow") - Number(a.type === "allow"));
  return rules[0]?.type !== "disallow";
}

async function main() {
  const input = process.argv[2];
  if (!input) throw new Error("Usage: node scripts/sync-official-routine-catalog.mjs <html-cache-dir> [--fetch]");
  const refresh = process.argv.includes("--fetch");
  const scheduled = process.argv.includes("--scheduled");
  const output = process.env.ROUTINE_CATALOG_OUTPUT ?? "src/data/routineLookupExpansion.json";
  await mkdir(input, { recursive: true });
  const existing = JSON.parse(await readFile("src/data/routineLookupProducts.json", "utf8")).products;
  const prior = await readFile(process.env.ROUTINE_CATALOG_PREVIOUS ?? "src/data/routineLookupExpansion.json", "utf8").then(JSON.parse);
  const knownIds = new Set(existing.map(p => p.id));
  const knownNames = new Set(existing.map(p => entryKey(p)));
  const products = new Map(prior.products.map(p => [p.id, p]));
  const brands = { ...prior.brands };
  const date = process.env.ROUTINE_CATALOG_DATE ?? new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  const selection = process.argv.find(arg => arg.startsWith("--brands="))?.slice(9).split(",");
  if (selection?.some(key => !Object.hasOwn(stores, key))) throw new Error("Unknown brand in --brands");
  const queue = Object.entries(stores).filter(([key]) => !selection || selection.includes(key));
  await Promise.all(Array.from({ length: 4 }, async () => {
    for (let item; (item = queue.shift()); ) {
      const [key, store] = item;
      let robots = "";
      if (scheduled) {
        try { robots = (await exec("curl", ["-fsS", "--max-time", "10", "-A", "DearSinceCatalog/1.0", `https://${store.domain}/robots.txt`], { maxBuffer: 100000 })).stdout; }
        catch { console.log(`${store.brand}: robots unavailable; skipped`); continue; }
        if (!/^\s*(user-agent|sitemap)\s*:/im.test(robots)) { console.log(`${store.brand}: unrecognized robots; skipped`); continue; }
      }
      const fresh = new Map();
      let useful = 0, missed = 0;
      for (const [kind, path] of store.paths) {
        const file = resolve(input, `${key}-${kind}`);
        if (scheduled && !allowsPublicCatalogPath(robots, path)) { missed++; continue; }
        if (scheduled) await new Promise(resolve => setTimeout(resolve, 5000));
        if (refresh) {
          try { await exec("curl", ["-fsS", "--max-time", "19", ...(scheduled ? ["-A", "DearSinceCatalog/1.0"] : []), "-o", file + ".new", `https://${store.domain}${path}`]);
            await writeFile(file, await readFile(file + ".new")); }
          catch { missed++; continue; }
        }
        const source = await readFile(file).then(b => decodeBody(b, store)).catch(() => null);
        if (!source) { missed++; continue; }
        const found = extractOfficialListings(source, key, store, kind === "site");
        if (found.length) useful++;
        else missed++;
        for (const p of found) {
          const current = fresh.get(p.id);
          if (!current || p.image || (!current.volume && p.volume)) fresh.set(p.id, p);
        }
      }
      if (useful) {
        const byName = new Set();
        let added = 0;
        for (const p of fresh.values()) {
          const name = entryKey(p);
          if (knownIds.has(p.id) || knownNames.has(name) || byName.has(name)) continue;
          byName.add(name);
          products.set(p.id, p);
          added++;
        }
        brands[key] = { name: store.brand, checkedAt: date, usefulPages: useful, fetchedListings: fresh.size };
        console.log(`${store.brand}: ${fresh.size} product listings, ${added} after current lookup dedupe, ${missed} unavailable or empty pages`);
      } else console.log(`${store.brand}: no usable official list`);
    }
  }));
  const canonical = new Map();
  for (const p of products.values()) {
    const key = entryKey(p);
    if (!knownIds.has(p.id) && !knownNames.has(key) && !canonical.has(key)) canonical.set(key, p);
  }
  const list = [...canonical.values()].sort((a, b) => a.id.localeCompare(b.id, "en"));
  await writeFile(output, JSON.stringify({ market: "KR", checkedAt: date,
    provenance: "official_listing_identity_only", brands: Object.fromEntries(Object.entries(brands).sort()), products: list }, null, 2) + "\n");
  console.log(`${list.length} official listings in the expansion snapshot. No formula or recommendation scores added.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
