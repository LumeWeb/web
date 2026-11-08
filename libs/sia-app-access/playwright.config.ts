/** Playwright starts the fixture server while Sia fixtures own transport and run cleanup. */
import { defineConfig } from "@playwright/test";
export default defineConfig({
  fullyParallel: false,
  outputDir: "node_modules/.cache/playwright-results",
  testDir: "./tests/browser",
  use: { baseURL: "http://127.0.0.1:4173", browserName: "chromium" },
  webServer: {
    command:
      "./node_modules/.bin/vite --host 127.0.0.1 --port 4173 --strictPort",
    reuseExistingServer: false,
    url: "http://127.0.0.1:4173/tests/browser/fixture.html",
  },
});
