"use client";

import { Reply } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MessageShellProps {
  children: ReactNode;
  /** Accessible summary, e.g. "Skyline Heights: Hi there". */
  label: string;
  onReply?: () => void;
  /** Long-press (touch), right-click or Enter (keyboard): open the reaction bar. */
  onActions?: (rect: DOMRect) => void;
  onDoubleTap?: () => void;
  align: "start" | "end";
  className?: string;
}

const SWIPE_TRIGGER = 56;
const LONG_PRESS_MS = 450;

/**
 * Message gestures like the real apps: swipe right to reply, long-press for
 * reactions, double-tap (Instagram heart). Vertical scrolling stays native
 * (touch-action: pan-y). Keyboard: Enter opens actions, R replies.
 */
export function MessageShell({ children, label, onReply, onActions, onDoubleTap, align, className }: MessageShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const pressTimer = useRef<number | null>(null);
  const lastTap = useRef(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const clearPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const openActions = () => {
    if (ref.current && onActions) onActions(ref.current.getBoundingClientRect());
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    if (e.pointerType !== "mouse") {
      pressTimer.current = window.setTimeout(() => {
        start.current = null;
        setDx(0);
        navigator.vibrate?.(10);
        openActions();
      }, LONG_PRESS_MS);
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const mx = e.clientX - s.x;
    const my = e.clientY - s.y;
    if (Math.abs(mx) > 8 || Math.abs(my) > 8) clearPress();
    // Horizontal right swipe only, with resistance past the trigger point.
    if (onReply && mx > 0 && Math.abs(mx) > Math.abs(my) * 1.2) {
      if (!dragging) {
        setDragging(true);
        ref.current?.setPointerCapture(s.id);
      }
      setDx(mx < SWIPE_TRIGGER ? mx : SWIPE_TRIGGER + (mx - SWIPE_TRIGGER) * 0.25);
    }
  };

  const onPointerUp = () => {
    clearPress();
    const swiped = dx >= SWIPE_TRIGGER;
    if (swiped) {
      navigator.vibrate?.(8);
      onReply?.();
    } else if (start.current && !dragging && onDoubleTap) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        lastTap.current = 0;
        onDoubleTap();
      } else lastTap.current = now;
    }
    start.current = null;
    setDragging(false);
    setDx(0);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
      e.preventDefault();
      openActions();
    } else if ((e.key === "r" || e.key === "R") && onReply) {
      e.preventDefault();
      onReply();
    }
  };

  return (
    <div className={cn("relative flex w-full", align === "end" ? "justify-end" : "justify-start", className)}>
      {onReply && (
        <span
          aria-hidden
          className="absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/10 text-[#54656F] dark:bg-white/10 dark:text-[#AEBAC1]"
          style={{ opacity: Math.min(1, dx / SWIPE_TRIGGER), transform: `translateY(-50%) scale(${0.6 + Math.min(1, dx / SWIPE_TRIGGER) * 0.4})` }}
        >
          <Reply className="h-4 w-4" />
        </span>
      )}
      <div
        ref={ref}
        tabIndex={0}
        role="group"
        aria-label={label}
        aria-roledescription="message"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => {
          e.preventDefault();
          clearPress();
          openActions();
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "flex w-full touch-pan-y flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#00A884]/60",
          align === "end" ? "items-end" : "items-start",
        )}
        style={{ transform: dx ? `translateX(${dx}px)` : undefined, transition: dragging ? "none" : "transform 200ms ease-out" }}
      >
        {children}
      </div>
    </div>
  );
}
