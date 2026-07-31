import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";

const IS_BROWSER = process.env.LBRY_TEST_ENV !== "node";

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
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: "chromium" as const, headless: true },
            ],
          },
          include: ["tests/**/*.test.ts", "!tests/rollup-plugin.test.ts", "!tests/live-*.test.ts"],
          hookTimeout: 60000,
          testTimeout: 60000,
          setupFiles: ["./tests/setup.ts"],
        }
      : {
          include: ["tests/**/*.test.ts", "!tests/live-*.test.ts"],
          environment: "node",
          hookTimeout: 30000,
          testTimeout: 30000,
          setupFiles: ["./tests/setup.node.ts"],
        }),
  },
} as any);
