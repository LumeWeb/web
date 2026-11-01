/** Runs guarded real-service metadata checks without host certificate exceptions. */
import { defineConfig } from "@playwright/test";
import { readHostServiceConfig } from "./src/e2e/internal/config.js";

readHostServiceConfig();
export default defineConfig({
  testDir: "./tests/e2e/browser",
  testMatch: ["browser-auth.spec.ts"],
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4182",
    browserName: "chromium",
    headless: true,
  },
  webServer: {
    command:
      "pnpm vite --config tests/e2e/browser/app/vite.config.ts --host 127.0.0.1 --port 4182",
    cwd: process.cwd(),
    port: 4182,
  },
});
