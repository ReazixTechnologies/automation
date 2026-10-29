"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { sectionIds } from "@/data/brand";
import { WhatsAppGlyph } from "./icons";
import { ErrorBoundary } from "./ErrorBoundary";
import { PoweredBy } from "./PoweredBy";

// The chat UI is only downloaded the first time the drawer opens.
const ChatDrawerContent = dynamic(() => import("./ChatDrawerContent"), {
  ssr: false,
  loading: () => <div className="flex-1 animate-pulse bg-muted" aria-hidden />,
});

/**
 * WhatsApp-style launcher (md and up) opening a compact drawer with the same
 * AI chat as the #live-demo section. Hidden while that section is on screen.
 */
export function FloatingChatLauncher() {
  const [open, setOpen] = useState(false);
  const [demoVisible, setDemoVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.getElementById(sectionIds.liveDemo);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDemoVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The section's own chat is visible: close the drawer rather than show two.
  useEffect(() => {
    if (demoVisible) setOpen(false);
  }, [demoVisible]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => drawerRef.current?.querySelector<HTMLInputElement>("input[type=text]")?.focus(), 250);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hidden = demoVisible && !open;

  return (
    <div className="hidden md:block">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={drawerRef}
            id="chat-drawer"
            role="dialog"
            aria-label="Chat with the AI concierge"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98, pointerEvents: "none" }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-[45] flex h-[min(620px,calc(100dvh-8rem))] w-[380px] flex-col overflow-hidden rounded-2xl border border-copper-500/40 bg-card shadow-phone"
          >
            <ErrorBoundary name="chat" className="m-4">
              <ChatDrawerContent />
            </ErrorBoundary>
            <PoweredBy className="border-t border-border py-2" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="chat-drawer"
        aria-label={open ? "Close chat" : "Chat with our AI concierge"}
        initial={false}
        animate={{ scale: hidden ? 0.6 : 1, opacity: hidden ? 0 : 1 }}
        style={{ pointerEvents: hidden ? "none" : "auto" }}
        tabIndex={hidden ? -1 : 0}
        className="fixed bottom-6 right-6 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-copper-500 text-ink shadow-glow-copper transition-colors hover:shadow-glow-copper-strong"
      >
        {open ? <X aria-hidden className="h-6 w-6" /> : <WhatsAppGlyph aria-hidden className="h-7 w-7" />}
      </motion.button>
    </div>
  );
}
