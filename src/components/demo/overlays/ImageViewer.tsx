"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";

interface ImageViewerProps {
  title: string;
  caption?: string;
  /** CSS background (the demo uses gradient placeholders, no stock photos). */
  background: string;
  onClose: () => void;
}

/** Full-screen image viewer; swipe down (or Escape) to close. */
export default function ImageViewer({ title, caption, background, onClose }: ImageViewerProps) {
  const [dy, setDy] = useState(0);
  const start = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onDown = (e: PointerEvent) => {
    start.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => start.current !== null && setDy(Math.max(0, e.clientY - start.current));
  const onUp = () => {
    if (dy > 110) onClose();
    start.current = null;
    setDy(0);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col bg-black text-white"
      style={{ backgroundColor: `rgba(0,0,0,${1 - Math.min(0.6, dy / 400)})` }}
    >
      <div className="flex items-center gap-3 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close image" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
          <X aria-hidden className="h-6 w-6" />
        </button>
        <p className="truncate text-[16px] font-medium">{title}</p>
      </div>
      <div
        className="flex flex-1 touch-none items-center justify-center px-2"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          role="img"
          aria-label={`${title} (illustrative render)`}
          className="relative aspect-[4/3] w-full max-w-xl rounded"
          style={{ background, transform: `translateY(${dy}px) scale(${1 - Math.min(0.15, dy / 1200)})`, transition: start.current === null ? "transform 200ms" : "none" }}
        >
          <svg aria-hidden viewBox="0 0 160 120" className="absolute inset-0 h-full w-full text-white/25">
            <path d="M0 90h160M20 90V50l30-20 30 20v40M90 90V40h50v50M100 52h10v10h-10zM120 52h10v10h-10z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span className="absolute bottom-2 left-2 rounded bg-black/40 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">Illustrative</span>
        </div>
      </div>
      {caption && <p className="px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 text-center text-[15px] text-white/90">{caption}</p>}
    </motion.div>
  );
}
