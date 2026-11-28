import { dateLabel, day, getTrialProduct } from "../utils/basicTrialProducts";

export function TrialSyncStatus({ store }) {
  if (store.status === "loading") return <p role="status" className="text-sm text-slate-700">계정 루틴을 동기화하고 있어요.</p>;
  if (store.status === "conflict") return <div className="space-y-2 text-sm" role="status">
    <p>다른 기기에서 같은 루틴이 바뀌었어요. 이어갈 기록을 골라주세요.</p>
    <button type="button" className="care-secondary mr-2" onClick={store.useServer}>계정에 저장된 기록 사용</button>
    <button type="button" className="care-secondary" onClick={store.keepLocal}>이 기기 기록 사용</button>
  </div>;
  if (store.status === "error") return <div className="space-y-2 text-sm">
    <p role="status">계정 루틴을 동기화하지 못했어요. 이 기기에 저장된 기록으로 이어갈 수 있어요.</p>
    <button type="button" className="care-secondary" onClick={store.retry}>동기화 다시 시도</button>
  </div>;
  return null;
}

export function BasicRoutineResume({ store, onOpen }) {
  const { trial, guestTrial, status } = store;
  if (!trial && !guestTrial && ["local", "synced"].includes(status)) return null;
  const names = trial ? Object.entries(trial.ids).filter(([slot]) =>
    trial.check?.reaction !== "irritation" || (trial.check.used?.includes(slot) &&
      !(trial.check.changed?.length ? trial.check.changed.includes(slot) : ["unknown", slot].includes(trial.check.source))))
    .map(([, id]) => getTrialProduct(id)?.name).filter(Boolean) : [];
  return <section className="care-panel space-y-3" aria-label="내 루틴 이어하기">
    <h2 className="text-xl font-bold text-forest-900">내 루틴 이어하기</h2>
    {trial && <>
      <p className="text-sm text-slate-700">사용 시작 {dateLabel(trial.startedAt)} · {trial.check?.reaction === "irritation"
        ? "불편했던 제품 점검 중" : trial.check?.stage === 14 ? "14일 재검사 완료"
          : `재검사 예정 ${dateLabel(trial.startedAt + 14 * day)}`}</p>
      {names.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm">{names.map((name, index) => <li key={`${name}-${index}`}>{name}</li>)}</ul>}
      <button type="button" className="care-secondary" onClick={onOpen}>간편 루틴 이어하기</button>
      {status === "synced" && <p className="text-xs text-slate-600">계정에 저장됨</p>}
    </>}
    {guestTrial && <button type="button" className="care-secondary" onClick={() => store.save(guestTrial)}>이 기기의 간편 루틴 가져오기</button>}
    <TrialSyncStatus store={store} />
  </section>;
}
