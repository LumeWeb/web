import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react() as any],
  test: {
    projects: [
      {
        // Configuration block 1: Happy DOM tests
        test: {
          environment: "happy-dom",
          exclude: ["src/**/*.browser.spec.{ts,tsx}"],
          include: ["src/**/*.spec.{ts,tsx}"],
          name: "happy-dom-tests",
          setupFiles: ["@testing-library/jest-dom/vitest"],
        },
      },
      {
        // Configuration block 2: Browser tests
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: "playwright",
            screenshotFailures: false,
          },
          environment: "browser",
          include: ["src/**/*.browser.spec.{ts,tsx}"],
          name: "browser-tests",
        },
      },
    ],
  },
});
