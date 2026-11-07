import { DetailDisclosure } from "./DetailDisclosure";
import { hasRecentCosmetic } from "../data/symptomQuestions";

export function RecentProductCheck({ answers = {} }) {
  if (answers.habit !== "products" && !hasRecentCosmetic(answers)) return null;
  return <DetailDisclosure title="최근 바꾼 화장품 점검하는 법" open>
    <ol className="list-decimal space-y-1 pl-5">
      <li>최근 바꾼 화장품의 이름과 처음 바른 날, 피부가 불편해진 날을 적어요.</li>
      <li>불편해지기 직전에 추가했거나 바를 때마다 따가웠던 화장품은 쉬어요. 잘 맞던 세안제·보습제는 유지하고, 확인하는 동안 새 화장품을 더하지 않아요.</li>
      <li>쉬는 동안 따가움·붉어짐·새 돌기가 줄었는지 기록해요. 좋아져도 원인이 확정된 건 아니고, 붓거나 발진이 났던 제품을 확인하려고 다시 바르지 않아요.</li>
    </ol>
    <p className="mt-2">처방받은 약은 이 점검으로 임의로 바꾸거나 끊지 않아요.</p>
  </DetailDisclosure>;
}
