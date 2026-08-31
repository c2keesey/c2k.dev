import { defineConfig, devices } from "@playwright/test";

const standalone = process.env.PLAYWRIGHT_STANDALONE === "1";
const port = standalone ? 4383 : 4321;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "retain-on-failure" },
  webServer: {
    command: standalone
      ? `C2K_ENV=production NODE_ENV=production HOSTNAME=127.0.0.1 PORT=${port} bun .next/standalone/server.js`
      : "C2K_ENV=production bun run dev",
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } },
  ],
});
