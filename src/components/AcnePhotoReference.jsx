import { DetailDisclosure } from "./DetailDisclosure";

const examples = [
  { file: "closed-comedones.jpg", image: "/skin-examples/closed-comedones.jpg", title: "면포성 여드름 실제 사진", description: "이마에 작게 막힌 돌기가 보이는 예시예요.", author: "Dr. Thomas Brinkmeier", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", source: "https://commons.wikimedia.org/wiki/File:Acne_comedonica,_Stirn,_%C2%A9WIKIDERM.jpg" },
  { file: "blackheads.jpg", image: "/skin-examples/blackheads.jpg", title: "블랙헤드·화이트헤드 구조 그림", description: "표면이 열린 검은 면포와 닫힌 하얀 면포의 차이를 나타낸 그림이에요.", author: "Hilda Bastian", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", source: "https://commons.wikimedia.org/wiki/File:Comedones.jpg" },
  { file: "inflammatory.jpg", image: "/skin-examples/inflammatory.jpg", title: "붉은 돌기·고름이 섞인 실제 사진", description: "몸에 여러 염증성 돌기가 섞인 예시예요. 넓게 번진 이 사진의 상태를 작은 뾰루지용 약품 안내에 그대로 적용하지 않아요.", author: "Dr. Thomas Brinkmeier", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", source: "https://commons.wikimedia.org/wiki/File:Acne_papulopustulosa,_Decollet%C3%A9,_%C2%A9WIKIDERM.jpg" },
];
export function AcnePhotoReference() {
  return <DetailDisclosure title="실제 사진·구조 그림으로 비교하기">
    <p className="mb-3">모양을 이해하기 위한 참고 자료예요. 비슷해 보여도 원인균이나 질환이 같다고 판단할 수는 없어요.</p>
    <div className="grid gap-4 sm:grid-cols-3">{examples.map(example => <figure key={example.file} className="space-y-2">
      <img src={example.image} alt={example.title} width="320" height="240" loading="lazy" className="w-full h-48 rounded-xl object-contain bg-slate-50" />
      <figcaption><p className="font-semibold">{example.title}</p><p className="mt-1">{example.description}</p>
        <p className="mt-2 text-xs">{example.author} · <a href={example.source} target="_blank" rel="noreferrer" className="underline">원본</a> · <a href={example.licenseUrl} target="_blank" rel="noreferrer" className="underline">{example.license}</a> · 크기 축소</p></figcaption>
    </figure>)}</div>
    <a href="https://www.aad.org/public/diseases/acne/really-acne/symptoms" target="_blank" rel="noreferrer" className="mt-4 inline-block underline">미국피부과학회 유형별 사진·설명 더 보기</a>
    <a href="https://www.aad.org/public/diseases/acne/derm-treat/scars/symptoms" target="_blank" rel="noreferrer" className="mt-3 block underline">평평한 자국과 패이거나 솟은 흉터 사진 비교</a>
  </DetailDisclosure>;
}
