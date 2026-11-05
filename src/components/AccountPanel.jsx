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
  const [username, setUsername] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  useEffect(() => {
    setEmail(""); setUsername(""); setRecoveryCode(""); setPassword(""); setMode("signin"); setMessage(""); setFormError("");
  }, [account.user?.id]);
  useEffect(() => { if (account.recovery || account.recoveryCode) setOpen(true); }, [account.recovery, account.recoveryCode]);
  const changeMode = (next) => { setMode(next); setPassword(""); setRecoveryCode(""); setMessage(""); setFormError(""); };

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
        await account.signUpUsername(username.trim(), password);
        setMessage("가입했어요. 복구 코드를 따로 보관해주세요.");
      } else if (mode === "recover") {
        await account.recoverUsername(username.trim(), recoveryCode);
        setRecoveryCode("");
        setMessage("계정을 확인했어요. 새 복구 코드를 보관하고 비밀번호를 변경해주세요.");
      } else if (mode === "reset") {
        await account.resetPassword(email.trim());
        setMessage("비밀번호 재설정 이메일을 확인해주세요.");
      } else if (mode === "legacy") {
        await account.signIn(email.trim(), password);
        setMessage("로그인했어요. 아이디를 연결하면 다음부터 이메일 없이 로그인할 수 있어요.");
      } else {
        await account.signInUsername(username.trim(), password);
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
        <button type="button" disabled={!!account.recoveryCode || busy} onClick={() => { setOpen(!open); setFormError(""); setPassword(""); }} className="rounded-xl border border-gray-300 bg-white px-3 py-2 font-medium">
          {open ? "저장·계정 닫기" : "저장·계정"}
        </button>
      </div>
      {account.error && <p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{account.error}</p>}
      {open && <section aria-label="저장 및 계정 관리" className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold">내 피부 기록 저장</h2>
        {!account.enabled ? <p className="mt-3 text-sm text-gray-600">현재 기록은 이 기기에 저장돼요. 계정으로 다른 기기에서도 이어보는 기능은 준비 중이에요.</p> : account.authLoading ? <p className="mt-3 text-sm text-gray-600">로그인 상태를 확인하고 있어요.</p> : (
          <>
            {account.recoveryCode && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4" aria-label="복구 코드 보관">
              <h3 className="font-semibold">복구 코드를 따로 보관해주세요</h3>
              <p className="mt-2 text-sm">이메일 없이 계정을 찾을 때 필요해요. 이 코드는 다시 조회할 수 없어요. 새 코드가 발급되면 이전 코드는 사용할 수 없어요.</p>
              <code className="mt-3 block break-all rounded-xl bg-white p-3 font-mono text-sm select-all">{account.recoveryCode}</code>
              <p className="mt-2 text-xs text-gray-600">비밀번호와 복구 코드를 모두 잃으면 계정을 복구할 수 없어요. 아이디와 함께 보관하고 다른 사람에게 공유하지 마세요.</p>
              <button type="button" onClick={account.dismissRecoveryCode} className="mt-3 rounded-xl border bg-white px-4 py-2 text-sm">복구 코드를 따로 보관했어요</button>
            </div>}
            {account.user && !account.recovery ? <div className="mt-4 space-y-4">
              <p className="text-sm break-all">{account.username ? `${account.username} 계정의 기록이에요.` : "내 계정의 기록이에요."}</p>
              {account.usernameLoading && <p className="text-sm text-gray-600">아이디를 확인하고 있어요.</p>}
              {account.usernameError && <p role="alert" className="text-sm text-amber-900">{account.usernameError}</p>}
              {!account.username && !account.usernameLoading && !account.usernameError && <form className="rounded-2xl bg-gray-50 p-4" onSubmit={(event) => { event.preventDefault(); run(async () => { await account.claimUsername(username.trim()); setUsername(""); setPassword(""); }); }}>
                <p className="text-sm">기존 기록을 유지하면서 이메일 없이 로그인할 아이디를 만들 수 있어요.</p>
                <label className="mt-3 block text-sm">사용할 아이디<input required autoComplete="username" minLength={4} maxLength={20} pattern="[A-Za-z0-9][A-Za-z0-9_]{3,19}" value={username} onChange={event => setUsername(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" /></label>
                <p className="mt-2 text-xs text-gray-600">영문·숫자·밑줄 4~20자, 대소문자는 구분하지 않아요.</p>
                <button disabled={busy || !!account.recoveryCode} className="mt-3 rounded-xl border bg-white px-4 py-2 text-sm">아이디 연결하기</button>
              </form>}
              {mode === "rotate" && <form className="max-w-md space-y-3" onSubmit={(event) => { event.preventDefault(); run(async () => { await account.rotateRecoveryCode(password); setPassword(""); setMode("signin"); }); }}>
                <p className="text-sm">현재 비밀번호를 확인한 뒤 새 복구 코드를 발급해요. 이전 코드는 사용할 수 없게 돼요.</p>
                <label className="block text-sm">현재 비밀번호<input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" /></label>
                <button disabled={busy} className="rounded-xl border px-4 py-2 text-sm">새 복구 코드 발급</button>
                <button type="button" onClick={() => changeMode("signin")} className="ml-3 text-sm underline">취소</button>
              </form>}
              <p className="text-sm text-gray-600">로그아웃하면 이 계정 기록은 화면에서 숨기고, 로그인 전 기기 기록으로 돌아가요. 아직 서버에 보내지 못한 기록도 계정별로 이 기기에 보관해요.</p>
              <div className="flex flex-wrap gap-2">
                <button disabled={busy || account.syncStatus === "syncing"} onClick={() => run(account.syncNow)} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50">서버 저장 다시 확인</button>
                <button disabled={busy || !!account.recoveryCode} onClick={account.startPasswordChange} className="rounded-xl border px-4 py-2 text-sm">비밀번호 변경</button>
                {account.username && <button disabled={busy || !!account.recoveryCode} onClick={() => changeMode("rotate")} className="rounded-xl border px-4 py-2 text-sm">복구 코드 재발급</button>}
                <button disabled={busy || !!account.recoveryCode} onClick={() => run(account.signOut)} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50">로그아웃</button>
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
              <p className="text-sm text-gray-600">{account.recovery ? "새 비밀번호를 입력해주세요." : mode === "recover" ? "아이디와 보관한 복구 코드로 계정을 확인해요. 사용한 코드는 새 코드로 교체돼요." : mode === "reset" ? "기존 이메일 계정의 비밀번호 재설정 메일을 요청해요." : mode === "legacy" ? "기존 이메일 계정으로 로그인한 뒤 아이디를 연결할 수 있어요." : "이메일 없이 아이디와 비밀번호로 피부 기록을 저장하고 이어보세요."}</p>
              {!account.recovery && (["legacy", "reset"].includes(mode) ? <label className="block text-sm">이메일
                <input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" />
              </label> : <label className="block text-sm">아이디
                <input required autoComplete="username" minLength={4} maxLength={20} pattern="[A-Za-z0-9][A-Za-z0-9_]{3,19}" value={username} onChange={event => setUsername(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" />
              </label>)}
              {!account.recovery && !["legacy", "reset"].includes(mode) && <p className="text-xs text-gray-500">영문·숫자·밑줄 4~20자, 대소문자는 구분하지 않아요.</p>}
              {mode === "recover" && !account.recovery && <label className="block text-sm">복구 코드
                <input required type="password" autoComplete="off" value={recoveryCode} onChange={event => setRecoveryCode(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" />
              </label>}
              {(!["reset", "recover"].includes(mode) || account.recovery) && <label className="block text-sm">{account.recovery ? "새 비밀번호" : "비밀번호"}
                <input required type="password" minLength={account.recovery || mode === "signup" ? 8 : 1} maxLength={128} autoComplete={account.recovery || mode === "signup" ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" />
              </label>}
              {mode === "signup" && !account.recovery && <p className="text-xs text-gray-500">비밀번호는 8자 이상으로 정해주세요. 가입 후 복구 코드를 따로 보관해야 해요.</p>}
              <button disabled={busy || !!account.recoveryCode} type="submit" className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? "처리 중" : account.recovery ? "새 비밀번호 저장" : mode === "signup" ? "회원가입" : mode === "recover" ? "복구 코드로 계정 확인" : mode === "reset" ? "재설정 이메일 받기" : "로그인"}</button>
              {account.recovery ? <button type="button" disabled={!!account.recoveryCode} onClick={account.cancelPasswordChange} className="ml-3 text-sm underline">계정 화면으로</button> : <div className="flex flex-wrap gap-3 text-sm">
                {mode !== "signin" && <button type="button" onClick={() => changeMode("signin")} className="underline underline-offset-4">아이디 로그인으로 전환</button>}
                {mode !== "signup" && <button type="button" onClick={() => changeMode("signup")} className="underline underline-offset-4">회원가입으로 전환</button>}
                {mode !== "recover" && <button type="button" onClick={() => changeMode("recover")} className="underline underline-offset-4">복구 코드로 찾기</button>}
                {!["legacy", "reset"].includes(mode) && <button type="button" onClick={() => changeMode("legacy")} className="text-gray-500 underline underline-offset-4">기존 이메일 계정으로 로그인</button>}
                {mode === "legacy" && <button type="button" onClick={() => changeMode("reset")} className="underline underline-offset-4">기존 이메일 계정 복구</button>}
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
