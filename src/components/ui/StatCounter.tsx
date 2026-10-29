"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
  /** Decimal places shown while counting and at rest. */
  decimals?: number;
  valueClassName?: string;
  labelClassName?: string;
  className?: string;
}

/** Counts up from 0 when scrolled into view; static under reduced motion. */
export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  duration = 1.4,
  decimals = 0,
  valueClassName,
  labelClassName,
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const format = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <div className={cn("flex flex-col", className)}>
      <span ref={ref} className={cn("font-display text-2xl font-extrabold tabular-nums text-foreground sm:text-3xl", valueClassName)}>
        {/* Screen readers get the final value, not intermediate frames */}
        <span className="sr-only">{`${prefix}${format(value)}${suffix}`}</span>
        <span aria-hidden>
          {prefix}
          {/* An invisible copy of the final number reserves its exact width (no layout shift) */}
          <span className="relative inline-block">
            <span className="invisible">{format(value)}</span>
            <span className="absolute inset-y-0 left-0">{format(display)}</span>
          </span>
          {suffix}
        </span>
      </span>
      <span className={cn("mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm", labelClassName)}>{label}</span>
    </div>
  );
}
