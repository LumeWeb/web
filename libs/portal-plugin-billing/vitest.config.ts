import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import nodePolyfills from "@rolldown/plugin-node-polyfills";

const pnpmDir = path.resolve(__dirname, "../../node_modules/.pnpm");
const papaparseEntry = fs.readdirSync(pnpmDir).find((e) => e.startsWith("papaparse@"));
const papaparsePath = papaparseEntry
  ? path.resolve(pnpmDir, papaparseEntry, "node_modules/papaparse/papaparse.js")
  : require.resolve("papaparse");

export default defineConfig({
  plugins: [react({ jsxRuntime: "automatic" }) as any, nodePolyfills({ include: ["events", "stream", "string_decoder", "util", "process"] })],
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@lumeweb/portal-framework-auth", replacement: path.resolve(__dirname, "../portal-framework-auth/dist/esm/index.js") },
      { find: "@lumeweb/analytics", replacement: path.resolve(__dirname, "../analytics/dist/esm/index.js") },
      {
        find: "papaparse",
        replacement: papaparsePath,
      },
    ],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "papaparse"],
  },
  test: {
    projects: [
      {
        resolve: {
          alias: [
            { find: "@", replacement: path.resolve(__dirname, "./src") },
            { find: "@lumeweb/portal-framework-auth", replacement: path.resolve(__dirname, "../portal-framework-auth/dist/esm/index.js") },
            { find: "@lumeweb/analytics", replacement: path.resolve(__dirname, "../analytics/dist/esm/index.js") },
            {
              find: "papaparse",
              replacement: papaparsePath,
            },
          ],
        },
        test: {
          name: "unit",
          include: ["src/**/__tests__/types/**/*.test.ts", "src/**/__tests__/utils/**/*.test.{ts,tsx}"],
          environment: "happy-dom",
        },
      },
      {
        resolve: {
          alias: [
            { find: "@", replacement: path.resolve(__dirname, "./src") },
            { find: "@lumeweb/portal-framework-auth", replacement: path.resolve(__dirname, "../portal-framework-auth/dist/esm/index.js") },
            { find: "@lumeweb/analytics", replacement: path.resolve(__dirname, "../analytics/dist/esm/index.js") },
            {
              find: "papaparse",
              replacement: papaparsePath,
            },
          ],
        },
        test: {
          setupFiles: ["./vitest-setup.ts"],
          name: "browser",
          include: ["src/**/__tests__/hooks/**/*.test.{ts,tsx}", "src/**/__tests__/components/**/*.test.{ts,tsx}", "src/**/__tests__/context/**/*.test.{ts,tsx}"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            headless: true,
          },
        },
      },
      {
        plugins: [nodePolyfills({ include: ["events", "stream", "string_decoder", "util", "process"] })],
        resolve: {
          alias: [
            { find: "@", replacement: path.resolve(__dirname, "./src") },
            { find: "@lumeweb/portal-framework-auth", replacement: path.resolve(__dirname, "../portal-framework-auth/dist/esm/index.js") },
            { find: "@lumeweb/analytics", replacement: path.resolve(__dirname, "../analytics/dist/esm/index.js") },
            {
              find: "papaparse",
              replacement: papaparsePath,
            },
          ],
        },
        test: {
          name: "e2e",
          include: ["src/__tests__/e2e/**/*.browser.test.{ts,tsx}"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            headless: true,
          },
          setupFiles: ["./src/__tests__/e2e/setup.tsx"],
        },
      },
    ],
  },
});
