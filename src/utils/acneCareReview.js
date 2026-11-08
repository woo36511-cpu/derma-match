export const ACNE_REVIEW_VERSION = "acne-support-and-review-v1";
export const acneEvidenceSources = {
  guideline: { label: "AAD 여드름 관리 지침", url: "https://www.aad.org/member/clinical-quality/guidelines/acne" },
  timing: { label: "AAD 여드름 관리의 변화 확인 시점", url: "https://www.aad.org/public/diseases/acne/diy/wont-clear/" },
  salicylic: { label: "클리어틴 식약처 허가사항", url: "https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=201306847" },
  acnon: { label: "애크논 제조·판매사 제품 설명", url: "https://dpharm.co.kr/acnon/ko/info" },
  acnonLabel: { label: "애크논 식약처 허가사항", url: "https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=201901721" },
  benzoyl: { label: "파티마겔 2.5% 제조사 제품 정보", url: "https://www.taiguk.co.kr/product/view.jsp?pid=AHG72438" },
};
export function buildAcneCareReview(plan) {
  const a = plan.answers;
  if (!plan.complete || a.concern !== "acne") return null;
  const blocked = plan.blockNewBasics;
  const medicine = a.medicine === "none" && plan.pharmacy ? ["closed", "blackhead"].includes(a.shape) ? "salicylic" : "acnon" : a.medicine;
  const isComedone = ["closed", "blackhead"].includes(a.shape);
  const result = {
    version: ACNE_REVIEW_VERSION, clinicalOutcomeValidated: false,
    goal: blocked ? "새 자극·악화에 대응하고 기존 관리를 줄여요." : a.shape === "deep" ? "깊은 덩이의 커짐·통증·흉터 여부를 우선 확인해요." : isComedone ? "막힌 면포가 줄어드는지 확인해요." : "새 붉은 뾰루지와 기존 돌기의 변화를 확인해요.",
    cosmeticRole: "기본 화장품은 세안·보습을 보조하는 후보예요. 이 제품 순위가 여드름 치료 효과 순위나 개선 확률을 뜻하지 않아요.",
    observations: isComedone ? ["같은 부위의 막힌 알갱이·검은 점 변화", "새 붉은 뾰루지가 생기는지", "따가움·붉어짐·벗겨짐"] : ["같은 부위에 새로 생긴 붉은 뾰루지 수", "기존 돌기의 크기·통증 변화", "새 따가움·붉어짐·벗겨짐"],
    earlyCheck: "초기에는 사용 후 새 따가움·붉어짐·붓기·벗겨짐을 먼저 확인해요. 악화하면 예정된 체크일까지 기다리지 않아요.",
    effectCheck: "여드름 관리의 변화는 수주가 걸릴 수 있어요. 2주 체크는 사용감과 자극 점검이며, 개선이 없다는 이유만으로 다른 제품을 바로 겹치지 않아요. 개별 약품의 중단 기준이 우선이에요.",
    evidence: "화장품의 성분·제형 적합도와 의약품의 허가 용도는 별도 근거예요. 브랜드 만족도나 피지 시험 수치를 여드름 감소율로 바꾸지 않아요.",
    sources: [acneEvidenceSources.timing],
  };
  if (blocked) return { ...result, effectCheck: "먼저 자극·악화 상태를 확인해요. 새 약을 추가하거나 사용량을 늘려 효과를 시험하지 않아요." };
  if (medicine === "salicylic") return { ...result, effectCheck: "클리어틴은 허가사항상 수회 사용해도 개선이 없으면 중단하고 확인하도록 되어 있어요. 일반적인 여드름 관리 기간을 이유로 계속 사용하지 않아요.",
    evidence: "살리실산은 면포 관리에 사용되는 성분이며 지침에서는 조건부 권고예요. 국내 클리어틴의 감염·염증·발적·자극 부위 사용 금지 등 허가사항이 우선해요.", sources: [acneEvidenceSources.salicylic, acneEvidenceSources.guideline] };
  if (medicine === "acnon") return { ...result, effectCheck: "애크논은 허가사항상 개선이 나타나지 않으면 사용을 중단하고 확인하도록 되어 있어요. 사용량·범위를 늘리거나 다른 약을 겹쳐 해결하지 않아요.",
    evidence: "애크논은 국내에서 여드름·뾰루지 용도로 허가된 제품이에요. 벤조일퍼옥사이드 등에 대한 지침 근거를 애크논의 효과나 우월성 근거로 대신 사용하지 않아요.", sources: [acneEvidenceSources.acnon, acneEvidenceSources.acnonLabel] };
  if (medicine === "patima") return { ...result, effectCheck: a.response === "better" ? "조금 나아지고 자극이 없다면 기존 설명서 범위에서 사용해요. 완전히 없애려고 양·횟수를 늘리지 않아요." : "며칠만으로 실패를 판정하지 않아요. 일반적인 여드름 치료의 개선은 수주가 걸릴 수 있지만, 지속적인 자극·악화나 설명서의 중단 조건이 있으면 기다리지 않아요.",
    evidence: "벤조일퍼옥사이드는 AAD 지침의 강한 권고 성분이에요. 파티마겔은 이 성분의 국내 일반의약품이며 개인의 효과·원인균을 확정하지 않아요. 국내 설명서의 병용·사용 부위·주의사항이 우선이에요.", sources: [acneEvidenceSources.benzoyl, acneEvidenceSources.guideline, acneEvidenceSources.timing] };
  if (medicine === "prescribed") return { ...result, effectCheck: "처방받은 사용 기간·방법과 재평가 계획을 우선해요. 사이트에서 임의로 중단·교체하거나 새 약을 더하지 않아요." };
  return result;
}
