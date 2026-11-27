import { GuidedFacePhoto } from "./GuidedFacePhoto";

export function SkinPhotoSurfaceCheck({ question, answer, onAnswer, initialFeatures }) {
  return <GuidedFacePhoto key={question.id} initialFeatures={initialFeatures} renderConfirmation={features => {
    if (!["surfaceObservation", "surfaceCheck"].includes(question.id)) return null;
    const options = question.options.filter(option =>
      (option.value === "flakes" && features.includes("flaking")) ||
      (option.value === "irritated" && features.includes("redness") && features.includes("flaking")));
    return options.length > 0 && <div className="space-y-2">
      <p>사진과 실제 느낌이 아래 설명과 일치하면 설문 답변에 반영할 수 있어요.</p>
      {options.map(option => <button key={option.value} type="button" className="care-secondary mr-2"
        disabled={answer === option.label} onClick={() => onAnswer(question, option)}>
        {answer === option.label ? "답변에 반영됨" : "확인 후 답변에 반영"} · {option.label}
      </button>)}
    </div>;
  }} />;
}
