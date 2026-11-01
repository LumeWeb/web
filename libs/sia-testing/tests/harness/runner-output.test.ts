/** Real owned-child output stays in a bounded private file, including failure paths. */
import { execFileSync, spawnSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { expect, it } from "vitest";
import { withTemporaryDirectory } from "../../scripts/workspace.mjs";

const secret =
  "seed-SENTINEL ?signature=signed-query-SENTINEL raw-error-SENTINEL";

/** Only this fixture's capture is read; the guardian owns and reaps the supplied worker. */
async function captureOutput(worker: string) {
  return withTemporaryDirectory("sia-runner-output-", async (directory) => {
    const logPath = join(directory, "private.log");
    const program = `import {runWithGuardian} from './src/e2e/internal/owned-cluster-lease.mjs';
      const code=await runWithGuardian(process.execPath,['-e',${JSON.stringify(worker)}],process.env,true,${JSON.stringify(join(directory, "lock"))},3000,100,process.cwd(),${JSON.stringify(logPath)});console.log(JSON.stringify({code}));`;
    const output = execFileSync(
      process.execPath,
      ["--input-type=module", "-e", program],
      {
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
      },
    );
    return {
      code: (JSON.parse(output) as { code: number }).code,
      info: await stat(logPath),
      output,
      privateText: await readFile(logPath, "utf8"),
    };
  });
}

it.each(["missing", "not-a-descriptor", "2", "999999999999999999999"])(
  "rejects inherited descriptor %s before opening a private log",
  async (descriptor) => {
    await withTemporaryDirectory("sia-runner-no-lease-", async (directory) => {
      const logPath = join(directory, "private.log");
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
    });
  },
);

it("keeps a failed child's diagnostics in its private capture", async () => {
  const captured = await captureOutput(
    `process.stdout.write(${JSON.stringify(secret)});process.exitCode=1;`,
  );
  expect(captured.code).toBe(1);
  expect(captured.output).not.toContain("SENTINEL");
  expect(captured.privateText).toBe(secret);
  expect(captured.info.mode & 0o777).toBe(0o600);
});

it("caps overflowing private output and fails the owned run", async () => {
  const captured = await captureOutput(
    `process.stdout.write(${JSON.stringify(secret)});process.stdout.write('x'.repeat(9 * 1024 * 1024));`,
  );
  expect(captured.code).not.toBe(0);
  expect(captured.output).not.toContain("SENTINEL");
  expect(captured.privateText).toContain(secret);
  expect(captured.info.mode & 0o777).toBe(0o600);
  expect(captured.info.size).toBeLessThanOrEqual(8 * 1024 * 1024);
});

it("keeps ordered native token failures in private capture", async () => {
  const worker = `import {withTokenCleanup} from './tests/e2e/native/shared-token-checks.ts';await withTokenCleanup(()=>Promise.reject(new Error('signed-query-SENTINEL')),{cleanup:()=>Promise.reject(new Error('raw-error-SENTINEL')),confirm:()=>Promise.resolve(),expired:()=>false,revoke:()=>Promise.reject({seed:'seed-SENTINEL'})}).catch(error=>{console.error(error);process.exitCode=1;});`;
  const captured = await captureOutput(worker);
  expect(captured.code).toBe(1);
  expect(captured.output).not.toContain("SENTINEL");
  for (const sentinel of [
    "signed-query-SENTINEL",
    "seed-SENTINEL",
    "raw-error-SENTINEL",
  ])
    expect(captured.privateText).toContain(sentinel);
  expect(captured.info.mode & 0o777).toBe(0o600);
  expect(captured.info.size).toBeLessThanOrEqual(8 * 1024 * 1024);
});
