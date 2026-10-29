"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Signature "light stroke": a thin glowing copper line that draws itself once,
 * echoing the logo's light-painted "R". Static under reduced motion.
 */
export function LightStroke({ className, delay = 0.2 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const id = useId();
  return (
    <svg aria-hidden viewBox="0 0 240 14" preserveAspectRatio="none" className={cn("h-3 w-40 overflow-visible", className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#FFB27A" stopOpacity="0" />
          <stop offset="0.35" stopColor="#FFB27A" />
          <stop offset="0.7" stopColor="#E8692E" />
          <stop offset="1" stopColor="#C4501F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M2 10 C 50 3, 110 12, 160 6 S 220 3, 238 5"
        fill="none"
        stroke={`url(#${id}-g)`}
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 4px rgba(232,105,46,0.7))" }}
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay }}
      />
    </svg>
  );
}

/** The same light stroke tracing a rounded rectangle around a phone mockup. */
export function LightStrokeFrame({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const id = useId();
  return (
    <svg aria-hidden viewBox="0 0 100 200" preserveAspectRatio="none" className={cn("pointer-events-none absolute overflow-visible", className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#FFB27A" />
          <stop offset="0.5" stopColor="#E8692E" />
          <stop offset="1" stopColor="#C4501F" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <motion.rect
        x="1"
        y="1"
        width="98"
        height="198"
        rx="14"
        ry="7"
        fill="none"
        stroke={`url(#${id}-g)`}
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
        style={{ filter: "drop-shadow(0 0 6px rgba(232,105,46,0.75))" }}
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1], delay: 0.4 }}
      />
    </svg>
  );
}
