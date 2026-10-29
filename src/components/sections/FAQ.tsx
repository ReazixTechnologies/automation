"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, Sparkles } from "lucide-react";
import { useId, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionIds } from "@/data/brand";
import { faqCategories, faqs, type FaqCategory } from "@/data/faq";
import { track } from "@/lib/analytics";
import { prefillLiveDemo } from "@/lib/liveDemo";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [category, setCategory] = useState<"All" | FaqCategory>("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const baseId = useId();

  const q = query.trim().toLowerCase();
  const visible = faqs.filter(
    (f) => (category === "All" || f.category === category) && (!q || `${f.question} ${f.answer}`.toLowerCase().includes(q)),
  );

  const toggle = (id: string) => {
    const next = openId === id ? null : id;
    if (next) track("faq_opened", { id });
    setOpenId(next);
  };

  const askAi = () => {
    document.getElementById(sectionIds.liveDemo)?.scrollIntoView({ behavior: "smooth" });
    prefillLiveDemo(query.trim() || "I have a question about Skyline Heights");
  };

  return (
    <section id={sectionIds.faq} aria-labelledby="faq-title" className="section-y bg-muted/60">
      <div className="container max-w-4xl">
        <SectionHeading id="faq-title" eyebrow="FAQ" title="Questions, Answered" highlight="Answered" />

        <div className="mt-8 flex flex-col gap-4">
          <label className="relative mx-auto w-full max-w-md">
            <span className="sr-only">Search questions</span>
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground shadow-soft placeholder:text-muted-foreground"
            />
          </label>
          <div role="group" aria-label="Filter by category" className="flex flex-wrap justify-center gap-2">
            {faqCategories.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  category === c ? "border-copper-700 bg-copper-700 text-white dark:border-copper-500 dark:bg-copper-500 dark:text-ink" : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <p aria-live="polite" className="sr-only">
          {visible.length} question{visible.length === 1 ? "" : "s"} shown
        </p>

        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {visible.map((f) => {
            const open = openId === f.id;
            const buttonId = `${baseId}-${f.id}-q`;
            const panelId = `${baseId}-${f.id}-a`;
            return (
              <li key={f.id}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(f.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-foreground hover:bg-foreground/[0.02]"
                  >
                    <span>
                      {f.question}
                      <span className="ml-2 align-middle text-[11px] font-medium text-muted-foreground">{f.category}</span>
                    </span>
                    <ChevronDown aria-hidden className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
          {visible.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted-foreground">No questions match. Try asking our AI instead.</li>}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">Still have questions?</p>
          <button
            type="button"
            onClick={askAi}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-700 dark:bg-white dark:text-ink"
          >
            <Sparkles aria-hidden className="h-4 w-4 text-copper-400" />
            Ask our AI{query.trim() ? `: “${query.trim().slice(0, 40)}”` : ""}
          </button>
        </div>
      </div>
    </section>
  );
}
