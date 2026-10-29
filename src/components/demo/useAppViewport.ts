"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Mobile: pins the chat to the *visual* viewport so the input sits right above
 * the on-screen keyboard and the header never scrolls away (iOS Safari keeps
 * the layout viewport full height when the keyboard opens). Desktop: no-op.
 */
export function useAppViewport(onResize?: () => void): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties>();
  const cb = useRef(onResize);
  cb.current = onResize;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const vv = window.visualViewport;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!mq.matches || !vv) {
          setStyle(undefined);
          return;
        }
        setStyle({ height: vv.height, transform: `translateY(${Math.max(0, vv.offsetTop)}px)` });
        cb.current?.();
      });
    };
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    mq.addEventListener("change", update);
    window.addEventListener("orientationchange", update);
    return () => {
      cancelAnimationFrame(frame);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      mq.removeEventListener("change", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return style;
}
