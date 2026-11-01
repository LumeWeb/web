/** CLI checks never read a deployment or acquire the shared cluster lock. */
import { spawnSync } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import {
  runGuardedCommand,
  type RunnerIO,
} from "../../src/e2e/internal/run-command.mjs";
import { runWithGuardian } from "../../src/e2e/internal/owned-cluster-lease.mjs";
import { withTemporaryDirectory } from "../../scripts/workspace.mjs";

const env = {
  SIA_TEST_ADMIN_PASSWORD: "private",
  SIA_TEST_ADMIN_URL: "http://localhost:1",
  SIA_TEST_ALLOW_MUTATION: "1",
  SIA_TEST_INDEXD_URL: "http://localhost:1",
};

/** Own only the diagnostics directory supplied by this invocation, including failed postflight. */
function consumerFixture(consume: () => Promise<number>) {
  return {
    assertMutation: () => Promise.resolve(),
    preflight: vi.fn<RunnerIO["preflight"]>().mockResolvedValue(1),
    run: (
      _command,
      _args,
      _env,
      _acquire,
      _lock,
      _deadline,
      _grace,
      _cwd,
      log,
    ) => {
      if (!log) throw new Error("Expected private diagnostics path");
      onTestFinished(() =>
        rm(join(log, ".."), { force: true, recursive: true }),
      );
      return consume();
    },
  } satisfies RunnerIO;
}

/** CLI parsing must refuse these invocations before touching any deployment. */
function run(args: string[]) {
  return spawnSync(
    process.execPath,
    ["src/e2e/internal/run-command.mjs", ...args],
    {
      encoding: "utf8",
      env: { PATH: process.env.PATH, SIA_TEST_ALLOW_MUTATION: "0" },
    },
  );
}
test("prints guarded executable help without service configuration", () => {
  const result = run(["--help"]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("--cwd");
});
test("refuses commands before service inspection without consent", () => {
  const result = run([
    "--cwd",
    "/tmp",
    "--",
    process.execPath,
    "-e",
    "console.log('UNSAFE')",
  ]);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("consent");
  expect(result.stdout).not.toContain("UNSAFE");
});

test("keeps runner and postflight failures together", async () => {
  const primary = new Error("owned runner failed");
  const postflight = new Error("postflight failed");
  const io = consumerFixture(() => Promise.reject(primary));
  io.preflight.mockResolvedValueOnce(1).mockRejectedValueOnce(postflight);
  const failure: unknown = await runGuardedCommand(
    process.execPath,
    [],
    "/tmp",
    env,
    io,
  ).catch((error: unknown) => error);
  expect(failure).toBeInstanceOf(AggregateError);
  if (!(failure instanceof AggregateError))
    throw new Error("Expected combined runner failure");
  expect(failure.errors).toEqual([primary, postflight]);
});

test("passes executable arguments and consumer cwd to an owned guardian before postflight", async () => {
  await withTemporaryDirectory("sia-runner-fixture-", async (directory) => {
    let calls = 0;
    const code = await runGuardedCommand(
      process.execPath,
      [
        "-e",
        "require('node:fs').writeFileSync('result.json',JSON.stringify({cwd:process.cwd(),args:process.argv.slice(1)}))",
        "space in argument",
        "; echo UNSAFE",
      ],
      directory,
      env,
      {
        assertMutation: () => Promise.resolve(),
        preflight: async () => {
          if (++calls === 2)
            expect(
              JSON.parse(
                await readFile(join(directory, "result.json"), "utf8"),
              ),
            ).toEqual({
              args: ["space in argument", "; echo UNSAFE"],
              cwd: directory,
            });
          return 1;
        },
        run: (
          command,
          args,
          environment,
          _acquire,
          _lock,
          _deadline,
          _grace,
          cwd,
          log,
        ) =>
          runWithGuardian(
            command,
            args,
            { ...process.env, ...environment },
            true,
            join(directory, "lock"),
            5000,
            100,
            cwd,
            log,
          ),
      },
    );
    expect(code).toBe(0);
    expect(calls).toBe(2);
  });
});

test("rejects a forged locked invocation before deployment preflight", () => {
  const result = spawnSync(
    process.execPath,
    [
      "src/e2e/internal/run-command.mjs",
      "--locked",
      "--cwd",
      "/tmp",
      "--",
      process.execPath,
      "-e",
      "console.log('UNSAFE')",
    ],
    {
      encoding: "utf8",
      env: {
        ...env,
        PATH: process.env.PATH,
        SIA_NATIVE_TOKEN_LOCK_FD: "999999",
      },
    },
  );
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("inherited lease");
  expect(result.stdout).not.toContain("UNSAFE");
});

test("returns the consumer exit code when postflight succeeds", async () => {
  const io = consumerFixture(() => Promise.resolve(23));
  expect(
    await runGuardedCommand("private-command", ["secret"], "/tmp", env, io),
  ).toBe(23);
  expect(io.preflight).toHaveBeenCalledTimes(2);
});

test("preserves nonzero exit evidence when postflight also fails", async () => {
  const io = consumerFixture(() => Promise.resolve(23));
  const postflight = new Error("postflight failed");
  io.preflight.mockResolvedValueOnce(1).mockRejectedValueOnce(postflight);
  const failure: unknown = await runGuardedCommand(
    "private-command",
    ["secret"],
    "/tmp",
    env,
    io,
  ).catch((error: unknown) => error);
  expect(failure).toBeInstanceOf(AggregateError);
  if (!(failure instanceof AggregateError))
    throw new Error("Missing aggregate");
  expect(failure.errors).toHaveLength(2);
  expect(String(failure.errors[0])).toContain("23");
  expect(String(failure.errors[0])).not.toMatch(/secret|private-command/);
  expect(failure.errors[1]).toBe(postflight);
});
