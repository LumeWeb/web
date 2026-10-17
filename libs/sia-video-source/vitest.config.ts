import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";

const IS_BROWSER = process.env.SIA_TEST_ENV !== "node";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    ...(IS_BROWSER
      ? {
          projects: [
            {
              extends: true,
              test: {
                name: "declarations",
                environment: "node",
                include: ["src/__tests__/**/*.declarations.spec.ts"],
                hookTimeout: 30000,
                testTimeout: 30000,
              },
            },
            {
              extends: true,
              test: {
                name: "playback",
                include: ["src/__tests__/**/*.spec.ts"],
                exclude: ["src/__tests__/**/*.declarations.spec.ts"],
                browser: {
                  enabled: true,
                  provider: playwright(),
                  // Firefox exercises main-thread MSE because it cannot
                  // construct a MediaSource in a dedicated worker.
                  instances: [
                    { browser: "chromium" as const, headless: true },
                    { browser: "firefox" as const, headless: true },
                  ],
                },
                hookTimeout: 60000,
                testTimeout: 60000,
              },
            },
          ],
        }
      : {
          environment: "node",
          include: ["src/__tests__/**/*.spec.ts"],
          hookTimeout: 30000,
          testTimeout: 30000,
        }),
  },
} as any);
