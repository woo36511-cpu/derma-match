import { GuidedFacePhoto } from "../components/GuidedFacePhoto";
import { useScreenHeading } from "../hooks/useScreenHeading";

export function SkinPhotoStartScreen({ onContinue, onBack }) {
  const heading = useScreenHeading("skin-photo-start");

  return <div className="mx-auto max-w-2xl space-y-4">
    <section className="care-panel space-y-3" aria-labelledby="skin-photo-start">
      <h1 id="skin-photo-start" ref={heading} tabIndex={-1} className="text-2xl font-bold">설문 전에 피부 사진 찍기</h1>
      <p>먼저 얼굴을 찍으면 사진에서 보인 특징을 설문에서 함께 확인할 수 있어요.</p>
      <GuidedFacePhoto renderConfirmation={features => features.length > 0 &&
        <button type="button" className="care-secondary" onClick={() => onContinue(features)}>
          사진 분석 결과와 함께 설문 시작
        </button>
      } />
    </section>
    <div className="flex justify-between gap-3">
      <button type="button" className="care-secondary" onClick={onBack}>시작 화면으로</button>
      <button type="button" className="care-secondary" onClick={() => onContinue([])}>사진 없이 설문 시작</button>
    </div>
  </div>;
}
