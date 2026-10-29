import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { scrollThrough, skipCookieBanner } from "./helpers";

for (const scheme of ["light", "dark"] as const) {
  test(`no serious axe violations (${scheme})`, async ({ page }) => {
    await skipCookieBanner(page);
    // Dark is the default theme; light is the visitor's saved choice.
    await page.addInitScript((theme) => {
      try {
        localStorage.setItem("theme", theme);
      } catch {}
    }, scheme);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await scrollThrough(page);
    await page.waitForTimeout(800);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    const report = serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} nodes\n  ${v.nodes.slice(0, 4).map((n) => n.target.join(" ")).join("\n  ")}`).join("\n");
    expect(serious, report).toEqual([]);
  });
}
