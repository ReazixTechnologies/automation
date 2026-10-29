"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toggles the `.dark` class on <html> and persists the choice.
 * Both icons render and CSS picks one, so there is no hydration mismatch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5",
        className,
      )}
    >
      <Sun aria-hidden className="hidden h-5 w-5 dark:block" />
      <Moon aria-hidden className="h-5 w-5 dark:hidden" />
    </button>
  );
}

/** Inline script for <head>: dark by default; light only if the visitor chose it. Runs before paint. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})();`;
