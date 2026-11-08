import { pharmacyOptions } from "./targetedCareProducts";

export const quickSkinTypes = [
  { id: "dry", label: "건성", detail: "세안 뒤 당기고 쉽게 건조해요", level: 3, skinType: "건성", description: "보습감을 충분히 주는 기본 제품을 살펴봐요." },
  { id: "combination", label: "수부지·복합성", detail: "속당김과 번들거림이 함께 있어요", level: 5, skinType: "수부지", description: "과하게 무겁지 않으면서 수분을 보충하는 제품을 살펴봐요." },
  { id: "oily", label: "지성", detail: "유분이 많고 무거운 제품이 답답해요", level: 8, skinType: "지성", description: "가볍게 씻고 보습하는 기본 제품을 살펴봐요." },
];

// Reference shelf only: opening a card never diagnoses a condition or starts a drug trial.
// Label sources rechecked 2026-11-08. The guide intentionally separates approved
// Korean product indications from clinical information about off-label ingredients.
const labelUrl = id => `https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=${id}`;
const checkedAt = "2026-11-08";
export const homeMedicineGroups = [
  {
    id: "comedones", label: "좁쌀·블랙헤드", description: "붉거나 아프지 않은 막힌 면포를 관리할 때 살펴보는 약이에요.",
    notice: "붉고 아프거나 따갑고 벗겨진 부위에는 이 면포 안내를 적용하지 않아요.",
    medicines: [{ ...pharmacyOptions.blackheads, id: "clearteen", classification: "일반의약품", role: "여드름 치료 · 각질 연화", approvedUse: "여드름 치료", use: "설명서의 사용 부위와 횟수를 먼저 확인해요. 같은 부위에 다른 각질 관리 제품을 새로 겹치지 않아요.", sourceLabel: "허가사항 확인", checkedAt }],
  },
  {
    id: "acne", label: "여드름·뾰루지", description: "여드름 치료에 쓰이는 일반의약품을 성분별로 비교해요.",
    notice: "아래 약을 모두 함께 쓰라는 뜻은 아니에요. 이미 쓰는 약이 있다면 새 약을 겹치기 전에 설문에서 먼저 확인해요. 깊은 덩이·퍼지는 붓기는 별도 확인이 필요해요.",
    medicines: [
      { ...pharmacyOptions.breakouts, id: "acnon", classification: "일반의약품", role: "국소 여드름·뾰루지용", approvedUse: "여드름·뾰루지", indication: "여드름이나 뾰루지가 있는 부분에 국소적으로 쓰는 크림이에요.", use: "깨끗이 씻은 뒤 설명서대로 해당 부위에만 사용해요. 얼굴 전체나 눈 주위에 넓게 바르지 않아요.", sourceLabel: "식약처 허가사항", checkedAt },
      { id: "patima", name: "파티마겔 2.5%", classification: "일반의약품", role: "벤조일퍼옥사이드 여드름 치료제", ingredients: "가수과산화벤조일 35 mg/g (과산화벤조일로서 25 mg/g, 2.5%)", approvedUse: "보통 여드름", indication: "보통 여드름 치료에 쓰는 벤조일퍼옥사이드 겔이에요.", image: "/otc/patima.png", use: "제품 설명서의 초기 사용법과 적용 부위를 따라요. 며칠간 변화가 없다고 양·횟수를 늘리거나 다른 여드름약을 덧바르지 않아요.", caution: "이미 자극이 생긴 피부, 상처, 눈·입·콧속 점막에는 사용하지 않아요. 다른 국소 여드름약·각질용해제와 함께 쓰지 않아요. 심하거나 지속되는 자극·붓기는 중단 사유예요. 모발·옷감을 탈색시킬 수 있어요. 임신·수유 중이거나 소아라면 스스로 시작하지 않아요.", source: "https://www.taiguk.co.kr/product/view.jsp?pid=AHG72438", sourceLabel: "태극제약 제품·설명서", checkedAt },
    ],
  },
  {
    id: "bacterial", label: "세균성 모낭염", description: "세균성 피부 감염에 쓰이는 약이에요. 모든 모낭염이 세균성인 것은 아니에요.",
    notice: "고름의 색이나 사진만으로 원인균을 정할 수 없어요. 항생제를 번갈아 시험하는 용도로 사용하지 않아요.",
    medicines: [{ id: "esroban", name: "에스로반연고", classification: "일반의약품 · 항생제", role: "무피로신 외용 항생제", ingredients: "무피로신 20 mg/g (2%)", approvedUse: "감수성 세균에 의한 모낭염·농가진 등 세균성 피부 감염", indication: "해당 세균에 의한 국소 피부 감염에 쓰는 약이에요. 일반 여드름이나 진균성 모낭염에 공통으로 쓰는 약은 아니에요.", use: "설명서의 기간·횟수를 지켜요. 3~5일 써도 개선이 없으면 계속 반복하거나 다른 항생제로 바꾸지 말고 원인을 확인해야 해요.", caution: "무피로신·폴리에틸렌글리콜 알레르기, 신장질환, 임신 가능성·임신·수유 중에는 사용하지 않아요. 눈·콧속 등 점막이나 넓게 손상된 피부에 적용하지 않아요. 발진·붓기·화끈거림 등 과민반응이 나타나면 중단해요.", source: labelUrl("199902738"), sourceLabel: "식약처 허가사항", checkedAt }],
  },
  {
    id: "malassezia", label: "말라세지아 모낭염", description: "확인된 말라세지아 모낭염에는 항진균제가 쓰일 수 있어요.",
    notice: "비슷한 크기의 가려운 돌기만으로 확정하지 않아요. 국내 니조랄2%액의 허가 용도에는 모낭염이 기재되어 있지 않으므로, 그 설명서를 모낭염 자가사용법으로 안내하지 않아요.",
    medicines: [{ id: "ketoconazole-info", name: "케토코나졸 등 외용 항진균제", classification: "치료 성분 정보", role: "진균에 대한 치료 방향", ingredients: "케토코나졸 등 · 제형과 제품에 따라 다름", approvedUse: "제품별 국내 허가 용도가 다름", indication: "확인된 말라세지아 모낭염에서 사용되는 외용 치료 성분의 예예요. 특정 국내 제품을 얼굴 모낭염에 바로 쓰라는 추천은 아니에요.", use: "국내 제품명·제형·허가 용도를 구분해요. 먹는 항진균제의 자가사용이나 항생제에서 항진균제로 자동 전환하는 안내는 제공하지 않아요.", caution: "자극·발진·붓기 등 이상반응이 생기면 새로 시작한 제품을 중단해요. 진균 감염과 비슷한 다른 질환일 수 있어 반복·악화 시 원인 확인이 필요해요.", source: "https://dermnetnz.org/topics/malassezia-folliculitis", sourceLabel: "DermNet 임상 자료", secondarySource: labelUrl("201802157"), secondarySourceLabel: "니조랄 국내 허가 용도와 비교", checkedAt }],
  },
  {
    id: "seborrheic", label: "지루피부염·비듬", description: "말라세지아와 관련된 지루피부염·비듬의 국내 허가 제품을 살펴봐요.",
    notice: "얼굴의 붉어짐·각질만으로 지루피부염을 확정하지 않아요. 말라세지아 모낭염 안내와 구분해서 읽어요.",
    medicines: [{ id: "nizoral", name: "니조랄2%액", classification: "일반의약품", role: "헹궈내는 케토코나졸 외용제", ingredients: "케토코나졸 20 mg/mL (2%)", approvedUse: "효모균에 의한 비듬·지루피부염의 치료·재발방지 및 어루러기 치료", indication: "국내 허가에 기재된 지루피부염·비듬 등의 용도에 맞춰 사용하는 제품이에요.", use: "바르고 두는 크림이 아니라 헹궈내는 액제예요. 부위·질환별 사용법과 기간은 제품 설명서를 확인해요.", caution: "성분 과민증이 있으면 사용하지 않아요. 눈과 심하게 짓무른 부위, 상처나 염증이 있는 두피에는 적용하지 않아요. 임신·수유 중이거나 소아라면 스스로 시작하지 않아요. 자극·발진·붓기가 나타나면 중단하고, 치료기간 뒤에도 낫지 않으면 원인을 재확인해요.", source: labelUrl("201802157"), sourceLabel: "식약처 허가사항", checkedAt }],
  },
  {
    id: "rosacea", label: "주사·모낭충 관련 돌기", description: "얼굴의 지속적인 붉어짐과 염증성 돌기가 있을 때 다른 트러블과 구분해야 해요.",
    notice: "모낭충이 의심된다는 이유만으로 수란트라를 시험하지 않아요. 처방약은 진단과 처방이 필요한 정보로 구분해요.",
    medicines: [{ id: "soolantra", name: "수란트라크림 1%", classification: "전문의약품 · 처방 필요", role: "성인 주사의 염증성 병변 치료", ingredients: "이버멕틴 10 mg/g (1%)", approvedUse: "성인의 주사로 인한 염증성 병변의 국소 치료", indication: "일반 여드름이나 원인 모를 모낭염 전체에 쓰는 약이 아니에요.", use: "처방받은 경우 처방된 사용법을 따라요. 이 안내에서는 새로 시작하는 자가사용법을 제시하지 않아요.", caution: "성분 알레르기가 있으면 사용하지 않아요. 눈·눈꺼풀·입술·점막을 피해야 해요. 임신·수유, 간·신장 질환, 다른 주사 치료제 사용 여부를 처방 과정에서 확인해요. 강한 피부 반응이나 심한 악화가 생기면 중단해요.", source: labelUrl("201605345"), sourceLabel: "식약처 허가사항", checkedAt }],
  },
];
