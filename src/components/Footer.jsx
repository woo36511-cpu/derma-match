import React from "react";

export function Footer() {
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

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">
              저장 기능 안내
            </p>
            <p className="text-xs text-gray-500 leading-relaxed break-keep">
              최근 설문 결과는 현재 사용 중인 브라우저에만 저장됩니다. 브라우저
              데이터 삭제, 시크릿 모드, 다른 기기에서는 결과가 보이지 않을 수
              있습니다.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">
              제휴 링크 안내
            </p>
            <p className="text-xs text-gray-500 leading-relaxed break-keep">
              일부 제품 링크는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의
              수수료를 제공받을 수 있습니다.
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          © DearSince. Personalized skincare routine guide.
        </p>
      </div>
    </footer>
  );
}
