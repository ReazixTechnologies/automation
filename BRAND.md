# Reazix brand guide

**Reazix — Digital Product Studio.** We design, build and manage WhatsApp + Instagram automation and AI chat concierges for real estate developers, brokers and channel partners. We are a **done-for-you studio**, not a self-serve SaaS.

Mood: **dark, premium, cinematic, with glowing copper accents**, taken from the logo's light-painted "R".

Implementation lives in `src/styles/brand.css` (CSS variables + utilities) and `tailwind.config.ts` (tokens). Use the tokens. Don't hard-code new colors.

---

## Logo

| Asset | Path | Use |
|---|---|---|
| Original (master) | `public/brand/reazix-logo.png` | Source of truth. Never edit. |
| Lockup (padding trimmed) | `public/brand/reazix-logo-lockup.png` | Light theme (on a dark plate), OG image |
| Lockup for dark surfaces | `public/brand/reazix-logo-lockup-dark.png` | Navbar and footer in dark theme |
| "R" mark icons | `public/brand/favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` (180), `icon-512.png` | Favicon, app icon, small marks |

All derived files come from `node scripts/generate-brand-assets.mjs`. The script only crops empty black padding and resizes; for the icons, the neighbouring wordmark is covered with the logo's own black.

**Rules**
- Use the image as provided. **Never** redraw, recolour, stretch, add effects to or re-typeset the logo.
- Always render it through `<Logo />` (`src/components/ui/Logo.tsx`):
  - **Navbar:** height **32–36px** (currently 34).
  - **Footer:** about 64px.
- The artwork sits on opaque black:
  - **Dark theme:** use `reazix-logo-lockup-dark.png`. Its black is converted to transparency (alpha = brightest channel, colour un-premultiplied), so over black it is pixel-identical to the original.
  - **Light theme:** it sits on a small near-black plate.
- Keep clear space of at least the height of the "R" mark's top curl around the lockup.
- Minimum size: 28px tall for the lockup, 16px for the "R" mark.

## Color

| Token | Value | Use |
|---|---|---|
| `--bg-base` / `bg-background` (dark) | `#070707` | Page background |
| `--bg-elevated` / `bg-muted` (dark) | `#111111` | Alternating section bands |
| `--bg-card` / `bg-card` (dark) | `#161412` | Cards, panels (warm dark) |
| `--border-subtle` | `rgba(255,255,255,0.08)` (≈ `#211F1D` opaque) | Hairlines |
| `copper-300` | `#FFB27A` | **Small text on dark**, highlights |
| `copper-400` | `#F58A4B` | Small text and icons on dark |
| `copper-500` | `#E8692E` | **Primary** accent, fills, focus |
| `copper-600` | `#C4501F` | Deep stop, chart fills on light |
| `copper-700` | `#8F3714` | **Copper text on light backgrounds** |
| `cream` / `text-foreground` (dark) | `#F3E9DD` | Headings and primary text |
| `--text-muted` / `text-muted-foreground` (dark) | `#A39A90` | Secondary text |

**Light theme (optional)**: background `#F7F1EA`, cards `#FFFBF6`, text ink `#14100C`, muted text `#6B6159`, the same copper. Copper text uses `copper-700` in light mode.

**Signature gradient:** `linear-gradient(135deg, #FFB27A, #E8692E 50%, #C4501F)`. Use `bg-copper-gradient` or `.text-gradient-copper`. Filled buttons use the lighter `bg-copper-button` so their dark label keeps AA contrast.

**Signature glow:** `0 0 24px rgba(232,105,46,0.35)`. Use `shadow-glow-copper`, `.glow-copper-text`, or `shadow-glow-copper-strong` on hover.

**Contrast (WCAG AA, enforced by the axe tests)**
- Cream on black: about 16:1.
- Small copper text on dark: `copper-300` or `copper-400` only.
- Small copper text on light: `copper-700` only.
- Never put white text on `copper-500` (3.3:1). Use ink text on copper fills.

**Copper is the only brand accent.** WhatsApp green and Instagram colors are **only** allowed:
1. Inside phone mockups. Screens use `.force-light` and always show the real light WhatsApp skin (green header, beige wallpaper) or the Instagram skin.
2. As channel identity: the WhatsApp/Instagram badges and the channel toggle.

Phone frames get the thin copper edge glow (`shadow-phone`).

## Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display / headings | **Sora** (`font-display`) | **300** for large headlines, **600** for emphasis words | `tracking-tight` |
| Body | **Inter** (`font-sans`) | 400–600 | |
| Eyebrows, labels, badges, nav items | Inter | 500 | `.eyebrow` / `uppercase tracking-eyebrow` (0.25em), small (11–12px). Echoes "DIGITAL PRODUCT STUDIO" |

- **One key word or phrase per headline** gets the copper gradient. Use `SectionHeading highlight="…"` or `<HighlightedTitle>`.
- Eyebrow text is copper: `copper-300` on dark, `copper-700` on light.

## Buttons

| Variant | Look | Use |
|---|---|---|
| `primary` | Copper gradient (`bg-copper-button`), ink label, soft glow that intensifies on hover | **One per view**: "Call for a Free Strategy Call" (dials +91 82755 29298) |
| `outline` (secondary) | Transparent, 1px copper border, copper wash and glow on hover | "See It Live", "Try the AI Demo", "Book a Demo" |
| `secondary` / `ghost` | Neutral | Utility actions |

Pill-shaped (`rounded-full`). Labels are sentence or title case, not uppercase.

**CTA vocabulary**
- **Primary:** "Call for a Free Strategy Call". It dials the strategy-call number directly; there is no booking form.
- **Secondary:** "See It Live" or "Try the AI Demo".
- "Book a Demo" is fine where a demo fits.
- **Never** "Free Trial" or "Start Free". We are a studio, not self-serve.

## Motion

- **Light stroke** (`<LightStroke />`, `<LightStrokeFrame />`): a thin glowing copper line that draws itself once via SVG `pathLength`. It runs under section headings and around the hero phone.
- **Glow dividers** (`<GlowDivider />`, `.glow-divider`): thin copper lines between major sections.
- **Atmosphere:**
  - very subtle copper radial glows behind key sections (≤ 0.3 opacity);
  - faint film grain on `body` (built into `brand.css`).
- **Tempo:** slow and elegant. Use ease-in-out curves, 0.4–2.4s, and play once rather than loop.
- **Property:** animate `transform` and `opacity` only (plus `pathLength` for strokes). Pause off-screen loops with `usePauseOffscreen`.
- **`prefers-reduced-motion`:** strokes render already drawn, scripts show their final state, and there are no floats, marquees or count-ups.

## Voice & tone

**Confident, premium, concise. No hype, no exaggerated claims.**
- Speak as a studio: "We design, build and run…", "Our team…".
- Lead with outcomes buyers and sales teams feel: instant replies, qualified leads, booked site visits.
- Keep sentences short and avoid exclamation marks in brand copy. The demo concierge persona may use them sparingly.
- **Numbers:**
  - Only use numbers we can stand behind.
  - Label every illustrative metric (asterisk plus footnote).
  - Never promise results or guarantees.
- Avoid "revolutionary", "best-in-class", "10×" and similar.
- The demo property ("Skyline Heights", "Azure Bay Residences") is **fictional**. Always present it as "Demo built by Reazix".
- Tagline: **"Digital products that convert."**
