# ID3·ID12·ID24 크림·로션 제품 데이터 일괄 검수

검수일: 2026-10-11. 기준은 `src/data/products.js`의 총 43개 제품, ID3/12/24이며 기존 제품 ID·루틴 구조는 보존한다.

## ID3 피지오겔 데일리 모이스처 크림 150ml

- [LG생활건강 가족몰 제품명·용량](https://www.lgcaremall.com/product/detail/A50062540)에서 현행 브랜드 판매 제품의 정체성을 확인했다.
- [국내 SSG 상품고시](https://www.ssg.com/item/itemView.ssg?itemId=1000313497906)에 기재된 150ml 전성분 **13종**을 순서대로 저장했다. 유통사 페이지의 동일한 제품군 전성분이 생산지·업체 정보와 함께 달라진 기록도 있어 국내 공식 제조사 처방과 실제 주문 옵션의 동일성은 미확인이다.
- 대표 성분은 세라마이드엔피, 스쿠알란, 글리세린, 시어버터로 구체화했다. 성분 배합률은 공개 확인되지 않아 추정하지 않는다.
- `fullIngredientsMarket: "domestic_retailer"`, `domesticFormulaVerified: false`, 내부 C 근거 등급. 수분 8 / 가벼움 2 / 진정 2 / 막힘 0 / 장벽 7은 추천 휴리스틱으로 임상 개선율이 아니다.
- 쿠팡 판매옵션·가격과 제조사 최신 라벨 불일치는 확인하지 못했다.

## ID12 일리윤 세라마이드 아토 로션 350ml

- [일리윤 직영몰 350ml 상품고시](https://illiyoon.com/product/detail.html?cate_no=27&display_group=1&product_no=263)와 [아모레몰 같은 로션 전성분](https://www.amoremall.com/kr/ko/product/detail?onlineProdSn=71205)을 대조해 **45개 전성분**을 순서대로 저장했다.
- 함량이 명시된 원료는 `세틸-피지하이드록시에틸팔미타마이드(세라마이드 CPP-40) 65.5ppm`과 `세라마이드엔피 4.04ppm` 두 가지다.
- 이 수치는 각 성분의 브랜드 표시 배합량이며 완제품 세라마이드 총량, 순수 유효물질 단독 함량, 장벽 개선율 또는 치료 효능을 뜻하지 않는다. 나머지 성분은 함량 미공개다.
- 내부 careProfile 수분 8 / 가벼움 5 / 진정 4 / 막힘 0 / 장벽 8은 제품 성분·제형에 대한 비교용 수동 점수이지 임상 점수가 아니다.
- `evidenceLevel: "B"`, `fullIngredientsMarket: "domestic_official"`, `domesticFormulaVerified: true`로 기록했다. 공개 자료가 실제 구매 제품과 다를 수 있어 라벨 대조와 쿠팡 가격·옵션은 후속 확인 대상이다.

## ID24 라로슈포제 시카플라스트 밤 B5

- 기존 DB는 **B5 100ml**이나 [현재 국내 공식몰](https://www.larocheposay.co.kr/m/product/view/5085.do)은 **밤 B5+ 100ml**를 판매하며 공식 전성분을 별도 게시하고 있다.
- [브랜드 B5+/크림 B5 묶음 공식 전성분](https://www.larocheposay.co.kr/m/product/view/5118.do)은 이름이 비슷해도 밤과 크림이 서로 다른 처방임을 보여준다.
- 새 B5+의 전성분을 기존 B5 데이터에 복사하지 않는다. 기존 B5의 실제 쿠팡 링크가 어떤 제품과 연결되는지 확인되지 않아 `isAvailable: false`로 임시 제외한다.
- `fullIngredientsVerified: false`, 내부 D 등급. 향후 B5+를 별도 제품 ID로 등록하거나 확인 가능한 동일 상품으로 교체할 때 성분·용량·구매 옵션을 일괄 검증한다.

## 검증 및 범위

- 제품 DB에서 ID3/12/24만 수정하고 제품 총 43개 및 ID는 유지한다.
- 이전 전성분 데이터 21개에서 2개를 추가한 **23개**가 `fullIngredients`를 보유한다. 20개는 여전히 비어 있다.
- 자동 GitHub Actions가 UI/추천 테스트와 420개 합성 입력, eslint, build를 수행하도록 기존 테스트 외 ID3/12/24 전용 검증을 추가했다.
- `purchaseLinkVerified: false`는 URL 부재가 아니라 쿠팡 옵션·가격 매칭을 검증하지 못했다는 뜻이다.
- B5 별도 카드 UI, 가격 업데이트, 과거 저장된 루틴 사용자 기록의 소급 변경은 진행하지 않는다.
