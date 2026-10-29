"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { brand, sectionIds } from "@/data/brand";
import { CONSENT_CHANGE_EVENT, CONSENT_OPEN_EVENT, readConsent } from "@/lib/consent";

/**
 * Mobile bottom bar shown after the hero. Hides near the final CTA, while the
 * on-screen keyboard is open, and while the cookie banner is up.
 */
export function StickyMobileCTA() {
  const [pastHero, setPastHero] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [bannerUp, setBannerUp] = useState(true);

  useEffect(() => {
    const hero = document.getElementById(sectionIds.hero);
    const end = document.getElementById(sectionIds.finalCta);
    const ioHero = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0));
    const ioEnd = new IntersectionObserver(([e]) => setNearEnd(e.isIntersecting), { rootMargin: "0px 0px 200px 0px" });
    if (hero) ioHero.observe(hero);
    if (end) ioEnd.observe(end);

    // A focused text field on a touch device means the keyboard is (about to be) open.
    const onFocus = () => {
      const el = document.activeElement as HTMLElement | null;
      setKeyboard(!!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable));
    };
    const onBlur = () => setTimeout(onFocus, 0);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);

    setBannerUp(!readConsent().decided);
    const onConsent = () => setBannerUp(false);
    const onOpen = () => setBannerUp(true);
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsent);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);

    return () => {
      ioHero.disconnect();
      ioEnd.disconnect();
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
      window.removeEventListener(CONSENT_CHANGE_EVENT, onConsent);
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  const show = pastHero && !nearEnd && !keyboard && !bannerUp;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgb(11_18_21/0.08)] backdrop-blur-lg md:hidden"
        >
          <div className="flex gap-2">
            <a
              href={`#${sectionIds.liveDemo}`}
              data-track="cta"
              data-track-location="sticky_mobile_demo"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground"
            >
              <MessageCircle aria-hidden className="h-4 w-4" /> Try AI Demo
            </a>
            <a
              href={brand.contact.phoneHref}
              aria-label={`Call ${brand.contact.phoneDisplay} for a free strategy call`}
              data-track="cta"
              data-track-location="sticky_mobile_call"
              className="flex flex-1 items-center justify-center rounded-full bg-copper-500 px-4 py-3 text-sm font-semibold text-ink"
            >
              Call Us
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
