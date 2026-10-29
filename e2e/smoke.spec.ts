import { expect, test } from "@playwright/test";
import { skipCookieBanner, uniqueClientIp } from "./helpers";

test.beforeEach(async ({ page }) => {
  await skipCookieBanner(page);
  await uniqueClientIp(page);
});

test("page loads with one H1 and SEO metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("We Build AI Concierges That Turn WhatsApp & Instagram Chats Into Site Visits");
  await expect(page).toHaveTitle(/^Reazix — WhatsApp & Instagram AI Automation for Real Estate/);
  await expect(page.getByRole("link", { name: "Reazix home" }).first()).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  for (const type of ["Organization", "Service", "FAQPage"]) expect(jsonLd).toContain(`"@type":"${type}"`);
});

test("nav links scroll to their sections", async ({ page, isMobile }) => {
  await page.goto("/");
  for (const [label, id] of [
    ["Features", "dashboard"],
    ["Live Demo", "live-demo"],
    ["Pricing", "pricing"],
    ["FAQ", "faq"],
  ] as const) {
    if (isMobile) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.getByRole("dialog", { name: "Site navigation" }).getByRole("link", { name: label }).click();
    } else {
      await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: label, exact: true }).click();
    }
    await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.05 });
  }
});

test("chatbot replies in offline mode", async ({ page }) => {
  await page.goto("/#live-demo");
  const phone = page.getByRole("figure", { name: /Live AI concierge demo/ });
  await phone.getByRole("textbox", { name: "Message the AI property concierge" }).fill("Is it RERA approved?");
  await phone.getByRole("textbox", { name: "Message the AI property concierge" }).press("Enter");
  await expect(phone.getByRole("log")).toContainText("DEMO-RERA", { timeout: 15_000 });
  await expect(page.locator("#live-demo").getByText("Offline", { exact: false }).filter({ visible: true }).first()).toBeVisible();
});

test("ROI calculator updates results", async ({ page }) => {
  await page.goto("/#roi");
  const summary = page.locator("#roi p[aria-live]");
  const before = await summary.textContent();
  const leads = page.getByRole("textbox", { name: "Monthly leads" });
  await leads.fill("4000");
  await leads.press("Enter");
  await expect(summary).not.toHaveText(before ?? "", { timeout: 5_000 });
  await expect(page.locator("#roi")).not.toContainText("NaN");
});

test("FAQ opens one answer at a time and filters", async ({ page }) => {
  await page.goto("/#faq");
  const q1 = page.getByRole("button", { name: /Will my WhatsApp number get banned/ });
  const q2 = page.getByRole("button", { name: /How long does it take to go live/ });
  await q1.click();
  await expect(q1).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("official WhatsApp Business Platform")).toBeVisible();
  await q2.click();
  await expect(q2).toHaveAttribute("aria-expanded", "true");
  await expect(q1).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("searchbox", { name: "Search questions" }).fill("languages");
  await expect(page.locator("#faq li button[aria-expanded]")).toHaveCount(1);
});

test("strategy call CTAs dial the phone number directly (no form)", async ({ page }) => {
  await page.goto("/#get-started");
  const section = page.locator("#get-started");
  await expect(section.locator("form")).toHaveCount(0);
  await expect(section.getByRole("link", { name: "+91 82755 29298" })).toHaveAttribute("href", "tel:+918275529298");
  await expect(section.getByRole("link", { name: "Call for a Free Strategy Call" })).toHaveAttribute("href", "tel:+918275529298");
  await expect(page.locator('#pricing a[href="tel:+918275529298"]').first()).toBeVisible();
});

test("no horizontal overflow at common widths", async ({ page, isMobile }) => {
  test.skip(isMobile, "widths are covered from the desktop project");
  for (const width of [360, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test("floating launcher opens the same chat (desktop)", async ({ page, isMobile }) => {
  test.skip(isMobile, "launcher is desktop-only");
  await page.goto("/#pricing");
  // The hash jump smooth-scrolls past #live-demo, where the launcher hides; let it settle.
  await expect(page.locator("#pricing")).toBeInViewport();
  await expect(page.locator("#live-demo")).not.toBeInViewport();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Chat with our AI concierge" }).click();
  const drawer = page.getByRole("dialog", { name: "Chat with the AI concierge" });
  await expect(drawer.getByRole("log")).toContainText("Welcome to Skyline Heights");
  await drawer.getByRole("button", { name: "3 BHK price?" }).click();
  await expect(drawer.getByRole("log")).toContainText("1.85 Cr", { timeout: 15_000 });
  // Shared state: without reloading, the #live-demo section shows the same conversation.
  await page.keyboard.press("Escape");
  await page.evaluate(() => document.getElementById("live-demo")?.scrollIntoView({ behavior: "instant" }));
  await expect(page.getByRole("figure", { name: /Live AI concierge demo/ }).getByRole("log")).toContainText("1.85 Cr");
});

test("asking who built the bot hands off to Reazix (offline)", async ({ page }) => {
  await page.goto("/#live-demo");
  const phone = page.getByRole("figure", { name: /Live AI concierge demo/ });
  const input = phone.getByRole("textbox", { name: "Message the AI property concierge" });
  await input.fill("Who built this? I want one for my project");
  await input.press("Enter");
  await expect(phone.getByRole("log")).toContainText("A Reazix specialist will reach out", { timeout: 15_000 });
});

test("light theme toggle persists", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Toggle light and dark theme" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("cookie banner: reject keeps analytics off and remembers the choice", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/");
  const banner = page.getByRole("region", { name: "Cookie consent" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Reject non-essential" }).click();
  await expect(banner).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("concierra-consent-v1"))).toContain('"analytics":false');
  expect(await page.evaluate(() => typeof window.gtag)).toBe("undefined");
  await page.reload();
  await expect(page.getByRole("region", { name: "Cookie consent" })).toBeHidden();
  await context.close();
});
