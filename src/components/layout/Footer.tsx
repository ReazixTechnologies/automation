"use client";

import { ArrowRight, AtSign, Briefcase, Camera, Check, Phone, PlayCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/ui/Logo";
import { brand, sectionIds } from "@/data/brand";
import { openCookieSettings } from "@/lib/consent";

// TODO(launch): point these at real pages (see LAUNCH_CHECKLIST.md).
const columns = [
  {
    title: "Studio",
    links: [
      { label: "Live AI Demo", href: `#${sectionIds.liveDemo}` },
      { label: "Team Inbox", href: `#${sectionIds.dashboard}` },
      { label: "Pricing", href: `#${sectionIds.pricing}` },
      { label: "Integrations", href: `#${sectionIds.integrations}` },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "For Developers", href: `#${sectionIds.liveDemo}` },
      { label: "For Brokers", href: `#${sectionIds.liveDemo}` },
      { label: "For Channel Partners", href: `#${sectionIds.liveDemo}` },
      { label: "ROI Calculator", href: `#${sectionIds.roi}` },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: `#${sectionIds.faq}` },
      { label: "Case Studies", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Help Centre", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Reazix", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: `#${sectionIds.finalCta}` },
      { label: "Partners", href: "#" },
    ],
  },
];

// Generic icons only (no brand logos). TODO(launch): add real profile URLs.
const socials = [
  { label: "LinkedIn (placeholder)", Icon: Briefcase },
  { label: "Instagram (placeholder)", Icon: Camera },
  { label: "YouTube (placeholder)", Icon: PlayCircle },
  { label: "X / Twitter (placeholder)", Icon: AtSign },
];

export function Footer() {
  return (
    <footer className="relative bg-muted/60">
      <div aria-hidden className="glow-divider absolute inset-x-0 top-0" />
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <a href={`#${sectionIds.hero}`} className="inline-flex rounded-md" aria-label={`${brand.name} home`}>
              <Logo height={64} />
            </a>
            <p className="mt-4 max-w-xs font-display text-lg font-light text-foreground">{brand.tagline}</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              A digital product studio building WhatsApp &amp; Instagram AI concierges for real estate.
            </p>
            <a href={brand.contact.phoneHref} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-copper-700 underline-offset-4 hover:underline dark:text-copper-300">
              <Phone aria-hidden className="h-4 w-4" />
              Strategy call: {brand.contact.phoneDisplay}
            </a>
            <Newsletter />
            <ul className="mt-5 flex gap-2" aria-label="Social media">
              {socials.map(({ label, Icon }) => (
                <li key={label}>
                  <a href="#" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground">
                    <Icon aria-hidden className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="eyebrow">{col.title}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="rounded text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.fullName}. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper-500 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-copper-500" />
            </span>
            Systems operational
          </p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <li>
              <a href="#" className="hover:text-foreground">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Terms
              </a>
            </li>
            <li>
              <button type="button" onClick={openCookieSettings} className="hover:text-foreground">
                Cookie settings
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function Newsletter() {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email");
      return;
    }
    // TODO(launch): send to the newsletter provider.
    setError(null);
    setDone(true);
  };

  if (done) {
    return (
      <p role="status" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-copper-700 dark:text-copper-300">
        <Check aria-hidden className="h-4 w-4" /> Subscribed. Watch your inbox for monthly playbooks.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-5 max-w-xs">
      <label htmlFor="newsletter-email" className="text-sm font-semibold text-foreground">
        Real estate automation playbooks, monthly
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "newsletter-error" : undefined}
          placeholder="you@company.com"
          className="min-w-0 flex-1 rounded-full border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <button type="submit" aria-label="Subscribe" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copper-700 text-white hover:bg-copper-600 dark:bg-copper-500 dark:text-ink">
          <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <p id="newsletter-error" className="mt-1 text-xs font-medium text-[#B42318] dark:text-[#FF8A80]">
          {error}
        </p>
      )}
    </form>
  );
}
