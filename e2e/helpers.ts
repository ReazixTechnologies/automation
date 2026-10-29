import type { Page } from "@playwright/test";

/** Pretend consent was already decided so the banner doesn't cover the page. */
export async function skipCookieBanner(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("concierra-consent-v1", JSON.stringify({ analytics: false }));
    } catch {}
  });
}

/** Own rate-limit bucket per test so reruns don't trip the chat API limiter. */
export async function uniqueClientIp(page: Page) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `10.200.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` });
}

/** Scroll the whole page in steps so lazy sections mount. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}
