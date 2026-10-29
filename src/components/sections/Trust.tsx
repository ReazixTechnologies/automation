"use client";

import { motion } from "framer-motion";
import { Activity, ArrowRight, BadgeCheck, FileCheck2, Lock, Quote, ShieldCheck, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePauseOffscreen } from "@/hooks/usePauseOffscreen";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionIds } from "@/data/brand";
import { caseStudy, complianceBadges, testimonials, wordmarks, type Testimonial } from "@/data/testimonials";
import { cn } from "@/lib/utils";

const badgeIcons: Record<(typeof complianceBadges)[number]["icon"], LucideIcon> = {
  badge: BadgeCheck,
  lock: Lock,
  shield: ShieldCheck,
  file: FileCheck2,
  activity: Activity,
};

export function Trust() {
  return (
    <section id={sectionIds.trust} aria-labelledby="trust-title" className="section-y overflow-x-clip">
      <div className="container">
        <SectionHeading
          id="trust-title"
          eyebrow="Trusted by Growing Teams"
          title="Built for Developers, Brokers & Channel Partners"
          highlight="Channel Partners"
          description="Placeholder logos and stories from fictional teams, shown to illustrate the layout."
        />
      </div>

      <LogoMarquee />

      <div className="container">
        <TestimonialsGrid />
        <TestimonialsCarousel />
        <CaseStudyCard />

        <ul aria-label="Compliance and reliability" className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-3">
          {complianceBadges.map((b) => {
            const Icon = badgeIcons[b.icon];
            return (
              <li key={b.label} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-soft">
                <Icon aria-hidden className="h-4 w-4 text-copper-700 dark:text-copper-300" />
                {b.label}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function LogoMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  usePauseOffscreen(ref);
  const row = (hidden: boolean) =>
    wordmarks.map((w) => (
      <li key={`${w}-${hidden}`} aria-hidden={hidden || undefined} className="shrink-0 px-6 sm:px-10">
        <span className="font-display text-lg font-extrabold tracking-tight text-muted-foreground grayscale transition-colors hover:text-copper-700 hover:grayscale-0 sm:text-xl dark:hover:text-copper-300">
          {w}
        </span>
      </li>
    ));

  return (
    <div ref={ref} className="group relative mt-10 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <p className="sr-only">Placeholder customer wordmarks: {wordmarks.join(", ")}.</p>
      {/* Two copies of the row make a seamless loop; pauses on hover; static under reduced motion. */}
      <ul aria-hidden className="flex w-max animate-marquee py-2 group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
        {row(false)}
        {row(true)}
      </ul>
    </div>
  );
}

function TestimonialCard({ t, className }: { t: Testimonial; className?: string }) {
  return (
    <figure className={cn("rounded-card border border-border bg-card p-5 shadow-soft", className)}>
      <Quote aria-hidden className="h-5 w-5 text-copper-400" />
      <blockquote className="mt-2 text-[15px] leading-relaxed text-foreground">“{t.quote}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-copper-gradient text-sm font-bold text-white">
          {t.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{t.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {t.role}, {t.company}
          </span>
        </span>
      </figcaption>
      <p className="mt-3 inline-flex rounded-full bg-copper-500/10 px-2.5 py-1 text-xs font-semibold text-copper-700 dark:text-copper-300">{t.metric}*</p>
    </figure>
  );
}

function TestimonialsGrid() {
  return (
    <div className="mt-12 hidden gap-4 md:block md:columns-2 lg:columns-3">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
          className="mb-4 break-inside-avoid"
        >
          <TestimonialCard t={t} />
        </motion.div>
      ))}
    </div>
  );
}

function TestimonialsCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.index))),
      { root: track, threshold: 0.6 },
    );
    track.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const card = track?.children[i] as HTMLElement | undefined;
    if (track && card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  return (
    <div className="mt-10 md:hidden">
      <ul
        ref={trackRef}
        aria-label="Testimonials, swipe for more"
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((t, i) => (
          <li key={t.id} data-index={i} className="w-[86%] shrink-0 snap-center">
            <TestimonialCard t={t} className="h-full" />
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-center gap-1" role="group" aria-label="Choose testimonial">
        {testimonials.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show testimonial ${i + 1} of ${testimonials.length}`}
            aria-current={active === i ? "true" : undefined}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span className={cn("h-2 rounded-full transition-all", active === i ? "w-5 bg-copper-600 dark:bg-copper-500" : "w-2 bg-border")} />
          </button>
        ))}
      </div>
    </div>
  );
}

function CaseStudyCard() {
  return (
    <article aria-labelledby="case-study-title" className="mt-12 overflow-hidden rounded-2xl border border-border bg-card shadow-card lg:grid lg:grid-cols-[1fr_1.2fr]">
      <div className="dark relative bg-ink-800 p-6 text-cream sm:p-8">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(245_138_75/0.35),transparent_55%)]" />
        <p className="eyebrow relative">Case study · {caseStudy.company}</p>
        <h3 id="case-study-title" className="relative mt-3 text-2xl font-light leading-tight">
          {caseStudy.title}
        </h3>
        <a href="#" className="relative mt-6 inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-copper-300 underline-offset-4 hover:underline">
          Read case study <ArrowRight aria-hidden className="h-4 w-4" />
        </a>
      </div>
      <div className="p-6 sm:p-8">
      <dl className="grid gap-5">
        {caseStudy.metrics.map((m) => {
          const max = Math.max(m.beforeValue, m.afterValue);
          return (
            <div key={m.label}>
              <dt className="text-sm font-semibold text-foreground">{m.label}</dt>
              <dd className="mt-2 space-y-1.5">
                {[
                  { k: "Before", v: m.before, value: m.beforeValue, tone: "bg-[#9AA6AD] dark:bg-[#5E6E76]" },
                  { k: "After", v: m.after, value: m.afterValue, tone: "bg-[#C4501F] dark:bg-[#F58A4B]" },
                ].map((row) => (
                  <div key={row.k} className="flex items-center gap-3 text-xs">
                    <span className="w-12 shrink-0 text-muted-foreground">{row.k}</span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                      <motion.span
                        className={cn("block h-full rounded-full", row.tone)}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(3, (row.value / max) * 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </span>
                    <span className="w-14 shrink-0 text-right font-semibold tabular-nums text-foreground">{row.v}</span>
                  </div>
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
        <p className="mt-5 text-xs text-muted-foreground">*Illustrative placeholder results, not a real client.</p>
      </div>
    </article>
  );
}
