import { getProductPurchaseLink, isCoupangAffiliateUrl } from "./productPurchaseLink";

const base={id:52,link:"https://www.coupang.com/vp/products/123?itemId=4",purchaseSource:{label:"쿠팡"}};
test("only an exact-product affiliate mapping overrides a normal Coupang link",()=>{
  const saved={52:{originalUrl:base.link,affiliateUrl:"https://link.coupang.com/a/test"}};
  expect(getProductPurchaseLink(base,saved)).toMatchObject({url:saved[52].affiliateUrl,affiliate:true,label:"쿠팡에서 보기"});
  expect(getProductPurchaseLink({...base,link:base.link+"5"},saved).affiliate).toBe(false);
  expect(getProductPurchaseLink(base,{52:{...saved[52],affiliateUrl:"https://example.com/redirect"}}).url).toBe(base.link);
  expect(getProductPurchaseLink({...base,volume:"453g"},{52:{...saved[52],destination:"search"}})).toMatchObject({
    url:saved[52].affiliateUrl, affiliate:true, label:"쿠팡에서 검색", note:"검색 결과에서 453g 옵션을 확인해요.",
  });
});
test("official and other retailer destinations are labelled accurately and never converted",()=>{
  const official={...base,link:"https://www.amoremall.com/kr/ko/product/detail?onlineProdSn=123",purchaseSource:{label:"아모레몰",note:"150ml 2개 구성"}};
  expect(getProductPurchaseLink(official,{52:{originalUrl:official.link,affiliateUrl:"https://link.coupang.com/a/test"}})).toMatchObject({url:official.link,label:"아모레몰에서 보기",affiliate:false,note:"150ml 2개 구성"});
  expect(getProductPurchaseLink({...base,link:"https://coupa.ng/test"}).affiliate).toBe(true);
});
test("unsafe schemes, fake affiliate hosts and credentials cannot create purchase destinations",()=>{
  for(const link of ["javascript:alert(1)","data:text/html,test","http://www.coupang.com/test","https://user:password@www.coupang.com/test","#",""]) expect(getProductPurchaseLink({...base,link}).url).toBe("");
  for(const link of ["https://link.coupang.com.evil.test/a/1","https://evil.test/?next=link.coupang.com","https://coupa.ng:444/test"]) expect(isCoupangAffiliateUrl(link)).toBe(false);
});
