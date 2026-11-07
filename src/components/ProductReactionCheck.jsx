import { useState } from "react";

const reactions = {
  improved: { label: "나아졌어요", next: "잘 맞던 세안·보습을 유지하고 새 제품은 더하지 않아요. 약을 더 쓰는 경우에는 설명서의 사용법을 따라요." },
  unchanged: { label: "그대로예요", next: "좋아지지 않았다면 사용을 중단해요. 언제부터 발랐는지와 새 돌기·가려움이 어떻게 달라졌는지 확인하고 다시 답해요." },
  worse: { label: "더 심해졌거나 자극이 생겼어요", next: "새로 바른 제품은 중단해요. 다른 약을 덧바르지 말고, 새로 생긴 따가움·붓기·통증을 다시 체크해요. 붉어짐이 빠르게 번지거나 통증이 갑자기 심해지면 바로 진료받으세요." },
};

export function ProductReactionCheck({ productName, onRecheck }) {
  const [reaction, setReaction] = useState(null);
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3" aria-label="제품 사용 후 확인">
    <h3 className="font-semibold">{productName} 사용 후 피부가 어떻게 달라졌나요?</h3>
    <div className="flex flex-wrap gap-2" role="group" aria-label="사용 후 피부 변화">
      {Object.entries(reactions).map(([key, option]) => <button key={key} type="button"
        aria-pressed={reaction === key} onClick={() => setReaction(key)}
        className={`rounded-lg border px-3 py-2 text-sm ${reaction === key ? "border-emerald-700 bg-emerald-50" : "border-slate-300"}`}>
        {option.label}
      </button>)}
    </div>
    <p className="text-sm" aria-live="polite">{reaction ? reactions[reaction].next : "이 제품을 사용한 경우에만 답해주세요."}</p>
    {reaction && reaction !== "improved" && <button type="button" onClick={() => onRecheck(reaction)}
      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">달라진 피부 다시 확인하기</button>}
  </section>;
}
