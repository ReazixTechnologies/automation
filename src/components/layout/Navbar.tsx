"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { brand, navLinks, sectionIds } from "@/data/brand";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Lock body scroll and move focus into the sheet while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus());

    const onResize = () => window.innerWidth >= 1280 && setOpen(false);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Focus trap spans the toggle button + sheet so the close button stays reachable.
  const onHeaderKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab" || !sheetRef.current || !toggleRef.current) return;
    const items = [toggleRef.current, ...sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const solid = scrolled || open;

  return (
    <header
      onKeyDown={onHeaderKeyDown}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        solid
          ? "bg-background/85 shadow-[0_1px_0_rgb(232_105_46/0.18),0_8px_24px_rgb(0_0_0/0.25)] backdrop-blur-lg"
          : "bg-transparent",
      )}
    >
      <nav aria-label="Primary" className="container flex h-[var(--nav-height)] items-center justify-between gap-4">
        <a href={`#${sectionIds.hero}`} className="flex shrink-0 items-center rounded-md" aria-label={`${brand.name} home`}>
          <Logo height={34} priority />
        </a>

        {/* Full link row from xl; below that the links live in the menu sheet. */}
        <ul className="hidden items-center gap-1 xl:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-2 py-2 text-[11px] font-medium uppercase tracking-eyebrow text-muted-foreground transition-colors hover:text-copper-700 dark:hover:text-copper-300"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Button href={brand.cta.seeLive.href} variant="outline" size="sm" className="hidden md:inline-flex xl:hidden 2xl:inline-flex" data-track="cta" data-track-location="nav_see_live">
            {brand.cta.seeLive.label}
          </Button>
          <Button href={brand.cta.primary.href} size="sm" className="hidden sm:inline-flex" data-track="cta" data-track-location="nav_strategy_call">
            {brand.cta.primary.label}
          </Button>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-foreground/5 xl:hidden"
          >
            {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={sheetRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--nav-height))] overflow-y-auto border-t border-border bg-background/95 shadow-card backdrop-blur-lg xl:hidden"
          >
            <div className="container py-4">
              <ul className="flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <a
                      href={link.href}
                      onClick={() => close(false)}
                      className="block rounded-card px-3 py-3 text-xs font-medium uppercase tracking-eyebrow text-foreground hover:bg-foreground/5"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
                <Button href={brand.cta.seeLive.href} variant="outline" onClick={() => close(false)}>
                  {brand.cta.seeLive.label}
                </Button>
                <Button href={brand.cta.primary.href} onClick={() => close(false)}>
                  {brand.cta.primary.label}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
