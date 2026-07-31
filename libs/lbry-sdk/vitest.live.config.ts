import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";

/**
 * Parallel vitest config for live API tests against mempool.lbry.org.
 *
 * No MSW — real network calls. No mock WASM. Only read-only endpoints.
 *
 * Uses Playwright browser (chromium) — the SDK runs in browsers, so tests
 * must too. The mnemonic is passed via process.env and made available
 * through import.meta.env via vi.stubEnv in the config (server-side, not
 * baked into the bundle).
 *
 * Usage:
 *   LBRY_TEST_MNEMONIC="..." npx vitest run --config vitest.live.config.ts
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: "chromium" as const, headless: true },
      ],
    },
    include: ["tests/live-*.test.ts"],
    setupFiles: ["./tests/setup.live.ts"],
    hookTimeout: 600000,
    testTimeout: 600000,
    // Vitest passes process.env to browser context via import.meta.env
    // This is runtime, not compile-time — no bundle exposure.
    env: {
      LBRY_TEST_MNEMONIC: process.env.LBRY_TEST_MNEMONIC ?? "",
    },
  },
} as any);
