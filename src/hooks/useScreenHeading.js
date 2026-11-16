import { useEffect, useRef } from "react";

export function useScreenHeading(questionKey) {
  const heading = useRef(null);
  useEffect(() => {
    heading.current?.scrollIntoView?.({ block: "nearest" });
    heading.current?.focus({ preventScroll: true });
  }, [questionKey]);
  return heading;
}
