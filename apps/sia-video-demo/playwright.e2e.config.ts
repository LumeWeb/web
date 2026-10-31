/** Collection is offline; live execution requires the guarded runner and host SPKI file. */
import { readFileSync } from "node:fs";
import { defineConfig } from "@playwright/test";
const spkiFile = process.env.SIA_TEST_HOST_SPKI_FILE;
const spki = spkiFile ? readFileSync(spkiFile, "utf8").trim() : "";
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "consumer.spec.ts",
  timeout: 15 * 60_000,
  use: {
    baseURL: "http://127.0.0.1:4193",
    browserName: "chromium",
    headless: true,
    launchOptions: {
      args: spki
        ? [
            `--ignore-certificate-errors-spki-list=${spki}`,
            "--webtransport-developer-mode",
            "--host-resolver-rules=MAP localhost 127.0.0.1",
          ]
        : [],
    },
  },
  webServer: {
    command: "vite --config tests/e2e/vite.config.ts",
    port: 4193,
    reuseExistingServer: false,
  },
  workers: 1,
});
