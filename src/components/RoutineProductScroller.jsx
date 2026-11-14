import { ProductCard } from "./ProductCard";
import React from "react";

export function RoutineProductScroller({ productsByCategory, userContext, optionalSlots = [] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 xl:grid-cols-4 sm:gap-6 sm:overflow-visible">
      {Object.entries(productsByCategory)
        .filter(([, item]) => !!item)
        .map(([key, item]) => (
          <div
            key={key}
            className="min-w-[82%] max-w-[82%] snap-start sm:min-w-0 sm:max-w-none"
          >
            {optionalSlots.includes(key) && <p className="mb-2 text-xs font-semibold text-slate-600">필요할 때 추가</p>}
            <ProductCard
              categoryKey={key}
              product={item}
              userContext={userContext && { ...userContext, slot: key }}
            />
          </div>
        ))}
    </div>
  );
}
