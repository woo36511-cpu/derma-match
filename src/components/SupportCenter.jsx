import { useRef, useState } from "react";
import { getSupabaseClient } from "../services/supabaseClient";

const categories = { bug: "오류·불편 사항", suggestion: "개선 제안", other: "기타 의견" };

export function SupportCenter({ dialogRef }) {
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const receipt = useRef(null);
  const pending = useRef(false);

  function editMessage(value) {
    receipt.current = null;
    setStatus("idle");
    setMessage(value);
  }

  async function submit(event) {
    event.preventDefault();
    const feedback = message.trim();
    if (pending.current || status === "sent" || feedback.length < 5 || feedback.length > 2000) return;
    pending.current = true;
    setStatus("sending");
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error("feedback unavailable");
      receipt.current ??= crypto.randomUUID();
      const { error } = await client.from("site_feedback").insert({
        id: receipt.current, category, message: feedback,
      });
      if (error && error.code !== "23505") throw error;
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      pending.current = false;
    }
  }

  return <dialog ref={dialogRef} aria-labelledby="support-center-title"
    className="w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-line bg-white p-5 text-ink shadow-xl backdrop:bg-black/45 sm:p-6">
    <div className="mb-4 flex items-start justify-between gap-3">
      <h2 id="support-center-title" className="text-xl font-bold text-forest-900">고객센터</h2>
      <button type="button" className="care-secondary" onClick={() => dialogRef.current.close()}>닫기</button>
    </div>
    {status === "sent" ? <div className="space-y-4">
      <p role="status">의견을 접수했어요. 운영자가 확인할게요.</p>
      <button type="button" className="care-secondary" onClick={() => editMessage("")}>다른 의견 남기기</button>
    </div> : <form className="space-y-4" onSubmit={submit}>
      <p className="text-sm text-slate-700">디얼신스를 쓰면서 불편했던 점이나 바뀌었으면 하는 점을 알려주세요.</p>
      <fieldset disabled={status === "sending"} className="space-y-3">
        <label className="block text-sm font-semibold">의견 종류
          <select value={category} onChange={event => { receipt.current = null; setCategory(event.target.value); }}
            className="mt-1 block w-full rounded-xl border border-slate-300 bg-white p-2">
            {Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">의견 내용
          <textarea rows={5} maxLength={2000} required minLength={5} value={message}
            onChange={event => editMessage(event.target.value)}
            placeholder="어떤 화면에서 무엇을 하다가 불편했나요?"
            className="mt-1 block w-full rounded-xl border border-slate-300 p-3 font-normal" />
        </label>
        <p className="text-xs text-slate-600">5~2,000자 · 연락처나 비밀번호 같은 개인정보는 입력하지 마세요.</p>
      </fieldset>
      {status === "error" && <p role="alert" className="text-sm text-rose-800">접수하지 못했어요. 입력한 내용은 남아 있으니 다시 보내주세요.</p>}
      <button type="submit" className="care-secondary" disabled={status === "sending" || message.trim().length < 5}>
        {status === "sending" ? "접수 중…" : "의견 보내기"}
      </button>
    </form>}
  </dialog>;
}
