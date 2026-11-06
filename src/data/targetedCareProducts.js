// Separate concern products from the starter catalog so exfoliants never fill a basic slot.
export const blackheadCosmetics = [
  {
    type: "씻어내는 화장품 · 살리실산 세안제",
    name: "코스알엑스 살리실산 데일리 젠틀 클렌저",
    guidance: "세안제 형태를 원할 때. 기존 세안제와 연달아 쓰는 대신 이 제품을 쓰는 날에는 세안제를 대체하는 선택지예요.",
    source: "https://www.cosrx.co.kr/product/살리실산-데일리-젠틀-클렌저-150ml/162/category/77/display/1/",
  },
  {
    type: "바르고 두는 화장품 · AHA/BHA 토너",
    name: "코스알엑스 AHA/BHA 클래리파잉 트리트먼트 토너",
    guidance: "글라이콜릭애씨드·베타인살리실레이트가 든 토너예요. 각질 관리용 토너로 한 가지만 골라요.",
    source: "https://cosrx.co.kr/m/product_detail.html?brand_uid=191",
  },
  {
    type: "바르고 두는 화장품 · BHA 리퀴드",
    name: "코스알엑스 BHA 블랙헤드 파워 리퀴드",
    guidance: "베타인살리실레이트를 담은 국내 화장품이에요. 살리실산 2% 일반의약품과 성분 표시 및 용도가 달라요.",
    source: "https://www.cosrx.co.kr/m/product_detail.html?brand_uid=1173596",
  },
];

export const pharmacyOptions = {
  blackheads: {
    name: "클리어틴외용액 2%",
    ingredients: "살리실산 2%",
    indication: "여드름 치료용 일반의약품이에요. 검은 점이 면포인지, 이 제품을 써도 되는 부위인지 약사에게 먼저 확인해요.",
    caution: "붉거나 자극이 있는 부위, 감염·염증 부위, 눈가와 점막에는 쓰지 않아요. 성분 과민증·당뇨병·혈액순환장애가 있는 사람은 사용할 수 없어요. 임신·수유 중이거나 알레르기 병력이 있으면 먼저 알리세요.",
    source: "https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=201306847",
  },
  breakouts: {
    name: "애크논크림",
    ingredients: "이부프로펜피코놀 30 mg/g · 이소프로필메틸페놀 10 mg/g",
    indication: "여드름·뾰루지에 허가된 일반의약품이에요. 지금 돌기가 여드름인지, 이미 바르는 제품과 같이 써도 되는지 약사에게 먼저 확인해요.",
    caution: "눈 주위나 깊은 상처에 쓰지 않아요. 성분 과민증이 있거나 임신 3기에는 사용하지 않아요. 임신 중이거나 약·화장품에 알레르기 반응이 있었다면 먼저 알리세요.",
    source: "https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=201901721",
  },
};

export const sunscreenOption = {
  type: "자외선 차단제 · 화장품",
  name: "라운드랩 자작나무 수분 선크림",
  guidance: "잘 맞는 자외선 차단제가 없다면 살펴볼 후보예요. 잔주름을 없애는 제품으로 제시하지 않아요.",
  source: "https://roundlab.co.kr/product/자작나무-수분-선크림-50ml/138/",
};
