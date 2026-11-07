import React from "react";

export function Header({ resetFlow, isStart = false }) {
  const BrandHeading = isStart ? "p" : "h1";
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <BrandHeading className="text-lg sm:text-xl font-bold break-keep">DearSince</BrandHeading>
          <p className="text-xs sm:text-sm text-gray-500 break-keep">
            얼굴 피부 관리 가이드
          </p>
        </div>
        <button
          onClick={resetFlow}
          className="text-xs sm:text-sm px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          처음으로
        </button>
      </div>
    </header>
  );
}
