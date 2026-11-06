import { DetailDisclosure } from "./DetailDisclosure";

const patterns = {
  acne: {
    title: "막힌 피지가 함께 보여요",
    meaning: "블랙헤드나 하얗게 막힌 피지가 함께 보인다는 답은 여드름 양상을 살펴볼 단서예요.",
    label: "여드름 양상",
    example: "블랙헤드·화이트헤드와 붉은 돌기가 섞여 보일 수 있어요.",
    source: "https://dermnetnz.org/topics/acne-vulgaris",
  },
  folliculitis: {
    title: "털구멍 주변에 고름이 보이는 양상이에요",
    meaning: "털구멍 중심의 고름 돌기는 모낭염을 확인할 단서예요. 이 모습만으로 세균 감염이나 원인균을 알 수는 없어요.",
    label: "세균성 모낭염과 비슷한 양상",
    example: "털구멍을 중심으로 고름 돌기가 보일 수 있어요. 다른 원인도 비슷하게 보일 수 있어요.",
    treatment: "세균성으로 확인된 국소 감염에는 에스로반(무피로신) 같은 바르는 항생제를 쓰기도 해요. 고름만 보고 항생제를 시작하지 않아요.",
    source: "https://dermnetnz.org/topics/bacterial-folliculitis",
  },
  malassezia: {
    title: "크기가 비슷하고 가려운 돌기가 보여요",
    meaning: "비슷한 크기의 가려운 돌기가 있고 같은 부위에 막힌 피지가 보이지 않는다는 답은 말라세지아 모낭염을 살펴볼 단서예요.",
    label: "말라세지아 모낭염과 비슷한 양상",
    example: "비슷한 크기의 가려운 돌기가 가슴·등이나 이마 쪽에 생길 수 있어요.",
    treatment: "말라세지아가 원인으로 확인되면 바르는 항진균제를 쓰고, 상태에 따라 먹는 항진균제를 처방하기도 해요.",
    source: "https://dermnetnz.org/topics/malassezia-folliculitis",
  },
  shaving: {
    title: "면도·제모 뒤 같은 부위에 반복돼요",
    meaning: "면도나 제모 뒤에 생긴 돌기는 자극이나 말려 들어간 털과 관련될 수 있어요. 감염이 함께 있는지는 설문으로 알 수 없어요.",
    label: "면도·제모 자극",
    example: "면도나 제모를 한 자리에서 반복되는지 살펴봐요.",
    source: "https://dermnetnz.org/topics/pseudofolliculitis-barbae",
  },
  demodex: {
    title: "볼·코의 반복되는 붉어짐이 함께 있어요",
    meaning: "얼굴 중심이 자주 붉어지고 막힌 피지가 없다는 답은 주사와 겹치는 단서예요. 모낭충이 원인인지는 이 설문으로 알 수 없어요.",
    label: "주사·모낭충 관련 상태와 겹치는 양상",
    example: "볼·코가 넓게 붉어지거나 붉은 기가 남으면서 돌기가 생길 수 있어요.",
    treatment: "수란트라(이버멕틴)는 성인 주사의 염증성 돌기에 허가된 처방약이에요. 모낭충 여부를 시험하는 용도로 쓰지 않아요.",
    source: "https://www.health.kr/drug/2016090100022?view=inter",
  },
};

export function BreakoutPatternGuide({ assessment }) {
  const clues = (assessment.candidates ?? []).filter(candidate => Object.hasOwn(patterns, candidate.key));
  const matched = clues.length === 1 ? patterns[clues[0].key] : null;
  const heading = matched?.title || (clues.length > 1
    ? "서로 다른 트러블 단서가 함께 보여요"
    : "현재 답변으로는 트러블 양상을 구분하기 어려워요");
  const summary = matched?.meaning || (clues.length > 1
    ? "한 가지로 단정하기 어려워요. 어떤 돌기가 언제 늘었는지 확인하는 게 먼저예요."
    : "다음 확인에서 돌기 모양, 가려움, 같은 부위에 막힌 피지가 있는지를 같이 살펴봐요.");

  return <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3" aria-label="답변에서 보인 트러블 단서">
    <p className="text-xs font-semibold text-emerald-800">내 답변에서 보인 단서</p>
    <h3 className="text-lg font-bold break-keep">{heading}</h3>
    <p className="text-sm text-slate-700">{summary}</p>
    {assessment.breakoutCare && <p className="text-sm text-slate-700"><strong>다음 방향을 바꾸는 단서:</strong> {assessment.breakoutCare.nextClue} <a className="underline" href={assessment.breakoutCare.source} target="_blank" rel="noreferrer">관리 근거 보기</a></p>}
    {clues.some(clue => patterns[clue.key].treatment) && <DetailDisclosure title="원인이 확인되면 쓰는 치료">
      <ul className="space-y-2">
        {clues.filter(clue => patterns[clue.key].treatment).map(({ key }) => <li key={key}>
          <strong>{patterns[key].label}</strong> · {patterns[key].treatment} <a className="underline" href={patterns[key].source} target="_blank" rel="noreferrer">근거 보기</a>
        </li>)}
      </ul>
    </DetailDisclosure>}
    {clues.length > 0 && <DetailDisclosure title="어떤 답변을 참고했나요?">
      <ul className="space-y-2">
        {clues.map(clue => <li key={clue.key}>
          <strong>{patterns[clue.key].label}</strong> · {clue.reasons.join(" ")}
        </li>)}
      </ul>
    </DetailDisclosure>}
    <DetailDisclosure title="비슷한 트러블 양상 비교하기">
      <dl className="space-y-3">
        {Object.values(patterns).map(item => <div key={item.label}>
          <dt className="font-semibold">{item.label}</dt>
          <dd>{item.example} {item.treatment && <span>{item.treatment} </span>}<a className="underline" href={item.source} target="_blank" rel="noreferrer">근거 보기</a></dd>
        </div>)}
      </dl>
      <p className="mt-3">겉모습이나 약을 써본 반응만으로 원인을 확정할 수 없어요. 좋아지지 않으면 바른 제품과 달라진 증상을 기록하고 다시 확인해요. 항생제와 항진균제를 순서대로 시험하지 않아요.</p>
    </DetailDisclosure>
  </section>;
}
