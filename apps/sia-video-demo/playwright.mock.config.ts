/** Runs the actual demo UI against test-owned loopback payloads, without a Sia cluster. */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  fullyParallel: false,
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
  ],
  retries: 0,
  testDir: "./tests/playback",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4195",
    headless: true,
    serviceWorkers: "block",
    trace: "off",
  },
  webServer: {
    command: "pnpm exec vite --config tests/playback/vite.config.ts",
    reuseExistingServer: false,
    timeout: 30000,
    url: "http://127.0.0.1:4195",
  },
  workers: 1,
});
