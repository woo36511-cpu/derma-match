import React from "react";
import { CatalogRefreshStatus } from "./CatalogRefreshStatus";

export function Footer({ onSupport }) {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div>
          <p className="text-sm font-bold text-gray-900 mb-2">DearSince 안내</p>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed break-keep">
            DearSince의 추천 결과는 사용자가 입력한 설문 답변을 바탕으로 한 피부
            관리 가이드입니다. 질환의 진단이나 치료를 대신하지 않으며, 통증,
            고름, 심한 붉어짐, 진물, 흉터가 있거나 증상이 반복된다면 피부과
            상담을 권장합니다.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">
              저장 기능 안내
            </p>
            <p className="text-xs text-gray-500 leading-relaxed break-keep">
              로그인 전 기록과 서버에 아직 전송하지 못한 기록은 현재 브라우저에
              저장됩니다. 로그인 후 ‘서버 저장 완료’가 표시된 기록은 같은 계정으로
              다른 기기에서도 이어볼 수 있습니다. 브라우저 데이터를 삭제하면
              서버에 전송하지 못한 기록이 사라질 수 있습니다.
            </p>
          </div>

        </div>

        {onSupport && <button type="button" className="text-sm font-semibold text-forest-900 underline underline-offset-4" onClick={onSupport}>고객센터 · 의견 남기기</button>}

        <CatalogRefreshStatus />

        <p className="text-xs text-gray-400">
          © DearSince. Personalized skincare routine guide.
        </p>
        <section className="rounded-2xl bg-forest-50 p-4 text-sm text-forest-900" aria-label="디얼신스 제작 응원">
          <p>쿠팡에서 쇼핑할 일이 있다면 아래 링크를 이용해 주세요. 디얼신스를 더 열심히 만들 힘이 돼요.</p>
          <p className="mt-1 text-xs text-slate-700">쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받습니다.</p>
          <a className="mt-2 inline-block font-semibold underline underline-offset-4"
            href="https://link.coupang.com/a/iRsPawjcNU" target="_blank" rel="sponsored noopener noreferrer">쿠팡으로 제작 응원하기</a>
        </section>
      </div>
    </footer>
  );
}
