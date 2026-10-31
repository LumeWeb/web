import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/sdk/browser",
  testMatch: "loopback.spec.ts",
  timeout: 60_000,
  use: { browserName: "chromium", headless: true, baseURL: "http://127.0.0.1:4181" },
  webServer: { command: "pnpm vite --config tests/sdk/loopback/vite.config.ts --host 127.0.0.1", cwd: process.cwd(), port: 4181, reuseExistingServer: true },
  projects: [{ name: "loopback" }],
});
