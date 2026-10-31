/** Real owned-child output stays in a bounded private file, including failure paths. */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";

it.each(["missing", "not-a-descriptor", "2", "999999999999999999999"])(
  "rejects inherited descriptor %s before opening a private log",
  async (descriptor) => {
    const directory = await mkdtemp(join(tmpdir(), "sia-runner-no-lease-"));
    const logPath = join(directory, "private.log");
    try {
      const result = spawnSync(
        process.execPath,
        [
          "tests/fixtures/owned-run-input.mjs",
          descriptor,
          logPath,
          join(directory, "lock"),
        ],
        { encoding: "utf8", timeout: 5000 },
      );
      await expect(stat(logPath)).rejects.toMatchObject({ code: "ENOENT" });
      expect(result.status, result.stderr).toBe(1);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  },
);

it.each([false, true])(
  "keeps private child output off the public channel with overflow %s",
  async (overflow) => {
    const directory = await mkdtemp(join(tmpdir(), "sia-runner-output-"));
    try {
      const logPath = join(directory, "private.log");
      const secret =
        "seed-SENTINEL ?signature=signed-query-SENTINEL raw-error-SENTINEL";
      const worker = `process.stdout.write(${JSON.stringify(secret)});${overflow ? "process.stdout.write('x'.repeat(9 * 1024 * 1024));" : "process.exitCode=1;"} `;
      const program = `import {ownedRun} from './src/e2e/internal/owned-cluster-lease.mjs';
      const code=await ownedRun(process.execPath,['-e',${JSON.stringify(worker)}],process.env,true,${JSON.stringify(join(directory, "lock"))},3000,100,process.cwd(),${JSON.stringify(logPath)});console.log(JSON.stringify({code}));`;
      const output = execFileSync(
        process.execPath,
        ["--input-type=module", "-e", program],
        { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
      );
      expect(output).not.toContain("SENTINEL");
      expect((JSON.parse(output) as { code: number }).code).not.toBe(0);
      expect(await readFile(logPath, "utf8")).toContain(secret);
      const info = await stat(logPath);
      expect(info.mode & 0o777).toBe(0o600);
      expect(info.size).toBeLessThanOrEqual(8 * 1024 * 1024);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  },
);
