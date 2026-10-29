import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

/**
 * Smoke + accessibility tests against a production build. Uses the locally
 * installed Chrome (channel "chrome"), so no browser download is needed.
 * No ANTHROPIC_API_KEY is set, so the chatbot runs in offline mode.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: {
    // Build with NEXT_DIST_DIR=.next-e2e first (see the "e2e" script) so a running dev server can't clobber it.
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { ANTHROPIC_API_KEY: "", NEXT_DIST_DIR: ".next-e2e" },
  },
});
