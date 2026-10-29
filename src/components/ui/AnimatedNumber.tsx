"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}

/** Tweens from the previous value to the new one; jumps straight there under reduced motion. */
export function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString("en-IN"), duration = 0.6 }: AnimatedNumberProps) {
  const reduce = useReducedMotion() ?? false;
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, { duration, ease: "easeOut", onUpdate: setDisplay });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduce, duration]);

  return (
    <>
      <span className="sr-only">{format(value)}</span>
      <span aria-hidden className="tabular-nums">
        {format(display)}
      </span>
    </>
  );
}
