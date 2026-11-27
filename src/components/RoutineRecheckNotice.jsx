export function RoutineRecheckNotice({ onRecheck }) {
  return <section className="care-panel mx-auto max-w-3xl space-y-2" aria-label="다음 재검사 시점">
    <h2 className="font-bold">루틴 사용 시작 후 14일 뒤 재검사</h2>
    <p className="text-sm text-slate-700">14일쯤 사용감과 피부 변화를 기록하면 다음 추천에 반영해요. 따가움이 생기거나 상태가 악화되면 기다리지 말고 먼저 상태를 확인하세요.</p>
    {onRecheck && <button type="button" className="care-secondary" onClick={onRecheck}>재검사 시작</button>}
  </section>;
}
