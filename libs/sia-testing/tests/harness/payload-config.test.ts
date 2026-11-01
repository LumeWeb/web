/** Loading payload configuration must explain missing host hashes before any browser starts. */
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { withTemporaryDirectory } from "../../scripts/workspace.mjs";

const message =
  "SIA_TEST_HOST_SPKI_FILE must contain the live host public-key hashes";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("SIA_TEST_ALLOW_MUTATION", "1");
  vi.stubEnv("SIA_TEST_ADMIN_URL", "http://127.0.0.1:19001");
  vi.stubEnv("SIA_TEST_INDEXD_URL", "http://127.0.0.1:19002");
  vi.stubEnv("SIA_TEST_ADMIN_PASSWORD", "fixture-only");
});
afterEach(() => vi.unstubAllEnvs());

it.each([undefined, ""])(
  "explains a host-hash file setting of %s",
  async (value) => {
    vi.stubEnv("SIA_TEST_HOST_SPKI_FILE", value);
    await expect(import("../../playwright.payload.config.js")).rejects.toThrow(
      message,
    );
  },
);

it("explains an empty host-hash file", async () => {
  await withTemporaryDirectory("sia-payload-config-", async (directory) => {
    const path = join(directory, "host-spki");
    await writeFile(path, " \n");
    vi.stubEnv("SIA_TEST_HOST_SPKI_FILE", path);
    await expect(import("../../playwright.payload.config.js")).rejects.toThrow(
      message,
    );
  });
});

it("passes the supplied host hashes to Chromium", async () => {
  await withTemporaryDirectory("sia-payload-config-", async (directory) => {
    const path = join(directory, "host-spki");
    await writeFile(path, " fixture-host-hash\n");
    vi.stubEnv("SIA_TEST_HOST_SPKI_FILE", path);
    const { default: config } =
      await import("../../playwright.payload.config.js");
    expect(config.use?.launchOptions?.args).toContain(
      "--ignore-certificate-errors-spki-list=fixture-host-hash",
    );
  });
});
