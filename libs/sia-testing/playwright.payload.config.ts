import { readFileSync } from "node:fs";
import { defineConfig } from "@playwright/test";
import { readHostServiceConfig } from "./src/e2e/internal/config.js";

readHostServiceConfig();
const spkiFile = process.env.SIA_TEST_HOST_SPKI_FILE;
if (!spkiFile)
  throw new Error(
    "SIA_TEST_HOST_SPKI_FILE must contain the live host public-key hashes",
  );
const spki = readFileSync(spkiFile, "utf8").trim();
if (!spki)
  throw new Error(
    "SIA_TEST_HOST_SPKI_FILE must contain the live host public-key hashes",
  );

export default defineConfig({
  projects: [{ name: "real-browser" }],
  testDir: "./tests/e2e/browser",
  testMatch: [
    "payload.spec.ts",
    "token-observations.spec.ts",
    "reference.spec.ts",
    "accounting.spec.ts",
    "owner-isolation.spec.ts",
  ],
  timeout: 15 * 60_000,
  use: {
    baseURL: "http://127.0.0.1:4179",
    browserName: "chromium",
    headless: true,
    launchOptions: {
      args: [
        `--ignore-certificate-errors-spki-list=${spki}`,
        "--webtransport-developer-mode",
        "--host-resolver-rules=MAP localhost 127.0.0.1",
      ],
    },
  },
  webServer: {
    command:
      "pnpm vite --config tests/e2e/browser/app/vite.config.ts --host 127.0.0.1",
    cwd: process.cwd(),
    port: 4179,
  },
  workers: 1,
});
