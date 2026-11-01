/** Runs the opt-in SDK boundary check without publishing private browser diagnostics. */
import { defineConfig } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { contract } from "./tests/contract/settings.ts";

const outputDir = mkdtempSync(join(tmpdir(), "sia-video-contract-output-"));
process.once("exit", () => rmSync(outputDir, { force: true, recursive: true }));
export default defineConfig({
  globalTimeout: contract.timeoutMs,
  outputDir,
  preserveOutput: "never",
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  reporter: "dot",
  retries: 0,
  testDir: "./tests/contract",
  testMatch: "sdk.spec.ts",
  timeout: contract.timeoutMs,
  use: {
    baseURL: "http://127.0.0.1:4194",
    screenshot: "off",
    serviceWorkers: "allow",
    trace: "off",
    video: "off",
  },
  webServer: {
    command: "pnpm build && vite --config tests/contract/vite.config.ts",
    reuseExistingServer: false,
    timeout: contract.timeoutMs,
    url: "http://127.0.0.1:4194",
  },
  workers: 1,
});
