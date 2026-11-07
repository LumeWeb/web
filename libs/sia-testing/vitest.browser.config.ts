/** Browser providers execute the public portable fixture in each supported engine. */
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { FailureMessages } from "./tests/harness/lifecycle.config.js";
const lifecycle = process.env.SIA_LIFECYCLE_CASE;
export default defineConfig({
  define: { "process.env.SIA_LIFECYCLE_CASE": JSON.stringify(lifecycle ?? "") },
  test: {
  include: [lifecycle ? "tests/vitest-browser/lifecycle.case.ts" : "tests/vitest-browser/*.browser.ts"],
  reporters: ["default", "json", new FailureMessages()],
  browser: {
    enabled: true, headless: true, provider: playwright(),
    instances: [{ browser: "chromium" }, { browser: "firefox" }],
  },
} });
