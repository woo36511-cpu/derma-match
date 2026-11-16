import React from "react";

export function PrimaryButton({ children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-3 rounded-xl px-5 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 sm:text-base ${
        disabled
          ? "cursor-not-allowed bg-stone-200 text-stone-600"
          : "bg-forest-700 text-white hover:bg-forest-800"
      }`}
    >
      {children}
    </button>
  );
}
