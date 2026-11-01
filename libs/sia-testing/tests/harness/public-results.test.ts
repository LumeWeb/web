/** Public diagnostics contain outcomes only, even when private artifacts contain credentials. */
import { execFileSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, it } from "vitest";

it("publishes only validated suite outcomes and never private failures or archives", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-public-results-"));
  try {
    await mkdir(join(directory, "test-results"));
    const secret = "seed-SENTINEL signed-query-SENTINEL raw-error-SENTINEL";
    await writeFile(
      join(directory, "test-results", "private.trace.zip"),
      secret,
    );
    await writeFile(join(directory, "test-results", "failure.txt"), secret);
    execFileSync(
      process.execPath,
      [resolve("scripts/write-public-results.mjs")],
      {
        cwd: directory,
        env: {
          ...process.env,
          SIA_RESULT_BROWSER: "failure",
          SIA_RESULT_METADATA: secret,
          SIA_RESULT_NATIVE: "success",
        },
      },
    );
    expect(await readdir(directory)).toContain("public-real-results");
    expect(await readdir(join(directory, "public-real-results"))).toEqual([
      "summary.json",
    ]);
    const output = await readFile(
      join(directory, "public-real-results", "summary.json"),
      "utf8",
    );
    expect(JSON.parse(output)).toEqual({
      schema: 1,
      suites: { browser: "failure", metadata: "unknown", native: "success" },
    });
    for (const sentinel of secret.split(" "))
      expect(output).not.toContain(sentinel);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
