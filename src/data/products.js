export const products = [
  {
    id: 1,
    name: "라운드랩 독도 토너",
    brand: "라운드랩",
    category: "toner",
    hydrationLevel: 5,
    texture: "light",
    concerns: [ "hydration", "soothing"],
    ingredients: ["글리세린", "판테놀", "알란토인"],
    // 국내 판매처 고시 16종이며 제조사 원문 전성분·구매 제품 라벨 대조는 추가 확인 필요.
    fullIngredients: [
      "정제수",
      "부틸렌글라이콜",
      "글리세린",
      "펜틸렌글라이콜",
      "프로판다이올",
      "아이리쉬모스추출물",
      "사탕수수추출물",
      "해수",
      "1,2-헥산다이올",
      "프로테아제",
      "베타인",
      "판테놀",
      "에틸헥실글리세린",
      "알란토인",
      "잔탄검",
      "다이소듐이디티에이",
    ],
    careProfile: {
      hydrationSupport: 6,
      lightweightFit: 9,
      soothingSupport: 4,
      congestionSupport: 0,
      barrierSupport: 2,
    },
    evidence: {
      evidenceLevel: "C",
      officialProductVerified: true,
      currentOfficialProductVerified: true,
      fullIngredientsVerified: true,
      fullIngredientsMarket: "domestic_retailer",
      domesticFormulaVerified: false,
      concentrationDisclosure: "not_disclosed",
      purchaseLinkVerified: false,
      priceVerified: false,
      lastVerifiedAt: "2026-10-11",
      sources: [
        { sourceType: "official_domestic_product_page", url: "https://roundlab.co.kr/product/1025-%EB%8F%85%EB%8F%84-%ED%86%A0%EB%84%88-200ml/22/" },
        { sourceType: "domestic_retailer_full_ingredient_disclosure", url: "https://shinsegaemall.ssg.com/item/itemView.ssg?itemId=1000031697295&salestrNo=6005&siteNo=6004" },
      ],
      note: "라운드랩 공식 제품명·용량은 확인했으나 16종 목록은 국내 유통사의 제품고시 출처입니다. 해당 공개 목록에 히알루론산은 없어서 대표 성분에서 제거했습니다. 구매 제품의 리뉴얼 처방 동일성과 피부자극 인체시험은 확인하지 않았습니다.",
    },
    skinTypes: ["중성", "복합성", "수부지"],
    description: "가볍고 무난하게 시작하기 좋은 수분 토너",
    image: "https://t5c.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/421123228552146-ac365ead-d849-48d2-9b25-cb643d89abc5.jpg",
    link: "https://link.coupang.com/a/gmQS3K67ci",

    sensitivitySafe: true,
    beginnerFriendly: true,
    seasons: ["spring", "summer", "autumn", "winter"],
    price: 12900,
    volume: "200ml",
    shortReason: "가볍고 순해서 초보자가 수분 토너로 시작하기 좋음",
    caution: ["극건성에는 단독으로 부족할 수 있음"],
    ratingTags: ["입문용", "가벼운 토너", "데일리"],
    usageType: "toner",

usageAmount: {
  oily: "500원 동전보다 적게",
  normal: "500원 동전 크기 정도",
  dry: "500원 동전 크기 1~2회"
},

usage: {
  when: "세안 후 첫 단계 / 아침·저녁",
  howToUse: [
    "세안 후 물기를 가볍게 닦아냅니다.",
    "손바닥이나 화장솜에 적당량을 덜어냅니다.",
    "얼굴 전체에 부드럽게 펴 바릅니다.",
    "건조한 부위는 한 번 더 레이어링합니다."
  ],
  caution: [
    "화장솜 사용 시 세게 문지르지 마세요."
  ]
}
  },
  {
    id: 2,
    name: "토리든 다이브인 세럼",
    brand: "토리든",
    category: "serum",
    hydrationLevel: 4,
    texture: "light",
    concerns: ["hydration"],
    ingredients: [
      "히알루론산",
      "판테놀",
      "알란토인",
      "글리세린",
      "베타인",
      "세라마이드엔피",
      "베타글루칸"
    ],

    fullIngredients: [
      "Water",
      "Butylene Glycol",
      "Glycerin",
      "Dipropylene Glycol",
      "1,2-Hexanediol",
      "Panthenol",
      "Sodium Hyaluronate",
      "Hydrolyzed Hyaluronic Acid",
      "Sodium Acetylated Hyaluronate",
      "Sodium Hyaluronate Crosspolymer",
      "Hydrolyzed Sodium Hyaluronate",
      "Allantoin",
      "Trehalose",
      "Betaine",
      "Propanediol",
      "Portulaca Oleracea Extract",
      "Hamamelis Virginiana (Witch Hazel) Leaf Extract",
      "Madecassoside",
      "Madecassic Acid",
      "Ceramide NP",
      "Beta-Glucan",
      "Malachite Extract",
      "Cholesterol",
      "Pentylene Glycol",
      "Glyceryl Acrylate/Acrylic Acid Copolymer",
      "PVM/MA Copolymer",
      "Polyglyceryl-10 Laurate",
      "Xanthan Gum",
      "Tromethamine",
      "Carbomer",
      "Ethylhexylglycerin",
      "Scutellaria Baicalensis Root Extract",
      "Paeonia Suffruticosa Root Extract"
    ],

    activeIngredients: [
      {
        name: "5종 히알루론산 복합체",
        concentration: null,
        unit: "%",
        concentrationVerified: false,
        sourceType: "official_global_product_page"
      },
      {
        name: "판테놀",
        concentration: null,
        unit: "%",
        concentrationVerified: false,
        sourceType: "official_global_full_ingredient_list"
      },
      {
        name: "알란토인",
        concentration: null,
        unit: "%",
        concentrationVerified: false,
        sourceType: "official_global_full_ingredient_list"
      }
    ],

    careProfile: {
      hydrationSupport: 9,
      lightweightFit: 10,
      soothingSupport: 5,
      congestionSupport: 0,
      barrierSupport: 3,
    },

    evidence: {
      evidenceLevel: "B",
      officialProductVerified: true,
      fullIngredientsVerified: true,
      fullIngredientsMarket: "global_official",
      domesticFormulaVerified: false,
      concentrationDisclosure: "not_disclosed",
      purchaseLinkVerified: false,
      currentOfficialProductVerified: true,
      lastVerifiedAt: "2026-10-11",
      sources: [
        {
          sourceType: "official_domestic_product_listing",
          url: "https://www.torriden.com/goods/goods_list.php?cateCd=001007",
        },
        {
          sourceType: "official_global_product_page",
          url: "https://torriden.us/products/dive-in-serum",
        },
      ],
    },

    clinicalEvidence: {
      sourceType: "brand_reported",
      humanStudyAvailable: true,
      studies: [
        {
          endpoint: "repeat_insult_patch_test",
          sampleSize: 50,
          duration: "6_weeks",
          result: "non_irritant"
        },
        {
          endpoint: "outer_skin_moisture",
          sampleSize: 20,
          duration: "immediate",
          resultPercent: 88.87
        },
        {
          endpoint: "inner_skin_moisture",
          sampleSize: 20,
          duration: "immediate",
          resultPercent: 10.09
        },
        {
          endpoint: "lower_stratum_corneum_moisture",
          sampleSize: 22,
          duration: "4_weeks",
          resultPercent: 14.94
        }
      ],
      note:
        "토리든 글로벌 공식 페이지의 브랜드 공개 인체적용시험 요약입니다. 독립 임상시험과 동일하게 취급하지 않으며 국내 판매 처방과 시험 처방의 완전한 동일성은 별도 확인이 필요합니다."
    },
    skinTypes: ["건성", "중성", "수부지"],
    description:
      "5종 히알루론산과 판테놀·알란토인을 중심으로 가볍게 수분을 보충하는 저점도 수분 세럼",
    image: "https://thumbnail5.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/076a/53c053161aa6834869885e94909f50b87e42b050165af8bc153b7eaf327d.jpg",
    link: "https://link.coupang.com/a/gmRbsjXonA",

    sensitivitySafe: true,
    beginnerFriendly: true,
    seasons: ["spring", "summer", "autumn", "winter"],
    price: 17800,
    volume: "50ml",
    shortReason: "가볍게 수분을 채워줘서 수부지와 초보자 입문용으로 무난함",
    caution: ["극건성은 크림과 같이 써야 만족도가 높을 수 있음"],
    ratingTags: ["수분세럼", "입문용", "가벼움"],
    usageType: "serum",

usageAmount: {
  oily: "1~2방울 정도",
  normal: "2~3방울 정도",
  dry: "3~4방울 정도"
},

usage: {
  when: "토너 다음 단계 / 아침·저녁",
  howToUse: [
    "토너 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "흡수될 때까지 손바닥으로 가볍게 눌러줍니다."
  ],
  caution: [
    "기능성 성분이 강한 제품은 처음부터 많은 양을 바르지 마세요."
  ]
}
  },
  {
    id: 3,
    name: "피지오겔 데일리 모이스처 크림",
    brand: "피지오겔",
    category: "cream",
    hydrationLevel: 3,
    texture: "rich",
    concerns: ["barrier", "hydration"],
    ingredients: ["세라마이드엔피", "스쿠알란", "글리세린", "시어버터"],
    // 국내 유통사 상품고시 전성분. 제조사 직접 게시 라벨·쿠팡 옵션 동일성은 미검증.
    fullIngredients: [
      "정제수",
      "카프릴릭/카프릭트라이글리세라이드",
      "글리세린",
      "펜틸렌글라이콜",
      "코코넛야자오일",
      "하이드로제네이티드레시틴",
      "시어버터",
      "하이드록시에틸셀룰로오스",
      "스쿠알란",
      "카보머",
      "잔탄검",
      "소듐카보머",
      "세라마이드엔피",
    ],
    careProfile: {
      hydrationSupport: 8,
      lightweightFit: 2,
      soothingSupport: 2,
      congestionSupport: 0,
      barrierSupport: 7,
    },
    evidence: {
      evidenceLevel: "C",
      officialProductVerified: true,
      fullIngredientsVerified: true,
      fullIngredientsMarket: "domestic_retailer",
      domesticFormulaVerified: false,
      concentrationDisclosure: "not_disclosed",
      purchaseLinkVerified: false,
      priceVerified: false,
      lastVerifiedAt: "2026-10-11",
      sources: [
        { sourceType: "official_brand_retail_product_identity", url: "https://www.lgcaremall.com/product/detail/A50062540" },
        { sourceType: "domestic_retail_full_ingredient_list", url: "https://www.ssg.com/item/itemView.ssg?itemId=1000313497906" },
      ],
      note: "150ml 제품 판매 실재를 확인했고 국내 유통사 전성분 13종을 입력했습니다. 제조·유통 시점별 생산국/전성분 표시가 달라 현재 주문 제품의 동일성과 공개 함량은 미확인입니다. 내부 점수는 비교용 휴리스틱이며 임상 시험값이 아닙니다.",
    },
    skinTypes: ["건성", "민감성"],
    description: "건조하고 예민할 때 장벽 보습용으로 무난한 크림",
    image: "https://t2c.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/159640203347477-301e72d8-72b6-4e5d-a684-f802a5852491.jpg",
    link: "https://link.coupang.com/a/gmRlB3BoY0",

    sensitivitySafe: true,
    beginnerFriendly: true,
    seasons: ["autumn", "winter"],
    price: 21900,
    volume: "150ml",
    shortReason: "건조하고 민감한 피부가 장벽 보습용으로 쓰기 좋은 크림",
    caution: ["지성 피부에는 무겁게 느껴질 수 있음"],
    ratingTags: ["장벽보습", "민감성", "건성용"],
    usageType: "cream",

usageAmount: {
  oily: "완두콩 반 개 정도",
  normal: "완두콩 1개 정도",
  dry: "완두콩 1~2개 정도"
},

usage: {
  when: "스킨케어 마지막 단계 / 아침·저녁",
  howToUse: [
    "토너와 세럼 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "건조한 부위는 한 번 더 덧바릅니다."
  ],
  caution: [
    "지성 피부는 처음부터 많은 양을 바르면 답답할 수 있습니다."
  ]
}
  },
  {
    id: 4,
    name: "세타필 젠틀 스킨 클렌저",
    brand: "세타필",
    category: "cleanser",
    hydrationLevel: 5,
    texture: "mild",
    concerns: [],
    ingredients: ["글리세린", "판테놀", "나이아신아마이드"],
    fullIngredients: [
      "Aqua",
      "Glycerin",
      "Cetearyl Alcohol",
      "Panthenol",
      "Niacinamide",
      "Pantolactone",
      "Xanthan Gum",
      "Sodium Cocoyl Isethionate",
      "Sodium Benzoate",
      "Citric Acid",
    ],
    evidence: {
      evidenceLevel: "C",
      officialProductVerified: true,
      fullIngredientsVerified: true,
      fullIngredientsMarket: "domestic_official_other_volume",
      domesticFormulaVerified: false,
      concentrationDisclosure: "not_disclosed",
      purchaseLinkVerified: false,
      priceVerified: false,
      lastVerifiedAt: "2026-10-11",
      sources: [
        { sourceType: "official_domestic_product_page", url: "https://www.cetaphil.co.kr/cleansers/%EC%A0%A0%ED%8B%80-%EC%8A%A4%ED%82%A8-%ED%81%B4%EB%A0%8C%EC%A0%80/KR_302990110227.html" },
      ],
      note: "국내 공식 젠틀 스킨 클렌저 페이지의 10개 INCI를 기록했습니다. 해당 공식 페이지의 연관 용량은 473ml이며 DB 500ml 쿠팡 옵션의 처방/용량 동일성은 미확인입니다. 브랜드 94% 소비자 응답은 피부 개선율로 저장하지 않았습니다.",
    },
careProfile: {
  hydrationSupport: 4,
  lightweightFit: 5,
  soothingSupport: 5,
  congestionSupport: 0,
  barrierSupport: 5,
},
    skinTypes: ["건성", "중성", "민감성"],
    description: "처음 시작하는 사람도 쓰기 쉬운 순한 클렌저",
    image: "https://thumbnail1.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/322416961259287-bb522629-38c6-423d-a169-80c4c9669047.jpg",
    link: "https://link.coupang.com/a/gmRpCgobYW",

    sensitivitySafe: true,
    beginnerFriendly: true,
    seasons: ["spring", "summer", "autumn", "winter"],
    price: 13900,
    volume: "500ml",
    shortReason: "세정 자극이 강하지 않아 처음 루틴을 시작하는 사람도 부담이 적음",
    caution: ["메이크업 세정력은 별도 확인 필요"],
    ratingTags: ["순한클렌저", "입문용", "민감성"],
    usageType: "cleanser",

usageAmount: {
  oily: "손바닥에 1~2cm 정도",
  normal: "손바닥에 1cm 정도",
  dry: "소량만 사용"
},

usage: {
  when: "아침 또는 저녁 세안",
  howToUse: [
    "손을 먼저 깨끗하게 씻습니다.",
    "손에 물을 묻힌 뒤 제품을 덜어 충분히 거품을 냅니다.",
    "얼굴 전체를 30초 정도 부드럽게 문질러 세안합니다.",
    "미온수로 충분히 헹궈냅니다."
  ],
  caution: [
    "세안 시간이 너무 길면 피부가 건조해질 수 있습니다."
  ]
}
  },
  {
  id: 5,
  name: "코스알엑스 BHA 블랙헤드 파워 리퀴드",
  brand: "코스알엑스",
  category: "serum",
  hydrationLevel: 8,
  texture: "light",
  concerns: [
    "sebum",
    "blackhead"
  ],
  ingredients: [
    "베타인살리실레이트(BHA)",
    "나이아신아마이드",
    "판테놀",
    "히알루론산"
  ],
  skinTypes: [
    "지성",
    "수부지"
  ],
  description: "국내 베타인살리실레이트 0.9% 처방의 각질·피지·블랙헤드 관리 보조 리퀴드",
  image: "https://thumbnail13.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/e9fb/8effc1bb3005666fa6c031616cf281e7c20366f39bfbaeb2cf70c764ddae.jpg",
  link: "https://link.coupang.com/a/gmRy1ZCQ2v",
  sensitivitySafe: false,
  beginnerFriendly: false,
  seasons: [
    "spring",
    "summer",
    "autumn"
  ],
  price: 14900,
  volume: "100ml",
  shortReason: "각질·피지와 블랙헤드 관리 목적의 리퀴드로, 민감 피부와 입문자의 기본 세럼에는 우선 추천하지 않음",
  caution: [
    "국내 공식 베타인살리실레이트 함량은 0.9%로, 글로벌 4% 제품 설명과 구분해야 합니다.",
    "민감 피부는 자극 가능성이 있어 작은 부위에 소량부터 확인하세요.",
    "저자극 표기가 무자극이나 염증성 여드름 치료 효과를 보장하지 않습니다."
  ],
  ratingTags: [
    "각질관리",
    "피지관리",
    "블랙헤드"
  ],
  usageType: "exfoliating_serum",
  usageAmount: {
    "oily": "얇게 1회",
    "normal": "소량만 사용",
    "dry": "국소 부위 위주로 소량"
  },
  usage: {
    "when": "저녁 / 주 2~3회 이내에서 소량부터 반응 확인",
    "howToUse": [
      "세안 후 토너 또는 에센스 단계에서 소량을 사용합니다.",
      "토너와 함께 사용하면 토너를 충분히 흡수시킨 뒤 고민 부위에 얇게 펴 바릅니다.",
      "피부 반응에 따라 빈도를 조절하고 사용 후 보습제를 바릅니다."
    ],
    "caution": [
      "처음에는 작은 부위에 소량부터 반응을 확인하세요.",
      "상처가 있는 부위는 피하고 붉어짐·부어오름·가려움 등 이상 반응이 있으면 중단하고 상담하세요.",
      "눈가·입가와 자극받은 부위는 피하세요.",
      "다른 각질 제거제·레티놀·고함량 비타민C 제품과 같은 단계에 겹쳐 바르지 않는 편이 좋습니다.",
      "낮에는 자외선 차단제를 사용하세요."
    ]
  },
  fullIngredients: [
    "흰버드나무껍질수",
    "부틸렌글라이콜",
    "베타인",
    "나이아신아마이드",
    "베타인살리실레이트",
    "1,2-헥산다이올",
    "소듐하이드록사이드",
    "소듐하이알루로네이트",
    "판테놀",
    "잔탄검",
    "에틸헥산다이올"
  ],
  activeIngredients: [
    {
      "name": "베타인살리실레이트",
      "concentration": 0.9,
      "unit": "%",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_product_page"
    },
    {
      "name": "흰버드나무껍질수",
      "concentration": 65,
      "unit": "%",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_product_page"
    },
    {
      "name": "나이아신아마이드",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "판테놀",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "소듐하이알루로네이트",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    }
  ],
  careProfile: {
    "hydrationSupport": 3,
    "lightweightFit": 9,
    "soothingSupport": 2,
    "congestionSupport": 7,
    "barrierSupport": 1
  },
  evidence: {
    "evidenceLevel": "C",
    "officialProductVerified": true,
    "fullIngredientsVerified": true,
    "fullIngredientsMarket": "domestic_official",
    "domesticFormulaVerified": true,
    "concentrationDisclosure": "partially_disclosed",
    "purchaseLinkVerified": false,
    "priceVerified": false,
    "lastVerifiedAt": "2026-10-11",
    "sources": [
      {
        "sourceType": "official_domestic_product_page",
        "url": "https://www.cosrx.co.kr/m/product_detail.html?brand_uid=1173596"
      },
      {
        "sourceType": "official_global_formula_comparison",
        "url": "https://www.cosrx.com/products/bha-blackhead-power-liquid"
      },
      {
        "sourceType": "official_global_concentration_comparison",
        "url": "https://www.cosrx.com/blogs/skinsights/all-about-exfoliation"
      }
    ],
    "marketFormulaDifferenceVerified": true
  },
  clinicalEvidence: {
    "sourceType": "official_material_review",
    "humanStudyAvailable": false,
    "brandLowIrritationTestClaimAvailable": true,
    "studies": [],
    "note": "국내 공식 저자극 테스트 완료 표기는 확인했으나 시험 방법·표본·기간·기관·정량 결과와 인체시험 여부를 이번 자료에서 확정하지 못했습니다. 후기·원료 특성·글로벌 처방의 설명을 국내 완제품 임상 결과로 옮기지 않습니다."
  }
},
{
  id: 6,
  name: "이니스프리 그린티 히알루론산 수분 세럼",
  brand: "이니스프리",
  category: "serum",
  hydrationLevel: 5,
  texture: "light",
  concerns: [
    "hydration"
  ],
  ingredients: [
    "녹차씨오일",
    "녹차추출물",
    "히알루론산",
    "글리세린",
    "판테놀",
    "스쿠알란"
  ],
  skinTypes: [
    "중성",
    "복합성"
  ],
  description: "녹차씨오일·히알루론산·글리세린과 판테놀·스쿠알란을 담은 가벼운 수분 보조 세럼",
  image: "https://thumbnail6.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2025/01/03/14/4/95bab02b-e604-4e03-b452-81e999a0a36b.jpg",
  link: "https://link.coupang.com/a/gmRDP3XfEG",
  sensitivitySafe: false,
  beginnerFriendly: true,
  seasons: [
    "spring",
    "summer",
    "autumn"
  ],
  price: 18900,
  volume: "80ml",
  shortReason: "산뜻한 수분 보충이 필요한 중성·복합성 피부에서 고려할 수 있지만 향 성분 반응은 확인이 필요함",
  caution: [
    "리모넨·시트랄과 향을 내는 식물 오일이 있어 향 성분에 민감하면 확인하세요.",
    "저자극·논코메도제닉 시험 표기가 모든 피부의 무자극을 보장하지 않습니다.",
    "외부 열 자극 시험과 사용감 설문을 홍조·여드름 질환 치료 근거로 해석하지 않습니다."
  ],
  ratingTags: [
    "데일리",
    "수분세럼",
    "복합성"
  ],
  usageType: "serum",
  usageAmount: {
    "oily": "적당량을 얇게 / 소량부터",
    "normal": "적당량을 골고루",
    "dry": "적당량 사용 후 건조한 부위만 필요 시 덧바르기"
  },
  usage: {
    "when": "세안 후 첫 단계 또는 에센스 단계 / 아침·저녁",
    "howToUse": [
      "세안 후 또는 에센스 단계에서 적당량을 덜어냅니다.",
      "얼굴에 부드럽게 펴 바르고 가볍게 흡수시킵니다.",
      "건조한 부위는 피부 반응을 확인하고 소량만 덧바릅니다.",
      "수분이 부족하면 크림으로 마무리합니다."
    ],
    "caution": [
      "처음에는 작은 부위에 소량부터 반응을 확인하세요.",
      "상처가 있는 부위는 피하고 붉어짐·부어오름·가려움 등 이상 반응이 있으면 중단하고 상담하세요."
    ]
  },
  fullIngredients: [
    "정제수*",
    "프로판다이올*",
    "글리세린*",
    "1,2-헥산다이올*",
    "나이아신아마이드",
    "베타인",
    "사카라이드아이소머레이트",
    "녹차씨오일(2,609 ppm)",
    "자일리톨",
    "세테아릴올리베이트",
    "하이드로제네이티드레시틴",
    "부틸렌글라이콜*",
    "솔비탄올리베이트",
    "락토바실러스발효용해물",
    "아크릴레이트/C10-30알킬아크릴레이트크로스폴리머",
    "스쿠알란",
    "판테놀",
    "알란토인",
    "하이드록시에틸아크릴레이트/소듐아크릴로일다이메틸타우레이트코폴리머",
    "트로메타민",
    "트라이에틸시트레이트",
    "에틸헥실글리세린*",
    "캐롭검",
    "다이소듐이디티에이*",
    "리모넨",
    "녹차추출물(366 ppm)*",
    "다이포타슘글리시리제이트",
    "레몬껍질오일",
    "소듐하이알루로네이트(103 ppm)",
    "하이알루로닉애씨드(100 ppm)*",
    "덱스트린",
    "카카오추출물",
    "3-O-에틸아스코빅애씨드",
    "소듐시트레이트",
    "시트릭애씨드",
    "솔비탄아이소스테아레이트",
    "마테잎추출물",
    "글리세릴올리에이트*",
    "시트랄",
    "소두구씨오일",
    "토코페롤*",
    "레시틴*",
    "수크로오스",
    "라우릴글루코사이드*",
    "폴리글리세릴-6라우레이트*",
    "미리스틸글루코사이드*",
    "스피어민트잎오일",
    "시트로넬라오일",
    "갈바눔수지오일",
    "잔탄검*",
    "락틱애씨드",
    "하이드롤라이즈드하이알루로닉애씨드(0.5 ppm)",
    "소듐하이알루로네이트크로스폴리머(0.2 ppm)",
    "소듐아세틸레이티드하이알루로네이트(0.01 ppm)"
  ],
  activeIngredients: [
    {
      "name": "녹차씨오일",
      "concentration": 2609,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "녹차추출물",
      "concentration": 366,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "소듐하이알루로네이트",
      "concentration": 103,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "하이알루로닉애씨드",
      "concentration": 100,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "하이드롤라이즈드하이알루로닉애씨드",
      "concentration": 0.5,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "소듐하이알루로네이트크로스폴리머",
      "concentration": 0.2,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "소듐아세틸레이티드하이알루로네이트",
      "concentration": 0.01,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "나이아신아마이드",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "판테놀",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "스쿠알란",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    }
  ],
  careProfile: {
    "hydrationSupport": 8,
    "lightweightFit": 9,
    "soothingSupport": 4,
    "congestionSupport": 0,
    "barrierSupport": 3
  },
  evidence: {
    "evidenceLevel": "B",
    "officialProductVerified": true,
    "fullIngredientsVerified": true,
    "fullIngredientsMarket": "domestic_official",
    "domesticFormulaVerified": true,
    "concentrationDisclosure": "partially_disclosed",
    "purchaseLinkVerified": false,
    "priceVerified": false,
    "lastVerifiedAt": "2026-10-11",
    "sources": [
      {
        "sourceType": "official_domestic_product_page_and_embedded_product_information",
        "url": "https://www.innisfree.com/kr/ko/dp/product/34116"
      },
      {
        "sourceType": "official_domestic_brand_reported_study",
        "url": "https://inm-cdn.innisfree.com/publish/pdtDetail/skincare/essence/greentea_seed_hyaluronic_serum_240103/gtshs_img23_250519.png"
      },
      {
        "sourceType": "official_domestic_brand_reported_study",
        "url": "https://inm-cdn.innisfree.com/publish/pdtDetail/skincare/essence/greentea_seed_hyaluronic_serum_240103/gtshs_img09_250519.png"
      },
      {
        "sourceType": "official_domestic_brand_reported_study",
        "url": "https://inm-cdn.innisfree.com/publish/pdtDetail/skincare/essence/greentea_seed_hyaluronic_serum_240103/gtshs_img11_250519.png"
      },
      {
        "sourceType": "official_domestic_brand_reported_study",
        "url": "https://inm-cdn.innisfree.com/publish/pdtDetail/skincare/essence/greentea_seed_hyaluronic_serum_240103/gtshs_img12_250519.png"
      },
      {
        "sourceType": "official_domestic_brand_reported_study",
        "url": "https://inm-cdn.innisfree.com/publish/pdtDetail/skincare/essence/greentea_seed_hyaluronic_serum_240103/gtshs_img03_250519.png"
      },
      {
        "sourceType": "official_domestic_brand_reported_study",
        "url": "https://inm-cdn.innisfree.com/publish/pdtDetail/skincare/essence/greentea_seed_hyaluronic_serum_240103/gtshs_img14_250519.png"
      }
    ]
  },
  clinicalEvidence: {
    "sourceType": "brand_reported",
    "humanStudyAvailable": true,
    "currentFormulaStudyMatchVerified": false,
    "studies": [
      {
        "sampleSize": 30,
        "studyPeriod": "2022-12-05~2022-12-26",
        "institute": "(주)글로벌의학연구센터",
        "populationScope": "성인 여성",
        "endpoint": "absorption_speed_comparison",
        "duration": null,
        "resultRatio": 1.4,
        "comparator": "GREENTEA+HA 희석액",
        "note": "공식 헤드라인의 물보다 1.4배는 각주에서 GREENTEA+HA 희석액과 세럼의 비교로 설명합니다. 순수 물 대비 일반적 우위로 확대하지 않습니다."
      },
      {
        "sampleSize": 30,
        "studyPeriod": "2022-12-05~2022-12-26",
        "institute": "(주)글로벌의학연구센터",
        "populationScope": "만 20~49세 성인 여성",
        "endpoint": "facial_moisture_and_stratum_corneum_distribution",
        "duration": "after application; timing unspecified",
        "result": "안면 26개 부위 수분량 증가·각질층 15층까지 보습 성분 관찰 표기",
        "note": "각질층 관찰을 진피 침투나 전신 수분 공급으로 해석하지 않습니다."
      },
      {
        "sampleSize": 30,
        "studyPeriod": "2022-12-05~2022-12-26",
        "institute": "(주)글로벌의학연구센터",
        "populationScope": "만 20~49세 성인 여성",
        "endpoint": "temporary_redness_after_heat_irritation",
        "duration": "after heat irritation; timing unspecified",
        "resultPercent": 48,
        "direction": "improvement",
        "resultScope": "second_highest_improvement_participant",
        "note": "상위 두 번째 개선율 시험자의 수치라는 각주를 보존합니다. 30명 평균이나 일상 홍조 질환 개선율로 쓰지 않습니다."
      },
      {
        "sampleSize": 30,
        "studyPeriod": "2022-12-05~2022-12-26",
        "institute": "(주)글로벌의학연구센터",
        "populationScope": "만 20~49세 성인 여성",
        "endpoint": "skin_barrier_damage_improvement",
        "duration": "3 days",
        "outcomes": [
          {
            "timePoint": "after application",
            "resultPercent": 67,
            "direction": "improvement"
          },
          {
            "timePoint": "3 days",
            "resultPercent": 85.4,
            "direction": "improvement"
          }
        ],
        "note": "동일 상세에서 그래프는 85%, 아래 요약은 85.4%로 표시합니다. 더 정밀한 표시를 저장하고 정밀도 차이를 기록합니다. 측정 지표를 TEWL로 추정하지 않습니다."
      },
      {
        "sampleSize": 30,
        "studyPeriod": "2022-12-05~2022-12-26",
        "institute": "(주)글로벌의학연구센터",
        "populationScope": "만 20~49세 성인 여성",
        "endpoint": "moisture_retention",
        "duration": "72 hours",
        "result": "브랜드 72시간 보습 지속 표기"
      },
      {
        "sampleSize": null,
        "studyPeriod": null,
        "endpoint": "sensitive_skin_primary_irritation",
        "duration": null,
        "institute": null,
        "resultScore": 0,
        "result": "브랜드 민감 피부 자극지수 0.00·피부과 테스트 완료 표기",
        "note": "보고서 이미지의 흐린 표본·기간·기관은 확정하지 않았습니다."
      },
      {
        "sampleSize": null,
        "studyPeriod": null,
        "endpoint": "non_comedogenic_and_hypoallergy_test",
        "duration": null,
        "institute": null,
        "result": "브랜드 논코메도제닉·하이포알러지 테스트 완료 표기",
        "note": "모든 피부의 무자극·알레르기 없음·면포 발생 없음 보장은 아닙니다."
      }
    ],
    "note": "브랜드가 공개한 시험 요약입니다. 전체 보고서·대조군·통계와 시험 당시 처방의 현재 처방 동일성은 미확인입니다. 개인의 기대 개선량·질환 치료율·타 제품 대비 효능으로 쓰지 않습니다."
  },
  consumerEvidence: {
    "sourceType": "brand_reported_self_assessment",
    "studies": [
      {
        "sampleSize": 30,
        "duration": "2 weeks",
        "studyPeriod": "2023-05-04~2023-05-18",
        "institute": "(주)ACORN",
        "populationScope": "만 20~35세 성인 여성",
        "responseThreshold": null,
        "outcomes": [
          {
            "endpoint": "feeling_of_relief_from_inner_dryness",
            "agreementPercent": 100
          }
        ]
      },
      {
        "sampleSize": 31,
        "duration": null,
        "studyPeriod": "2024-05-20~2024-05-31",
        "institute": "(주)글로벌의학연구센터",
        "populationScope": "스스로 민감하다고 느끼고 건조 고민이 있는 평균 20대 여성",
        "responseThreshold": null,
        "outcomes": [
          {
            "endpoint": "makeup_breakdown_feeling",
            "agreementPercent": 90
          },
          {
            "endpoint": "oiliness_feeling",
            "agreementPercent": 100
          },
          {
            "endpoint": "immediate_hydration_feeling",
            "agreementPercent": 100
          },
          {
            "endpoint": "moisture_glow_feeling",
            "agreementPercent": 100
          },
          {
            "endpoint": "texture_feeling",
            "agreementPercent": 100
          }
        ],
        "note": "일시적 사용감 설문. 시험 진행 기간을 개인별 사용 기간으로 추정하지 않습니다."
      }
    ],
    "note": "주관적 응답률은 정량 피부 개선율이 아닙니다. 응답 임계값은 미확인입니다. 판매·재구매 순위, 일반 후기, 메타데이터의 과장된 100% 개선 문구는 임상 근거로 쓰지 않습니다."
  }
},
{
    id: 7,
    name: "에스트라 아토베리어 365 크림",
    brand: "에스트라",
    category: "cream",
    hydrationLevel: 2,
    texture: "rich",
    concerns: ["barrier","hydration"],
    ingredients: [
      "세라마이드엔피",
      "콜레스테롤",
      "스쿠알란",
      "지방산",
      "알란토인",
      "나이아신아마이드"
    ],

    fullIngredients: [
      "정제수",
      "부틸렌글라이콜",
      "글리세린",
      "부틸렌글라이콜다이카프릴레이트/다이카프레이트",
      "세틸에틸헥사노에이트",
      "스쿠알란",
      "펜타에리스리틸테트라아이소스테아레이트",
      "다이카프릴릴카보네이트",
      "베헤닐알코올",
      "다이메티콘",
      "하이드록시프로필비스팔미타마이드엠이에이",
      "스테아릭애씨드",
      "베타인",
      "만니톨",
      "C14-22알코올",
      "팔미틱애씨드",
      "하이드록시프로필비스라우라마이드엠이에이",
      "아라키딜알코올",
      "콜레스테롤",
      "폴리아크릴레이트-13",
      "C12-20알킬글루코사이드",
      "알란토인",
      "아라키딜글루코사이드",
      "나이아신아마이드",
      "세라마이드엔피",
      "글리세릴카프릴레이트",
      "에틸헥실글리세린",
      "하이드로제네이티드폴리아이소부텐",
      "카보머",
      "트로메타민",
      "다이메티콘올",
      "폴리글리세릴-10라우레이트",
      "하이드로제네이티드레시틴",
      "에틸헥실팔미테이트",
      "아크릴레이트/암모늄메타크릴레이트코폴리머",
      "솔비탄아이소스테아레이트",
      "실리카",
      "피토스핑고신",
      "스핑고리피드",
      "아라키딕애씨드",
      "토코페롤",
      "올레익애씨드"
    ],

    careProfile: {
      hydrationSupport: 9,
      lightweightFit: 2,
      soothingSupport: 5,
      congestionSupport: 0,
      barrierSupport: 10,
    },

    evidence: {
      evidenceLevel: "B",
      officialProductVerified: true,
      fullIngredientsVerified: true,
      fullIngredientsMarket: "domestic_official",
      domesticFormulaVerified: true,
      concentrationDisclosure: "not_disclosed",
      purchaseLinkVerified: false,
      currentOfficialProductVerified: true,
      lastVerifiedAt: "2026-10-11",
      sources: [
        {
          sourceType: "official_domestic_product_page",
          url: "https://www.aestura.com/m/product/view.do?prdSeq=1021",
        },
      ],
    },
    skinTypes: ["건성", "민감성"],
    description:
      "세라마이드·콜레스테롤·지방산 계열과 보습 성분을 포함해 건조하고 민감한 피부의 장벽 보습에 초점을 둔 고보습 크림",
    image: "https://thumbnail9.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/8222/2abf1f5fb2c41c432e0355b8df2d92a4c106ab1d17af9826382045b53b02.jpg",
    link: "https://link.coupang.com/a/gmRG4mejdc",

    sensitivitySafe: true,
    beginnerFriendly: true,
    seasons: ["autumn", "winter"],
    price: 28900,
    volume: "80ml",
    shortReason: "건조하고 민감한 피부가 장벽 보완용으로 쓰기 좋은 크림",
    caution: ["지성·수부지에는 답답하게 느껴질 수 있음"],
    ratingTags: ["장벽", "민감성", "고보습"],
    usageType: "cream",

usageAmount: {
  oily: "완두콩 반 개 정도",
  normal: "완두콩 1개 정도",
  dry: "완두콩 1~2개 정도"
},

usage: {
  when: "스킨케어 마지막 단계 / 아침·저녁",
  howToUse: [
    "토너와 세럼 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "건조한 부위는 한 번 더 덧바릅니다."
  ],
  caution: [
    "지성 피부는 처음부터 많은 양을 바르면 답답할 수 있습니다."
  ]
}
  },
  {
    id: 8,
    name: "닥터지 레드 블레미쉬 수딩 크림",
    brand: "닥터지",
    category: "cream",
    hydrationLevel: 6,
    texture: "gel",
    concerns: ["soothing"],
    ingredients: [
      "판테놀",
      "병풀",
      "나이아신아마이드",
      "알란토인",
      "베타글루칸"
    ],

    ingredientEvidence: {
      officialProductIdentityVerified: true,
      secondaryFullIngredientListVerified: true,
      officialFullIngredientListVerified: false
    },

    careProfile: {
      hydrationSupport: 7,
      lightweightFit: 8,
      soothingSupport: 9,
      congestionSupport: 0,
      barrierSupport: 3,
    },

    evidence: {
      evidenceLevel: "C",
      officialProductVerified: true,
      fullIngredientsVerified: false,
      concentrationDisclosure: "not_disclosed",
      purchaseLinkVerified: false,
      currentOfficialProductVerified: true,
      lastVerifiedAt: "2026-10-11",
      sources: [
        {
          sourceType: "official_domestic_product_page",
          url: "https://www.dr-g.co.kr/item/9826",
        },
        {
          sourceType: "secondary_retail_full_ingredient_list",
          url: "https://www.kurly.com/goods/1001428282",
        },
      ],
    },
    skinTypes: ["수부지", "복합성", "민감성"],
    description: "가볍고 진정용으로 시작하기 좋은 젤크림",
    image: "https://thumbnail3.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/711411626878446-f5a03ad2-1be3-4c58-87f2-3cb245512016.jpg",
    link: "https://link.coupang.com/a/gmRLMA2WAf",

    sensitivitySafe: true,
    beginnerFriendly: true,
    seasons: ["spring", "summer", "autumn"],
    price: 18900,
    volume: "70ml",
    shortReason: "무겁지 않은 진정 젤크림이라 수부지 초보자에게 잘 맞기 쉬움",
    caution: ["건성 피부는 겨울에 보습이 부족할 수 있음"],
    ratingTags: ["진정", "젤크림", "수부지"],
    usageType: "cream",

usageAmount: {
  oily: "완두콩 반 개 정도",
  normal: "완두콩 1개 정도",
  dry: "완두콩 1~2개 정도"
},

usage: {
  when: "스킨케어 마지막 단계 / 아침·저녁",
  howToUse: [
    "토너와 세럼 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "건조한 부위는 한 번 더 덧바릅니다."
  ],
  caution: [
    "지성 피부는 처음부터 많은 양을 바르면 답답할 수 있습니다."
  ]
}
  },
  {
    id: 9,
    name: "아누아 어성초 77 토너",
    brand: "아누아",
    category: "toner",
    hydrationLevel: 6,
    texture: "light",
    concerns: ["soothing","acne"],
    ingredients: ["어성초", "판테놀"],
    // 현재 국내 브랜드몰 제품은 '어성초 77 히알루론산 수분 진정 토너'로 리뉴얼됨. 구형 ID와 동일성 확인 전 추천 중단.
    isAvailable: false,
    evidence: {
      evidenceLevel: "D",
      officialProductVerified: false,
      fullIngredientsVerified: false,
      domesticFormulaVerified: false,
      currentOfficialProductVerified: false,
      purchaseLinkVerified: false,
      priceVerified: false,
      lastVerifiedAt: "2026-10-11",
      sources: [
        { sourceType: "official_domestic_renewed_product_page", url: "https://anua.kr/product/detail.html?cate_no=84&product_no=496" },
      ],
      note: "2026년 현재 국내 아누아 공식몰에 NEW/리뉴얼 제품(어성초 77 히알루론산 수분 진정 토너 250ml)이 있으며, 기존 DB의 어성초 77 토너와 전성분·쿠팡 판매 옵션 동일성이 확인되지 않았습니다. 신규 처방의 30종을 기존 제품에 덮어쓰지 않았습니다.",
    },
    skinTypes: ["수부지", "지성", "민감성"],
    description: "가볍고 진정 위주로 보기 좋은 토너",
    image: "https://t5a.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/13e2/5f4cfc4b08c3682018cbcaf7a4c10a151cbc352c3ae8fbecfbb91184cccd.jpg",
    link: "https://link.coupang.com/a/gmROnkwqCO",

    sensitivitySafe: true,
    beginnerFriendly: true,
    seasons: ["spring", "summer", "autumn"],
    price: 16900,
    volume: "250ml",
    shortReason: "유분감이 많거나 예민한 피부가 진정용 토너로 시작하기 좋음",
    caution: ["건성 피부에는 단독 보습감이 부족할 수 있음"],
    ratingTags: ["진정토너", "수부지", "트러블보조"],
    usageType: "toner",

usageAmount: {
  oily: "500원 동전보다 적게",
  normal: "500원 동전 크기 정도",
  dry: "500원 동전 크기 1~2회"
},

usage: {
  when: "세안 후 첫 단계 / 아침·저녁",
  howToUse: [
    "세안 후 물기를 가볍게 닦아냅니다.",
    "손바닥이나 화장솜에 적당량을 덜어냅니다.",
    "얼굴 전체에 부드럽게 펴 바릅니다.",
    "건조한 부위는 한 번 더 레이어링합니다."
  ],
  caution: [
    "화장솜 사용 시 세게 문지르지 마세요."
  ]
}
    
  },
  {
    id: 10,
    name: "셀퓨전씨 약산성 패리어 클렌징폼",
    brand: "셀퓨전씨",
    category: "cleanser",
    hydrationLevel: 4,
    texture: "mild",
    concerns: ["hydration", "soothing"],

    ingredients: [
      "글리세린",
      "레몬밤잎추출물",
      "로즈마리닉애씨드",
      "락토코쿠스발효용해물",
      "석시닉애씨드"
    ],

    fullIngredients: [
      "정제수",
      "소듐코코일이세티오네이트",
      "글리세린",
      "스테아릴알코올",
      "글리세릴스테아레이트에스이",
      "코코-베타인",
      "소듐메틸코코일타우레이트",
      "레몬밤잎추출물",
      "로즈마리닉애씨드",
      "락토코쿠스발효용해물",
      "석시닉애씨드",
      "포타슘코코일글리시네이트",
      "시트릭애씨드",
      "소듐클로라이드",
      "카프릴릴글라이콜",
      "소듐파이테이트",
      "폴리쿼터늄-67",
      "부틸렌글라이콜",
      "페닐프로판올",
      "레불리닉애씨드",
      "소듐레불리네이트"
    ],

    careProfile: {
      hydrationSupport: 4,
      lightweightFit: 5,
      soothingSupport: 5,
      congestionSupport: 0,
      barrierSupport: 2,
    },

    evidence: {
      evidenceLevel: "B",
      officialProductVerified: true,
      fullIngredientsVerified: true,
      fullIngredientsMarket: "domestic_official",
      domesticFormulaVerified: true,
      concentrationDisclosure: "not_disclosed",
      purchaseLinkVerified: false,
      currentOfficialProductVerified: true,
      lastVerifiedAt: "2026-10-11",
      sources: [
        {
          sourceType: "official_domestic_product_page",
          url: "https://www.cellfusionc.co.kr/product/%EC%95%BD%EC%82%B0%EC%84%B1-%ED%8C%A8%EB%A6%AC%EC%96%B4-%ED%81%B4%EB%A0%8C%EC%A7%95%ED%8F%BC-165ml/267/",
        },
      ],
    },

    skinTypes: ["건성", "민감성", "중성"],
    description:
      "세안 후 피부 pH 밸런스를 유지하면서 과도한 당김을 줄이는 데 초점을 둔 약산성 클렌징폼",
    image: "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/323292401994452-6ee66fe4-f38d-4633-8fea-f164540d3b76.jpg",
    link: "https://link.coupang.com/a/gmRSF74qaW",

    sensitivitySafe: true,
    beginnerFriendly: true,
    seasons: ["spring", "summer", "autumn", "winter"],
    price: 15900,
    volume: "165ml",
    shortReason:
      "세안 후 당김이 신경 쓰이거나 순한 약산성 세안을 원하는 피부에 고려하기 좋은 클렌징폼",
    caution: ["진한 메이크업은 2차 세안이 필요할 수 있음"],
    ratingTags: ["약산성", "민감성", "장벽"],
    usageType: "cleanser",

usageAmount: {
  oily: "손바닥에 1~2cm 정도",
  normal: "손바닥에 1cm 정도",
  dry: "소량만 사용"
},

usage: {
  when: "아침 또는 저녁 세안",
  howToUse: [
    "손을 먼저 깨끗하게 씻습니다.",
    "손에 물을 묻힌 뒤 제품을 덜어 충분히 거품을 냅니다.",
    "얼굴 전체를 30초 정도 부드럽게 문질러 세안합니다.",
    "미온수로 충분히 헹궈냅니다."
  ],
  caution: [
    "세안 시간이 너무 길면 피부가 건조해질 수 있습니다."
  ]
}
  },
  {
    id: 11,
    name: "라로슈포제 에빠끌라 듀오",
    brand: "라로슈포제",
    category: "cream",
    // 현재 공식 국내 제품은 '듀오+M 에센스 40ml'로 안내됨. 기존 cream ID의 제품/판매 링크 매칭 확인 전 추천 제외.
    isAvailable: false,
    evidence: {
      evidenceLevel: "D",
      officialProductVerified: false,
      fullIngredientsVerified: false,
      domesticFormulaVerified: false,
      currentOfficialProductVerified: false,
      purchaseLinkVerified: false,
      priceVerified: false,
      lastVerifiedAt: "2026-10-11",
      sources: [
        { sourceType: "official_domestic_possible_successor", url: "https://www.larocheposay.co.kr/product/view/4416.do" },
      ],
      note: "기존 DB의 에빠끌라 듀오 크림 항목은 현재 국내 공식 듀오+M 에센스 40ml와 제품 정체성·처방·사용 단계·쿠팡 구매 옵션이 일치하는지 검증되지 않았습니다. 임시 비추천 처리하며 현행 에센스 전성분을 기존 제품에 혼합하지 않습니다.",
    },
    hydrationLevel: 7,
    texture: "light",
    concerns: ["acne","sebum","pores"],
    ingredients: ["나이아신아마이드", "살리실산"],
    skinTypes: ["지성", "수부지"],
    description: "트러블과 유분 관리 쪽으로 보기 좋은 제품",
    image: "https://t1a.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/5569/783106476aeb01e8eaecfff16da76ff56d70504545cb32773d1c8be10acd.jpg",
    link: "https://link.coupang.com/a/gmRZFwpctw",

    sensitivitySafe: false,
    beginnerFriendly: false,
    seasons: ["spring", "summer", "autumn"],
    price: 25900,
    volume: "40ml",
    shortReason: "트러블·피지 관리 목적이 분명한 지성 피부에 더 잘 맞는 편",
    caution: ["민감 피부는 자극을 느낄 수 있음", "입문자는 빈도 조절이 필요함"],
    ratingTags: ["트러블", "유분관리", "지성용"],
    usageType: "cream",

usageAmount: {
  oily: "완두콩 반 개 정도",
  normal: "완두콩 1개 정도",
  dry: "완두콩 1~2개 정도"
},

usage: {
  when: "스킨케어 마지막 단계 / 아침·저녁",
  howToUse: [
    "토너와 세럼 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "건조한 부위는 한 번 더 덧바릅니다."
  ],
  caution: [
    "지성 피부는 처음부터 많은 양을 바르면 답답할 수 있습니다."
  ]
}
  },
  {
    id: 12,
    name: "일리윤 세라마이드 아토 로션",
    brand: "일리윤",
    category: "cream",
    hydrationLevel: 3,
    texture: "mid",
    concerns: ["barrier","hydration"],
    ingredients: ["세틸-피지하이드록시에틸팔미타마이드", "세라마이드엔피", "글리세린", "스쿠알란", "콜레스테롤", "마데카소사이드"],
    fullIngredients: [
      "정제수",
      "글리세린",
      "프로판다이올",
      "다이메티콘",
      "하이드로제네이티드쌀겨오일",
      "하이드로제네이티드폴리(C6-14올레핀)",
      "세틸에틸헥사노에이트",
      "다이아이소스테아릴말레이트",
      "1,2-헥산다이올",
      "하이드록시에틸아크릴레이트/소듐아크릴로일다이메틸타우레이트코폴리머",
      "C14-22알코올",
      "아라키딜알코올",
      "팔미틱애씨드",
      "글리세릴스테아레이트",
      "스테아릭애씨드",
      "베헤닐알코올",
      "C12-20알킬글루코사이드",
      "글리세릴카프릴레이트",
      "아라키딜글루코사이드",
      "솔비탄아이소스테아레이트",
      "에틸헥실글리세린",
      "부틸렌글라이콜",
      "소듐메타포스페이트",
      "인삼수",
      "황금추출물",
      "세틸-피지하이드록시에틸팔미타마이드(세라마이드 CPP-40 65.5ppm)",
      "만니톨",
      "매실추출물",
      "하이드로제네이티드레시틴",
      "검정콩오일",
      "스쿠알란",
      "마데카소사이드",
      "폴리글리세릴-10펜타스테아레이트",
      "아크릴레이트/암모늄메타크릴레이트코폴리머",
      "세라마이드엔피(4.04ppm)",
      "토코페롤",
      "콜레스테롤",
      "피토스핑고신",
      "실리카",
      "펜틸렌글라이콜",
      "다이포타슘글리시리제이트",
      "아라키딕애씨드",
      "올레익애씨드",
      "카놀라오일",
      "로즈마리잎추출물",
    ],
    activeIngredients: [
      { name: "세틸-피지하이드록시에틸팔미타마이드(세라마이드 CPP-40)", concentration: 65.5, unit: "ppm", concentrationVerified: true, concentrationBasis: "ingredient_fraction", sourceType: "official_domestic_ingredient_disclosure" },
      { name: "세라마이드엔피", concentration: 4.04, unit: "ppm", concentrationVerified: true, concentrationBasis: "ingredient_fraction", sourceType: "official_domestic_ingredient_disclosure" },
    ],
    careProfile: {
      hydrationSupport: 8,
      lightweightFit: 5,
      soothingSupport: 4,
      congestionSupport: 0,
      barrierSupport: 8,
    },
    evidence: {
      evidenceLevel: "B",
      officialProductVerified: true,
      fullIngredientsVerified: true,
      fullIngredientsMarket: "domestic_official",
      domesticFormulaVerified: true,
      concentrationDisclosure: "partially_disclosed",
      purchaseLinkVerified: false,
      priceVerified: false,
      lastVerifiedAt: "2026-10-11",
      sources: [
        { sourceType: "official_domestic_product_page", url: "https://illiyoon.com/product/detail.html?cate_no=27&display_group=1&product_no=263" },
        { sourceType: "manufacturer_brand_domestic_mall", url: "https://www.amoremall.com/kr/ko/product/detail?onlineProdSn=71205" },
      ],
      note: "직영몰 350ml 로션 표시 전성분 45종과 공개된 성분 함량 65.5ppm/4.04ppm을 각각 기록했습니다. 이는 화장품에 첨가한 두 종류 원료의 표기이며 세라마이드 전체의 농도, 치료율 또는 장벽 개선율이 아닙니다. 과거 처방과 섞지 않았고 쿠팡 옵션·가격은 미확인입니다.",
    },
    skinTypes: ["건성", "중성", "민감성"],
    description: "무난하게 오래 쓰기 쉬운 보습 로션",
    image: "https://thumbnail1.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/76383476284976-beeac87e-878a-434d-9b87-acc1ecbc6961.jpg",
    link: "https://link.coupang.com/a/gmR43V9dv2",

    sensitivitySafe: true,
    beginnerFriendly: true,
    seasons: ["autumn", "winter", "spring"],
    price: 16900,
    volume: "350ml",
    shortReason: "가성비 좋고 장벽 보습용으로 오래 쓰기 쉬운 로션 타입 제품",
    caution: ["한여름 지성 피부에는 무겁게 느껴질 수 있음"],
    ratingTags: ["가성비", "장벽보습", "데일리"],
    usageType: "cream",

usageAmount: {
  oily: "완두콩 반 개 정도",
  normal: "완두콩 1개 정도",
  dry: "완두콩 1~2개 정도"
},

usage: {
  when: "스킨케어 마지막 단계 / 아침·저녁",
  howToUse: [
    "토너와 세럼 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "건조한 부위는 한 번 더 덧바릅니다."
  ],
  caution: [
    "지성 피부는 처음부터 많은 양을 바르면 답답할 수 있습니다."
  ]
}
  },
  {
  id: 13,
  name: "코스드바하 나이아신아마이드 10 세럼",
  brand: "코스드바하",
  category: "serum",
  hydrationLevel: 8,
  texture: "light",
  concerns: ["sebum"],
  ingredients: ["나이아신아마이드", "징크PCA", "글리세린", "히알루론산", "판테놀", "알란토인"],
  fullIngredients: [
    "정제수",
    "프로판다이올",
    "나이아신아마이드(10%)",
    "베타인",
    "글리세린",
    "1,2-헥산다이올",
    "징크피씨에이",
    "소듐하이알루로네이트",
    "알로에베라잎추출물",
    "알란토인",
    "다이포타슘글리시리제이트",
    "판테놀",
    "녹차추출물",
    "엘더꽃추출물",
    "여주열매추출물",
    "에델바이스추출물",
  ],
  activeIngredients: [
    {
      name: "나이아신아마이드",
      concentration: 10,
      unit: "%",
      concentrationVerified: true,
      concentrationBasis: "ingredient_fraction",
      sourceType: "official_domestic_product_detail",
    },
    {
      name: "징크피씨에이",
      concentration: 1,
      unit: "%",
      concentrationVerified: true,
      concentrationBasis: "ingredient_fraction",
      sourceType: "official_domestic_product_detail",
    },
    {
      name: "소듐하이알루로네이트",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_product_detail",
    },
    {
      name: "판테놀",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_product_detail",
    },
  ],
  // 내부 휴리스틱입니다. 10%·1%나 브랜드 효능 그래프를 완제품 개선율로 환산하지 않습니다.
  careProfile: {
    hydrationSupport: 3,
    lightweightFit: 8,
    soothingSupport: 2,
    congestionSupport: 3,
    barrierSupport: 1,
  },
  evidence: {
    evidenceLevel: "C",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "domestic_official",
    domesticFormulaVerified: true,
    concentrationDisclosure: "partially_disclosed",
    purchaseLinkVerified: false,
    priceVerified: false,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_domestic_product_page",
        url: "https://www.cosdebaha.co.kr/product/n-세럼-30ml/70/",
      },
      {
        sourceType: "official_domestic_full_ingredient_list",
        url: "https://ecimg.cafe24img.com/pg2348b91183604049/jainaface/web/upload/NNEditor/20260909/N_02.jpg",
      },
      {
        sourceType: "official_domestic_concentration_claim",
        url: "https://ecimg.cafe24img.com/pg2348b91183604049/jainaface/web/upload/NNEditor/20260909/N_01.jpg",
      },
      {
        sourceType: "official_global_product_page",
        url: "https://cosdebahaofficial.com/products/niacinamide-serum-30ml",
      },
      {
        sourceType: "official_brand_usage_guidance",
        url: "https://www.cosdebaha.com/blogs/news/niacinamide-serum-important-information",
      },
    ],
  },
  clinicalEvidence: {
    sourceType: "official_material_review",
    humanStudyAvailable: false,
    studies: [],
    note:
      "확인한 공식 자료에서 이 완제품의 인체시험 표본·방법·기간·결과를 찾지 못했습니다. 원료 특성에 한정된 효능 설명과 마케팅 그래프는 임상 측정값이 아닙니다. 시험 부재를 확정하는 기록은 아니며 피지·모공 관리 설명을 여드름 치료나 직접적인 막힘 제거 근거로 확대하지 않습니다.",
  },
  skinTypes: ["지성", "수부지"],
  description: "나이아신아마이드 10%·징크PCA 1%와 보습 성분을 포함한 유분·피부 톤 관리 보조 세럼",
  image: "https://thumbnail8.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/f305/1e9c347b53760f6700536ed4988c0bc515792e70d082a0db853506d31283.png",
  link: "https://link.coupang.com/a/gmR8QVtMya",
  sensitivitySafe: false,
  beginnerFriendly: false,
  seasons: ["spring", "summer", "autumn"],
  price: 21000,
  volume: "30ml",
  shortReason: "번들거림 관리 보조용으로 고려할 수 있는 고함량 세럼으로, 처음에는 1~2방울부터 사용하세요.",
  caution: [
    "고함량 나이아신아마이드 제품으로 개인에 따라 따가움이나 눈시림이 생길 수 있습니다.",
    "처음에는 작은 부위에 소량으로 반응을 확인하고, 자극이 생기면 사용을 중단하세요.",
    "징크PCA 1%는 징크PCA 원료의 함량이며 순수 아연 1%를 뜻하지 않습니다.",
    "여드름 치료나 모공 막힘 제거 효과가 확인된 제품으로 해석하지 않습니다.",
  ],
  ratingTags: ["유분관리", "피부톤"],
  usageType: "serum",

usageAmount: {
  oily: "1~2방울 정도",
  normal: "1~2방울부터 시작",
  dry: "1~2방울부터 시작, 건조하면 보습 크림으로 보완"
},

usage: {
  when: "토너 다음, 크림 전 / 아침 또는 저녁, 피부 반응에 따라 조절",
  howToUse: [
    "사용 전 작은 부위에 소량을 발라 피부 반응을 확인합니다.",
    "토너 사용 후 세럼 1~2방울을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "흡수 후 보습 크림을 바르고, 낮에는 자외선 차단제로 마무리합니다."
  ],
  caution: [
    "눈 주위를 피하고, 따가움이나 눈시림 등 자극이 생기면 사용을 중단하세요.",
    "많이 바르면 끈적일 수 있으니 한 번에 사용량을 늘리지 마세요."
  ]
}
},
{
  id: 14,
  name: "코스알엑스 나이아신아마이드 15 세럼",
  brand: "코스알엑스",
  category: "serum",
  hydrationLevel: 9,
  texture: "light",
  concerns: ["sebum", "pores"],
  ingredients: ["나이아신아마이드", "징크PCA", "아세틸글루코사민", "트레할로오스", "알란토인"],
  fullIngredients: [
    "정제수",
    "펜틸렌글라이콜",
    "나이아신아마이드(15%)",
    "부틸렌글라이콜",
    "아세틸글루코사민",
    "1,2-헥산다이올",
    "징크피씨에이",
    "트레할로오스",
    "잔탄검",
    "풀루란",
    "알란토인",
    "에틸헥실글리세린",
    "소듐파이테이트",
    "시트릭애씨드",
    "토코페롤",
  ],
  activeIngredients: [
    {
      name: "나이아신아마이드",
      concentration: 15,
      unit: "%",
      concentrationVerified: true,
      concentrationBasis: "ingredient_fraction",
      sourceType: "official_domestic_full_ingredient_list",
    },
    {
      name: "징크피씨에이",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_full_ingredient_list",
    },
    {
      name: "아세틸글루코사민",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_full_ingredient_list",
    },
    {
      name: "알란토인",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_full_ingredient_list",
    },
  ],
  // 내부 휴리스틱입니다. 원료 15%·브랜드 시험 변화율·100% 설문을 점수로 직접 환산하지 않습니다.
  careProfile: {
    hydrationSupport: 2,
    lightweightFit: 9,
    soothingSupport: 2,
    congestionSupport: 6,
    barrierSupport: 0,
  },
  evidence: {
    evidenceLevel: "B",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "domestic_official",
    domesticFormulaVerified: true,
    concentrationDisclosure: "partially_disclosed",
    purchaseLinkVerified: false,
    priceVerified: false,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_domestic_product_page",
        url: "https://www.cosrx.co.kr/shop/shopdetail.html?branduid=1177564",
      },
      {
        sourceType: "official_domestic_brand_reported_study",
        url: "https://cosrxinc.jpg3.kr/cosrximg/cosrx/product/The-Niacinamide15-Serum/1000_Niacinamide-15-Serum_03.jpg",
      },
      {
        sourceType: "official_domestic_consumer_survey",
        url: "https://cosrxinc.jpg3.kr/cosrximg/cosrx/product/The-Niacinamide15-Serum/1000_Niacinamide-15-Serum_02.gif",
      },
      {
        sourceType: "official_global_product_page",
        url: "https://www.cosrx.com/products/the-niacinamide-15-serum-%EB%B2%88%EB%93%A4",
      },
    ],
  },
  clinicalEvidence: {
    sourceType: "brand_reported",
    humanStudyAvailable: true,
    studies: [
      {
        endpoint: "sebum_oil_and_comedone_count_change",
        sampleSize: null,
        duration: "4_weeks",
        studyPeriod: null,
        institute: null,
        outcomes: [
          { endpoint: "sebum_amount", resultPercent: 45, direction: "decrease" },
          { endpoint: "oil_amount", resultPercent: 48, direction: "decrease" },
          { endpoint: "blackhead_count", resultPercent: 42, direction: "decrease" },
          { endpoint: "whitehead_count", resultPercent: 50, direction: "decrease" },
        ],
        note: "국내 Test 01에 표시된 정밀도 그대로 저장합니다. 인접 Test 02·03이나 설문의 표본·기간을 이 항목의 정보로 추정하지 않습니다.",
      },
      {
        endpoint: "pigmentation_and_post_blemish_mark_change",
        sampleSize: 20,
        duration: "4_weeks",
        studyPeriod: "2022-09-03/2022-10-04",
        institute: "(주)더마코스메틱 피부과학연구소",
        populationScope: "brand_stated_ages_14_to_50",
        outcomes: [
          { endpoint: "pigmentation", resultPercent: 15, direction: "decrease" },
          { endpoint: "post_blemish_marks", resultPercent: 19, direction: "decrease" },
        ],
        photoScope: "top_five_improvement_examples",
      },
      {
        endpoint: "skin_tone_change",
        sampleSize: 20,
        duration: "4_weeks",
        studyPeriod: "2022-09-03/2022-10-04",
        institute: "(주)더마코스메틱 피부과학연구소",
        populationScope: "brand_stated_ages_14_to_50",
        outcomes: [
          { endpoint: "redness", resultPercent: 24.8, direction: "decrease" },
          { endpoint: "yellowness", resultPercent: 11.7, direction: "decrease" },
          { endpoint: "brightness", resultPercent: 2.5, direction: "increase" },
        ],
        photoScope: "top_five_improvement_examples",
      },
      {
        endpoint: "non_comedogenic_test",
        sampleSize: null,
        duration: null,
        result: "brand_reported_tested",
        sourceMarket: "global_official",
      },
    ],
    note:
      "브랜드가 공개한 시험 요약입니다. 전체 보고서·대조군·통계·시험 처방과 현재 처방의 동일성은 미확인입니다. 정량 결과·선별 사진·주관적 설문을 구분하며 변화율을 사용자의 예상 개선량이나 여드름·홍조 질환 치료 효과로 사용하지 않습니다. 논코메도제닉 시험은 모든 피부에서 막힘 없음을 보장하지 않습니다.",
  },
  consumerEvidence: {
    sourceType: "brand_reported_self_assessment",
    sampleSize: 20,
    duration: "approximately_4_weeks",
    studyPeriod: "2022-09-03/2022-10-04",
    institute: "(주)더마코스메틱 피부과학연구소",
    populationScope: "brand_stated_ages_14_to_50",
    responseThreshold: "at_least_neutral_on_5_point_scale",
    outcomes: [
      { endpoint: "post_blemish_mark_feeling", agreementPercent: 100 },
      { endpoint: "sebum_and_blemish_improvement_feeling", agreementPercent: 100 },
      { endpoint: "oiliness_improvement_feeling", agreementPercent: 100 },
    ],
    note: "5점 척도에서 보통 이상을 긍정 답변으로 계산한 브랜드 표기입니다. 보통 응답을 포함하며 100% 치료 성공률이나 100% 개선율이 아닙니다.",
  },
  skinTypes: ["지성", "복합성"],
  description: "나이아신아마이드 15%·징크PCA·아세틸글루코사민을 포함한 피지·모공 외관 관리 보조 세럼",
  image: "https://t1c.coupangcdn.com/thumbnails/remote/492x492ex/image/1025_amir_coupang_oct_80k/145d/4cd6ffbf602d22c4dc267895124106da27d3797ff766b96628e7eae6a85b.jpg",
  link: "https://link.coupang.com/a/gmSbUPpoQe",
  sensitivitySafe: false,
  beginnerFriendly: false,
  seasons: ["spring", "summer"],
  price: 19000,
  volume: "20ml",
  shortReason: "피지·모공 관리 목적이 분명할 때 고려하는 15% 고함량 세럼으로, 소량부터 피부 반응을 확인하세요.",
  caution: [
    "고함량 제품으로 따가움·붉어짐·가려움 등이 생길 수 있으며, 자극이 생기면 사용을 중단하세요.",
    "처음에는 작은 부위에 소량으로 반응을 확인하고 상처가 있는 부위와 눈 주위를 피하세요.",
    "브랜드 시험의 변화율과 만족도는 개인의 예상 개선량이나 여드름 치료 효과를 뜻하지 않습니다.",
    "징크PCA·아세틸글루코사민·알란토인의 함량은 미공개입니다.",
  ],
  ratingTags: ["피지", "모공", "고함량"],
  usageType: "serum",

usageAmount: {
  oily: "소량부터 시작해 피부 반응에 따라 조절",
  normal: "소량부터 시작해 피부 반응에 따라 조절",
  dry: "소량부터 시작, 건조하면 보습 크림으로 보완"
},

usage: {
  when: "토너 다음, 크림 전 / 아침 또는 저녁, 피부 반응에 따라 조절",
  howToUse: [
    "사용 전 작은 부위에 소량을 발라 피부 반응을 확인합니다.",
    "토너 다음 세럼 단계에서 소량을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "흡수 후 보습 크림을 바르고, 낮에는 SPF 30 이상의 자외선 차단제로 마무리합니다."
  ],
  caution: [
    "처음부터 많은 양을 사용하지 말고, 따가움·붉어짐·가려움이 생기면 사용을 중단하세요."
  ]
}
},
{
  id: 15,
  name: "라운드랩 자작나무 수분 토너",
  brand: "라운드랩",
  category: "toner",
  hydrationLevel: 4,
  texture: "light",
  concerns: ["hydration", "soothing"],
  ingredients: ["글리세린", "히알루론산", "판테놀", "자작나무수액"],
  fullIngredients: [
    "정제수",
    "글리세린",
    "프로판다이올",
    "글리세레스-26",
    "펜틸렌글라이콜",
    "자작나무수액(10,000ppm)",
    "1,2-헥산다이올",
    "아이리쉬모스추출물",
    "사탕수수추출물",
    "소듐하이알루로네이트",
    "하이알루로닉애씨드",
    "판테놀",
    "트로메타민",
    "다이포타슘글리시리제이트",
    "글리세릴카프릴레이트",
    "글리세릴글루코사이드",
    "부틸렌글라이콜",
    "아스코빅애씨드",
    "카보머",
    "잔탄검",
    "다이소듐이디티에이",
  ],
  activeIngredients: [
    { name: "자작나무수액", concentration: 10000, unit: "ppm", concentrationVerified: true, concentrationBasis: "ingredient_fraction", sourceType: "domestic_retailer_ingredient_disclosure" },
  ],
  careProfile: {
    hydrationSupport: 7,
    lightweightFit: 9,
    soothingSupport: 4,
    congestionSupport: 0,
    barrierSupport: 2,
  },
  evidence: {
    evidenceLevel: "C",
    officialProductVerified: true,
    currentOfficialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "domestic_retailer",
    domesticFormulaVerified: false,
    concentrationDisclosure: "partially_disclosed",
    purchaseLinkVerified: false,
    priceVerified: false,
    lastVerifiedAt: "2026-10-11",
    sources: [
      { sourceType: "official_domestic_product_identity", url: "https://roundlab.co.kr/product/list.html?cate_no=50" },
      { sourceType: "domestic_retail_full_ingredient_list", url: "https://www.ssg.com/item/itemView.ssg?itemId=1000031717269" },
    ],
    note: "국내 유통사 공개 300ml 전성분 21종 및 자작나무수액 10000ppm 표기를 기록했습니다. 제조사 최신 상세 라벨 및 쿠팡 옵션과의 동일성은 미확인이라 국내 공식 현재 처방 검증으로 승격하지 않았습니다.",
  },
  skinTypes: ["건성", "중성", "수부지"],
  description: "가볍게 수분을 채우기 좋은 수분 토너",
  image: "https://t1c.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/6065/a07ee5f8fce3eed3f3125dfa0b554774ada005510abac4474bee9e4e3aa1.png",
  link: "https://link.coupang.com/a/gmSe2ecyvA",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn", "winter"],
  price: 23800,
  volume: "300ml",
  shortReason: "가볍고 촉촉한 수분 토너라 건성·수부지 입문용으로 무난함",
  caution: ["극건성은 크림과 함께 써야 만족도가 높을 수 있음"],
  ratingTags: ["수분토너", "입문용", "산뜻함"],
  usageType: "toner",

usageAmount: {
  oily: "500원 동전보다 적게",
  normal: "500원 동전 크기 정도",
  dry: "500원 동전 크기 1~2회"
},

usage: {
  when: "세안 후 첫 단계 / 아침·저녁",
  howToUse: [
    "세안 후 물기를 가볍게 닦아냅니다.",
    "손바닥이나 화장솜에 적당량을 덜어냅니다.",
    "얼굴 전체에 부드럽게 펴 바릅니다.",
    "건조한 부위는 한 번 더 레이어링합니다."
  ],
  caution: [
    "화장솜 사용 시 세게 문지르지 마세요."
  ]
}
},

{
  id: 18,
  name: "토리든 다이브인 저분자 히알루론산 수딩 크림",
  brand: "토리든",
  category: "cream",
  hydrationLevel: 7,
  texture: "gel",

  concerns: [
    "hydration",
    "soothing"
  ],

  ingredients: [
    "히알루론산",
    "판테놀",
    "알란토인",
    "글리세린",
    "트레할로오스"
  ],

  fullIngredients: [
    "Water",
    "Butylene Glycol",
    "Glycerin",
    "1,2-Hexanediol",
    "Hydrogenated Didecene",
    "Allantoin",
    "Trehalose",
    "Hamamelis Virginiana (Witch Hazel) Extract",
    "Panthenol",
    "Hydrolyzed Hyaluronic Acid",
    "Sodium Hyaluronate",
    "Sodium Hyaluronate Crosspolymer",
    "Sodium Acetylated Hyaluronate",
    "Hydrolyzed Sodium Hyaluronate",
    "Glyceryl Acrylate/Acrylic Acid Copolymer",
    "PVM/MA Copolymer",
    "Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer",
    "2,3-Butanediol",
    "Cetearyl Alcohol",
    "C14-22 Alcohols",
    "C12-20 Alkyl Glucoside",
    "Pentylene Glycol",
    "Sorbitan Isostearate",
    "Caprylic/Capric Triglyceride",
    "Melia Azadirachta Leaf Extract",
    "Melia Azadirachta Flower Extract",
    "Coccinia Indica Fruit Extract",
    "Solanum Melongena (Eggplant) Fruit Extract",
    "Ocimum Sanctum Leaf Extract",
    "Curcuma Longa (Turmeric) Root Extract",
    "Corallina Officinalis Extract",
    "Salvia Sclarea (Clary) Extract",
    "Lavandula Angustifolia (Lavender) Flower Extract",
    "Hyacinthus Orientalis (Hyacinth) Extract",
    "Chamomilla Recutita (Matricaria) Flower Extract",
    "Centaurea Cyanus Flower Extract",
    "Borago Officinalis Extract",
    "Disodium EDTA",
    "Carbomer",
    "Tromethamine",
    "Xanthan Gum",
    "Glutathione",
    "Malachite Extract",
    "Ethylhexylglycerin",
  ],

  activeIngredients: [
    {
      name: "5종 히알루론산 복합체",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_global_product_page"
    },
    {
      name: "판테놀",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_global_full_ingredient_list"
    },
    {
      name: "알란토인",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_global_full_ingredient_list"
    }
  ],

  careProfile: {
    hydrationSupport: 9,
    lightweightFit: 9,
    soothingSupport: 7,
    congestionSupport: 0,
    barrierSupport: 2,
  },

  evidence: {
    evidenceLevel: "B",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "global_official",
    domesticFormulaVerified: false,
    concentrationDisclosure: "not_disclosed",
    purchaseLinkVerified: false,
    currentOfficialProductVerified: true,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_domestic_product_page",
        url: "https://www.torriden.com/goods/goods_view.php?goodsNo=439",
      },
      {
        sourceType: "official_global_product_page",
        url: "https://torriden.us/products/dive-in-soothing-cream",
      },
    ],
  },

  clinicalEvidence: {
    sourceType: "brand_reported",
    humanStudyAvailable: true,
    studies: [
      {
        endpoint: "repeat_insult_patch_test",
        sampleSize: 50,
        duration: "6_weeks",
        result: "non_irritant"
      },
      {
        endpoint: "skin_water_content",
        sampleSize: 20,
        duration: "4_weeks",
        resultPercent: 30.85
      },
      {
        endpoint: "immediate_moisturizing",
        sampleSize: 20,
        duration: "immediate",
        resultPercent: 145.02
      },
      {
        endpoint: "physical_irritation_soothing",
        sampleSize: 20,
        duration: "immediate",
        resultPercent: 109.77
      }
    ],
    note:
      "브랜드 공식 페이지에 공개된 인체적용시험 결과이며 독립 임상 근거와 동일하게 취급하지 않습니다."
  },

  skinTypes: [
    "중성",
    "수부지",
    "복합성",
    "민감성"
  ],

  description:
    "5종 히알루론산과 판테놀·알란토인을 중심으로 수분 공급과 진정을 돕는 가벼운 젤 타입 수딩 크림",

  image: "https://t3c.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/71993950971424-62de1ae8-f5cc-46ab-bcb2-b13e35cd9c69.jpg",
  link: "https://link.coupang.com/a/gmSpgkU1yS",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn"],
  price: 21000,
  volume: "100ml",

  shortReason:
    "속당김은 있지만 무거운 크림이 부담스러운 중성·복합성·수부지·민감 피부에 가볍게 수분과 진정을 보충하기 좋은 젤 크림",

  caution: [
    "정확한 핵심 성분 함량은 공식적으로 공개되지 않아 함량 기반 평가는 하지 않습니다.",
    "겨울철 강한 건조 피부에는 단독 보습이 부족할 수 있습니다."
  ],

  ratingTags: [
    "젤크림",
    "수분",
    "진정",
    "민감"
  ],

  usageType: "cream",

usageAmount: {
  oily: "완두콩 반 개 정도",
  normal: "완두콩 1개 정도",
  dry: "완두콩 1~2개 정도"
},

usage: {
  when: "스킨케어 마지막 단계 / 아침·저녁",
  howToUse: [
    "토너와 세럼 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "건조한 부위는 한 번 더 덧바릅니다."
  ],
  caution: [
    "지성 피부는 처음부터 많은 양을 바르면 답답할 수 있습니다."
  ]
}
},
{
  id: 19,
  name: "라운드랩 자작나무 수분 크림",
  brand: "라운드랩",
  category: "cream",
  hydrationLevel: 4,
  texture: "mid",
  concerns: ["hydration", "soothing"],
  ingredients: ["히알루론산", "판테놀"],
  // 유통사 공개된 서로 다른 전성분 버전(기존 37종·신규 기획 59종)을 아직 같은 처방으로 확인하지 못함.
  isAvailable: false,
  evidence: {
    evidenceLevel: "D",
    officialProductVerified: true,
    fullIngredientsVerified: false,
    domesticFormulaVerified: false,
    currentOfficialProductVerified: true,
    purchaseLinkVerified: false,
    priceVerified: false,
    lastVerifiedAt: "2026-10-11",
    sources: [
      { sourceType: "official_domestic_product_identity", url: "https://m.roundlab.co.kr/product/%EC%9E%90%EC%9E%91%EB%82%98%EB%AC%B4-%EC%88%98%EB%B6%84-%ED%81%AC%EB%A6%BC-80ml/94/category/105/display/1/" },
      { sourceType: "domestic_retail_earlier_formula", url: "https://www.ssg.com/item/itemView.ssg?itemId=1000031715471" },
      { sourceType: "domestic_recent_bundle_formula_indication", url: "https://kbeauty-digest.com/olive/A000000263179" },
    ],
    note: "같은 자작나무 수분 크림 80ml 명칭에서 유통사 기존 37성분과 최근 기획 구성 59성분 보고가 달라 리뉴얼/옵션별 처방 동일성 확인이 필요합니다. 순서 없는 59성분과 과거 37성분을 혼합하지 않고, 구매 옵션·공식 현재 전성분 확인 전 추천을 임시 중단합니다.",
  },
  skinTypes: ["건성", "중성", "수부지"],
  description: "수분감 중심의 데일리 크림",
  image: "https://thumbnail11.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/2c17/cd5eabb516815e853338d54cf6f9d2a7b0fc7f987d4789caf1a2b0320346.png",
  link: "https://link.coupang.com/a/gmSsTbdHk4",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "autumn", "winter"],
  price: 25000,
  volume: "80ml",
  shortReason: "수분감은 있으면서 너무 무겁지 않아 데일리 크림으로 쓰기 좋음",
  caution: ["강한 지성 피부에는 다소 촉촉하게 느껴질 수 있음"],
  ratingTags: ["수분크림", "데일리", "중간보습"],
  usageType: "cream",

usageAmount: {
  oily: "완두콩 반 개 정도",
  normal: "완두콩 1개 정도",
  dry: "완두콩 1~2개 정도"
},

usage: {
  when: "스킨케어 마지막 단계 / 아침·저녁",
  howToUse: [
    "토너와 세럼 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "건조한 부위는 한 번 더 덧바릅니다."
  ],
  caution: [
    "지성 피부는 처음부터 많은 양을 바르면 답답할 수 있습니다."
  ]
}
},
{
  id: 20,
  name: "브링그린 티트리 시카 수딩 토너",
  brand: "브링그린",
  category: "toner",
  hydrationLevel: 7,
  texture: "light",

  concerns: [
    "soothing",
    "sebum"
  ],

  ingredients: [
    "티트리",
    "병풀",
    "판테놀"
  ],

  ingredientEvidence: {
    officiallyVerifiedKeyIngredients: [
      "티트리",
      "시카"
    ],
    secondaryReportedIngredients: [
      "판테놀",
      "티트리잎오일",
      "베타인살리실레이트"
    ],
    officialFullIngredientListVerified: false
  },

  activeIngredients: [
    {
      name: "티트리 성분",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_product_positioning"
    },
    {
      name: "베타인살리실레이트",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "secondary_ingredient_database"
    }
  ],

  careProfile: {
    hydrationSupport: 5,
    lightweightFit: 10,
    soothingSupport: 6,
    congestionSupport: 3,
    barrierSupport: 1,
  },

  evidence: {
    evidenceLevel: "C",
    officialProductVerified: true,
    currentRetailListingVerified: true,
    fullIngredientsVerified: false,
    concentrationDisclosure: "not_disclosed",
    purchaseLinkVerified: false,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_retail_product_page",
        url: "https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000189181",
      },
    ],
  },

  skinTypes: [
    "수부지",
    "지성",
    "복합성"
  ],

  description:
    "유분감이 많은 피부가 가볍게 사용하기 좋은 티트리·시카 중심의 수딩 토너. 전체 성분과 핵심 성분 함량은 공식 텍스트 자료로 완전히 검증되지 않아 민감 피부에는 보수적으로 추천합니다.",

  image: "https://thumbnail2.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/2a60/b58ba28c8a0e23a5df8f520587c6c04d7195b89fec5bed02b2b98af3fac2.png",
  link: "https://link.coupang.com/a/gmSu4mfZRY",

  sensitivitySafe: false,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn"],
  price: 18000,
  volume: "250ml",

  shortReason:
    "번들거림이 많은 지성·수부지 피부가 산뜻한 진정 토너를 원할 때 고려할 수 있지만, 민감 피부에는 우선 추천하지 않습니다.",

  caution: [
    "공식 페이지에서 현재 전성분과 핵심 성분 함량을 텍스트로 완전히 검증하지 못했습니다.",
    "최신 성분 데이터베이스에는 티트리잎오일과 베타인살리실레이트가 보고되어 민감 피부는 자극 여부를 확인하는 편이 좋습니다.",
    "건성 피부는 보습감이 부족할 수 있습니다."
  ],

  ratingTags: [
    "진정",
    "지성",
    "산뜻함",
    "민감주의"
  ],

  usageType: "toner",

usageAmount: {
  oily: "500원 동전보다 적게",
  normal: "500원 동전 크기 정도",
  dry: "500원 동전 크기 1~2회"
},

usage: {
  when: "세안 후 첫 단계 / 아침·저녁",
  howToUse: [
    "세안 후 물기를 가볍게 닦아냅니다.",
    "손바닥이나 화장솜에 적당량을 덜어냅니다.",
    "얼굴 전체에 부드럽게 펴 바릅니다.",
    "건조한 부위는 한 번 더 레이어링합니다."
  ],
  caution: [
    "화장솜 사용 시 세게 문지르지 마세요."
  ]
}
},
{
  id: 21,
  name: "스킨푸드 캐롯 카로틴 카밍 워터 패드",
  brand: "스킨푸드",
  category: "toner",
  hydrationLevel: 6,
  texture: "light",
  concerns: ["soothing"],
  ingredients: ["판테놀"],
  skinTypes: ["수부지", "민감성", "복합성"],
  description: "진정과 가벼운 수분 정돈용으로 쓰기 좋은 패드",
  image: "https://thumbnail1.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/6f96/a2b431e1d1ab4ba0577bb569decef02f63de6f76c6642ab6a98a1840b613.jpg",
  link: "https://link.coupang.com/a/gmSXbSNkL6",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn"],
  price: 26000,
  volume: "60매",
  shortReason: "피부가 예민하거나 열감이 있을 때 가볍게 정돈하기 좋음",
  caution: ["패드 마찰에 예민하면 자주 문지르지 않는 편이 좋음"],
  ratingTags: ["진정패드", "민감성", "쿨링"],
  usageType: "toner",

usageAmount: {
  oily: "500원 동전보다 적게",
  normal: "500원 동전 크기 정도",
  dry: "500원 동전 크기 1~2회"
},

usage: {
  when: "세안 후 첫 단계 / 아침·저녁",
  howToUse: [
    "세안 후 물기를 가볍게 닦아냅니다.",
    "손바닥이나 화장솜에 적당량을 덜어냅니다.",
    "얼굴 전체에 부드럽게 펴 바릅니다.",
    "건조한 부위는 한 번 더 레이어링합니다."
  ],
  caution: [
    "화장솜 사용 시 세게 문지르지 마세요."
  ]
}
},
{
  id: 22,
  name: "넘버즈인 1번 진정 맑게담은 청초토너",
  brand: "넘버즈인",
  category: "toner",
  hydrationLevel: 6,
  texture: "light",
  concerns: ["soothing", "acne"],
  ingredients: ["판테놀"],
  skinTypes: ["수부지", "지성", "민감성"],
  description: "가볍게 피부를 진정시키는 데일리 토너",
  image: "https://t5c.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/308859245406299-5945ce5a-2f44-4fa4-99e9-96fadccaa13b.jpg",
  link: "https://link.coupang.com/a/gmSZ7XALds",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn"],
  price: 22000,
  volume: "300ml",
  shortReason: "무겁지 않고 진정 중심이라 수부지·지성 피부가 쓰기 쉬움",
  caution: ["건성은 보습 제품을 추가하는 편이 좋음"],
  ratingTags: ["진정토너", "데일리", "수부지"],
  usageType: "toner",

usageAmount: {
  oily: "500원 동전보다 적게",
  normal: "500원 동전 크기 정도",
  dry: "500원 동전 크기 1~2회"
},

usage: {
  when: "세안 후 첫 단계 / 아침·저녁",
  howToUse: [
    "세안 후 물기를 가볍게 닦아냅니다.",
    "손바닥이나 화장솜에 적당량을 덜어냅니다.",
    "얼굴 전체에 부드럽게 펴 바릅니다.",
    "건조한 부위는 한 번 더 레이어링합니다."
  ],
  caution: [
    "화장솜 사용 시 세게 문지르지 마세요."
  ]
}
},
{
  id: 23,
  name: "마녀공장 비피다 바이옴 콤플렉스 앰플",
  brand: "마녀공장",
  category: "serum",
  hydrationLevel: 5,
  texture: "mid",
  concerns: [
    "barrier",
    "hydration"
  ],
  ingredients: [
    "비피다발효용해물",
    "글리세린",
    "나이아신아마이드",
    "스쿠알란",
    "히알루론산"
  ],
  skinTypes: [
    "중성",
    "건성",
    "수부지"
  ],
  description: "비피다 발효 원료·글리세린·히알루론산과 스쿠알란을 담은 수분·장벽 보조 앰플",
  image: "https://thumbnail13.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2026/04/07/17/5/fb583be9-5bd3-4cb5-aaac-daa1e24238d5.png",
  link: "https://link.coupang.com/a/gmS2u5vPNc",
  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: [
    "spring",
    "autumn",
    "winter"
  ],
  price: 28000,
  volume: "50ml",
  shortReason: "건조함과 장벽 보조가 필요할 때 고려할 수 있는 앰플로, 브랜드가 수분·장벽 관련 인체시험 요약을 공개함",
  caution: [
    "발효 원료·나이아신아마이드 등에 대한 반응은 개인차가 있어 처음에는 작은 부위에 소량부터 확인하세요.",
    "저자극·민감 피부 시험 완료 표기가 모든 피부의 무자극을 보장하지 않습니다.",
    "피지·면포나 염증성 트러블 치료용으로 검증된 제품은 아닙니다.",
    "건조함이 남으면 크림을 함께 사용하세요."
  ],
  ratingTags: [
    "수분",
    "장벽",
    "발효앰플"
  ],
  usageType: "serum",
  usageAmount: {
    "oily": "적당량을 얇게 / 소량부터",
    "normal": "적당량을 골고루",
    "dry": "적당량 사용 후 건조한 부위만 필요 시 덧바르기"
  },
  usage: {
    "when": "토너 다음·크림 전 단계 / 아침·저녁",
    "howToUse": [
      "토너 사용 후 적당량을 덜어냅니다.",
      "피부 결을 따라 골고루 펴 바릅니다.",
      "가볍게 두드려 흡수시킵니다.",
      "건조함과 피부 반응을 확인하고 필요한 부위에만 덧바릅니다."
    ],
    "caution": [
      "처음에는 작은 부위에 소량부터 사용하세요.",
      "상처가 있는 부위에는 사용을 피하세요.",
      "붉어짐·부어오름·가려움 등 이상 반응이 생기면 사용을 중단하고 상담하세요."
    ]
  },
  fullIngredients: [
    "정제수",
    "부틸렌글라이콜",
    "비피다발효용해물(30,000ppm)",
    "글리세린",
    "나이아신아마이드",
    "1,2-헥산다이올",
    "펜틸렌글라이콜",
    "스쿠알란",
    "폴리글리세릴-10라우레이트",
    "비피다발효여과물(2,046ppm)",
    "락토바실러스발효용해물",
    "락토코쿠스발효용해물",
    "효모발효여과물",
    "카보머",
    "하이드로제네이티드레시틴",
    "트로메타민",
    "잔탄검",
    "프로판다이올",
    "에틸헥실글리세린",
    "아데노신",
    "덱스트린",
    "카카오씨추출물",
    "소듐하이알루로네이트",
    "소듐파이테이트",
    "락토바실러스/호박열매발효여과물",
    "쿠티박테리움 그라눌로숨발효추출여과물(5ppm)",
    "카페인",
    "에델바이스캘러스배양추출물",
    "꽈리꽃받침추출물",
    "하이드롤라이즈드알진",
    "흑효모발효물",
    "에피갈로카테킨갈레이트",
    "벤질글라이콜",
    "하이드롤라이즈드글라이코사미노글리칸",
    "아시아티코사이드",
    "아시아틱애씨드",
    "마데카식애씨드",
    "하이드록시프로필트라이모늄하이알루로네이트",
    "소듐하이알루로네이트크로스폴리머",
    "하이드롤라이즈드하이알루로닉애씨드",
    "소듐아세틸레이티드하이알루로네이트",
    "하이알루로닉애씨드",
    "카퍼트라이펩타이드-1",
    "하이드롤라이즈드소듐하이알루로네이트",
    "아세틸헥사펩타이드-8",
    "포타슘하이알루로네이트"
  ],
  activeIngredients: [
    {
      "name": "비피다발효용해물",
      "concentration": 30000,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "비피다발효여과물",
      "concentration": 2046,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "쿠티박테리움 그라눌로숨발효추출여과물",
      "concentration": 5,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "나이아신아마이드",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "스쿠알란",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "소듐하이알루로네이트",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "아데노신",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    }
  ],
  careProfile: {
    "hydrationSupport": 8,
    "lightweightFit": 7,
    "soothingSupport": 5,
    "congestionSupport": 0,
    "barrierSupport": 7
  },
  evidence: {
    "evidenceLevel": "B",
    "officialProductVerified": true,
    "fullIngredientsVerified": true,
    "fullIngredientsMarket": "domestic_official",
    "domesticFormulaVerified": true,
    "concentrationDisclosure": "partially_disclosed",
    "purchaseLinkVerified": false,
    "priceVerified": false,
    "lastVerifiedAt": "2026-10-11",
    "sources": [
      {
        "sourceType": "official_domestic_product_page",
        "url": "https://manyo.co.kr/goods/goods_view.php?goodsNo=1709"
      },
      {
        "sourceType": "official_domestic_formula_cross_check",
        "url": "https://www.manyo.co.kr/goods/goods_view.php?goodsNo=1000000499"
      },
      {
        "sourceType": "official_domestic_brand_reported_study",
        "url": "https://img.manyo.co.kr/page/260618_bifida_ampoule/Bifida_Biome_Complex_Ampoule_1000_03.jpg"
      },
      {
        "sourceType": "official_domestic_texture_and_usage",
        "url": "https://img.manyo.co.kr/page/260618_bifida_ampoule/Bifida_Biome_Complex_Ampoule_1000_05.jpg"
      },
      {
        "sourceType": "official_us_product_page",
        "url": "https://manyo.us/products/bifida-biome-complex-ampoule"
      }
    ]
  },
  clinicalEvidence: {
    "sourceType": "brand_reported",
    "humanStudyAvailable": true,
    "currentFormulaStudyMatchVerified": false,
    "studies": [
      {
        "endpoint": "skin_barrier_and_chemical_irritation_improvement",
        "sampleSize": 21,
        "duration": "3 weeks",
        "studyPeriod": "2020-01-20~2020-03-11",
        "institute": "(주)한국피부과학연구원",
        "populationScope": "20~60세 성인 여성",
        "outcomes": [
          {
            "endpoint": "skin_barrier_improvement",
            "resultPercent": 83.45,
            "direction": "improvement"
          },
          {
            "endpoint": "chemical_irritation_and_soothing_improvement",
            "resultPercent": 21.79,
            "direction": "improvement"
          }
        ],
        "note": "외부 화학적 자극 시험 요약. 측정 지표·계산식은 미확인으로 TEWL 감소율이나 질환 치료율로 해석하지 않습니다."
      },
      {
        "endpoint": "hydration_wrinkles_elasticity_lifting_and_density",
        "sampleSize": 21,
        "duration": "4 weeks",
        "studyPeriod": "2020-11-09~2020-12-08",
        "institute": "(주)KC피부임상연구센터",
        "populationScope": "만 30~60세 성인 여성",
        "outcomes": [
          {
            "endpoint": "skin_moisture_content",
            "resultPercent": 18.551,
            "direction": "improvement"
          },
          {
            "endpoint": "eye_area_wrinkle_appearance",
            "resultPercent": 6.526,
            "direction": "improvement"
          },
          {
            "endpoint": "skin_elasticity",
            "resultPercent": 4.1814,
            "direction": "improvement"
          },
          {
            "endpoint": "facial_lifting",
            "resultPercent": 0.932,
            "direction": "improvement"
          },
          {
            "endpoint": "skin_density",
            "resultPercent": 6.402,
            "direction": "improvement"
          }
        ]
      },
      {
        "endpoint": "primary_skin_irritation_patch_test",
        "sampleSize": 33,
        "duration": "patch removal then 1 hour and 24 hours follow-up",
        "studyPeriod": "2020-02-12~2020-02-14",
        "institute": "(주)KC피부임상연구센터",
        "populationScope": "만 19~59세 성인 여성",
        "result": "브랜드 피부 일차자극 테스트 완료·저자극 표기",
        "note": "패치 부착 시간·정량 자극지수는 미확인입니다."
      },
      {
        "endpoint": "sensitive_skin_primary_irritation_patch_test",
        "sampleSize": 31,
        "duration": "patch removal then 1 hour and 24 hours follow-up",
        "studyPeriod": "2020-02-26~2020-02-28",
        "institute": "(주)KC피부임상연구센터",
        "populationScope": "만 19~59세 성인 여성·민감 피부 시험",
        "result": "브랜드 민감성 피부 사용 적합 테스트 완료 표기",
        "note": "모든 민감 피부의 무자극·알레르기 없음·논코메도제닉을 보장하지 않습니다."
      }
    ],
    "note": "현재 국내 상세가 공개하는 2020년 브랜드 시험 요약입니다. 전체 보고서·대조군·통계·시험 당시 처방과 현재 전성분의 동일성은 미확인입니다. 수치를 타 제품 대비 효능이나 개인의 기대 개선량으로 쓰지 않습니다."
  },
  consumerEvidence: {
    "sourceType": "brand_reported_self_assessment",
    "studies": [
      {
        "sampleSize": 21,
        "duration": "4 weeks",
        "studyPeriod": "2020-11-09~2020-12-08",
        "institute": "(주)KC피부임상연구센터",
        "populationScope": "만 30~60세 성인 여성",
        "responseThreshold": "score_at_least_3",
        "outcomes": [
          {
            "endpoint": "feeling_of_use",
            "agreementPercent": 100
          },
          {
            "endpoint": "willingness_to_recommend",
            "agreementPercent": 100
          },
          {
            "endpoint": "overall_satisfaction",
            "agreementPercent": 100
          }
        ],
        "note": "3점 이상 응답한 사람의 비율이며 척도 전체와 선택지 문구는 미확인입니다."
      },
      {
        "sampleSize": 100,
        "duration": null,
        "studyPeriod": "2025-03-17~2025-03-24",
        "institute": null,
        "responseThreshold": null,
        "outcomes": [
          {
            "endpoint": "glowpick_evaluation_panel_product_satisfaction",
            "agreementPercent": 100
          }
        ],
        "note": "글로우픽 평가단의 만족도 홍보이며 임상시험이나 독립 효능 검증으로 취급하지 않습니다."
      },
      {
        "sampleSize": null,
        "duration": "3 weeks",
        "studyPeriod": null,
        "institute": "Korea Research Institution of Dermatology",
        "responseThreshold": null,
        "outcomes": [
          {
            "endpoint": "overall_feeling_of_use",
            "agreementPercent": 95.2
          },
          {
            "endpoint": "reported_calming_of_externally_irritated_skin",
            "agreementPercent": 100
          }
        ],
        "note": "미국 공식 페이지 설문 표기. 국내 시험의 표본·기간을 추정해 옮기거나 국내 만족도 수치와 합치지 않습니다."
      }
    ],
    "note": "주관적 응답률은 정량 피부 개선율·치료 성공률이 아닙니다. 판매 후기·AI 리뷰 요약은 시험 근거에서 제외했습니다."
  }
},
{
  id: 24,
  name: "라로슈포제 시카플라스트 밤 B5",
  brand: "라로슈포제",
  category: "cream",
  hydrationLevel: 2,
  texture: "rich",
  concerns: ["barrier", "soothing"],
  ingredients: ["판테놀"],
  // 현재 국내 공식 판매 제품은 '시카플라스트 밤 B5+'로, 기존 B5 항목의 처방 동일성이 확인되지 않아 추천 잠정 제외.
  isAvailable: false,
  evidence: {
    evidenceLevel: "D",
    officialProductVerified: false,
    fullIngredientsVerified: false,
    domesticFormulaVerified: false,
    concentrationDisclosure: "unknown",
    purchaseLinkVerified: false,
    priceVerified: false,
    currentOfficialProductVerified: false,
    lastVerifiedAt: "2026-10-11",
    sources: [
      { sourceType: "official_domestic_successor_product_page", url: "https://www.larocheposay.co.kr/m/product/view/5085.do" },
      { sourceType: "official_domestic_successor_bundle_formula_comparison", url: "https://www.larocheposay.co.kr/m/product/view/5118.do" },
    ],
    note: "DB는 시카플라스트 밤 B5(100ml)이나 현재 국내 공식 상품은 B5+(100ml)입니다. 공식 B5+의 전성분을 기존 B5에 덮어쓰지 않았습니다. 쿠팡 검색 링크의 실제 옵션 및 B5/B5+ 동일성 미확인으로 isAvailable=false; B5+를 별도 제품으로 추가하려면 옵션·제품명과 처방을 함께 검수해야 합니다.",
  },
  skinTypes: ["건성", "민감성"],
  description: "건조하고 예민할 때 국소 보습용으로 보기 좋은 밤 타입 크림",
  image: "https://thumbnail12.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/44e6/bb8d4273aaea912d8cc3734c4511d8431f1413eda68571903b252baa6352.jpg",
  link: "https://link.coupang.com/a/gmS5hjsujI",

  sensitivitySafe: true,
  beginnerFriendly: false,
  seasons: ["autumn", "winter"],
  price: 22000,
  volume: "100ml",
  shortReason: "강한 건조감이나 예민함이 있을 때 장벽 보조용으로 보기 좋음",
  caution: ["지성·수부지 전체 얼굴 사용은 답답할 수 있음"],
  ratingTags: ["고보습", "판테놀", "장벽"],
  usageType: "cream",

usageAmount: {
  oily: "완두콩 반 개 정도",
  normal: "완두콩 1개 정도",
  dry: "완두콩 1~2개 정도"
},

usage: {
  when: "스킨케어 마지막 단계 / 아침·저녁",
  howToUse: [
    "토너와 세럼 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 얇게 펴 바릅니다.",
    "건조한 부위는 한 번 더 덧바릅니다."
  ],
  caution: [
    "지성 피부는 처음부터 많은 양을 바르면 답답할 수 있습니다."
  ]
}
},
{
  id: 25,
  name: "스킨1004 마다가스카르 센텔라 앰플",
  brand: "스킨1004",
  category: "serum",
  hydrationLevel: 6,
  texture: "light",
  concerns: ["soothing", "hydration"],
  ingredients: ["병풀", "글리세린", "부틸렌글라이콜"],

  // 국내 공식 100ml 상세 이미지와 글로벌 공식 INCI를 대조했습니다.
  // 대표 성분 목록과 전성분을 구분하며 성분 함량은 추정하지 않습니다.
  fullIngredients: [
    "Water",
    "Glycerin",
    "Butylene Glycol",
    "Centella Asiatica Extract",
    "1,2-Hexanediol",
    "Cellulose Gum",
    "Ethylhexylglycerin",
  ],
  activeIngredients: [
    {
      name: "병풀추출물",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_full_ingredient_list",
    },
  ],

  // 추천용 내부 평가값이며 임상 효과의 크기나 안전성 확률이 아닙니다.
  careProfile: {
    hydrationSupport: 5,
    lightweightFit: 9,
    soothingSupport: 7,
    congestionSupport: 0,
    barrierSupport: 2,
  },
  evidence: {
    evidenceLevel: "B",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "domestic_official",
    domesticFormulaVerified: true,
    concentrationDisclosure: "not_disclosed",
    purchaseLinkVerified: false,
    priceVerified: false,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_domestic_product_page",
        url: "https://skin1004korea.com/product/detail.html?product_no=275",
      },
      {
        sourceType: "official_domestic_full_ingredient_list",
        url: "https://skin1004korea.com/web/upload/NNEditor/20260430/copy-1777506000-5.jpg",
      },
      {
        sourceType: "official_domestic_brand_reported_study",
        url: "https://skin1004korea.com/web/upload/NNEditor/20260430/copy-1777505991-3.jpg",
      },
      {
        sourceType: "official_domestic_brand_reported_study",
        url: "https://skin1004korea.com/web/upload/NNEditor/20260430/copy-1777505995-4.jpg",
      },
      {
        sourceType: "official_global_product_page",
        url: "https://www.skin1004.com/products/skin1004-madagascar-centella-ampoule",
      },
    ],
  },
  clinicalEvidence: {
    sourceType: "brand_reported",
    humanStudyAvailable: true,
    studies: [
      {
        endpoint: "skin_irritation_test",
        sampleSize: 32,
        studyPeriod: "2019-01-22/2019-01-25",
        institute: "대한피부과학연구원",
        result: "test_completed",
      },
      {
        endpoint: "non_comedogenic_test",
        sampleSize: 20,
        studyPeriod: "2020-04-13/2020-06-05",
        institute: "한방바이오산업 임상지원센터",
        result: "brand_reported_suitable_for_acne_prone_skin",
      },
      {
        endpoint: "sebum_improvement",
        sampleSize: 20,
        duration: "2_weeks",
        resultPercent: 19.3,
      },
    ],
    note:
      "국내 공식 상세 이미지의 브랜드 공개 시험 요약입니다. 전체 보고서·대조군·통계 정보와 현재 판매 처방의 시험 당시 동일성은 확인하지 못했습니다. 피부자극 시험 완료를 무자극 보장으로, 논코메도제닉·피지 결과를 여드름 치료 효과로 해석하지 않습니다.",
  },
  skinTypes: ["수부지", "민감성", "복합성"],
  description: "병풀추출물과 글리세린·부틸렌글라이콜을 포함한 가벼운 워터 제형의 수분·진정 보조 앰플",
  image: "https://t5a.coupangcdn.com/thumbnails/remote/212x212ex/image/vendor_inventory/image_audit/prod/662b1b6e-a846-4bda-8855-8ff7a366823f_fixing_v2.png",
  link: "https://link.coupang.com/a/gmTeWUCFqK",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn"],
  price: 18900,
  volume: "100ml",
  shortReason: "가벼운 수분·진정 보조용으로 고려할 수 있으며, 병풀 함량과 진정 효과의 크기는 확인되지 않았습니다.",
  caution: [
    "병풀추출물과 개별 유효성분의 함량은 공개되지 않았습니다.",
    "피부자극·논코메도제닉 시험은 모든 사람의 무자극이나 여드름 치료 효과를 보장하지 않습니다.",
    "식물 추출물에 민감한 경우 적은 양부터 반응을 확인하세요.",
    "건성 피부는 단독 사용 시 보습이 부족할 수 있습니다.",
  ],
  ratingTags: ["진정", "병풀", "민감성"]
  ,

usageType: "serum",

usageAmount: {
  oily: "1~2방울 정도",
  normal: "2~3방울 정도",
  dry: "3~4방울 정도"
},

usage: {
  when: "토너 다음 단계 / 아침·저녁",
  howToUse: [
    "토너 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 부드럽게 펴 바릅니다.",
    "흡수될 때까지 손바닥으로 가볍게 눌러줍니다."
  ],
  caution: [
    "처음 사용할 때는 적은 양부터 시작하세요."
  ]
}
},
{
  id: 26,
  name: "브링그린 티트리 시카 트러블 세럼",
  brand: "브링그린",
  category: "serum",
  hydrationLevel: 7,
  texture: "light",
  concerns: ["acne", "soothing", "sebum"],
  ingredients: ["티트리", "판테놀"],
  isAvailable: false,
  availabilityReason:
    "current_product_identity_needs_review",

  evidence: {
    evidenceLevel: "D",
    officialProductVerified: false,
    fullIngredientsVerified: false,
    concentrationDisclosure: "unknown",
    purchaseLinkVerified: false,
    lastVerifiedAt: "2026-10-10",
  },

  skinTypes: ["지성", "수부지"],
  description: "트러블과 번들거림 관리용으로 가볍게 쓰기 좋은 세럼",
  image: "https://t1a.coupangcdn.com/thumbnails/remote/212x212ex/image/vendor_inventory/9390/b4dd4be4e3d66b66878b74e1da43fa4bcfc0e211c144bc981d58f9bf6385.jpg",
  link: "https://link.coupang.com/a/gmTiOtX9S8",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn"],
  price: 21000,
  volume: "50ml",
  shortReason: "피지와 붉은 트러블이 같이 신경 쓰일 때 무난하게 쓰기 좋음",
  caution: ["티트리에 민감하면 소량부터 시작하는 편이 좋음"],
  ratingTags: ["트러블", "진정", "수부지"]
  ,

usageType: "serum",

usageAmount: {
  oily: "1~2방울 정도",
  normal: "2~3방울 정도",
  dry: "3~4방울 정도"
},

usage: {
  when: "토너 다음 단계 / 아침·저녁",
  howToUse: [
    "토너 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 부드럽게 펴 바릅니다.",
    "흡수될 때까지 손바닥으로 가볍게 눌러줍니다."
  ],
  caution: [
    "처음 사용할 때는 적은 양부터 시작하세요."
  ]
}
},
{
  id: 27,
  name: "닥터지 약산성 클렌징 젤 폼",
  brand: "닥터지",
  category: "cleanser",
  hydrationLevel: 7,
  texture: "fresh",
  concerns: [ "sebum"],
  ingredients: ["판테놀"],
  skinTypes: ["수부지", "지성", "복합성"],
  description: "번들거림 부담을 줄이면서 세정하기 좋은 젤 클렌저",
  image: "https://t5c.coupangcdn.com/thumbnails/remote/212x212ex/image/retail/images/1748338049250098-c902968d-31a6-43dd-8a2f-1df4889ce41e.jpg",
  link: "https://link.coupang.com/a/gmTlQAlp3Q",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn"],
  price: 15900,
  volume: "200ml",
  shortReason: "유분감이 많은 피부가 데일리로 쓰기 쉬운 약산성 젤 클렌저",
  caution: ["극건성 피부는 세안 후 당김이 느껴질 수 있음"],
  ratingTags: ["약산성", "지성", "젤클렌저"]
  ,

usageType: "cleanser",

usageAmount: {
  oily: "손바닥에 1~2cm 정도",
  normal: "손바닥에 1cm 정도",
  dry: "소량만 사용"
},

usage: {
  when: "아침 또는 저녁 세안",
  howToUse: [
    "손을 먼저 깨끗하게 씻습니다.",
    "손에 물을 묻힌 뒤 제품을 덜어 충분히 거품을 냅니다.",
    "얼굴 전체를 30초 정도 부드럽게 문질러 세안합니다.",
    "미온수로 충분히 헹궈냅니다."
  ],
  caution: [
    "세안 시간이 너무 길면 피부가 건조해질 수 있습니다."
  ]
}
},
{
  id: 28,
  name: "라로슈포제 에빠끌라 퓨리파잉 포밍 젤",
  brand: "라로슈포제",
  category: "cleanser",
  hydrationLevel: 8,
  texture: "fresh",
  concerns: ["sebum", "acne", "pores"],
  ingredients: ["징크"],
  skinTypes: ["지성", "수부지"],
  description: "유분과 번들거림 관리용으로 많이 쓰이는 젤 클렌저",
  image: "https://thumbnail10.coupangcdn.com/thumbnails/remote/212x212ex/image/vendor_inventory/b87f/e7a265f06a3c28bded0932c27e6675b66c428d376fbfacc5ad75f653ae7b.jpg",
  link: "https://link.coupang.com/a/gmTq5qQf1g",

  sensitivitySafe: false,
  beginnerFriendly: true,
  seasons: ["spring", "summer"],
  price: 24000,
  volume: "200ml",
  shortReason: "강한 유분감과 번들거림 관리용으로 지성 피부에 잘 맞는 편",
  caution: ["건성·민감 피부는 세정력이 강하게 느껴질 수 있음"],
  ratingTags: ["지성", "유분관리", "클렌징젤"]
  ,

usageType: "cleanser",

usageAmount: {
  oily: "손바닥에 1~2cm 정도",
  normal: "손바닥에 1cm 정도",
  dry: "소량만 사용"
},

usage: {
  when: "아침 또는 저녁 세안",
  howToUse: [
    "손을 먼저 깨끗하게 씻습니다.",
    "손에 물을 묻힌 뒤 제품을 덜어 충분히 거품을 냅니다.",
    "얼굴 전체를 30초 정도 부드럽게 문질러 세안합니다.",
    "미온수로 충분히 헹궈냅니다."
  ],
  caution: [
    "세안 시간이 너무 길면 피부가 건조해질 수 있습니다."
  ]
}
},
{
  id: 29,
  name: "아누아 어성초 80 수분 진정 앰플",
  brand: "아누아",
  category: "serum",
  hydrationLevel: 6,
  texture: "light",
  concerns: ["soothing", "hydration"],
  ingredients: ["어성초", "판테놀", "히알루론산", "글리세린", "베타인"],
  // 현재 미국 공식 페이지의 처방입니다. 국내 판매 처방과의 동일성은 미확인입니다.
  fullIngredients: [
    "Houttuynia Cordata Flower/Leaf/Stem Water",
    "Butylene Glycol",
    "Glycerin",
    "1,2-Hexanediol",
    "Sodium Hyaluronate",
    "Bifida Ferment Lysate",
    "Cocoa Extract",
    "Poria Cocos Extract",
    "Water",
    "Betaine",
    "Panthenol",
    "Hydroxyethylcellulose",
    "Ethylhexylglycerin",
    "Tromethamine",
    "Dextrin",
    "Beta-Glucan",
    "Tocopherol",
    "Carbomer",
  ],
  activeIngredients: [
    {
      name: "어성초꽃/잎/줄기수",
      concentration: 80,
      unit: "%",
      concentrationVerified: true,
      concentrationBasis: "raw_material_fraction",
      sourceType: "official_us_full_ingredient_list",
      note:
        "미국 공식 처방의 어성초 원료 배합비 표기이며 식물 고형분이나 개별 유효성분 농도는 아닙니다. 국내 판매 처방의 같은 함량은 미확인입니다.",
    },
    {
      name: "판테놀",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_us_full_ingredient_list",
    },
    {
      name: "소듐하이알루로네이트",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_us_full_ingredient_list",
    },
  ],
  // 내부 추천용 평가값입니다. 원료 80%를 진정 효능 점수로 환산하지 않습니다.
  careProfile: {
    hydrationSupport: 7,
    lightweightFit: 7,
    soothingSupport: 7,
    congestionSupport: 0,
    barrierSupport: 2,
  },
  evidence: {
    evidenceLevel: "B",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "us_official",
    domesticFormulaVerified: false,
    concentrationDisclosure: "partially_disclosed",
    purchaseLinkVerified: false,
    priceVerified: false,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_us_product_page",
        url: "https://anua.com/products/heartleaf-80-moisture-soothing-ampoule-30ml",
      },
      {
        sourceType: "official_us_brand_reported_study",
        url: "https://anua.com/cdn/shop/files/anua-us-ampoule-serum-heartleaf-80-moisture-soothing-ampoule-1261541635.jpg?v=1791442930",
      },
      {
        sourceType: "official_us_non_comedogenic_claim",
        url: "https://anua.com/cdn/shop/files/anua-us-ampoule-serum-heartleaf-80-moisture-soothing-ampoule-1261541636.jpg?v=1791442988",
      },
    ],
  },
  clinicalEvidence: {
    sourceType: "brand_reported",
    humanStudyAvailable: true,
    studies: [
      {
        endpoint: "dryness_related_redness",
        sampleSize: 30,
        duration: "2_weeks",
        studyPeriod: "2022-02-14/2022-02-28",
        institute: "Oat Skin Clinical Trials Center",
        resultPercent: 4.89,
        populationScope:
          "redness_due_to_dryness_not_disease_limited_to_external_irritation",
      },
      {
        endpoint: "dermatological_testing",
        sampleSize: null,
        duration: null,
        result: "brand_reported_tested",
      },
      {
        endpoint: "non_comedogenic_test",
        sampleSize: null,
        duration: null,
        result: "brand_reported_tested",
      },
    ],
    note:
      "미국 공식 페이지의 브랜드 시험 요약입니다. 전체 보고서·대조군·통계 정보 및 시험 처방과 현재 미국·국내 처방의 동일성은 미확인입니다. 건조·외부 자극에 따른 붉어짐 결과를 여드름·홍조 질환 치료나 열감 개선으로 확대하지 않습니다. 피부과 테스트·논코메도제닉 표기만으로 모든 사람의 무자극·막힘 없음을 보장하지 않습니다.",
  },
  skinTypes: ["수부지", "민감성", "복합성"],
  description: "어성초 원료와 판테놀·히알루론산을 포함한 수분·진정 보조 앰플. 확인 자료는 미국 공식 처방이며 국내 판매 처방과의 동일성은 미확인입니다.",
  image: "https://thumbnail6.coupangcdn.com/thumbnails/remote/212x212ex/image/vendor_inventory/f589/4396e31a38e7e5a5256a41ee10f55dd74310913640294560a301788f42b0.png",
  link: "https://link.coupang.com/a/gmTukNQiVE",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn"],
  price: 23000,
  volume: "30ml",
  shortReason: "수분·진정 보조용으로 고려할 수 있으며, 어성초 원료 80% 표기는 개별 진정 유효성분의 농도를 뜻하지 않습니다.",
  caution: [
    "전성분과 어성초 원료 80% 표기는 미국 공식 자료 기준입니다. 국내 구매 제품의 라벨을 확인하세요.",
    "판테놀·히알루론산과 개별 식물 유효성분의 함량은 미공개입니다.",
    "공개된 붉어짐 시험은 건조·외부 자극 조건에 한정되며 여드름·홍조 질환 치료나 열감 개선을 의미하지 않습니다.",
    "식물 원료에 민감하면 적은 양부터 반응을 확인하세요.",
    "극건성은 보습 크림을 함께 사용하는 편이 좋습니다.",
  ],
  ratingTags: ["어성초", "진정", "수분"]
  ,

usageType: "serum",

usageAmount: {
  oily: "1~2방울 정도",
  normal: "2~3방울 정도",
  dry: "3~4방울 정도"
},

usage: {
  when: "토너 다음 단계 / 아침·저녁",
  howToUse: [
    "토너 사용 후 적당량을 덜어냅니다.",
    "얼굴 전체에 부드럽게 펴 바릅니다.",
    "흡수될 때까지 손바닥으로 가볍게 눌러줍니다."
  ],
  caution: [
    "처음 사용할 때는 적은 양부터 시작하세요."
  ]
}
},
{
  id: 30,
  name: "메이크프렘 세이프 미 릴리프 모이스처 클렌징 오일",
  brand: "메이크프렘",
  category: "cleansing_oil",
  hydrationLevel: 5,
  texture: "oil",
  concerns: ["hydration"],
  ingredients: ["호호바오일"],
  skinTypes: ["건성", "중성", "수부지"],
  description: "선크림과 메이크업 세정을 부드럽게 도와주는 클렌징 오일",
  image: "https://thumbnail7.coupangcdn.com/thumbnails/remote/212x212ex/image/vendor_inventory/476b/b9d85a96a7855034ccb4440f5da51b433910061bbe5f74092fd4bc444417.jpg",
  link: "https://link.coupang.com/a/gmTxcD5eO4",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn", "winter"],
  price: 26000,
  volume: "200ml",
  shortReason: "자극 부담을 줄이면서 선크림과 베이스 메이크업 세정용으로 무난함",
  caution: ["유화 과정을 충분히 하지 않으면 잔여감이 남을 수 있음"],
  ratingTags: ["클렌징오일", "저자극", "선크림세정"]
  ,

usageType: "cleansing_oil",

usageAmount: {
  oily: "2펌프 정도",
  normal: "2~3펌프 정도",
  dry: "3펌프 정도"
},

usage: {
  when: "저녁 1차 세안",
  howToUse: [
    "손을 먼저 깨끗하게 씻습니다.",
    "마른 손과 마른 얼굴 상태에서 클렌징 오일을 바릅니다.",
    "선크림과 메이크업이 녹도록 30초 정도 부드럽게 마사지합니다.",
    "손에 물을 조금 묻혀 얼굴에 다시 문질러 하얗게 유화시킵니다.",
    "미온수로 충분히 씻어냅니다.",
    "필요하면 약산성 클렌저로 2차 세안을 합니다."
  ],
  caution: [
    "젖은 얼굴에 바로 바르면 세정력이 떨어질 수 있습니다.",
    "유화를 충분히 하지 않으면 잔여감이 남을 수 있습니다."
  ]
}
},
{
  id: 31,
  name: "비오텀 클렌징 밀크",
  brand: "비오텀",
  category: "cleansing_milk",
  hydrationLevel: 2,
  texture: "milk",
  concerns: [],
  ingredients: ["판테놀"],
  careProfile: {
  hydrationSupport: 4,
  lightweightFit: 3,
  soothingSupport: 6,
  congestionSupport: 0,
  barrierSupport: 4,
},
  skinTypes: ["건성", "민감성"],
  description: "건조하고 민감한 피부를 위한 순한 클렌징 밀크",
  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/212x212q90trim/image/vendor_inventory/1c53/78173e47b79fd440d53c88e793d2a23644cc2c733de459f3d9424bbd6af1.jpg",
  link: "https://link.coupang.com/a/gmTzkTK61s",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "autumn", "winter"],
  price: 26000,
  volume: "200ml",

  shortReason: "건성·민감성 피부의 자극을 줄이며 세정",

  ratingTags: ["건성", "민감성", "저자극"],

  usageType: "cleansing_milk",

  usageAmount: {
    oily: "500원 동전 크기 정도",
    normal: "500원 동전 크기 1~2회",
    dry: "500원 동전 크기 2회 정도"
  },

  usage: {
    when: "저녁 세안",
    howToUse: [
      "마른 얼굴 또는 살짝 젖은 얼굴에 사용합니다.",
      "얼굴 전체를 부드럽게 마사지합니다.",
      "미온수로 충분히 헹궈냅니다."
    ],
    caution: [
      "진한 메이크업 세정력은 부족할 수 있습니다."
    ]
  }
},
{
  id: 32,
  name: "아벤느 익스트림 톨러런스 클렌징 로션",
  brand: "아벤느",
  category: "cleansing_milk",
  hydrationLevel: 1,
  texture: "milk",
  concerns: [ "barrier"],
  ingredients: ["스쿠알란", "글리세린"],
  fullIngredients: [
      "WATER (AVÈNE THERMAL SPRING WATER)",
      "SQUALANE",
      "CAPRYLIC / CAPRIC TRIGLYCERIDE",
      "GLYCERIN",
      "BEHENYL ALCOHOL",
      "SODIUM ACRYLATES/C10-30-ALKYL ACRYLATE CROSSPOLYMER",
      "CARBOMER",
    ],
  isAvailable: false,
  evidence: {
    evidenceLevel: "D",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "us_official_discontinued",
    domesticFormulaVerified: false,
    concentrationDisclosure: "not_disclosed",
    purchaseLinkVerified: false,
    priceVerified: false,
    lastVerifiedAt: "2026-10-11",
    sources: [
      { sourceType: "official_us_discontinued_product_page", url: "https://www.aveneusa.com/tolerance-extreme-cleansing-lotion" },
    ],
    note: "미국 공식몰에서 해당 7성분 로션이 단종으로 안내됩니다. 미국 단종은 한국 판매 중단을 확정하지 않으며, 현재 등록된 200ml 국내/쿠팡 옵션의 처방 동일성은 미확인입니다. 기존 판테놀 표기가 미국 공식 7종에 없어 제거하고 매칭 확인 전 추천을 중단합니다.",
  },
  skinTypes: ["민감성", "건성"],
  description: "극민감 피부를 위한 저자극 클렌징",
  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/212x212q90trim/image/vendor_inventory/2599/84580b2bf08fa177039b211c6b3f7373b0d606fabea0fe50b253a7751611.jpg",
  link: "https://link.coupang.com/a/gmTSzKrBca",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn", "winter"],
  price: 28000,
  volume: "200ml",

  shortReason: "과거 민감성 피부용 클렌징 로션으로 판매되었으나 현재 구매 제품 확인이 필요합니다.",

  ratingTags: ["장벽", "민감성", "저자극"],

  usageType: "cleansing_milk",

  usageAmount: {
    oily: "소량",
    normal: "500원 동전 크기",
    dry: "500원 동전 크기 2회"
  },

  usage: {
    when: "저녁 세안",
    howToUse: [
      "얼굴 전체에 펴 바릅니다.",
      "부드럽게 마사지합니다.",
      "화장솜을 사용해 부드럽게 닦아냅니다."
    ],
    caution: [
      "워터프루프 제품 제거에는 적합하지 않습니다."
    ]
  }
},
{
  id: 33,
  name: "에스트라 아토베리어 클렌저",
  brand: "에스트라",
  category: "gel_cleanser",

  hydrationLevel: 4,
  texture: "gel",

  concerns: [
    "hydration",
    "soothing"
  ],

  ingredients: [
    "히알루론산",
    "알란토인",
    "녹차"
  ],

  careProfile: {
    hydrationSupport: 4,
    lightweightFit: 5,
    soothingSupport: 6,
    congestionSupport: 0,
    barrierSupport: 4,
  },

  skinTypes: [
    "건성",
    "민감성"
  ],

  description:
    "건조하고 연약한 피부의 노폐물을 부드럽게 씻어내고 세안 후 보습감을 유지하는 젤 타입 약산성 클렌저",

  isAvailable: false,
  availabilityReason:
    "purchase_link_and_product_identity_need_review",

  evidence: {
    evidenceLevel: "C",
    officialProductVerified: true,
    fullIngredientsVerified: false,
    concentrationDisclosure: "unknown",
    purchaseLinkVerified: false,
    lastVerifiedAt: "2026-10-10",
  },

  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/212x212q90trim/image/vendor_inventory/a443/a4a04525b7b8af639640d2beb7ffe5d1884403bcd066d8bfada430219e62.png",
  link: "https://link.coupang.com/a/gmT1RLGyd2",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn"],
  price: 18000,
  volume: "250ml",

  shortReason:
  "세안 후 당김이 신경 쓰이는 건조·민감 피부가 순하게 세안하기 좋은 젤 클렌저",

  ratingTags: ["젤클렌저", "수부지", "저자극"],

  usageType: "cleanser",

  usageAmount: {
    oily: "1~2cm",
    normal: "1cm",
    dry: "소량"
  },

  usage: {
    when: "아침 또는 저녁 세안",
    howToUse: [
      "물을 묻혀 거품을 냅니다.",
      "얼굴 전체를 부드럽게 세안합니다.",
      "미온수로 헹궈냅니다."
    ],
    caution: [
      "과도한 세안은 피부를 건조하게 만들 수 있습니다."
    ]
  }
},
{
  id: 34,
  name: "이즈앤트리 그린티 프레시 클렌저",
  brand: "이즈앤트리",
  category: "gel_cleanser",
  hydrationLevel: 8,
  texture: "gel",
  concerns: ["sebum", "pores"],
  ingredients: [
  "녹차",
  "글리세린",
  "히알루론산"
],

fullIngredients: [
  "Water",
  "Glycerin",
  "Sodium Cocoyl Alaninate",
  "Disodium Cocoamphodiacetate",
  "Butylene Glycol",
  "Sodium Methyl Cocoyl Taurate",
  "1,2-Hexanediol",
  "Lauryl Hydroxysultaine",
  "Xanthan Gum",
  "Sodium Chloride",
  "Caprylyl Glycol",
  "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
  "Camellia Sinensis Leaf Powder",
  "Camellia Sinensis Leaf",
  "Camellia Sinensis Leaf Extract",
  "Sodium Phytate",
  "Malt Extract",
  "Hexylene Glycol",
  "Oenothera Biennis (Evening Primrose) Flower Extract",
  "Pinus Palustris Leaf Extract",
  "Pueraria Thunbergiana Root Extract",
  "Ulmus Davidiana Root Extract",
  "Ethylhexylglycerin",
  "Hydrolyzed Glycosaminoglycans",
  "Propanediol",
  "Sodium Hyaluronate Crosspolymer",
  "Sodium Hyaluronate",
  "Benzyl Glycol",
  "Hydrolyzed Hyaluronic Acid",
  "Hyaluronic Acid",
],

activeIngredients: [
  {
    name: "녹차 성분",
    concentration: null,
    unit: "%",
    concentrationVerified: false,
    sourceType: "official_global_full_ingredient_list",
  },
  {
    name: "히알루론산 복합 성분",
    concentration: null,
    unit: "%",
    concentrationVerified: false,
    sourceType: "official_global_full_ingredient_list",
  },
],

careProfile: {
  hydrationSupport: 4,
  lightweightFit: 9,
  soothingSupport: 3,
  congestionSupport: 3,
  barrierSupport: 1,
},

evidence: {
  evidenceLevel: "B",
  officialProductVerified: true,
  fullIngredientsVerified: true,
  fullIngredientsMarket: "global_official",
  domesticFormulaVerified: false,
  concentrationDisclosure: "not_disclosed",
  purchaseLinkVerified: false,
  lastVerifiedAt: "2026-10-11",
  sources: [
    {
      sourceType: "official_global_product_page",
      url: "https://isntree-global.com/products/isntree-green-tea-fresh-cleanser-120ml",
    },
  ],
},

  skinTypes: ["지성", "수부지"],
  description:
  "과잉 유분과 노폐물을 부드럽게 씻어내면서 과도한 세정감을 줄인 산뜻한 젤 클렌저",
  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/212x212q90trim/image/retail/images/616346333160917-47e1143a-f8a2-453a-a4d0-e1e57405e3fa.jpg",
  link: "https://link.coupang.com/a/gmT6f2WXmu",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer"],
  price: 15000,
  volume: "120ml",

  shortReason:
  "번들거림이 많은 지성·수부지 피부가 산뜻하게 데일리 세안하기 좋은 젤 클렌저",

  ratingTags: ["지성", "녹차", "피지"],

  usageType: "cleanser",

  usageAmount: {
    oily: "1~2cm",
    normal: "1cm",
    dry: "소량"
  },

  usage: {
    when: "아침 또는 저녁 세안",
    howToUse: [
      "거품을 충분히 냅니다.",
      "T존 위주로 부드럽게 세안합니다.",
      "미온수로 헹궈냅니다."
    ],
    caution: [
      "건성 피부는 세안 후 보습을 충분히 해주세요."
    ]
  }
},
{
  id: 35,
  name: "수이사이 뷰티클리어 파우더 워시",
  brand: "수이사이",
  category: "enzyme_cleanser",
  hydrationLevel: 6,
  texture: "powder",
  concerns: ["pores","deadskin"],
  ingredients: ["효소"],
  skinTypes: ["복합성", "수부지", "지성"],
  description: "각질과 모공 관리를 위한 효소 세안제",
  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/212x212q90trim/image/retail/images/714346960530000-40b05a94-5623-4643-bc32-bb13ea20e55d.jpg",
  link: "https://link.coupang.com/a/gmT9a2Oudw",

  sensitivitySafe: false,
  beginnerFriendly: false,
  seasons: ["spring", "summer", "autumn", "winter"],
  price: 22000,
  volume: "32개입",

  shortReason: "주 1~2회 각질 관리용",

  ratingTags: ["효소", "각질", "모공"],

  usageType: "enzyme_cleanser",

  usageAmount: {
    oily: "1개",
    normal: "1개",
    dry: "1개"
  },

  usage: {
    when: "주 1~2회 저녁",
    howToUse: [
      "물을 묻혀 충분히 거품을 냅니다.",
      "얼굴 전체를 부드럽게 세안합니다.",
      "미온수로 헹궈냅니다."
    ],
    caution: [
      "매일 사용하지 마세요."
    ]
  }
},
{
  id: 36,
  name: "파파레서피 효소 파우더 클렌저",
  brand: "파파레서피",
  category: "enzyme_cleanser",
  hydrationLevel: 5,
  texture: "powder",
  concerns: ["deadskin", "texture"],
  ingredients: ["효소"],
  skinTypes: ["복합성", "수부지"],
  description: "피부결 정돈을 위한 효소 세안제",
  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/212x212q90trim/image/retail/images/40278605056370-0e5825d6-e422-4449-a1c1-c2bc813c06df.png",
  link: "https://link.coupang.com/a/gmUf8iSbT2",

  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn", "winter"],
  price: 18000,
  volume: "50g",

  shortReason: "피부결과 각질 관리용",

  ratingTags: ["효소", "피부결", "각질"],

  usageType: "enzyme_cleanser",

  usageAmount: {
    oily: "1회",
    normal: "1회",
    dry: "1회"
  },

  usage: {
    when: "주 1~2회 저녁",
    howToUse: [
      "물을 묻혀 거품을 냅니다.",
      "얼굴 전체를 부드럽게 세안합니다.",
      "충분히 헹궈냅니다."
    ],
    caution: [
      "민감 피부는 주 1회부터 시작하세요."
    ]
  }
},

{
  id: 38,
  name: "이즈앤트리 그린티 프레쉬 토너",
  brand: "이즈앤트리",
  category: "toner",
  hydrationLevel: 10,
  texture: "light",

  concerns: [
    "hydration",
    "sebum",
    "soothing"
  ],

  ingredients: [
    "녹차",
    "히알루론산",
    "병풀",
    "알란토인",
    "감초",
    "베타글루칸",
    "버드나무껍질"
  ],

  careProfile: {
    hydrationSupport: 5,
    lightweightFit: 10,
    soothingSupport: 6,
    congestionSupport: 4,
    barrierSupport: 1,
  },
  skinTypes: ["지성", "수부지", "복합성"],

  description:
    "유분과 번들거림이 신경 쓰이는 피부에 가볍게 수분을 보충하며 피지 밸런스를 관리하기 좋은 토너",

  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492q90trim/image/retail/images/1157158040067497-679aa743-9a4f-41ac-ace0-b734210fc477.jpg",
  link: "https://link.coupang.com/a/gtkyAwlxGD",
  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer"],
  price: 0,
  volume: "200ml",
  shortReason:
    "유분감은 많지만 무거운 보습이 부담스러운 지성·수부지 피부에 산뜻하게 쓰기 좋습니다.",
  caution: [],
  ratingTags: ["가벼움", "피지 밸런스", "수부지 추천"],

  usageType: "toner",
  usageAmount: {
    oily: "손바닥에 소량",
    normal: "500원 동전 크기 정도",
    dry: "500원 동전 크기 정도"
  },
  usage: {
    when: "세안 후 첫 단계 / 아침·저녁",
    howToUse: [
      "세안 후 물기를 가볍게 닦아냅니다.",
      "손바닥에 소량 덜어 얼굴 전체에 펴 바릅니다.",
      "T존은 얇게, 건조한 부위는 한 번 더 눌러줍니다."
    ],
    caution: [
      "지성 피부는 여러 겹 바르기보다 얇게 사용하는 것이 좋아요."
    ]
  }
},
{
  id: 39,
  name: "라운드랩 소나무 진정 시카 토너",
  brand: "라운드랩",
  category: "toner",
  hydrationLevel: 9,
  texture: "light",
  concerns: ["hydration", "soothing", "acne"],
  ingredients: ["판테놀"],
  skinTypes: ["지성", "수부지", "민감성", "복합성"],
  description: "번들거림과 예민함이 함께 신경 쓰이는 피부에 맞춘 가벼운 진정 토너입니다.",
  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492q90trim/image/1025_amir_coupang_oct_80k/b56e/a3dac60206c68d62cac469185e5ce5dd83b73e6a525749a1c4aa7d6f6bbf.jpg",
  link: "https://link.coupang.com/a/gtkDSvmYcm",
  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "summer", "autumn"],
  price: 0,
  volume: "250ml",
  shortReason: "지성 피부라도 자극이 신경 쓰일 때 진정용으로 보기 좋은 토너입니다.",
  caution: [],
  ratingTags: ["진정", "민감 지성", "가벼운 토너"],

  usageType: "toner",
  usageAmount: {
    oily: "손바닥에 소량",
    normal: "500원 동전 크기 정도",
    dry: "500원 동전 크기 정도"
  },
  usage: {
    when: "세안 후 첫 단계 / 아침·저녁",
    howToUse: [
      "세안 후 바로 사용합니다.",
      "얼굴 전체에 얇게 펴 바릅니다.",
      "붉어짐이 있는 부위는 문지르지 말고 눌러 흡수시킵니다."
    ],
    caution: [
      "따가움이 느껴지면 사용량을 줄이고 상태를 확인하세요."
    ]
  }
},

{
  id: 42,
  name: "에스트라 테라크네365 수딩 액티브 모이스처라이저",
  brand: "에스트라",
  category: "cream",
  hydrationLevel: 10,
  texture: "gel",

  concerns: [
    "hydration",
    "soothing",
    "sebum",
    "acne"
  ],

  ingredients: [
    "나이아신아마이드",
    "살리실산",
    "히알루론산"
  ],

  // 공식 출처 기준 전성분이며 대표 성분(ingredients)과 구분합니다.
  fullIngredients: [
    "정제수",
    "부틸렌글라이콜",
    "카프릴릭/카프릭트라이글리세라이드",
    "나이아신아마이드",
    "아이소펜틸다이올",
    "세테아릴알코올",
    "다이메티콘",
    "폴리글리세릴-10스테아레이트",
    "베헤닐알코올",
    "카보머",
    "다이포타슘글리시리제이트",
    "포타슘하이드록사이드",
    "살리실릭애씨드",
    "다이소듐이디티에이",
    "에틸헥실글리세린",
    "소듐하이알루로네이트",
    "징크클로라이드",
    "토코페롤",
  ],

  evidence: {
    evidenceLevel: "C",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "domestic_official",
    domesticFormulaVerified: true,
    concentrationDisclosure: "not_disclosed",
    purchaseLinkVerified: false,
    priceVerified: false,
    currentOfficialProductVerified: true,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_domestic_product_page",
        url: "https://www.aestura.com/m/product/view.do?prdSeq=1110",
      },
    ],
  },


  careProfile: {
    hydrationSupport: 6,
    lightweightFit: 8,
    soothingSupport: 4,
    congestionSupport: 6,
    barrierSupport: 1,
  },

  skinTypes: [
    "지성",
    "수부지",
    "복합성"
  ],

description:
  "여드름성 피부의 유수분 밸런스와 트러블 관리에 초점을 둔 산뜻한 수분 모이스처라이저",

image: "https://thumbnail6.coupangcdn.com/thumbnails/remote/492x492q90trim/image/vendor_inventory/9276/4bed48ca6753310a5aeb166677ff815f4dd0356dc15ec568e7d8884dffa6.jpg",

link: "https://link.coupang.com/a/gtk9l8COtg",

sensitivitySafe: false,
beginnerFriendly: false,

seasons: ["spring", "summer"],
  price: 0,
  volume: "60ml",
  shortReason: "유분감이 강하고 트러블이 신경 쓰이는 10단계 피부에 맞춘 가벼운 크림입니다.",
  caution: [
  "살리실산이 포함되어 있어 다른 BHA·AHA 각질 관리 제품과 겹쳐 사용하지 않도록 주의하세요.",
  "민감하거나 자극받은 피부는 적은 양부터 피부 반응을 확인하세요."
],
  ratingTags: ["지성 추천", "피지 관리", "수딩 크림"],

  usageType: "cream",
  usageAmount: {
    oily: "완두콩 1개보다 적게",
    normal: "완두콩 1개 정도",
    dry: "완두콩 1~2개 정도"
  },
  usage: {
    when: "세럼 다음 단계 / 아침·저녁",
    howToUse: [
      "세럼이 흡수된 후 소량만 덜어냅니다.",
      "피지와 번들거림이 적은 부위부터 얇게 바릅니다.",
      "T존은 아주 적은 양만 사용합니다."
    ],
    caution: [
      "처음에는 밤에 소량으로 시작해 피부 반응을 확인하세요."
    ]
  }
},

{
  id: 44,
  name: "토리든 다이브인 저분자 히알루론산 토너",
  brand: "토리든",
  category: "toner",
  hydrationLevel: 2,
  texture: "watery",
  concerns: ["hydration", "soothing"],
  ingredients: [
    "히알루론산",
    "판테놀",
    "알란토인",
    "글리세린",
    "베타인",
    "트레할로오스",
    "쇠비름추출물"
  ],

  fullIngredients: [
    "Water",
    "Butylene Glycol",
    "Dipropylene Glycol",
    "1,2-Hexanediol",
    "Glycerin",
    "Betaine",
    "Allantoin",
    "Panthenol",
    "Portulaca Oleracea Extract",
    "Trehalose",
    "Sodium Hyaluronate",
    "Hydrolyzed Hyaluronic Acid",
    "Sodium Hyaluronate Crosspolymer",
    "Hydrolyzed Sodium Hyaluronate",
    "Sodium Acetylated Hyaluronate",
    "2,3-Butanediol",
    "Pentylene Glycol",
    "Malachite Extract",
    "Disodium EDTA",
    "Ethylhexylglycerin"
  ],

  activeIngredients: [
    {
      name: "5종 히알루론산 복합체",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_global_product_page"
    },
    {
      name: "판테놀",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_global_full_ingredient_list"
    },
    {
      name: "알란토인",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_global_full_ingredient_list"
    }
  ],

  careProfile: {
    hydrationSupport: 8,
    lightweightFit: 10,
    soothingSupport: 6,
    congestionSupport: 0,
    barrierSupport: 3,
  },

  evidence: {
    evidenceLevel: "B",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "global_official",
    domesticFormulaVerified: false,
    concentrationDisclosure: "not_disclosed",
    purchaseLinkVerified: false,
    currentOfficialProductVerified: true,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_domestic_product_page",
        url: "https://www.torriden.com/goods/goods_view.php?goodsNo=2269",
      },
      {
        sourceType: "official_global_product_page",
        url: "https://torriden.us/products/dive-in-toner",
      },
    ],
  },

  clinicalEvidence: {
    sourceType: "brand_reported",
    humanStudyAvailable: true,
    studies: [
      {
        endpoint: "repeat_insult_patch_test",
        sampleSize: 50,
        duration: "6_weeks",
        result: "non_irritant"
      },
      {
        endpoint: "skin_smoothness",
        sampleSize: 22,
        duration: "immediate",
        resultPercent: 13.24
      },
      {
        endpoint: "lower_stratum_corneum_hydration",
        sampleSize: 20,
        duration: "immediate",
        resultPercent: 112.5
      },
      {
        endpoint: "sebum_reduction",
        sampleSize: 20,
        duration: "immediate",
        resultPercent: 80.76
      }
    ],
    note:
      "토리든 글로벌 공식 페이지의 브랜드 공개 인체적용시험 요약입니다. 독립 임상시험과 동일하게 취급하지 않으며 국내 판매 처방과 시험 처방의 완전한 동일성은 별도 확인이 필요합니다."
  },
  skinTypes: ["건성", "민감성"],
  description: "속당김이 느껴지는 피부에 가볍게 수분을 여러 번 채우기 좋은 수분 토너입니다.",
  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492q90trim/image/vendor_inventory/c9d2/991f837bda30447b064f67677810e24a4d1019b7e369c2158d61a3cc0981.png",
  link: "https://link.coupang.com/a/hpv6j4CjQW",
  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["spring", "autumn", "winter"],
  price: 0,
  volume: "300ml",
  shortReason: "속당김이 있는 건성 피부에 수분감을 먼저 채워주기 좋습니다.",
  caution: [],
  ratingTags: ["속당김", "히알루론산", "건성 추천"],

  usageType: "toner",
  usageAmount: {
    oily: "손바닥에 소량",
    normal: "500원 동전 크기 정도",
    dry: "500원 동전 크기 정도를 1~2번"
  },
  usage: {
    when: "세안 후 첫 단계 / 아침·저녁",
    howToUse: [
      "세안 직후 얼굴이 마르기 전에 사용합니다.",
      "손바닥으로 얼굴 전체에 부드럽게 펴 바릅니다.",
      "당김이 있는 볼 주변은 한 번 더 눌러 흡수시킵니다."
    ],
    caution: [
      "많이 바른다고 오래 촉촉한 것은 아니니 얇게 나눠 바르세요."
    ]
  }
},
{
  id: 45,
  name: "에스트라 아토베리어365 하이드로 에센스",
  brand: "에스트라",
  category: "serum",
  hydrationLevel: 2,
  texture: "essence",

  concerns: [
    "hydration",
    "barrier"
  ],

  ingredients: [
    "글리세린",
    "스쿠알란",
    "천연보습인자(NMF)",
    "우레아",
    "유사 세라마이드(하이드록시프로필비스팔미타마이드엠이에이)",
    "콜레스테롤"
  ],

  fullIngredients: [
    "정제수",
    "부틸렌글라이콜",
    "글리세린",
    "스쿠알란",
    "1,2-헥산다이올",
    "아크릴레이트/C10-30알킬아크릴레이트크로스폴리머",
    "카보머",
    "트로메타민",
    "글리세릴카프릴레이트",
    "에틸헥실글리세린",
    "다이소듐이디티에이",
    "낫토검",
    "스테아릭애씨드",
    "하이드록시프로필비스팔미타마이드엠이에이",
    "만니톨",
    "피씨에이",
    "락틱애씨드",
    "글루코오스",
    "글라이신",
    "우레아",
    "소듐글리세로포스페이트",
    "세린",
    "글루타믹애씨드",
    "토코페롤",
    "아크릴레이트/암모늄메타크릴레이트코폴리머",
    "포타슘마그네슘아스파테이트",
    "아스파틱애씨드",
    "류신",
    "소듐클로라이드",
    "알라닌",
    "라이신",
    "알지닌",
    "칼슘글루코네이트",
    "마그네슘글루코네이트",
    "타이로신",
    "페닐알라닌",
    "프롤린",
    "트레오닌",
    "발린",
    "아이소류신",
    "시트릭애씨드",
    "콜레스테롤",
    "히스티딘",
    "실리카",
    "아세틸글루코사민",
    "크레아틴",
    "우릭애씨드",
    "시스테인",
    "메티오닌",
  ],
  activeIngredients: [
    {
      name: "글리세린",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_full_ingredient_list",
    },
    {
      name: "스쿠알란",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_full_ingredient_list",
    },
    {
      name: "우레아",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_full_ingredient_list",
    },
    {
      name: "하이드록시프로필비스팔미타마이드엠이에이",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_full_ingredient_list",
    },
    {
      name: "콜레스테롤",
      concentration: null,
      unit: "%",
      concentrationVerified: false,
      sourceType: "official_domestic_full_ingredient_list",
    },
  ],
  // 내부 추천용 휴리스틱입니다. NMF 30종·만족도 비율을 효능 점수로 환산하지 않습니다.
  careProfile: {
    hydrationSupport: 9,
    lightweightFit: 6,
    soothingSupport: 3,
    congestionSupport: 0,
    barrierSupport: 7,
  },
  evidence: {
    evidenceLevel: "B",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "domestic_official",
    domesticFormulaVerified: true,
    concentrationDisclosure: "not_disclosed",
    purchaseLinkVerified: false,
    priceVerified: false,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_domestic_product_page",
        url: "https://www.aestura.com/web/product/view.do?prdSeq=1071",
      },
      {
        sourceType: "official_domestic_brand_reported_study",
        url: "https://image.aestura.com/upload/editor/204e4def-3d9e-480d-bb2a-66a4688b189e.png",
      },
    ],
  },
  clinicalEvidence: {
    sourceType: "brand_reported",
    humanStudyAvailable: true,
    studies: [
      {
        endpoint: "skin_irritation_patch_test",
        sampleSize: 32,
        duration: "48_hours",
        studyPeriod: "2022-12-19/2022-12-22",
        institute: null,
        result: "brand_reported_tested",
      },
      {
        endpoint: "non_comedogenic_test",
        sampleSize: 22,
        duration: "4_weeks",
        studyPeriod: "2023-01-16/2023-02-16",
        institute: null,
        populationScope: "acne_prone_skin",
        result: "brand_reported_tested",
      },
      {
        endpoint: "repeated_patch_sensitization_test",
        sampleSize: 54,
        duration: null,
        studyPeriod: "2023-01-02/2023-02-10",
        institute: null,
        result: "brand_reported_tested",
      },
    ],
    note:
      "현재 국내 공식 상세 이미지의 브랜드 시험 요약입니다. 시험기관 이름·전체 보고서·대조군·통계 정보와 시험 당시 처방의 현재 판매 처방 동일성은 미확인입니다. 시험 완료는 모든 사람의 무자극·알레르기 없음·모공 막힘 없음을 보장하지 않으며 여드름 치료 근거가 아닙니다.",
  },
  consumerEvidence: {
    sourceType: "brand_reported_self_assessment",
    sampleSize: 292,
    surveyPeriod: "2020-10",
    platform: "화해",
    outcomes: [
      { endpoint: "texture_satisfaction", agreementPercent: 99 },
      { endpoint: "hydration_feeling_after_one_use", agreementPercent: 95 },
      { endpoint: "absorption_satisfaction", agreementPercent: 95 },
    ],
    note:
      "참가자의 주관적 만족도 설문이며 피부 수분량·장벽 개선율을 측정한 결과가 아닙니다. 추천 점수나 사용자의 예상 개선량으로 환산하지 않습니다.",
  },
  skinTypes: ["건성", "민감성", "수부지", "복합성"],
  description:
  "속당김이 신경 쓰이는 피부에 수분과 보습 성분을 공급해 피부 장벽의 수분 유지에 도움을 주는 에센스",
  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492q90trim/image/1025_amir_coupang_oct_80k/02ea/6c19ed5d20b7ba47ef2312a32faabc6b065f55a519cd7dbf60c3b62a970e.jpg",
  link: "https://link.coupang.com/a/hpwkEOhMfQ",
  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["autumn", "winter"],
  price: 0,
  volume: "200ml",
  shortReason:
  "속당김이 있는 피부의 수분·장벽 보습을 함께 보조하는 유백색 에센스",
  caution: [
    "개인에 따라 자극이나 알레르기 반응이 생길 수 있으니 처음에는 적은 양으로 반응을 확인하세요.",
    "논코메도제닉 시험은 여드름 치료 효과나 모든 피부의 막힘 없음을 뜻하지 않습니다.",
  ],
  ratingTags: ["장벽", "고보습", "건성"],

  usageType: "serum",
  usageAmount: {
    oily: "손바닥에 소량부터, 피부 반응에 따라 조절",
    normal: "손바닥에 얼굴 전체에 바를 적당량",
    dry: "적당량을 바르고 건조한 부위에 얇게 덧바름"
  },
  usage: {
    when: "세안 후 첫 단계 또는 토너 다음 / 아침·저녁",
    howToUse: [
      "아침·저녁 세안 후 손바닥에 적당량을 덜어냅니다.",
      "얼굴 전체에 문지르지 말고 눌러 흡수시킵니다.",
      "건조한 부위는 얇게 한 번 더 덧발라줍니다."
    ],
    caution: [
      "유백색 제형으로 사용감은 개인마다 다르니 적은 양부터 조절하세요."
    ]
  }
},

{
  id: 47,
  name: "웰라쥬 리얼 히알루로닉 블루 100 앰플",
  brand: "웰라쥬",
  category: "serum",
  hydrationLevel: 2,
  texture: "ampoule",
  concerns: [
    "hydration",
    "soothing"
  ],
  ingredients: [
    "히알루론산",
    "글리세린",
    "판테놀",
    "베타-글루칸"
  ],
  skinTypes: [
    "건성",
    "중성"
  ],
  description: "글리세린·판테놀과 여러 히알루론산 원료를 담은 가벼운 수분 보조 앰플",
  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492q90trim/image/retail/images/23109275375806-66e0449b-a752-47ae-af83-e535209617b9.jpg",
  link: "https://link.coupang.com/a/hpwv7OCCzc",
  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: [
    "autumn",
    "winter",
    "spring"
  ],
  price: 0,
  volume: "100ml",
  shortReason: "건조함과 속당김의 수분 보충용 앰플로 고려할 수 있으며, 브랜드가 보습 관련 인체시험 요약을 공개함",
  caution: [
    "제품명의 100과 원료 순도 100%는 앰플 전체가 히알루론산 100%라는 뜻이 아닙니다.",
    "저자극 시험 표기가 모든 민감 피부의 무자극을 보장하지 않습니다.",
    "수분 세럼만으로 건조함이 남으면 크림을 함께 사용하세요."
  ],
  ratingTags: [
    "수분앰플",
    "가벼운보습",
    "속당김"
  ],
  usageType: "serum",
  usageAmount: {
    "oily": "적당량을 얇게 / 소량부터",
    "normal": "적당량을 골고루",
    "dry": "적당량 사용 후 건조한 부위만 필요 시 덧바르기"
  },
  usage: {
    "when": "토너 다음·크림 전 단계 / 아침·저녁",
    "howToUse": [
      "토너 사용 후 적당량을 덜어냅니다.",
      "얼굴에 얇게 펴 바르고 가볍게 흡수시킵니다.",
      "피부 반응에 따라 건조한 부위만 덧바르고 크림으로 마무리합니다."
    ],
    "caution": [
      "처음에는 작은 부위에 소량부터 반응을 확인하세요.",
      "상처가 있는 부위는 피하고 붉어짐·부어오름·가려움 등 이상 반응이 있으면 중단하고 상담하세요."
    ]
  },
  fullIngredients: [
    "정제수",
    "프로판다이올",
    "펜틸렌글라이콜",
    "글리세린",
    "1,2-헥산다이올",
    "판테놀",
    "메틸프로판다이올",
    "소듐아크릴릭애씨드/엠에이코폴리머",
    "부틸렌글라이콜",
    "참마뿌리추출물",
    "잔탄검",
    "소듐시트레이트",
    "에틸헥실글리세린",
    "소듐하이알루로네이트(1,000ppm)",
    "글라이코실트레할로오스",
    "하이드로제네이티드스타치하이드롤리세이트",
    "시트릭애씨드",
    "라피노오스",
    "아데노신",
    "레시틴",
    "트라이소듐에틸렌다이아민다이석시네이트",
    "카프릴릴글라이콜",
    "사카라이드아이소머레이트",
    "폴리쿼터늄-51",
    "말라카이트추출물",
    "알지닌",
    "소듐디엔에이",
    "갈랑가갈랑갈추출물",
    "바이오사카라이드검-1",
    "사이아노코발아민",
    "토코페롤",
    "카프릴릭/카프릭트라이글리세라이드",
    "하이드로제네이티드레시틴",
    "하이드롤라이즈드하이알루로닉애씨드(0.100052ppm)",
    "하이드롤라이즈드소듐하이알루로네이트(0.1ppm)",
    "수크로오스라우레이트",
    "소듐스테아로일글루타메이트",
    "암모늄아크릴로일다이메틸타우레이트/브이피코폴리머",
    "글라이신",
    "세린",
    "히스티딘",
    "돌콩추출물",
    "라이소레시틴",
    "플로레틴",
    "테트라하이드로피페린",
    "다이메틸아이소소바이드",
    "소듐하이알루로네이트크로스폴리머(2.08ppb)",
    "벤질글라이콜",
    "하이드롤라이즈드글라이코사미노글리칸",
    "올레일알코올",
    "베타-글루칸",
    "하이드록시프로필트라이모늄하이알루로네이트(0.012ppb)",
    "하이알루로닉애씨드(0.001ppb)",
    "소듐아세틸레이티드하이알루로네이트(0.0002ppb)"
  ],
  activeIngredients: [
    {
      "name": "소듐하이알루로네이트",
      "concentration": 1000,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "하이드롤라이즈드하이알루로닉애씨드",
      "concentration": 0.100052,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "하이드롤라이즈드소듐하이알루로네이트",
      "concentration": 0.1,
      "unit": "ppm",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "소듐하이알루로네이트크로스폴리머",
      "concentration": 2.08,
      "unit": "ppb",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "하이드록시프로필트라이모늄하이알루로네이트",
      "concentration": 0.012,
      "unit": "ppb",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "하이알루로닉애씨드",
      "concentration": 0.001,
      "unit": "ppb",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "소듐아세틸레이티드하이알루로네이트",
      "concentration": 0.0002,
      "unit": "ppb",
      "concentrationVerified": true,
      "concentrationBasis": "ingredient_fraction",
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "판테놀",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "소듐디엔에이",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    },
    {
      "name": "베타-글루칸",
      "concentration": null,
      "unit": "%",
      "concentrationVerified": false,
      "sourceType": "official_domestic_full_ingredient_list"
    }
  ],
  careProfile: {
    "hydrationSupport": 9,
    "lightweightFit": 8,
    "soothingSupport": 6,
    "congestionSupport": 0,
    "barrierSupport": 2
  },
  evidence: {
    "evidenceLevel": "B",
    "officialProductVerified": true,
    "fullIngredientsVerified": true,
    "fullIngredientsMarket": "domestic_official",
    "domesticFormulaVerified": true,
    "concentrationDisclosure": "partially_disclosed",
    "purchaseLinkVerified": false,
    "priceVerified": false,
    "lastVerifiedAt": "2026-10-11",
    "sources": [
      {
        "sourceType": "official_domestic_product_page",
        "url": "https://www.wellage.co.kr/product/detail.html?product_no=1010"
      },
      {
        "sourceType": "official_domestic_brand_material",
        "url": "https://www.wellage.co.kr/detail/ha_ample_100_06_04.gif"
      },
      {
        "sourceType": "official_domestic_brand_material",
        "url": "https://www.wellage.co.kr/detail/ha_ample_100_08_03.gif"
      },
      {
        "sourceType": "official_domestic_brand_material",
        "url": "https://www.wellage.co.kr/detail/ha_ample_100_13_04.jpg"
      },
      {
        "sourceType": "official_domestic_brand_material",
        "url": "https://www.wellage.co.kr/detail/ha_ample_100_17_01.gif"
      },
      {
        "sourceType": "official_domestic_brand_material",
        "url": "https://www.wellage.co.kr/detail/ha_ample_100_20_04.jpg"
      },
      {
        "sourceType": "official_domestic_brand_material",
        "url": "https://www.wellage.co.kr/detail/ha_ample_100_13_02.jpg"
      }
    ],
    "officialStoreStockStatus": "sold_out_at_verification"
  },
  clinicalEvidence: {
    "sourceType": "brand_reported",
    "humanStudyAvailable": true,
    "currentFormulaStudyMatchVerified": false,
    "studies": [
      {
        "sampleSize": null,
        "studyPeriod": null,
        "institute": "피엔케이피부임상연구센타(주)",
        "endpoint": "instant_moisture_density_comparison",
        "duration": "immediate",
        "reportedComparisonPercent": 521.9,
        "comparator": "자사 리얼 히알루로닉 블루 앰플 1세대 100%",
        "note": "자사 이전 제품을 100%로 둔 비교 홍보 수치입니다. 사용 전 대비 증가율이나 시장 전체 대비 5배 효능으로 해석하지 않습니다. 계산식은 미확인입니다."
      },
      {
        "sampleSize": null,
        "studyPeriod": null,
        "institute": "피엔케이피부임상연구센타(주)",
        "endpoint": "stratum_corneum_moisture_to_30_layers",
        "duration": "10 seconds after use",
        "resultPercent": 195.7,
        "direction": "improvement",
        "note": "피부 표면 각질층 30층 관련 시험 표기를 보존합니다. 진피 침투·전신 수분·개인의 속당김 개선율로 확대하지 않습니다."
      },
      {
        "sampleSize": null,
        "studyPeriod": null,
        "institute": "피엔케이피부임상연구센타(주)",
        "endpoint": "moisture_retention",
        "duration": "100 hours after one use",
        "result": "브랜드 100시간 피부 속 보습 지속력 시험 표기",
        "note": "상세 정량값·표본·기간은 미확인입니다."
      },
      {
        "sampleSize": null,
        "studyPeriod": null,
        "institute": "피엔케이피부임상연구센타(주)",
        "endpoint": "instant_surface_skin_moisture",
        "duration": "immediate after one use",
        "resultPercent": 111,
        "direction": "increase",
        "note": "원문 사용 전 33.906·직후 71.545 표기, 즉각적·일시적 결과입니다."
      },
      {
        "sampleSize": null,
        "studyPeriod": null,
        "institute": "피엔케이피부임상연구센타(주)",
        "endpoint": "sensitive_skin_primary_irritation",
        "duration": null,
        "result": "브랜드 실제 민감 피부 대상 저자극 표기",
        "note": "자극지수·표본·기간·부착 및 관찰 방법은 미확인입니다."
      }
    ],
    "note": "브랜드가 공개한 시험 요약입니다. 전체 보고서·대조군·통계와 시험 당시 처방의 현재 처방 동일성은 미확인입니다. 개인의 기대 개선량·질환 치료율·타 제품 대비 효능으로 쓰지 않습니다."
  },
  consumerEvidence: {
    "sourceType": "brand_reported_self_assessment",
    "sampleSize": null,
    "duration": null,
    "studyPeriod": null,
    "institute": "피엔케이피부임상연구센타(주)",
    "responseThreshold": "at_least_neutral",
    "outcomes": [
      {
        "endpoint": "inner_dryness_feeling",
        "agreementPercent": 100
      },
      {
        "endpoint": "layered_hydration_feeling",
        "agreementPercent": 100
      },
      {
        "endpoint": "plumping_feeling",
        "agreementPercent": 100
      },
      {
        "endpoint": "lasting_moisture_feeling",
        "agreementPercent": 100
      },
      {
        "endpoint": "fast_non_sticky_absorption_feeling",
        "agreementPercent": 100
      }
    ],
    "note": "브랜드 설문에서 보통 이상 응답을 긍정으로 계산한 비율입니다. 척도 전체·표본·기간 미확인. 치료 성공률·수분 개선율이나 엄격한 동의율로 해석하지 않습니다."
  }
},
{
  id: 48,
  name: "에스트라 아토베리어365 세럼",
  brand: "에스트라",
  category: "serum",
  hydrationLevel: 1,
  texture: "serum",
  concerns: ["hydration", "barrier", "soothing"],
  ingredients: ["세라마이드", "판테놀"],

  isAvailable: false,
  availabilityReason:
    "current_product_identity_not_verified",

  evidence: {
    evidenceLevel: "D",
    officialProductVerified: false,
    fullIngredientsVerified: false,
    concentrationDisclosure: "unknown",
    purchaseLinkVerified: false,
    currentOfficialProductVerified: false,
    lastVerifiedAt: "2026-10-11",
    note:
      "현재 에스트라 공식/공식 유통 라인업에서 '아토베리어365 세럼 40ml'과 동일한 현행 제품 신원을 확인하지 못했습니다. 유사 이름 제품으로 덮어쓰지 않고 과거 기록 보존용으로 격리합니다."
  },

  skinTypes: ["건성", "민감성"],
  description:
    "현재 제품 신원 재검증이 필요해 신규 추천에서는 제외한 과거 제품 데이터",
  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/657x657q90trim/image/vendor_inventory/ee29/5d1491fe3223b17a5dc3d3ca089e1a2ad6fedbe3e43ce30c4ad7d07b93b4.jpg",
  link: "https://link.coupang.com/a/hpwy2BjV0e",
  sensitivitySafe: true,
  beginnerFriendly: true,
  seasons: ["autumn", "winter"],
  price: 0,
  volume: "40ml",
  shortReason: "1단계처럼 건조함과 장벽 약화가 강한 피부에 맞는 세럼입니다.",
  caution: [],
  ratingTags: ["장벽 세럼", "세라마이드", "극건성"],

  usageType: "serum",
  usageAmount: {
    oily: "1방울 정도",
    normal: "2방울 정도",
    dry: "2~3방울 정도"
  },
  usage: {
    when: "토너 다음 단계 / 아침·저녁",
    howToUse: [
      "토너가 흡수된 뒤 적당량을 덜어냅니다.",
      "볼, 입가, 턱처럼 건조한 부위에 먼저 바릅니다.",
      "피부가 예민할 때는 문지르지 말고 눌러 흡수시킵니다."
    ],
    caution: [
      "지성 피부에는 무겁게 느껴질 수 있어 건성 루틴 위주로 추천합니다."
    ]
  }
},
{
  id: 49,
  name: "코스알엑스 AHA/BHA 클래리파잉 트리트먼트 토너",
  brand: "코스알엑스",
  category: "toner",

  hydrationLevel: 4,
  texture: "light",

  concerns: [
    "closed_comedones",
    "blackhead",
    "pores",
    "deadskin"
  ],

  ingredients: [
    "글라이콜릭애씨드",
    "베타인살리실레이트",
    "판테놀",
    "알란토인"
  ],

  // 공식 출처 기준 전성분이며 대표 성분(ingredients)과 구분합니다.
  fullIngredients: [
    "미네랄워터",
    "흰버드나무껍질수",
    "사과수",
    "부틸렌글라이콜",
    "1,2-헥산다이올",
    "소듐락테이트",
    "글라이콜릭애씨드",
    "베타인살리실레이트",
    "알란토인",
    "판테놀",
    "에틸헥산다이올",
  ],

  evidence: {
    evidenceLevel: "C",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "domestic_official",
    domesticFormulaVerified: true,
    concentrationDisclosure: "not_disclosed",
    purchaseLinkVerified: false,
    priceVerified: false,
    currentOfficialProductVerified: true,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_domestic_product_page",
        url: "https://cosrx.co.kr/shop/shopdetail.html?branduid=191",
      },
    ],
  },


  skinTypes: [
    "건성",
    "중성",
    "복합성",
    "수부지"
  ],

  description:
    "건조함은 있지만 좁쌀·블랙헤드·거친 피부결이 신경 쓰일 때 피부 반응을 확인하며 사용해야 하는 각질 정돈 토너",

  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492q90trim/image/retail/images/80755316256044-ba3f756a-81ac-4183-85bb-9a14b24708f5.jpg",

  link: "https://link.coupang.com/a/hubSfuGY2e",

  sensitivitySafe: false,
  beginnerFriendly: false,

  seasons: [
    "spring",
    "summer",
    "autumn",
    "winter"
  ],

  price: 0,
  volume: "150ml",

  shortReason:
    "AHA·BHA 성분을 포함한 각질 관리용 토너로 사용 간격과 자극 반응을 확인하면서 사용해야 합니다.",

  caution: [
    "처음에는 주 2~3회부터 시작하세요.",
    "따가움이나 붉어짐이 생기면 사용 빈도를 줄이세요.",
    "다른 AHA·BHA·레티놀 제품과 같은 날 겹쳐 사용하지 마세요."
  ],

  ratingTags: [
    "좁쌀",
    "블랙헤드",
    "AHA/BHA 각질관리"
  ],

  usageType: "exfoliating_toner",

  usageAmount: {
    oily: "화장솜 또는 손바닥에 소량",
    normal: "화장솜 또는 손바닥에 소량",
    dry: "건조한 부위를 피해서 소량"
  },

  usage: {
    when: "저녁 / 주 2~3회부터",

    howToUse: [
      "세안 후 피부를 가볍게 말립니다.",
      "소량을 얼굴 전체 또는 막힘이 신경 쓰이는 부위에 사용합니다.",
      "문지르지 말고 부드럽게 흡수시킵니다.",
      "이후 수분 세럼과 보습 크림을 사용합니다."
    ],

    caution: [
      "처음부터 매일 사용하지 마세요.",
      "자극이 느껴지면 즉시 사용 빈도를 줄이세요.",
      "낮에는 자외선 차단제를 사용하세요."
    ]
  }
},
{
  id: 50,
  name: "바이위시트렌드 만델릭 애씨드 5% 스킨 프렙 워터",
  brand: "바이위시트렌드",
  category: "toner",

  hydrationLevel: 3,
  texture: "watery",

  concerns: [
    "closed_comedones",
    "deadskin",
    "texture",
    "soothing"
  ],

  ingredients: [
    "만델릭애씨드",
    "병풀",
    "판테놀",
    "히알루론산",
    "베타글루칸"
  ],

  // 공식 출처 기준 전성분이며 대표 성분(ingredients)과 구분합니다.
  fullIngredients: [
    "Water (Aqua)",
    "Mandelic Acid",
    "Butylene Glycol",
    "Panthenol",
    "Glycyrrhiza Glabra (Licorice) Root Extract",
    "Prunus Amygdalus Dulcis (Sweet Almond) Fruit Extract",
    "Sorbitan Sesquioleate",
    "Centella Asiatica Extract",
    "Houttuynia Cordata Extract",
    "Sorbitol",
    "Glycerin",
    "Dimethyl Sulfone",
    "Beta-Glucan",
    "Chlorphenesin",
    "Sodium Citrate",
    "Arginine",
    "1,2-Hexanediol",
    "Ethylhexylglycerin",
    "Carbomer",
    "PEG-60 Hydrogenated Castor Oil",
    "Sodium Hyaluronate",
    "Natto Gum",
  ],

  evidence: {
    evidenceLevel: "C",
    officialProductVerified: true,
    fullIngredientsVerified: true,
    fullIngredientsMarket: "global_official",
    domesticFormulaVerified: false,
    concentrationDisclosure: "partially_disclosed",
    purchaseLinkVerified: false,
    priceVerified: false,
    currentOfficialProductVerified: true,
    lastVerifiedAt: "2026-10-11",
    sources: [
      {
        sourceType: "official_global_product_page",
        url: "https://www.klairs.com/products/mandelic-acid-5-skin-prep-water",
      },
    ],
  },
  activeIngredients: [
    { name: "만델릭애씨드", concentration: 5, unit: "%", concentrationVerified: true, concentrationBasis: "ingredient_fraction", sourceType: "official_global_product_page" },
  ],

  skinTypes: [
  "건성",
  "중성"
],

  description:
    "건조하면서 피부결과 좁쌀이 신경 쓰이는 피부가 5% 만델산으로 각질·피부결 관리에 사용하는 토너",

  image: "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492q90trim/image/vendor_inventory/0e35/5c88b0a83350961760875b2693c24519d4e416998bcc128ba0b9630d9b7a.jpg",

  link: "https://link.coupang.com/a/hub2adwZxI",

  sensitivitySafe: false,
  beginnerFriendly: false,

  seasons: [
    "spring",
    "autumn",
    "winter"
  ],

  price: 0,
  volume: "120ml",

  shortReason:
    "5% 만델산을 함유한 각질 관리용 제품으로 피부 자극 반응을 확인하면서 사용해야 합니다.",

  caution: [
    "민감하거나 장벽이 약한 상태에서는 먼저 소량 테스트하세요.",
    "처음에는 주 1~2회부터 시작하세요.",
    "다른 각질제거 성분과 같은 날 겹쳐 사용하지 마세요."
  ],

  ratingTags: [
    "좁쌀",
    "피부결",
    "건성 각질관리"
  ],

  usageType: "exfoliating_toner",

  usageAmount: {
    oily: "소량",
    normal: "화장솜 또는 손바닥에 소량",
    dry: "건조하지 않은 부위 위주로 소량"
  },

  usage: {
    when: "저녁 / 주 1~2회부터",

    howToUse: [
      "세안 후 피부를 가볍게 말립니다.",
      "소량을 피부결이나 좁쌀이 신경 쓰이는 부위부터 사용합니다.",
      "강하게 닦지 말고 부드럽게 흡수시킵니다.",
      "이후 수분 세럼과 보습 크림을 사용합니다."
    ],

    caution: [
      "피부가 따갑거나 붉어지면 사용을 중단하세요.",
      "BHA나 다른 AHA 제품과 같은 날 사용하지 마세요.",
      "낮에는 자외선 차단제를 사용하세요."
    ]
  }
}
]
