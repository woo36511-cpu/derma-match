import React, { useEffect, useState } from "react";
import { SKIN_STATE_AXES, getRecordSkinMeasurement } from "../utils/skinStateMeasurement";

const statusLabels = {
  device: "이 기기에 저장", loading: "계정 기록 불러오는 중", syncing: "서버에 저장 중",
  pending: "서버 저장 대기", synced: "서버 저장 완료", error: "서버 저장 확인 필요", conflict: "다른 기기 기록과 비교 필요",
};

export function AccountPanel({ account }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  useEffect(() => {
    setEmail(""); setPassword(""); setMessage(""); setFormError("");
  }, [account.user?.id]);
  useEffect(() => { if (account.recovery) setOpen(true); }, [account.recovery]);

  const run = async (action) => {
    setBusy(true); setFormError(""); setMessage("");
    try { await action(); } catch (error) { setFormError(error.message || "처리하지 못했어요. 다시 시도해주세요."); }
    finally { setBusy(false); }
  };
  const submit = (event) => {
    event.preventDefault();
    run(async () => {
      if (account.recovery) {
        await account.updatePassword(password);
        setMessage("비밀번호를 변경했어요.");
      } else if (mode === "signup") {
        const data = await account.signUp(email.trim(), password);
        setMessage(data?.session ? "계정을 만들었어요." : "이메일의 인증 링크를 확인한 뒤 로그인해주세요.");
      } else if (mode === "reset") {
        await account.resetPassword(email.trim());
        setMessage("비밀번호 재설정 이메일을 확인해주세요.");
      } else {
        await account.signIn(email.trim(), password);
        setMessage("로그인했어요.");
      }
      setPassword("");
    });
  };
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <p role="status" className="text-gray-500">{account.authLoading ? "로그인 확인 중" : account.user ? statusLabels[account.syncStatus] : "이 기기에 저장"}
          {account.user && account.pendingCount > 0 && ` · ${account.pendingCount}개 대기`}
        </p>
        <button type="button" onClick={() => { setOpen(!open); setFormError(""); setPassword(""); }} className="rounded-xl border border-gray-300 bg-white px-3 py-2 font-medium">
          {open ? "저장·계정 닫기" : "저장·계정"}
        </button>
      </div>
      {account.error && <p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{account.error}</p>}
      {open && <section aria-label="저장 및 계정 관리" className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold">내 피부 기록 저장</h2>
        {!account.enabled ? <p className="mt-3 text-sm text-gray-600">현재 기록은 이 기기에 저장돼요. 계정으로 다른 기기에서도 이어보는 기능은 준비 중이에요.</p> : account.authLoading ? <p className="mt-3 text-sm text-gray-600">로그인 상태를 확인하고 있어요.</p> : (
          <>
            {account.user && !account.recovery ? <div className="mt-4 space-y-4">
              <p className="text-sm break-all">{account.user.email} 계정의 기록이에요.</p>
              <p className="text-sm text-gray-600">로그아웃하면 이 계정 기록은 화면에서 숨기고, 로그인 전 기기 기록으로 돌아가요. 아직 서버에 보내지 못한 기록도 계정별로 이 기기에 보관해요.</p>
              <div className="flex flex-wrap gap-2">
                <button disabled={busy || account.syncStatus === "syncing"} onClick={() => run(account.syncNow)} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50">서버 저장 다시 확인</button>
                <button disabled={busy} onClick={() => run(account.signOut)} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50">로그아웃</button>
              </div>
              {account.guestCount > 0 && <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-600">로그인 전 이 기기에 저장한 기록 {account.guestCount}개가 있어요. 가져오면 현재 계정에 저장되고 기기 원본도 남아요.</p>
                <button disabled={busy} onClick={() => run(async () => { account.importGuest(); setMessage("기기 기록을 가져왔어요. 서버 저장을 확인하고 있어요."); })} className="mt-3 rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50">이 기기 기록을 계정으로 가져오기</button>
              </div>}
              {account.conflicts.length > 0 && <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-sm font-semibold">같은 기록 {account.conflicts.length}개가 다른 기기에서 바뀌었어요.</p>
                <p className="mt-2 text-sm text-gray-600">선택하기 전 두 기록을 이 기기에 백업해요. 이 기기 기록을 선택하면 서버의 해당 기록을 바꿔요.</p>
                <div className="mt-3 space-y-3 text-xs text-gray-600">{account.conflicts.map((row) => <details key={row.record_id} className="rounded-xl bg-white p-3">
                  <summary className="cursor-pointer font-semibold">{row.payload.type === "feedback" ? "피드백" : "첫 진단"} · 두 기록 비교</summary>
                  <p className="mt-2">이 기기 기록일 · {row.localPayload?.savedAt || "미확인"}</p>
                  <p className="mt-1">서버 기록일 · {row.payload.savedAt || "미확인"}</p>
                  <table className="mt-3 w-full text-left">
                    <thead><tr><th scope="col">항목</th><th scope="col">이 기기</th><th scope="col">서버</th></tr></thead>
                    <tbody>
                      <tr><th scope="row" className="py-2 font-medium">수분감 단계</th><td>{row.localPayload?.nextState?.hydrationLevel ?? row.localPayload?.result?.hydrationLevel ?? "미확인"}</td><td>{row.payload.nextState?.hydrationLevel ?? row.payload.result?.hydrationLevel ?? "미확인"}</td></tr>
                      {SKIN_STATE_AXES.map(({ key, label }) => <tr key={key}><th scope="row" className="py-1 font-medium">{label}</th><td>{getRecordSkinMeasurement(row.localPayload).values[key] ?? "미측정"}</td><td>{getRecordSkinMeasurement(row.payload).values[key] ?? "미측정"}</td></tr>)}
                    </tbody>
                  </table>
                </details>)}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button disabled={busy} onClick={() => run(async () => account.resolveConflicts("cloud"))} className="rounded-xl border bg-white px-4 py-2 text-sm">서버 기록 사용</button>
                  <button disabled={busy} onClick={() => run(async () => account.resolveConflicts("local"))} className="rounded-xl border bg-white px-4 py-2 text-sm">이 기기 기록 저장</button>
                </div>
              </div>}
            </div> : <form onSubmit={submit} className="mt-4 max-w-md space-y-4">
              <p className="text-sm text-gray-600">{account.recovery ? "새 비밀번호를 입력해주세요." : "계정에 피부 설문·사용 제품·생활습관·변화 기록을 저장해 다른 기기에서 이어볼 수 있어요."}</p>
              {!account.recovery && <label className="block text-sm">이메일
                <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" />
              </label>}
              {(mode !== "reset" || account.recovery) && <label className="block text-sm">{account.recovery ? "새 비밀번호" : "비밀번호"}
                <input required type="password" minLength={account.recovery || mode === "signup" ? 8 : 1} autoComplete={account.recovery || mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" />
              </label>}
              <button disabled={busy} type="submit" className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? "처리 중" : account.recovery ? "새 비밀번호 저장" : mode === "signup" ? "회원가입" : mode === "reset" ? "재설정 이메일 받기" : "로그인"}</button>
              {!account.recovery && <div className="flex flex-wrap gap-3 text-sm">
                {[ ["signin", "로그인으로 전환"], ["signup", "회원가입으로 전환"], ["reset", "비밀번호 재설정"] ].filter(([value]) => value !== mode).map(([value, label]) => <button key={value} type="button" onClick={() => { setMode(value); setPassword(""); setMessage(""); setFormError(""); }} className="underline underline-offset-4">{label}</button>)}
              </div>}
            </form>}
          </>
        )}
        {message && <p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}
        {formError && <p role="alert" className="mt-4 text-sm text-amber-900">{formError}</p>}
      </section>}
    </div>
  );
}
