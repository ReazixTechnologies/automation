"use client";

import { useEffect, type RefObject } from "react";

/**
 * Pauses CSS animations inside `ref` while it is off-screen by toggling
 * data-paused (see the matching rule in globals.css). No re-renders.
 */
export function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.paused = entry.isIntersecting ? "false" : "true";
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
