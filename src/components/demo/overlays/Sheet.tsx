"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Channel } from "@/types/simulator";

interface SheetProps {
  channel: Channel;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

/** Bottom sheet in the style of the active app. Escape / backdrop closes; focus stays inside. */
export default function Sheet({ channel, title, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    opener.current = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button, input, [href]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !ref.current) return;
      const els = [...ref.current.querySelectorAll<HTMLElement>("button:not([disabled]), input, [href]")];
      if (!els.length) return;
      if (e.shiftKey && document.activeElement === els[0]) {
        e.preventDefault();
        els[els.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === els[els.length - 1]) {
        e.preventDefault();
        els[0].focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const restore = opener.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      restore?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <motion.div aria-hidden className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 40 }}
        className={cn(
          "relative rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]",
          channel === "whatsapp" ? "bg-white text-[#111B21] dark:bg-[#202C33] dark:text-[#E9EDEF]" : "bg-white text-black dark:bg-[#262626] dark:text-white",
        )}
      >
        <div aria-hidden className="mx-auto mt-2 h-1 w-9 rounded-full bg-black/20 dark:bg-white/25" />
        {title && <p className="px-5 pb-1 pt-3 text-center text-[17px] font-semibold">{title}</p>}
        {children}
      </motion.div>
    </div>
  );
}
