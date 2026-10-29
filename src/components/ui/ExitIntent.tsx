"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calculator, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { sectionIds } from "@/data/brand";

const KEY = "concierra-exit-intent-shown";
const MIN_TIME_ON_PAGE = 10_000;

function alreadyShown() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function markShown() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* storage unavailable: it may show again next page view, still once per load */
  }
}

/** Desktop-only, once per session: offers the ROI calculator when the cursor leaves the window. */
export function ExitIntent() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    if (!desktop || alreadyShown()) return;
    const armedAt = Date.now() + MIN_TIME_ON_PAGE;
    const onOut = (e: MouseEvent) => {
      if (e.relatedTarget || e.clientY > 0 || Date.now() < armedAt || alreadyShown()) return;
      markShown();
      returnFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    document.addEventListener("mouseout", onOut);
    return () => document.removeEventListener("mouseout", onOut);
  }, []);

  useEffect(() => {
    if (open) dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    returnFocus.current?.focus?.();
  };

  const goToRoi = () => {
    setOpen(false);
    document.getElementById(sectionIds.roi)?.scrollIntoView({ behavior: "smooth" });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
    if (e.key === "Tab" && dialogRef.current) {
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>("button")];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && close()}
          onKeyDown={onKeyDown}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-card"
          >
            <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-foreground/5">
              <X aria-hidden className="h-4 w-4" />
            </button>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-copper-400/15 text-copper-700 dark:text-copper-400">
              <Calculator aria-hidden className="h-6 w-6" />
            </span>
            <h2 id="exit-title" className="mt-4 text-xl font-light text-foreground">
              Before you go, see your ROI in 30 seconds
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Plug in your lead volume and response time to see how many more site visits you could book.</p>
            <div className="mt-5 grid gap-2">
              <button type="button" onClick={goToRoi} className="rounded-full bg-copper-500 px-5 py-2.5 text-sm font-semibold text-ink hover:shadow-glow-copper-strong">
                Calculate my ROI
              </button>
              <button type="button" onClick={close} className="rounded-full px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                No thanks
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
