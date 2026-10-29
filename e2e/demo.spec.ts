import { expect, test, type Page } from "@playwright/test";
import { uniqueClientIp } from "./helpers";

test.beforeEach(async ({ page }) => {
  await uniqueClientIp(page);
});

const log = (page: Page) => page.getByRole("log");
const waInput = (page: Page) => page.getByRole("textbox", { name: "Message" });

async function sendWa(page: Page, text: string) {
  await waInput(page).fill(text);
  await waInput(page).press("Enter");
}

test("?q= prefill sends as the first message and a reply arrives", async ({ page }) => {
  await page.goto("/demo/whatsapp?q=3%20BHK%20price");
  await expect(log(page)).toContainText("Welcome to Skyline Heights");
  await expect(log(page).getByRole("group", { name: /^You: 3 BHK price/ })).toBeVisible({ timeout: 15_000 });
  await expect(log(page)).toContainText("1.85 Cr", { timeout: 15_000 });
  // The prefill isn't resent on refresh: ?q= is removed from the URL.
  await expect(page).not.toHaveURL(/q=/);
});

test("demo pages render only the chat (no site chrome)", async ({ page }) => {
  await page.goto("/demo/whatsapp");
  await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Cookie consent" })).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Chat with our AI concierge" })).toHaveCount(0);
  await expect(page.getByText("This business uses a secure service from Meta")).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/demo.webmanifest");
});

test("conversation survives a refresh; Restart demo clears it", async ({ page }) => {
  await page.goto("/demo/whatsapp");
  await expect(log(page)).toContainText("Welcome to Skyline Heights");
  await sendWa(page, "Is it RERA approved?");
  await expect(log(page)).toContainText("DEMO-RERA", { timeout: 15_000 });
  await page.reload();
  await expect(log(page)).toContainText("DEMO-RERA");
  await page.getByRole("button", { name: "More options" }).click();
  await page.getByRole("menuitem", { name: "Restart demo" }).click();
  await expect(log(page)).not.toContainText("DEMO-RERA");
  await expect(log(page)).toContainText("Welcome to Skyline Heights");
});

test("swipe-to-reply (keyboard) and reactions (long-press / right-click)", async ({ page }) => {
  await page.goto("/demo/whatsapp");
  const welcome = log(page).getByRole("group", { name: /^Skyline Heights: 👋 Welcome/ });
  await expect(welcome).toBeVisible();
  await welcome.focus();
  await page.keyboard.press("r");
  await expect(page.getByRole("button", { name: "Cancel reply" })).toBeVisible();
  await sendWa(page, "Tell me more");
  await expect(log(page).getByRole("group", { name: /^You: Tell me more/ })).toContainText("Welcome to Skyline Heights");

  await welcome.click({ button: "right" });
  await page.getByRole("button", { name: "React 👍" }).click();
  await expect(welcome.getByLabel("Reactions: 👍")).toBeVisible();
});

test("site visit via list message, then the in-chat Reazix lead flow", async ({ page }) => {
  await page.goto("/demo/whatsapp");
  await expect(log(page)).toContainText("Welcome to Skyline Heights");
  await sendWa(page, "3 BHK price?");
  await expect(log(page)).toContainText("1.85 Cr", { timeout: 15_000 });
  await sendWa(page, "I want to book a site visit");
  await page.getByRole("button", { name: "View slots" }).click({ timeout: 15_000 });
  const sheet = page.getByRole("dialog", { name: "Available slots" });
  await sheet.getByRole("radio").first().check();
  await sheet.getByRole("button", { name: "Send" }).click();
  await expect(log(page)).toContainText("Open in Maps", { timeout: 15_000 });

  // Native offer appears after key details + a booked visit.
  await page.getByRole("button", { name: "Talk to Reazix" }).click({ timeout: 15_000 });
  await expect(log(page)).toContainText("what's your name?", { timeout: 10_000 });
  await sendWa(page, "Asha Kapoor");
  await expect(log(page)).toContainText("business or company called?", { timeout: 10_000 });
  await sendWa(page, "Kapoor Realty");
  await expect(log(page)).toContainText("phone number", { timeout: 10_000 });
  await sendWa(page, "+91 98765 43210");
  await expect(log(page)).toContainText("A Reazix specialist will reach out within one business day", { timeout: 10_000 });
  await expect(log(page).getByRole("link", { name: "Call +91 82755 29298" })).toHaveAttribute("href", "tel:+918275529298");
});

test("call icon opens the specialist sheet", async ({ page }) => {
  await page.goto("/demo/whatsapp");
  await page.getByRole("button", { name: "Voice call" }).click();
  const sheet = page.getByRole("dialog", { name: "Talk to a Reazix specialist?" });
  await expect(sheet.getByRole("button", { name: "Request a callback" })).toBeVisible();
  await sheet.getByRole("button", { name: "Cancel" }).click();
  await expect(sheet).toHaveCount(0);
});

test("Instagram: ice-breakers, reply, Seen", async ({ page }) => {
  await page.goto("/demo/instagram");
  await expect(page.getByText("1.2K followers · 48 posts")).toBeVisible();
  const breakers = page.getByRole("group", { name: "Ice breakers" });
  await breakers.getByRole("button", { name: "Is it RERA approved?" }).click({ timeout: 10_000 });
  await expect(log(page)).toContainText("DEMO-RERA", { timeout: 15_000 });
  await expect(log(page)).toContainText("Seen");
});

test("chooser links keep query params", async ({ page }) => {
  await page.goto("/demo?project=skyline-heights");
  await expect(page.getByRole("heading", { name: "Choose where you'd like to chat" })).toBeVisible();
  await expect(page.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", "/demo/whatsapp?project=skyline-heights");
  await expect(page.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", "/demo/instagram?project=skyline-heights");
});

test("mobile sizes: full-screen, no page scroll, 16px input", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile layout");
  for (const width of [375, 390, 412]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/demo/whatsapp");
    await expect(log(page)).toContainText("Welcome to Skyline Heights");
    const m = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth - innerWidth,
      pageScroll: document.documentElement.scrollHeight - innerHeight,
      inputFont: getComputedStyle(document.getElementById("wa-input")!).fontSize,
    }));
    expect(m.overflowX, `x overflow at ${width}`).toBeLessThanOrEqual(0);
    expect(m.pageScroll, `page scroll at ${width}`).toBeLessThanOrEqual(0);
    expect(m.inputFont).toBe("16px");
  }
});

test("desktop extras: QR beside the phone", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await page.goto("/demo/whatsapp");
  await expect(page.getByRole("img", { name: /QR code to open this WhatsApp demo/ })).toBeVisible();
  await expect(page.getByText("Powered by Reazix")).toBeVisible();
});
