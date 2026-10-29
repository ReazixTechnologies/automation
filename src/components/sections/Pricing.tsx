"use client";

import { Check, Phone } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brand, sectionIds } from "@/data/brand";
import { formatPrice, planCategories, plans, pricingTerms, type PlanCategory } from "@/data/pricing";
import { cn } from "@/lib/utils";

export function Pricing() {
  const [category, setCategory] = useState<PlanCategory>("combo");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const visible = plans.filter((p) => p.category === category);

  const onTabKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + planCategories.length) % planCategories.length;
    tabRefs.current[next]?.focus();
    setCategory(planCategories[next].id);
  };

  return (
    <section id={sectionIds.pricing} aria-labelledby="pricing-title" className="section-y">
      <div className="container">
        <SectionHeading
          id="pricing-title"
          eyebrow="Pricing"
          title="Simple Monthly Plans, Fully Managed"
          highlight="Fully Managed"
          description="Pick WhatsApp, Instagram or both. All prices are per month, with standard onboarding included."
        />

        <div className="mt-8 flex justify-center">
          <div role="tablist" aria-label="Plan type" className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-border bg-card p-1 shadow-soft">
            {planCategories.map((c, i) => {
              const selected = c.id === category;
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`plan-tab-${c.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="plan-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setCategory(c.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    selected ? "bg-copper-button text-ink shadow-glow-copper" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div id="plan-panel" role="tabpanel" aria-labelledby={`plan-tab-${category}`}>
        <ul className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          {visible.map((plan) => {
            const featured = plan.tier === "Standard";
            return (
              <li
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6",
                  featured ? "border-copper-500/70 shadow-glow-copper lg:-my-3 lg:py-9" : "border-border shadow-soft",
                )}
              >
                {plan.savings && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-copper-button px-3 py-1 text-[10.5px] font-semibold uppercase tracking-eyebrow text-ink">
                    Save {formatPrice(plan.savings.save)}/month
                  </span>
                )}
                <p className="eyebrow">{plan.tier}</p>
                <h3 className="mt-2 text-2xl font-light text-foreground">{plan.name}</h3>

                <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
                  <span className="font-display text-4xl font-semibold tabular-nums text-foreground">{formatPrice(plan.price)}</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </p>
                <p className="mt-1 h-5 text-sm text-muted-foreground">
                  {plan.savings ? (
                    <>
                      <span className="line-through">{formatPrice(plan.savings.individual)}</span> if bought separately
                    </>
                  ) : (
                    "Standard onboarding included"
                  )}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-foreground">
                      <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-copper-700 dark:text-copper-400" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  href={brand.cta.primary.href}
                  variant={featured ? "primary" : "outline"}
                  className="mt-8 w-full"
                  data-track="cta"
                  data-track-location={`pricing_${plan.id}`}
                >
                  {brand.cta.primary.label}
                </Button>
              </li>
            );
          })}
        </ul>
        </div>

        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted-foreground">
          Not sure which plan fits? Call us for a free strategy call:
          <a href={brand.contact.phoneHref} className="inline-flex items-center gap-1.5 font-semibold text-copper-700 underline-offset-4 hover:underline dark:text-copper-300" data-track="cta" data-track-location="pricing_phone">
            <Phone aria-hidden className="h-4 w-4" />
            {brand.contact.phoneDisplay}
          </a>
        </p>

        <div className="mx-auto mt-10 max-w-3xl rounded-card border border-border bg-card p-5 sm:p-6">
          <h3 className="eyebrow">Monthly subscription terms</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {pricingTerms.map((t) => (
              <li key={t} className="flex gap-2">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
