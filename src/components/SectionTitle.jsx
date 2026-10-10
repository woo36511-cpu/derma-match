import React from "react";

export function SectionTitle({ title, desc }) {
  return (
    <div className="text-center mb-8 sm:mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 break-keep leading-relaxed">
        {title}
      </h2>
      <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed break-keep">
        {desc}
      </p>
    </div>
  );
}
