/** Brand constants. Fictional placeholder brand; swap before launch. */

export const brand = {
  name: "Reazix",
  fullName: "Reazix Digital Product Studio",
  descriptor: "Digital Product Studio",
  tagline: "Digital products that convert.",
  logo: {
    /** The provided logo, unaltered (opaque black background). */
    original: "/brand/reazix-logo.png",
    /** Same artwork with the empty padding trimmed (scripts/generate-brand-assets.mjs). */
    lockup: "/brand/reazix-logo-lockup.png",
    /** Lockup with the black turned to transparency (identical over black) for dark surfaces. */
    lockupDark: "/brand/reazix-logo-lockup-dark.png",
    lockupSize: { width: 825, height: 412 },
    alt: "Reazix — Digital Product Studio",
  },
  colors: {
    base: "#070707",
    card: "#161412",
    copper: "#E8692E",
    copperLight: "#FFB27A",
    cream: "#F3E9DD",
  },
  /** Strategy-call line. */
  contact: {
    phoneDisplay: "+91 82755 29298",
    phoneHref: "tel:+918275529298",
  },
  cta: {
    /** Done-for-you studio: the primary action is a direct call for a free strategy call. */
    primary: { label: "Call for a Free Strategy Call", href: "tel:+918275529298" },
    demo: { label: "Book a Demo", href: "#get-started" },
    liveDemo: { label: "Try the AI Demo", href: "#live-demo" },
    seeLive: { label: "See It Live", href: "#live-demo" },
  },
} as const;

/** Section ids shared between the navbar and the sections in page.tsx. */
export const sectionIds = {
  hero: "top",
  dashboard: "dashboard",
  roi: "roi",
  liveDemo: "live-demo",
  pricing: "pricing",
  faq: "faq",
  trust: "trust",
  integrations: "integrations",
  finalCta: "get-started",
} as const;

export const navLinks = [
  { label: "Features", href: `#${sectionIds.dashboard}` },
  { label: "Live Demo", href: `#${sectionIds.liveDemo}` },
  { label: "Pricing", href: `#${sectionIds.pricing}` },
  { label: "FAQ", href: `#${sectionIds.faq}` },
] as const;
