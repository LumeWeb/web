import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react() as any],
  test: {
    browser: {
      enabled: true,
      headless: true,
      screenshotFailures: false,
      // at least one instance is required
      instances: [{ browser: "chromium" }],
      provider: "playwright",
    },
  },
});
