import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [react({ jsxRuntime: "automatic" }) as any],
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@lib", replacement: path.resolve(__dirname, "./src-lib") },
    ],
  },
  test: {
    projects: [
      {
        resolve: {
          alias: [
            { find: "@", replacement: path.resolve(__dirname, "./src") },
            { find: "@lib", replacement: path.resolve(__dirname, "./src-lib") },
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
            { find: "@lib", replacement: path.resolve(__dirname, "./src-lib") },
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
    ],
  },
});
