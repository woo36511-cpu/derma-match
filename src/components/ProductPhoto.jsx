import { useState } from "react";
import officialProductPhotos from "../data/officialProductPhotos.json";

function Photo({ sources, alt, width, height, className }) {
  const [index, setIndex] = useState(0);
  const source = sources[index];
  if (!source) return <div className={`grid place-items-center text-center text-xs text-slate-600 ${className}`}>제품 사진 준비 중</div>;

  return <img key={source} src={source} alt={alt} width={width} height={height} loading="lazy"
    referrerPolicy="no-referrer" onError={() => setIndex(index + 1)} className={className} />;
}

export function ProductPhoto({ product, alt = product.name, width, height, className }) {
  const sources = [...new Set([officialProductPhotos[product.id], product.image].filter(source => source && !/empty[_-]?thumb|placeholder|no[_-]?image|default[_-]?image/i.test(source)))];
  return <Photo key={JSON.stringify(sources)} {...{ sources, alt, width, height, className }} />;
}
