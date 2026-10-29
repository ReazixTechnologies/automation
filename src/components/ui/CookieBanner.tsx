"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { CONSENT_OPEN_EVENT, readConsent, saveConsent } from "@/lib/consent";

/** Consent banner: Accept / Reject non-essential / Settings. Analytics stays off until accepted. */
export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const switchId = useId();

  useEffect(() => {
    const consent = readConsent();
    setAnalytics(consent.analytics);
    if (!consent.decided) setOpen(true);
    const onOpen = () => {
      setAnalytics(readConsent().analytics);
      setSettings(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  const decide = (value: boolean) => {
    saveConsent(value);
    setOpen(false);
    setSettings(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          aria-label="Cookie consent"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0, pointerEvents: "none" }}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-card sm:inset-x-6 sm:bottom-6 sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 gap-3">
              <Cookie aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-copper-700 dark:text-copper-400" />
              <p className="text-sm text-foreground">
                We use essential cookies to run this site and, with your permission, analytics cookies to improve it.{" "}
                <a href="#" className="font-semibold underline underline-offset-2">
                  Cookie policy
                </a>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setSettings((s) => !s)} aria-expanded={settings} className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                Settings
              </button>
              <button type="button" onClick={() => decide(false)} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-foreground/5">
                Reject non-essential
              </button>
              <button type="button" onClick={() => decide(true)} className="rounded-full bg-copper-700 px-4 py-2 text-sm font-semibold text-white hover:bg-copper-600 dark:bg-copper-500 dark:text-ink">
                Accept all
              </button>
            </div>
          </div>
          {settings && (
            <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span>
                  <span className="font-semibold text-foreground">Essential</span>
                  <span className="block text-xs text-muted-foreground">Needed for the site and your preferences. Always on.</span>
                </span>
                <span className="text-xs font-semibold text-muted-foreground">Always on</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span id={switchId}>
                  <span className="font-semibold text-foreground">Analytics</span>
                  <span className="block text-xs text-muted-foreground">Anonymous usage stats, loaded only if you allow it.</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analytics}
                  aria-labelledby={switchId}
                  onClick={() => setAnalytics((a) => !a)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${analytics ? "bg-copper-600 dark:bg-copper-500" : "bg-muted ring-1 ring-inset ring-border"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${analytics ? "left-[1.375rem]" : "left-0.5"}`} />
                </button>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => decide(analytics)} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-ink">
                  Save preferences
                </button>
              </div>
            </div>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
