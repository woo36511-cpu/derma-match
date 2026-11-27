import { ProductCard } from "./ProductCard";
import { SurveyChoice } from "./SurveyChoice";
import { SkinPhotoSurfaceCheck } from "./SkinPhotoSurfaceCheck";

export function RoutineAnswerFollowUp({ questions, answers, onAnswer, onSave, changed, photoFeatures }) {
  if (!questions.length && !changed) return null;
  return <section className="care-panel space-y-3" aria-label="추천에 필요한 추가 답변">
    <h2 className="font-bold">추천에 필요한 답만 더 확인해요</h2>
    {questions.map(question => <fieldset key={question.id} className="space-y-2">
      <legend className="font-semibold">{question.question}</legend>
      {question.id === "surfaceObservation" &&
        <SkinPhotoSurfaceCheck question={question} initialFeatures={photoFeatures} answer={answers[question.id]} onAnswer={onAnswer} />}
      <div className="grid gap-2">{question.options.map(option =>
        <SurveyChoice key={option.value} selected={answers[question.id] === option.label}
          onClick={() => onAnswer(question, option)}>{option.label}</SurveyChoice>)}</div>
    </fieldset>)}
    {changed && <button type="button" className="care-secondary" onClick={onSave}>추가 답변 저장하고 추천 갱신</button>}
  </section>;
}

export function RoutineReactionFollowUp({ rows, statuses, onStatus, alternatives, canCompare }) {
  if (!rows.length) return null;
  return <section className="care-panel space-y-4" aria-label="현재 제품 반응 다시 확인">
    <h2 className="font-bold">불편했던 제품의 지금 상태를 확인해요</h2>
    {rows.map(product => <div key={product.id} className="space-y-2">
      <label className="block text-sm font-semibold">{product.name} 지금 상태
        <select className="mt-1 block w-full rounded-xl border p-2" value={statuses[product.id] ?? ""}
          onChange={event => onStatus(product.id, event.target.value)}>
          <option value="">선택해 주세요</option>
          <option value="ongoing">지금도 따갑거나 붉어요</option>
          <option value="stopped">제품을 쉬었고 피부가 편해졌어요</option>
          <option value="settled">제품을 쓰고 있지만 지금은 편안해요</option>
        </select>
      </label>
      {canCompare && statuses[product.id] === "stopped" && (alternatives[product.id] ?
        <div className="space-y-2">
          <p className="text-sm">같은 단계의 대체 후보예요. 사용 반응에는 개인차가 있어요.</p>
          <ProductCard product={alternatives[product.id]} categoryKey={alternatives[product.id].category} />
          {alternatives[product.id].ingredientDisclosure && <a className="text-sm underline"
            href={alternatives[product.id].ingredientDisclosure} target="_blank" rel="noreferrer">국내 판매처 전성분 고시 보기</a>}
        </div> : <p className="text-sm">이 단계에서 확인된 조건을 만족하는 대체품은 아직 없어요.</p>)}
    </div>)}
  </section>;
}
