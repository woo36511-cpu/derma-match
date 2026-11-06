import { DetailDisclosure } from "./DetailDisclosure";
import { ConcernProductOptions } from "./ConcernProductOptions";
import { ProductCard } from "./ProductCard";

export function FirstVisitCarePlan({ plan, onEditAnswer }) {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-5 sm:p-7 space-y-4" aria-label="오늘 해볼 피부 관리">
      <p className="text-sm font-semibold text-emerald-800">오늘 해볼 피부 관리</p>
      <h2 className="text-2xl font-bold break-keep">{plan.action}</h2>
      {plan.actionDetail && <p className="text-sm text-slate-700">{plan.actionDetail}</p>}
      {plan.concernTip && <p className="text-sm text-slate-700"><strong>함께 할 수 있는 관리:</strong> {plan.concernTip}</p>}
      {plan.product && <div className="max-w-sm">
        <h3 className="mb-2 text-sm font-semibold">보습제 후보 한 가지</h3>
        <ProductCard categoryKey="cream" product={plan.product} userContext={plan.userContext} />
      </div>}
      {plan.starterProducts && <section className="space-y-3" aria-label="피부에 맞는 기초 제품 네 가지">
        <h3 className="font-semibold">피부에 맞는 기초 제품 네 가지</h3>
        <p className="text-sm text-slate-700">세안제·크림부터 하나씩 시작해요. 토너·세럼은 원할 때만 추가해도 돼요.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {["cleanser", "toner", "serum", "cream"].map(category => {
            const product = plan.starterProducts[category];
            return product && <div key={category}>
              <p className="mb-1 text-xs font-semibold text-slate-600">{["cleanser", "cream"].includes(category) ? "기초" : "선택"}</p>
              <ProductCard categoryKey={category} product={product} userContext={plan.userContext} />
            </div>;
          })}
        </div>
      </section>}
      <ConcernProductOptions plan={plan} />
      {plan.editAnswer && <button type="button" onClick={() => onEditAnswer?.(plan.editAnswer)}
        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">이 답변만 다시 선택하기</button>}
      {plan.keep && <p className="text-sm text-slate-700">{plan.keep}</p>}
      <p className="text-sm text-slate-700"><strong>다음에 확인할 변화:</strong> {plan.observation}</p>
      {plan.reason && <DetailDisclosure title="왜 이렇게 안내했나요?">
        <p>{plan.reason}</p>
        {plan.level != null && <p className="mt-2">추정 수분감 {plan.level}단계 · 제품의 보습감 선택을 돕는 참고값이에요.</p>}
      </DetailDisclosure>}
      <DetailDisclosure title="올바른 세안법 보기">
        <p>미지근한 물과 순한 세안제로 손끝을 써서 가볍게 씻어요. 뽀득해질 때까지 문지르거나 반복해서 씻지 않아도 돼요.</p>
        <a className="mt-2 inline-block underline" href="https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101" target="_blank" rel="noreferrer">미국피부과학회 세안 안내</a>
      </DetailDisclosure>
    </section>
  );
}
