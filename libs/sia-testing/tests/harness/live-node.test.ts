/** Public live configuration is rejected before opening any SDK connection. */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { withSiaRun } from "../../src/node.js";
it("a live run requires its private profile before invoking the application", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-live-node-"));
  let entered = false;
  try {
    await expect(
      withSiaRun(
        {
          backend: {
            consent: {
              apiBaseUrl: "http://127.0.0.1:9980/",
              mutations: true,
              transfers: true,
            },
            kind: "live",
            profileFile: join(directory, "missing.json"),
          },
        },
        () => {
          entered = true;
          return Promise.resolve();
        },
      ),
    ).rejects.toMatchObject({ code: "invalid-profile" });
    expect(entered).toBe(false);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
it("a live run refuses a profile readable by other users", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-live-node-mode-"));
  try {
    const profileFile = join(directory, "profile.json");
    await writeFile(profileFile, "{}", { mode: 0o644 });
    await expect(
      withSiaRun(
        {
          backend: {
            consent: {
              apiBaseUrl: "http://127.0.0.1:9980/",
              mutations: true,
              transfers: true,
            },
            kind: "live",
            profileFile,
          },
        },
        () => Promise.resolve(),
      ),
    ).rejects.toMatchObject({ code: "invalid-profile" });
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
