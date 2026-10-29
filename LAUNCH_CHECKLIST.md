# Launch checklist

Everything below is a placeholder or stub that must be replaced or confirmed before going live.
Search the code for `TODO(launch)` to find each spot.

## Content & legal
- [ ] **Brand**: Reazix brand applied (BRAND.md). Logo master: `public/brand/reazix-logo.png`. If the logo changes, re-run `node scripts/generate-brand-assets.mjs`.
- [ ] **Dashboard mock URL** `app.reazix.com` (`DashboardShell.tsx`) is a placeholder. Confirm or change it.
- [ ] **Testimonials, wordmarks, case study**: all fictional (`src/data/testimonials.ts`). Replace with real, **permissioned** client quotes, logos and metrics, or remove the section.
- [ ] **Compliance badges** (`complianceBadges` in `src/data/testimonials.ts`): verify each claim before showing it. In particular:
  - "End-to-End Encrypted": WhatsApp Cloud API messages are decrypted on Meta's servers for the business, so this needs legal review.
  - "GDPR & DPDP Ready" and "99.9% Uptime": need policies, a DPA and an SLA to back them.
- [ ] **Metrics marked illustrative** (hero stats, testimonial chips): replace with real data or keep the "illustrative" labels.
- [x] **Pricing** (`src/data/pricing.ts`): WhatsApp / Instagram / Combo monthly plans and terms taken from `Reazix_Technologies_Automation_Pricing.pdf` (INR only).
- [ ] **Phone numbers**: the site uses **+91 82755 29298** for strategy calls (`brand.contact`). The pricing PDF lists 9518573085. Confirm which number customers should see.
- [ ] **Company name**: the site says "Reazix Digital Product Studio"; the pricing PDF says "Reazix Technologies". Pick one for legal/footer text.
- [ ] **FAQ answers** (`src/data/faq.ts`): legal/compliance review, especially ban risk, data privacy and Meta charges.
- [ ] **Integrations list** (`src/data/integrations.ts`): show only integrations that are live in the product.
- [ ] **Legal pages**: Privacy, Terms, Cookie policy (footer, cookie banner and lead form link to `#`).
- [ ] **Footer links**: case studies, blog, help centre, about, careers, partners and the social profile URLs.
- [ ] **Demo project data** (`src/data/projectKnowledge.ts`, `dashboardDemo.ts`): fictional "Skyline Heights" / "Azure Bay". Keep them clearly labelled as demo, or swap in a real, approved sample project.

## Integrations & keys
- [ ] `ANTHROPIC_API_KEY`: without it, the live demo runs in offline (keyword) mode.
- [ ] **Demo-chat leads**: the site's form was replaced by a direct call. `/api/lead` now only receives the in-chat demo leads and just logs them. Forward them to the CRM / email (`src/app/api/lead/route.ts`).
- [ ] **Newsletter signup**: the footer form only shows a success message. Connect a provider.
- [ ] `NEXT_PUBLIC_GA_ID`: the analytics measurement ID. Analytics loads only after cookie consent.
- [ ] **Rate limiting**: in-memory per server instance (`src/lib/rateLimit.ts`). On Vercel (serverless, many instances), move it to a shared store such as Upstash Redis.

## Standalone demo (/demo)
- [ ] `/demo/*` pages are `noindex` on purpose (share links, not search pages). Remove `robots` in `src/app/(demo)/layout.tsx` if you want them indexed.
- [ ] Per-client links: add projects to `src/data/projects.ts` and `getSystemPrompt` in `src/lib/ai/systemPrompt.ts`, then share `/demo/whatsapp?project=<id>`.
- [ ] Demo leads (`source: "demo-chat"`) reach `/api/lead` but are only logged. Forward them to the CRM together with the main form.
- [ ] Decide on `WELCOME_DELAY_MS` (`src/components/demo/config.ts`): a typing delay feels real but sets LCP; `0` makes the greeting instant.

## Domain & SEO
- [ ] `NEXT_PUBLIC_SITE_URL`: the production domain (defaults to the placeholder `https://reazix.com`; used for the canonical URL, OG/Twitter images, sitemap, robots and JSON-LD).
- [ ] Check the generated OG image at `/opengraph-image` with the final brand name and copy.
- [ ] Submit `/sitemap.xml` in Google Search Console.

## Before each release
- [ ] `npm run lint && npm run typecheck && npm test`
- [ ] `npm run build && npm run e2e` (Playwright smoke tests and axe accessibility scan)
- [ ] Lighthouse mobile on the production URL (target 90+ in every category)
