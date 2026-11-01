/** CLI validation must finish before a guardian or SDK fixture worker starts. */
import { spawnSync } from "node:child_process";
import { chmod, cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, it } from "vitest";

it.each(["run-e2e.mjs", "check-native-token-expiry.mjs"])(
  "%s prints help without deployment settings",
  (script) => {
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([name]) => !name.startsWith("SIA_")),
    );
    const result = spawnSync(
      process.execPath,
      [`scripts/${script}`, "--help", "--locked"],
      { encoding: "utf8", env, timeout: 10_000 },
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stderr).toBe("");
  },
);

it.each([
  "--unexpected=private-SENTINEL",
  "--scenario=other",
  "--scenario=",
  "unexpected-positional",
])("rejects %s before starting an owned fixture", async (argument) => {
  const directory = await mkdtemp("/tmp/sia-native-cutoff-run-");
  try {
    const marker = join(directory, "started");
    const fixture = join(directory, "fixture.json");
    const worker = join(directory, "worker.mjs");
    await cp(
      new URL("../fixtures/native-token-worker.mjs", import.meta.url),
      worker,
    );
    await chmod(worker, 0o600);
    await writeFile(join(directory, "recovery.json"), "{}", { mode: 0o600 });
    await writeFile(
      fixture,
      JSON.stringify({
        deadlineMs: 2000,
        graceMs: 100,
        lockPath: join(directory, "lock"),
        manifestPath: join(directory, "recovery.json"),
        workerPath: worker,
      }),
      { mode: 0o600 },
    );
    const result = spawnSync(
      process.execPath,
      [
        "scripts/check-native-token-expiry.mjs",
        `--fixture=${fixture}`,
        argument,
      ],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          SIA_NATIVE_TOKEN_FIXTURE: "1",
          SIA_TEST_FIXTURE_MARKER: marker,
        },
        timeout: 10_000,
      },
    );
    await expect(readFile(marker)).rejects.toMatchObject({ code: "ENOENT" });
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).not.toContain("private-SENTINEL");
    await expect(readFile(join(directory, "lock"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
