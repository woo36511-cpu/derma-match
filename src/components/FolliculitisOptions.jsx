import { DetailDisclosure } from "./DetailDisclosure";

export function FolliculitisOptions() {
  return <section className="space-y-3" aria-label="모낭염 공통 관리와 약품 정보">
    <h3 className="font-semibold">모낭염처럼 보이는 돌기의 관리</h3>
    <p className="text-sm">면도·마찰·기름진 밀폐 제품을 잠시 줄이고, 짜지 않아요. 순한 세안과 잘 맞는 보습은 유지해요. 모든 원인에 함께 듣는 약 한 가지는 없어요.</p>
    <AcnePhotoLink />
    <DetailDisclosure title="원인별 약품과 구분 단서 보기">
      <div className="space-y-4">
        <div><h4 className="font-semibold">세균성 모낭염</h4><p>털구멍 중심의 고름·통증이 단서가 될 수 있어요. 원인이 확인된 국소 세균 감염에는 무피로신 외용제(예: 에스로반)가 쓰이기도 해요. 여드름이나 진균에 공통으로 쓰는 약은 아니며, 항생제를 반복해서 시험하면 내성 문제가 생길 수 있어요.</p><a className="underline" href="https://dermnetnz.org/topics/bacterial-folliculitis" target="_blank" rel="noreferrer">DermNet 세균성 모낭염 자료</a></div>
        <div><h4 className="font-semibold">말라세지아 모낭염</h4><p>비슷한 크기의 가려운 돌기와 면포가 잘 보이지 않는 양상이 단서예요. 확인된 경우 케토코나졸 같은 항진균제가 쓰이지만, 제품마다 얼굴 사용 가능 여부와 허가 용도가 달라요. 먹는 항진균제를 스스로 시작하는 경로는 제공하지 않아요.</p><a className="underline" href="https://dermnetnz.org/topics/malassezia-folliculitis" target="_blank" rel="noreferrer">DermNet 말라세지아 자료</a></div>
        <div><h4 className="font-semibold">모낭충·주사 관련 돌기</h4><p>지속되는 얼굴 붉어짐과 돌기는 다른 질환과 구분이 필요해요. 이버멕틴 크림(수란트라)은 성인 주사의 염증성 병변에 쓰는 처방약으로, 모낭염인지 확인하는 시험용 약이 아니에요.</p><a className="underline" href="https://www.galderma.com/us/sites/default/files/2019-01/Soolantra_Cream_PI.pdf" target="_blank" rel="noreferrer">제조사 이버멕틴 크림 허가정보 (미국)</a></div>
        <p className="rounded-xl bg-amber-50 p-3">사진·설문만으로 세균·진균·모낭충을 확정하거나, 효과가 없다는 이유만으로 다음 항생제·항진균제로 바꾸지 않아요. 반복되거나 퍼지면 원인 확인이 필요해요.</p>
      </div>
    </DetailDisclosure>
  </section>;
}
function AcnePhotoLink() {
  return <a className="inline-block text-sm underline" href="https://dermnetnz.org/topics/folliculitis" target="_blank" rel="noreferrer">모낭염 실제 사진과 설명 비교하기</a>;
}
