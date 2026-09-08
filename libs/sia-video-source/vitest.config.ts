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
    include: ["src/__tests__/**/*.spec.ts"],
    ...(IS_BROWSER
      ? {
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: "chromium" as const, headless: true },
            ],
          },
          hookTimeout: 60000,
          testTimeout: 60000,
        }
      : {
          environment: "node",
          hookTimeout: 30000,
          testTimeout: 30000,
        }),
  },
} as any);
