import React from "react";

export function SeoContentSection() {
  const skinTypeGuides = [
    {
      title: "건성 피부 루틴",
      desc: "세안 후 당김이 크고 보습감이 오래가지 않는다면 건성 피부 쪽에 가까울 수 있어요. 이 경우에는 수분을 채우는 것뿐 아니라 크림으로 수분이 날아가지 않게 잡아주는 루틴이 중요해요.",
    },
    {
      title: "수부지 피부 루틴",
      desc: "속은 당기는데 오후가 되면 번들거림이 올라온다면 수부지 피부일 수 있어요. 무조건 유분을 없애기보다 가벼운 수분 제품으로 밸런스를 맞추는 방향이 좋아요.",
    },
    {
      title: "지성 피부 루틴",
      desc: "피지와 번들거림이 많고 무거운 크림이 답답하게 느껴진다면 지성 피부 쪽에 가까울 수 있어요. 산뜻한 토너, 가벼운 세럼, 젤크림 중심의 루틴이 잘 맞을 수 있어요.",
    },
    {
      title: "민감성 피부 루틴",
      desc: "화장품을 바른 뒤 따가움, 붉어짐, 화끈거림이 자주 느껴진다면 민감성 피부일 가능성이 있어요. 기능성 제품보다 진정, 보습, 장벽 관리 위주로 시작하는 것이 좋아요.",
    },
    {
      title: "여드름 피부 루틴",
      desc: "붉은 트러블이나 좁쌀이 반복된다면 제품을 한 번에 여러 개 바꾸기보다 루틴을 단순하게 유지하면서 어떤 제품이 맞지 않는지 확인하는 것이 중요해요.",
    },
    {
      title: "화장품 입문자 루틴",
      desc: "화장품을 처음 시작한다면 클렌저, 토너, 세럼, 크림 순서로 기본 루틴을 잡는 것이 좋아요. 처음부터 기능성 제품을 많이 쓰기보다 피부 반응을 보면서 하나씩 추가하는 것이 안전해요.",
    },
  ];

  const faqList = [
    {
      q: "피부타입을 몰라도 사용할 수 있나요?",
      a: "네. DearSince는 건성, 지성, 수부지 같은 피부타입을 정확히 몰라도 세안 후 당김, 오후 번들거림, 트러블 상태 같은 답변을 바탕으로 현재 피부 상태를 추정해요.",
    },
    {
      q: "추천 루틴은 어떤 기준으로 나오나요?",
      a: "설문 답변을 바탕으로 수분감 단계와 주요 피부 고민을 분석한 뒤 클렌저, 토너, 세럼, 크림 루틴을 추천해요.",
    },
    {
      q: "2주 후 피드백은 왜 필요한가요?",
      a: "피부는 제품을 실제로 사용해봐야 당김, 번들거림, 답답함, 트러블 변화를 알 수 있어요. 그래서 DearSince는 사용 후 피드백을 기준으로 다음 루틴 방향을 조정해요.",
    },
  ];

  return (
    <section className="mt-14 max-w-4xl w-full text-left">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
        <p className="text-sm font-semibold text-gray-400 mb-3">
          Skincare Guide
        </p>

        <h2 className="text-2xl sm:text-3xl font-black leading-relaxed break-keep mb-4">
          피부타입을 몰라도 화장품 루틴을 시작할 수 있어요
        </h2>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep mb-8">
          DearSince는 피부타입 테스트처럼 복잡한 진단보다, 실제로 느끼는 당김,
          번들거림, 답답함, 트러블 반응을 기준으로 스킨케어 루틴을 추천하는
          서비스입니다. 건성, 수부지, 지성, 민감성 피부처럼 자신의 피부 상태를
          정확히 모르더라도 간단한 설문으로 시작할 수 있어요.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skinTypeGuides.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl bg-gray-50 border border-gray-100 p-5"
            >
              <h3 className="text-lg font-bold mb-3 break-keep">
                {item.title}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed break-keep">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
        <p className="text-sm font-semibold text-gray-400 mb-3">
          자주 묻는 질문
        </p>

        <h2 className="text-2xl sm:text-3xl font-black leading-relaxed break-keep mb-6">
          화장품 추천과 피부 루틴이 헷갈릴 때
        </h2>

        <div className="space-y-4">
          {faqList.map((item) => (
            <div
              key={item.q}
              className="rounded-3xl bg-gray-50 border border-gray-100 p-5"
            >
              <h3 className="text-base sm:text-lg font-bold mb-2 break-keep">
                {item.q}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed break-keep">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
