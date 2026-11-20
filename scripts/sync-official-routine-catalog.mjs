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
  heimish: { brand: "헤이미쉬", alias: "heimish", domain: "eheimish.com", type: "cafe",
    paths: [["skin", "/category/skin-care/23/"], ["clean", "/category/cleansing/25/"]] },
  klavuu: { brand: "클라뷰", alias: "KLAVUU", domain: "www.klavuu.com", type: "cafe",
    paths: [1, 2, 3, 4].map(page => [`skin${page}`, `/product/list.html?cate_no=471&page=${page}`]) },
  tyf: { brand: "땡큐파머", alias: "THANK YOU FARMER", domain: "tyfmall.co.kr", type: "cafe",
    paths: [["list1", "/product/list.html?cate_no=72&page=1"]] },
  huxley: { brand: "헉슬리", alias: "Huxley", domain: "huxley.co.kr", type: "cafe",
    paths: [1, 2, 3].map(page => [`skin${page}`, `/product/list.html?cate_no=73&page=${page}`]) },
  somebymi: { brand: "썸바이미", alias: "SOME BY MI", domain: "www.somebymi.co.kr", type: "cafe",
    paths: [1, 2, 3].map(page => [`list${page}`, `/product/list.html?cate_no=383&page=${page}`]) },
  ninewishes: { brand: "나인위시스", alias: "9wishes", domain: "www.9wishes.shop", type: "cafe",
    paths: [1, 2, 3].map(page => [`list${page}`, `/product/list.html?cate_no=96&page=${page}`]) },
  kaine: { brand: "카이네", alias: "KAINE", domain: "kaine.co.kr", type: "cafe",
    paths: [1, 2].map(page => [`list${page}`, `/category/all/23/?page=${page}`]) },
  urang: { brand: "유랑", alias: "URANG", domain: "www.urangnatural.com", type: "cafe",
    paths: [1, 2, 3, 4].map(page => [`list${page}`, `/category/%EC%A0%84%EC%A0%9C%ED%92%88/127/?page=${page}`]) },
  bonamedusa: { brand: "보나메두사", alias: "BONA MEDUSA", domain: "www.bonamedusa.com", type: "cafe",
    paths: [4, 12, 39, 93].map(category => [String(category), `/product/list.html?cate_no=${category}`]) },
  miguhara: { brand: "미구하라", alias: "MIGUHARA", domain: "www.miguhara.com", type: "cafe",
    paths: [175, 176, 177, 178, 179, 180, 182].map(category => [String(category), `/product/list.html?cate_no=${category}`]) },
  sidmool: { brand: "시드물", alias: "SIDMOOL", domain: "www.sidmool.com", type: "makeshop",
    paths: [
      ...["005", "006", "009", "010", "012"].map(category =>
        [category, `/shop/shopbrand.html?type=N&xcode=017&mcode=${category}&viewtype=gallery`]),
      ...["007", "008", "009", "010", "011", "012", "013", "017", "018", "020", "024"].map(category =>
        [`main${category}`, `/shop/shopbrand.html?type=N&xcode=019&mcode=${category}&viewtype=gallery`]),
      ...[["007", 2], ["010", 2], ["011", 2], ["013", 2], ["013", 3], ["018", 2]].map(([category, page]) =>
        [`main${category}-${page}`, `/shop/shopbrand.html?type=Y&xcode=019&mcode=${category}&sort=&page=${page}`]),
    ] },
  nacific: { brand: "네시픽", alias: "NACIFIC", domain: "nacific.com", type: "cafe",
    paths: [...[1, 2].map(page => [`list${page}`, `/category/%241/98/?page=${page}`]),
      ...[345, 346, 347, 348].map(category => [String(category), `/product/list.html?cate_no=${category}`])] },
  blab: { brand: "비랩", alias: "B.LAB", domain: "www.b-labskincare.com", type: "cafe",
    paths: [["list", "/category/cleanser/163/"], ["skincare", "/category/skin-care/168/"]] },
  banila: { brand: "바닐라코", alias: "BANILA CO", domain: "www.banila.com", type: "cafe",
    paths: [...[1, 2, 3, 4].map(page => [`list${page}`, `/product/list.html?cate_no=214&page=${page}`]),
      ["204", "/product/list.html?cate_no=204"], ["220", "/product/list.html?cate_no=220"]] },
  ceraveus: { brand: "세라비", alias: "CeraVe", domain: "www.cerave.com", type: "cerave", sourceMarket: "US",
    paths: [["facial", "/skincare/cleansers/facial-cleansers"], ["all", "/skincare/cleansers"],
      ["cream", "/skincare/cleansers/cream-facial-cleansers"], ["foam", "/skincare/cleansers/foaming-facial-cleansers"]] },
  larocheposayus: { brand: "라로슈포제", alias: "La Roche-Posay", domain: "www.laroche-posay.us", type: "larocheposay", sourceMarket: "US",
    paths: [["facial", "/our-products/face/face-wash"]] },
  onedaysyou: { brand: "원데이즈유", alias: "One-day's You", domain: "onedaysyou.com", type: "cafe",
    paths: [161, 162, 163, 164, 166, 167].map(category => [String(category), `/product/list.html?cate_no=${category}`]) },
  ongredients: { brand: "온그리디언츠", alias: "Ongredients", domain: "www.ongredients.co.kr", type: "cafe",
    paths: [49, 58, 62, 91, 111].map(category => [String(category), `/product/list.html?cate_no=${category}`]) },
  biodance: { brand: "바이오던스", alias: "Biodance", domain: "www.biodance.co.kr", type: "cafe",
    paths: [1, 2, 3, 4, 5, 6].map(page => [`list${page}`, `/product/list.html?cate_no=28&page=${page}`]) },
  pcalm: { brand: "피캄", alias: "P.CALM", domain: "pcalm.co.kr", type: "cafe",
    paths: [["list1", "/product/list.html?cate_no=78&page=1"], ["home", "/"]] },
  snature: { brand: "에스네이처", alias: "S.NATURE", domain: "www.snature.co.kr", type: "cafe",
    paths: [1, 2].map(page => [`list${page}`, `/product/list.html?cate_no=87&page=${page}`]) },
  lagom: { brand: "라곰", alias: "LAGOM", domain: "lagom.kr", type: "cafe",
    paths: [1, 2, 3, 4].map(page => [`list${page}`, `/product/list.html?cate_no=48&page=${page}`]) },
  drceuracle: { brand: "닥터슈라클", alias: "Dr.Ceuracle", domain: "www.lghmall.co.kr", type: "godo",
    paths: ["001", "002", "003", "004", "006"].map(category =>
      [category, `/goods/goods_list.php?cateCd=013001${category}&pageNum=60`]) },
  bonajour: { brand: "보나쥬르", alias: "BONAJOUR", domain: "www.bonajour.com", type: "cafe",
    paths: [1, 2, 3, 4, 5].map(page => [`list${page}`, `/product/list.html?cate_no=331&page=${page}`]) },
  needly: cafe("니들리", "NEEDLY", "needly.co.kr", [1, 2].map(page => [`list${page}`, `/product/list.html?cate_no=55&page=${page}`])),
  wellage: cafe("웰라쥬", "WELLAGE", "www.wellage.co.kr", [["list1", "/product/list.html?cate_no=427&page=1"]]),
  vt: cafe("브이티", "VT Cosmetics", "www.vt-cosmetics.com", [72, 119, 218, 326].map(category => [`list${category}`, `/product/list.html?cate_no=${category}`])),
  primera: cafe("프리메라", "primera", "prmrbeauty.com", [1, 2, 3].map(page => [`list${page}`, `/product/list.html?cate_no=42&page=${page}`])),
  jumiso: { brand: "주미소", alias: "JUMISO", domain: "jumiso.co.kr", type: "cafe",
    paths: [["home", "/"], ["list", "/product/list.html?cate_no=24"], ["list2", "/product/list.html?cate_no=24&page=2"]] },
  medipeel: cafe("메디필", "MEDI-PEEL", "www.medipeel.co.kr",
    [1, 2, 3, 4, 5].map(page => [`list${page}`, `/product/list.html?cate_no=795&page=${page}`])),
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
  thera: { brand: "더라", alias: "THE RA", domain: "www.thera.co.kr", type: "imweb",
    paths: [["home", "/"]] },
  sonatural: { brand: "쏘내추럴", alias: "SO NATURAL", domain: "www.sonatural.co.kr", type: "makeshop",
    paths: ["001", "002", "004", "015", "005", "007"].map(category => [`list${category}`, `/shop/shopbrand.html?xcode=015&type=N&mcode=${category}`]) },
  yadah: { brand: "야다", alias: "YADAH", domain: "www.yadah.co.kr", type: "cafe",
    paths: [1, 2, 3, 4].map(page => [`list${page}`, `/product/list.html?cate_no=100&page=${page}`]) },
  paparecipe: { brand: "파파레서피", alias: "Papa Recipe", domain: "www.paparecipe.com", type: "cafe",
    paths: [288, 289, 297, 292, 293, 346, 295].map(category => [`list${category}`, `/product/list.html?cate_no=${category}`]) },
  etude: { brand: "에뛰드", alias: "ETUDE", domain: "www.etude.com", type: "etude",
    paths: [["list", "/product/category/skin-care/"], ["skin2", "/product/category/skin-care/page/2/"],
      ["cleanser", "/product/category/cleanser/"], ["cleanser2", "/product/category/cleanser/page/2/"]] },
  realbarrier: { brand: "리얼베리어", alias: "Real Barrier", domain: "myrealbarrier.co.kr", type: "cafe",
    paths: [42, 48, 49].map(category => [`list${category}`, `/product/list.html?cate_no=${category}&sort_method=5`]) },
  mamonde: { brand: "마몽드", alias: "Mamonde", domain: "www.mamonde.com", type: "cafe",
    paths: [28, 29, 30, 32, 33].map(category => [`list${category}`, `/product/list.html?cate_no=${category}`]) },
  aprilskin: { brand: "에이프릴스킨", alias: "APRILSKIN", domain: "www.aprilskin.com", type: "cafe",
    paths: [["skin1", "/product/list.html?cate_no=42&page=1"]] },
  onething: { brand: "원씽", alias: "ONE THING", domain: "www.onething.kr", type: "cafe",
    paths: [["home", "/"], ["type", "/category/category/43/"], ["ingredient", "/category/ingredient/44/"]] },
  banobagi: { brand: "바노바기", alias: "BANOBAGI", domain: "www.banobagicosmetic.com", type: "cafe",
    paths: [95, 96, 97, 98, 99].map(category => [`list${category}`, `/product/list.html?cate_no=${category}`]) },
  frankly: { brand: "프랭클리", alias: "FRANKLY", domain: "www.frankly.co.kr", type: "cafe",
    paths: [1, 2].map(page => [`list${page}`, `/category/%EC%A0%84-%EC%A0%9C%ED%92%88/23/?page=${page}`]) },
  klairs: { brand: "클레어스", alias: "Dear, Klairs", domain: "www.klairs.co.kr", type: "cafe",
    paths: [["home", "/"], ...[25, 43, 26, 44, 27].map(category => [`list${category}`, `/product/list.html?cate_no=${category}`])] },
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
  if (/선크림|선 크림|썬크림|썬 크림|[선썬]\s*스크린|선세럼|선 세럼|선스틱|선 스틱|선쿠션|선 쿠션|선플루이드|선로션|선젤|선 젤|선밤|선\s*미스트|모이스처 선$|유브이|uv\s*프로텍터|spf\s*\d/i.test(name)) return "sunscreen";
  if (/클렌|클랜|세안|페이셜워시|페이셜 워시|앰플 폼|약산성 폼|필링젤|필링 젤|필링패드|필링 패드/u.test(name)) return "cleanser";
  if (/수면팩|마스크|모델링팩|모델링 팩|세럼팩|세럼 팩|(?:수분|진정)팩/u.test(name)) return null;
  if (/토너|패드|미스트|스킨토너|스킨$/u.test(name)) return "toner";
  if (/(?:세럼|에센스)\s+로션|올인원\s+멀티밤/u.test(name)) return "moisturizer";
  if (/세럼|앰플|에센스|세럼오일/u.test(name)) return "serum";
  if (/크림|로션|모이스[처쳐]|에멀전|수딩젤|수딩 젤|젤크림|수딩겔/u.test(name)) return "moisturizer";
  return null;
}

function makeCandidate(storeKey, store, nameInput, url, id, image) {
  let name = nameInput.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (["banobagi", "onething"].includes(storeKey) && /[2-9]\d*\s*개(?:\s|$)/u.test(name)) return null;
  if (storeKey === "sonatural" && /크림 팩|프렙 픽서|커버 픽싱 크림|쿠션|아이밤|[2-9]\d*\s*개(?:\s|$)/u.test(name)) return null;
  if (storeKey === "yadah" && /쿠션|아이패치|여행용|[2-9]\d*\s*개(?:\s|$)/u.test(name)) return null;
  if (storeKey === "frankly") {
    if (/톤업\s*크림|EVENT/u.test(name)) return null;
    name = name.replace(/^\[[^\]]+\]\s*/u, "").replace(/\s*\(?소비기한.*$/u, "");
  }
  if (storeKey === "klairs" && /반반솜|클렌징 퍼프|블레미쉬 크림|더블구성|[x×]\s*\d|\d\s*개(?:\s|$)/iu.test(name)) return null;
  if (storeKey === "klavuu" && /액트리스 백스테이지|선비비|씨씨\s*크림/u.test(name)) return null;
  if (storeKey === "tyf") {
    name = name.replace(/^1등\*토너\s*/u, "");
    if (/\d+\s*개|씨씨\s*크림|스킨 톤 업 토탈 크림/u.test(name)) return null;
  }
  if (storeKey === "somebymi") name = name.replace(/\s*\[(\d+(?:\.\d+)?\s*(?:ml|g|매))\]$/iu, " $1");
  if (storeKey === "ninewishes") name = name.replace(/\s*\[사용기한:\s*\d{2}(?:\.\d{2}){2}\]$/u, "");
  if (storeKey === "urang") name = name.replace(/\s*(?:사용기한\s*)?20\d{2}\.\d{1,2}\.\d{1,2}까지$/u, "")
    .replace(/\s+\d{2}[A-Z]\d{4}\s*\/\s*$/u, "").trim();
  if (storeKey === "sidmool" && /개당|골라담기|버라이어티/u.test(name)) return null;
  if (storeKey === "nacific") {
    name = name.replace(/^★[^★]+★\s*/u, "").replace(/(\d\s*ml)\s*1구$/iu, "$1")
      .replace(/(패드\s+\d+매)\s*\/\s*\d+\s*(?:g|ml)$/iu, "$1")
      .replace(/(에어크림)(\d+ml)$/iu, "$1 $2");
  }
  if (storeKey === "blab") name = name.replace(/^\[\s*\d+\s*:\s*\d+\s*\]\s*/u, "");
  const nameScript = storeKey === "blab" ? /[a-z]/i : /[가-힣]/;
  if (storeKey === "banila") {
    name = name.replace(/^정한\s*PICK💗?\s*/iu, "");
    if (/세안밴드|더블|골라담기|\d+\s*개/u.test(name)) return null;
  }
  if (storeKey === "onedaysyou" && /선비비/u.test(name)) return null;
  if (storeKey === "ongredients") {
    name = name.replace(/^\[(?:진정장벽|속광장벽|딥클렌징|클렌징밤|진정케어|트러블모공|수분장벽|탄력케어|수분케어|24시간속보습|보습진정|클렌징패드|수분세안|항산화세안|진정세안|각질패드|진정토너|생기토너|선스틱|선크림)\]\s*/u, "");
    if (/쿠션|화장솜|듀오|\+/u.test(name)) return null;
    name = name.replace(/(패드\s+\d+)\s*ea$/iu, "$1매");
  }
  if (storeKey === "biodance") {
    name = name.replace(/^\[(?:NEW✨?|공식몰 1등 크림✨?|캐비어 페스타|뿌리는 겔마스크)\]\s*/iu, "");
    if (/듀오|코튼 패드|토너\s*\+\s*파하 토너|\s\+\s|\d+\s*매\s*\/|\d+\s*개/u.test(name)) return null;
  }
  if (storeKey === "snature" && /카밍패드\s+\d+매\s*\(\d+ml\)$/u.test(name)) {
    name = name.replace(/\s*\(\d+ml\)$/u, "");
  }
  if (storeKey === "pcalm" && /화장솜/u.test(name)) return null;
  if (storeKey === "lagom") {
    name = name.replace(/^(?:\[(?:이사배 PICK|블프|공식몰 단독)\]\s*)+/iu, "");
    if (name.includes("+") || /더블|트리플|듀오|본품|브러쉬|넥 크림|^미니\s/u.test(name)) return null;
  }
  if (storeKey === "bonajour") {
    if (name.includes("+") || /크림\s*카밍\s*팩/u.test(name)) return null;
    name = name.replace(/^\[속건조 수분크림\]\s*/u, "");
  }
  if (storeKey === "drceuracle" && /(?:^|\s)비비(?:\s|$)/u.test(name)) return null;
  if (storeKey === "needly" && /패드\s*케이스|코튼\s*패드/u.test(name)) return null;
  if (storeKey === "vt" && /신규회원|군인할인|최저가|샤워\s*필터|[x×]\s*\d+\s*개/iu.test(name)) return null;
  if (storeKey === "vt") name = name.replace(/^(?:약국 입점|(?:우찬|올데이 프로젝트) pick)\s+/iu, "");
  if (storeKey === "primera" && /크림\s*쿠션|모이스처 스무딩 케어/u.test(name)) return null;
  if (storeKey === "medipeel" &&
    /해외\s*전용|클렌징\s*해면|풋\s*크림|제품\s*이미지|\d\s*(?:ml|g)\s+11$/iu.test(name)) return null;
  const bundleName = storeKey === "etude" ? name.replace(/^순정 2x(?= 베리어 보습 크림)/iu, "순정") : name;
  if (skip.test(name) || /\b[2345]\s*[xX]\b|[\d.]\s*(?:ml|g)\s*[xX×*]|\bset\b/i.test(bundleName)) return null;
  if (storeKey === "jumiso") name = name.replace(/^\[(?:글로우픽\s*1위|흔적\/모공케어|데일리 톤\/결 케어|보습장벽클렌징|항산화광채케어|장벽회복기능성)\]\s*/u, "");
  name = name.replace(/^\s*(?:\[(?:NEW|대용량|단품|정품|비건|한정)\]\s*)+/iu, "");
  name = name.replace(/^\[(리뉴얼(?: 출시)?)\]\s*/u, "$1 ");
  if (/^\[|^[#?!+]|\ufffd|\u0000|https?:|선택옵션|프로모션|격리종료/u.test(name) || name.length > 110 || !nameScript.test(name)) return null;
  const volumes = Array.from(name.matchAll(volumePattern)).map(([, number, unit]) => `${Number(number)}${unit.toLowerCase().replace("매입", "매")}`);
  if (new Set(volumes).size > 1) return null;
  const volume = volumes[0];
  name = name.replaceAll(volumePattern, " ").replace(/[ ]{2,}/g, " ").replace(/\(\s*\)|^\s*[:–-]\s*|\s*[:–-]\s*$/g, "").trim();
  if (name.length < 4 || !nameScript.test(name)) return null;
  let category = classify(name);
  if (storeKey === "thera" && /선블럭$/u.test(name)) category = "sunscreen";
  if (storeKey === "tyf" && /선 프로젝트.*선 에센스/u.test(name)) category = "sunscreen";
  if (storeKey === "tyf" && /필링 크림$/u.test(name)) category = "cleanser";
  if (storeKey === "ninewishes" && /앰플 (?:아이앤페이스 )?크림(?: 나노 플러스)?$/u.test(name)) category = "moisturizer";
  if (storeKey === "kaine" && /쿨링 부스터 겔$/u.test(name)) category = "moisturizer";
  if (storeKey === "sidmool" && /\s솝$/u.test(name)) category = "cleanser";
  if (storeKey === "sidmool" && /(?:앰플 수분크림|에센스로션|수분젤|에센셜(?:\s*\/겔타입|\s*\[선택구입\])?)$/u.test(name)) category = "moisturizer";
  if (storeKey === "miguhara" && /^EGF 크리스탈 10 PPM 오리진$/iu.test(name)) category = "serum";
  if (storeKey === "miguhara" && /에센스 크림 오리진$|올인원 플루이드$/u.test(name)) category = "moisturizer";
  if (storeKey === "miguhara" && /클렌즈 토너$/u.test(name)) category = "toner";
  if (storeKey === "nacific" && /선블록/u.test(name)) category = "sunscreen";
  if (storeKey === "nacific" && /^(?:프레쉬 EM 솝|블랙헤드 올킬 블랙블럭)$/u.test(name)) category = "cleanser";
  if (storeKey === "blab") {
    if (/\b(?:sunscreen|sun stick)\b/i.test(name)) category = "sunscreen";
    else if (/\b(?:toner|pads?)\b/i.test(name)) category = "toner";
    else if (/\b(?:cleanser|cleansing (?:oil|balm))\b/i.test(name)) category = "cleanser";
    else if (/\b(?:serum|ampoule|essence)\b/i.test(name)) category = "serum";
    else if (/\b(?:cream|lotion)\b/i.test(name)) category = "moisturizer";
  }
  if (storeKey === "mamonde" && /(?:에센스 워터|스킨 소프너)$/u.test(name)) category = "toner";
  if (storeKey === "mamonde" && /에멀젼$/u.test(name)) category = "moisturizer";
  if (storeKey === "ongredients" && /톤업 선 로션$/u.test(name)) category = "sunscreen";
  if (storeKey === "ongredients" && /소프너$/u.test(name)) category = "toner";
  if (storeKey === "biodance" && /스킨 글로우 에센스 크림$/u.test(name)) category = "moisturizer";
  if (storeKey === "pcalm" && /앰플 샷 크림$/u.test(name)) category = "moisturizer";
  if (storeKey === "snature" && /쌀떡팩폼|립앤아이 리무버/u.test(name)) category = "cleanser";
  if (storeKey === "lagom" && /톤업 선$/u.test(name)) category = "sunscreen";
  if (storeKey === "vt" && /^리들샷\s+(?:50|100|300|700|1000)$/u.test(name)) category = "serum";
  if (storeKey === "drceuracle" && /멜팅 포밍 밤|메디케어 솝|엔자임 워시/u.test(name)) category = "cleanser";
  if (!category || (storeKey === "banila" && category !== "cleanser")) return null;
  if (!normalize(name).startsWith(normalize(store.brand))) name = `${store.brand} ${name}`;
  return { id: `lookup:${storeKey}:${id}`, name, brand: store.brand, brandAlias: store.alias, category,
    ...(volume && { volume }), officialUrl: url, ...(image && { image }) };
}

const children = n => n?.childNodes ?? [];
function* walk(n, includeTemplates = false) {
  if (!n || ["#comment", "script", "style", "noscript"].includes(n.nodeName) || (!includeTemplates && n.nodeName === "template")) return;
  yield n;
  for (const child of children(n.content ?? n)) yield* walk(child, includeTemplates);
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
  const tree = Array.from(walk(parse5.parse(source), store.type === "cerave"));
  if (store.type === "imweb") return tree.flatMap(node => {
    if (node.nodeName !== "a" || !attr(node, "class")?.split(/\s+/).includes("ra-card")) return [];
    const url = urlWithHost(attr(node, "href"), store.domain, false);
    const id = url?.searchParams.get("idx");
    if (!/^\d{1,12}$/.test(id ?? "") || url.pathname !== "/shop_view/") return [];
    const descendants = Array.from(walk(node));
    const title = descendants.find(child => child.nodeName === "h3");
    const volume = descendants.find(child => /^\d+\s*(?:ml|g)$/i.test(textOf(child)));
    const photo = descendants.find(child => child.nodeName === "img");
    const src = attr(photo, "src") ?? "";
    const image = imageUrl(src, store.domain) || (src.startsWith("https://cdn.imweb.me/") ? src.split("?")[0] : null);
    const candidate = makeCandidate(storeKey, store, [textOf(title), textOf(volume)].join(" "), url.origin + url.pathname + "?idx=" + id, id, image);
    return candidate ? [candidate] : [];
  });
  if (store.type === "etude") return tree.flatMap(card => {
    const classes = attr(card, "class")?.split(/\s+/) ?? [];
    if (!classes.includes("product-grid-item")) return [];
    const id = classes.find(value => /^post-\d+$/.test(value))?.slice(5);
    const descendants = Array.from(walk(card));
    const title = descendants.find(node => node.nodeName === "h3" && attr(node, "class")?.split(/\s+/).includes("wd-entities-title"));
    const link = title?.childNodes.find(node => node.nodeName === "a");
    const url = urlWithHost(attr(link, "href"), store.domain, false);
    if (!id || !url?.pathname.startsWith("/shop/category/")) return [];
    const photo = descendants.find(node => node.nodeName === "img" && attr(node, "class")?.split(/\s+/).includes("attachment-woocommerce_thumbnail"));
    const candidate = makeCandidate(storeKey, store, textOf(link), url.origin + url.pathname, id, imageUrl(attr(photo, "src"), store.domain));
    return candidate ? [candidate] : [];
  });
  if (store.sourceMarket === "US") {
    return tree.flatMap(node => {
      if (node.nodeName !== "a") return [];
      const url = urlWithHost(attr(node, "href"), store.domain, false);
      if (!url) return [];
      const isCerave = store.type === "cerave";
      const className = isCerave ? attr(node, "class") : attr(node.parentNode, "class");
      const listingClass = isCerave ? "results__card-front" : "c-product-tile__name";
      if (!className?.split(/\s+/).includes(listingClass)) return [];
      const path = isCerave ? /^\/skincare\/cleansers\/(?:facial-cleansers\/)?([a-z0-9-]+)\/?$/ :
        /^\/our-products\/face\/(?:face-wash|acne-products)\/([a-z0-9-]+)\.html$/;
      const slug = url.pathname.match(path)?.[1];
      const title = isCerave ? Array.from(walk(node)).find(child => child.nodeName === "h3") : node;
      const label = textOf(title).replace(/\u200B/gu, "").replace(/\s+/g, " ").trim();
      if (!slug || !label || !/cleanser|face wash|facial wash|micellar water|makeup remov|makeup melt|cleansing balm|cleansing bar|cleansing wipes|cream wash/i.test(label) ||
        /\b(?:set|bundle|kit|refill|body wash)\b/i.test(label)) return [];
      return [{ id: `lookup:${storeKey}:${slug}`, name: `${store.brand} ${label}`, brand: store.brand,
        brandAlias: store.alias, category: "cleanser", officialUrl: url.origin + url.pathname, sourceMarket: store.sourceMarket }];
    });
  }
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
    let image = imageUrl((storeKey === "frankly" ? attr(img, "data-src") : null) || attr(img, "src"), store.domain);
    let rawName = textOf(display) || attr(img, "alt") || "", id, sourceUrl;
    if (storeKey === "sonatural") {
      if (!attr(node, "class")?.split(/\s+/).includes("title")) continue;
      rawName = textOf(node);
      const photo = Array.from(walk(node.parentNode)).find(child => child.nodeName === "img" &&
        attr(child.parentNode, "class")?.split(/\s+/).includes("figure"));
      image = imageUrl(attr(photo, "src"), store.domain);
    }
    if (storeKey === "yadah") {
      if (attr(node.parentNode, "data-tc-product-card-name") == null) continue;
      rawName = textOf(node).replace(/^상품명\s*:\s*/u, "")
        .replace(/^\[(?:얼리\s*)?블프[^\]]*\]\s*/u, "")
        .replace(/\s*\|.*$/u, "")
        .replace(/\s+(?:비건 원스텝 딥클렌징|미백 주름개선 탄력 보습)$/u, "");
      let card = node.parentNode;
      while (card && attr(card, "data-tc-product-card") == null) card = card.parentNode;
      const thumbnail = Array.from(walk(card)).find(child => attr(child, "data-tc-product-card-image") != null);
      const photo = Array.from(walk(thumbnail)).find(child => child.nodeName === "img");
      image = imageUrl(attr(photo, "src"), store.domain);
    }
    if (storeKey === "paparecipe") {
      if (!attr(node.parentNode, "class")?.split(/\s+/).includes("sp__product_title_247")) continue;
      rawName = textOf(node);
      const card = node.parentNode?.parentNode?.parentNode;
      const photo = Array.from(walk(card)).find(child => child.nodeName === "img" &&
        attr(child.parentNode, "class")?.split(/\s+/).includes("sp__product_image"));
      image = imageUrl(attr(photo, "src"), store.domain);
    }
    if (storeKey === "banobagi" || storeKey === "onething") {
      if (!attr(node.parentNode, "class")?.split(/\s+/).includes("name")) continue;
      rawName = textOf(node).replace(/^상품명\s*:\s*/u, "");
      let card = node.parentNode;
      while (card && card.nodeName !== "li") card = card.parentNode;
      const photo = Array.from(walk(card)).find(child => child.nodeName === "img" && /^eListPrdImage\d+_\d+$/.test(attr(child, "id") ?? ""));
      image = imageUrl(attr(photo, "src"), store.domain);
    }
    if (storeKey === "frankly" || storeKey === "klairs") {
      if (!img) continue;
      let card = node.parentNode;
      while (card && !/^anchorBoxId_\d+$/.test(attr(card, "id") ?? "")) card = card.parentNode;
      const title = Array.from(walk(card)).find(child => child.nodeName === "strong" && attr(child, "class")?.split(/\s+/).includes("name"));
      if (!title) continue;
      rawName = textOf(title).replace(/^상품명\s*:\s*/u, "");
    }
    if (storeKey === "heimish") {
      const id = attr(node, "name")?.match(/^anchorBoxName_(\d+)$/)?.[1];
      if (!id || url.searchParams.get("product_no") !== id) continue;
      let card = node.parentNode;
      while (card && attr(card, "id") !== `anchorBoxId_${id}`) card = card.parentNode;
      const title = Array.from(walk(card)).find(child => attr(child, "class")?.split(/\s+/).includes("name"));
      if (!title) continue;
      rawName = textOf(title);
    }
    if (storeKey === "somebymi") {
      if (attr(node, "spec") !== "prd_name") continue;
      rawName = textOf(node);
    }
    if (storeKey === "ninewishes") {
      const title = descendants.find(child => child.nodeName === "div" && attr(child, "class")?.split(/\s+/).includes("name"));
      if (!title) continue;
      rawName = textOf(title);
    }
    if (storeKey === "kaine") {
      const title = descendants.find(child => child.nodeName === "strong" && attr(child, "class")?.split(/\s+/).includes("name"));
      if (!title) continue;
      const summary = descendants.find(child => child.nodeName === "li" && /^상품요약정보\s*:/u.test(textOf(child)));
      const size = textOf(summary).replace(/^상품요약정보\s*:\s*/u, "");
      rawName = textOf(title).replace(/^상품명\s*:\s*/u, "");
      if (/^\d+(?:\.\d+)?\s*(?:ml|g)$/iu.test(size)) rawName += ` ${size}`;
    }
    if (storeKey === "nacific") {
      const title = descendants.find(child => child.nodeName === "strong" && attr(child, "class")?.split(/\s+/).includes("name"));
      if (!title) continue;
      rawName = textOf(title).replace(/^상품명\s*:\s*/u, "");
    }
    if (storeKey === "banila") {
      const title = descendants.find(child => child.nodeName === "p" && attr(child, "class")?.split(/\s+/).includes("name"));
      if (!title) continue;
      rawName = textOf(title);
    }
    if (storeKey === "vt" && !sitemap) {
      if (!/(?:^|\s)name(?:\s|$)/.test(attr(node, "class") ?? "")) continue;
      rawName = textOf(node);
    }
    if (storeKey === "snature") {
      if (!/(?:^|\s)df-prl-name(?:\s|$)/.test(attr(node, "class") ?? "")) continue;
      rawName = textOf(node).replace(/^상품명\s*:\s*/u, "");
    }
    if (storeKey === "drceuracle") {
      const title = descendants.find(child => /(?:^|\s)prdName(?:\s|$)/.test(attr(child, "class") ?? ""));
      if (!title) continue;
      rawName = textOf(title);
    }
    if (storeKey === "primera" && !sitemap) {
      const title = descendants.find(child => /(?:^|\s)title(?:\s|$)/.test(attr(child, "class") ?? ""));
      const volume = descendants.find(child => attr(child, "rel") === "용량");
      if (title) rawName = [textOf(title), textOf(volume)].join(" ").trim();
    }
    if (["klavuu", "tyf", "huxley", "bonamedusa", "urang", "miguhara", "blab", "ongredients", "onedaysyou", "biodance", "pcalm", "lagom", "bonajour", "jmsolution", "jumiso"].includes(storeKey)) {
      if (!/(?:^|\s)name(?:\s|$)/.test(attr(node.parentNode, "class") ?? "")) continue;
      rawName = textOf(node).replace(/^상품명\s*:\s*/u, "").replace(/^JMsolution\s+(?=제이엠솔루션)/iu, "");
    }
    if (store.type === "cafe") {
      const m = url.pathname.match(/^\/product\/([^/]+)\/(\d+)(?:\/|$)/);
      if (!m) {
        const numericId = url.searchParams.get("product_no");
        if (sitemap || url.pathname !== "/product/detail.html" || !/^\d{1,12}$/.test(numericId ?? "") ||
          !rawName || (storeKey !== "blab" && !/[가-힣]/.test(rawName))) continue;
        id = numericId;
        sourceUrl = `https://${store.domain}/product/detail.html?product_no=${id}`;
      } else {
        id = m[2];
        let slug;
        try { slug = decodeURIComponent(m[1]).replace(/-/g, " "); } catch { continue; }
        // Product links can contain image alt text like “thumb.” The official slug still carries the readable listing name.
        if (storeKey === "vt" && sitemap && /레티\s*에이|레티날/u.test(slug)) continue;
      if ((storeKey !== "blab" && !/[가-힣]/.test(rawName)) || rawName.length > 110 || /제품 이미지|제품 사진|사용감|돕는|상세 이미지/.test(rawName)) rawName = slug;
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
  const indexedBrands = new Set(list.map(product => product.brand)).size;
  console.log(`${list.length} official listings across ${indexedBrands} indexed brands (${Object.keys(brands).length} with crawl metadata).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
