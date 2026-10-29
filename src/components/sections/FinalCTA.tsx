"use client";

import { Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LightStroke } from "@/components/ui/LightStroke";
import { HighlightedTitle } from "@/components/ui/SectionHeading";
import { brand, sectionIds } from "@/data/brand";
import { heroContent } from "@/data/hero";

/** Closing section: a direct call for the free strategy call (no form). */
export function FinalCTA() {
  return (
    // Always the dark, cinematic treatment (both themes): near-black with copper glows.
    <section id={sectionIds.finalCta} aria-labelledby="final-cta-title" className="dark relative overflow-hidden bg-ink-900 py-16 text-cream md:py-24">
      <div aria-hidden className="glow-divider absolute inset-x-0 top-0" />
      <div aria-hidden className="absolute -right-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,rgb(232_105_46/0.28),transparent)]" />
      <div aria-hidden className="absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(196_80_31/0.22),transparent)]" />

      <div className="container relative grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-16">
        <div className="text-center lg:text-left">
          <h2 id="final-cta-title" className="text-3xl font-light leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
            <HighlightedTitle title="Your Next Buyer Is Messaging You Right Now. Let Reazix Answer." highlight="Let Reazix Answer." />
          </h2>
          <LightStroke className="mx-auto mt-5 lg:mx-0" />
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#D9CFC4] lg:mx-0">
            We design, launch and run your WhatsApp and Instagram AI concierge, so every buyer gets an instant, on-brand reply and a booked visit.
          </p>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-[#E6DCD0] lg:justify-start">
            {heroContent.trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check aria-hidden className="h-4 w-4 text-copper-400" strokeWidth={3} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-copper-500/30 bg-ink-800 p-6 text-center shadow-glow-copper sm:p-8">
          <p className="eyebrow">Free strategy call</p>
          <p className="mt-3 text-[#D9CFC4]">Talk to us directly. We&apos;ll map your lead flow and recommend the right plan.</p>
          <a
            href={brand.contact.phoneHref}
            className="mt-5 block font-display text-3xl font-semibold tracking-tight text-cream underline-offset-8 hover:underline sm:text-4xl"
            data-track="cta"
            data-track-location="final_phone_number"
          >
            {brand.contact.phoneDisplay}
          </a>
          <div className="mt-6 grid gap-3">
            <Button
              href={brand.cta.primary.href}
              size="lg"
              className="w-full"
              data-track="cta"
              data-track-location="final_strategy_call"
              leftIcon={<Phone aria-hidden className="h-5 w-5" />}
            >
              {brand.cta.primary.label}
            </Button>
            <Button href={brand.cta.seeLive.href} size="lg" variant="outline" className="w-full text-cream" data-track="cta" data-track-location="final_see_live">
              {brand.cta.seeLive.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
