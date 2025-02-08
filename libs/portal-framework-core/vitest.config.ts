import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react() as any],
  test: {
    workspace: [
      {
        // Configuration block 1: Happy DOM tests
        test: {
          // The 'test' property within a workspace item is an object
          environment: "happy-dom",
          exclude: ["src/**/*.browser.spec.{ts,tsx}"], // Exclude files specifically for browser tests
          include: ["src/**/*.spec.{ts,tsx}"], // Include .spec.ts and .spec.tsx files
          name: "happy-dom-tests", // Recommended to give inline projects a name
          setupFiles: ["@testing-library/jest-dom/vitest"], // Setup for DOM environments
        },
      },
      {
        // Configuration block 2: Browser tests
        test: {
          // The 'test' property within a workspace item is an object
          browser: {
            enabled: true,
            headless: true,
            // at least one instance is required
            instances: [{ browser: "chromium" }],
            provider: "playwright",
            screenshotFailures: false,
          },
          environment: "browser",
          include: ["src/**/*.browser.spec.{ts,tsx}"], // Include only .browser.spec.tsx files
          name: "browser-tests", // Recommended to give inline projects a name
        },
      },
    ],
  },
});
