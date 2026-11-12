import { useId, useState } from "react";
import { getProcedureTopics, indentedOptions, procedureTopics } from "../utils/procedureOptions";

export function ProcedureOptions({ plan, profile }) {
  const id = useId();
  const [opened, setOpened] = useState(false);
  const [topicChoice, setTopicChoice] = useState("");
  const [scarType, setScarType] = useState("");
  const topics = getProcedureTopics(plan, profile);
  if (!topics.length) return null;
  const topic = topics.length === 1 ? topics[0] : topics.includes(topicChoice) ? topicChoice : "";
  const info = topic === "indented_scar" ? indentedOptions[scarType]?.option : procedureTopics[topic]?.option;

  return <section className="rounded-2xl border border-slate-200 bg-white">
    <button type="button" aria-expanded={opened} aria-controls={id} onClick={() => setOpened(!opened)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700">
      피부과 시술 선택지 보기 <span aria-hidden="true" className="text-xs text-slate-500">{opened ? "접기 −" : "선택 ＋"}</span>
    </button>
    <div id={id} hidden={!opened}>
      {opened && <div className="space-y-4 border-t border-slate-100 px-4 py-4 text-sm text-slate-700">
        <p>피부과에서 어떤 경우에 고려하는지 살펴봐요. 실제로 시술이 맞는지는 피부 상태와 현재 쓰는 약을 확인한 뒤 결정해요.</p>
        {topics.length > 1 && <label className="block font-semibold">어떤 고민의 시술을 살펴볼까요?
          <select value={topic} onChange={event => { setTopicChoice(event.target.value); setScarType(""); }}
            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal">
            <option value="">고민 선택</option>
            {topics.map(key => <option key={key} value={key}>{procedureTopics[key].label}</option>)}
          </select>
        </label>}
        {topic === "indented_scar" && <label className="block font-semibold">패임이 어떤 모습에 가까워요?
          <select value={scarType} onChange={event => setScarType(event.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal">
            <option value="">모양 선택</option>
            {Object.entries(indentedOptions).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
          </select>
        </label>}
        {topic === "indented_scar" && scarType === "unknown" && <p>패임의 깊이와 모양에 따라 시술이 달라요. 구분이 어렵다면 시술 이름부터 정하지 않아도 돼요.</p>}
        {info && <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
          <h2 className="font-bold text-slate-900">{info.title}</h2>
          <dl className="space-y-2">
            <div><dt className="font-semibold">언제 고려하나요?</dt><dd>{info.when}</dd></div>
            <div><dt className="font-semibold">기대할 수 있는 변화</dt><dd>{info.benefit}</dd></div>
            <div><dt className="font-semibold">부작용과 주의점</dt><dd>{info.risks}</dd></div>
          </dl>
          <ul className="space-y-1 text-xs">{info.sources.map(([label, url]) => <li key={url}>
            <a className="underline underline-offset-2" href={url} target="_blank" rel="noreferrer">{label}</a>
          </li>)}</ul>
        </div>}
      </div>}
    </div>
  </section>;
}
