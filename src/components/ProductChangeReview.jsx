import { useVerifiedProductFormula } from "../hooks/useVerifiedProductFormula";
import { observationQuestions } from "../data/observationSurvey";
import { productChangeQuestions } from "../data/productChangeSurvey";
import { getIngredientClue } from "../utils/productChangeReview";
import { getRoutineLookupProduct } from "../utils/routineLookup";

const changedProductAnswer = observationQuestions.find(question => question.id === "skinChange").options.find(option => option.value === "product").label;

export default function ProductChangeReview({ answers, entries = [] }) {
  const product = answers?.skinChange === changedProductAnswer ? getRoutineLookupProduct(answers.changedProductId) : null;
  const { formula, pending } = useVerifiedProductFormula(product, entries);

  if (answers?.skinChange !== changedProductAnswer || !answers.changedProduct || !Array.isArray(answers.changedReaction)) return null;
  const replies = answers.changedReaction;
  const reactionOptions = productChangeQuestions[1].options.filter(option => replies.includes(option.label));
  const reactionLabels = reactionOptions.map(option => option.label);
  const clue = formula ? getIngredientClue(formula.ingredients, reactionOptions.map(option => option.value)) : null;
  return <details className="rounded-xl border border-slate-200 p-4 text-sm">
    <summary className="cursor-pointer font-semibold">바꾼 제품과 피부 반응 살펴보기</summary>
    <div className="mt-3 space-y-2">
      <p>{product ? [product.name, product.volume].filter(Boolean).join(" · ") : "바꾼 제품을 하나로 특정하지 못했어요."}</p>
      {reactionLabels.length > 0 && <p>선택한 변화: {reactionLabels.join(" · ")}</p>}
      {pending ? <p role="status">공식 전성분을 확인 중이에요.</p> : !formula ? <p>확인된 전성분이 없어 성분에 따른 이유는 말하기 어려워요.</p> :
        <><p>{clue ? <><strong>{clue.ingredient}:</strong> {clue.detail}</> : "전성분을 확인했지만, 성분표만으로는 선택한 반응의 이유를 설명하기 어려워요."}</p>
        <p>사용량이나 빈도, 동시에 바꾼 제품도 함께 살펴보세요.</p>
        {formula.sourceUrl && <a className="underline" href={formula.sourceUrl} target="_blank" rel="noreferrer">공식 제품 정보 보기</a>}</>}
    </div>
  </details>;
}
