import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/sdk/browser",
  testMatch: ["browser.spec.ts", "browser-helpers.spec.ts", "browser-hosts.spec.ts", "dedicated-worker.spec.ts"],
  timeout: 60_000,
  use: { browserName: "chromium", headless: true, baseURL: "http://127.0.0.1:4179", trace: "retain-on-failure" },
  webServer: { command: "pnpm vite --config tests/sdk/app/vite.config.ts --host 127.0.0.1", cwd: process.cwd(), port: 4179 },
});
