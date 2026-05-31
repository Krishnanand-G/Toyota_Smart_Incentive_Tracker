"use client";

import { useEffect, useState } from "react";

const LG_BREAKPOINT = 1024;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);

    function onChange() {
      setIsMobile(media.matches);
    }

    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
