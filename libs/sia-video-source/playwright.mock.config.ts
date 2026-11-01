/** Browser playback acceptance uses fixture payloads without a Sia service or account. */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  expect: { timeout: 10_000 },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
  ],
  testDir: "tests/playback",
  testMatch: "*.spec.ts",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:4193", headless: true },
  webServer: {
    command: "pnpm run build && vite --config tests/playback/vite.config.ts",
    port: 4193,
    reuseExistingServer: false,
    timeout: 60_000,
  },
  workers: 1,
});
