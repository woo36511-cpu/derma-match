import { ProductCard } from "./ProductCard";
import { routineSlots } from "../utils/routineAdvice";
import React from "react";

export function RoutineProductScroller({ productsByCategory, userContext, optionalSlots = [], renderAfterProduct, layout = "scroller" }) {
  const items = Object.entries(productsByCategory).filter(([, item]) => !!item);
  const ordered = layout === "routine";
  return (
    <div className={ordered
      ? `grid items-start gap-3 ${items.length > 1 ? "sm:grid-cols-2" : ""} ${items.length > 2 ? "lg:grid-cols-4" : ""}`
      : "flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 xl:grid-cols-4 sm:gap-6 sm:overflow-visible"}>
      {items.map(([key, item]) => (
          <div
            key={key}
            className={ordered ? "min-w-0" : "min-w-[82%] max-w-[82%] snap-start sm:min-w-0 sm:max-w-none"}
          >
            <ProductCard
              categoryKey={key}
              product={item}
              step={ordered ? routineSlots.indexOf(key) + 1 : 0}
              optional={optionalSlots.includes(key)}
              userContext={userContext && { ...userContext, slot: key }}
            />
            {renderAfterProduct?.(key, item)}
          </div>
        ))}
    </div>
  );
}
