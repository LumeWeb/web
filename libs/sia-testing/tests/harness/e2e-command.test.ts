/** CLI checks never read a deployment or acquire the shared cluster lock. */
import { spawnSync } from "node:child_process";
import { expect, test } from "vitest";

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

import { runGuardedCommand } from "../../src/e2e/internal/run-command.mjs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ownedRun } from "../../src/e2e/internal/owned-cluster-lease.mjs";
const env = {
  SIA_TEST_ADMIN_PASSWORD: "private",
  SIA_TEST_ADMIN_URL: "http://localhost:1",
  SIA_TEST_ALLOW_MUTATION: "1",
  SIA_TEST_INDEXD_URL: "http://localhost:1",
};

test("keeps runner and postflight failures together", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-runner-fixture-"));
  const primary = new Error("owned runner failed");
  const postflight = new Error("postflight failed");
  let calls = 0,
    log = "";
  try {
    const failure: unknown = await runGuardedCommand(
      process.execPath,
      [],
      directory,
      env,
      {
        assertMutation: () => Promise.resolve(),
        preflight: () =>
          ++calls === 1 ? Promise.resolve(1) : Promise.reject(postflight),
        run: (
          _command,
          _args,
          _env,
          _acquire,
          _lock,
          _deadline,
          _grace,
          _cwd,
          privateLog,
        ) => {
          log = privateLog ?? "";
          return Promise.reject(primary);
        },
      },
    ).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(AggregateError);
    if (!(failure instanceof AggregateError))
      throw new Error("Expected combined runner failure");
    expect(failure.errors).toEqual([primary, postflight]);
  } finally {
    if (log) await rm(join(log, ".."), { force: true, recursive: true });
    await rm(directory, { force: true, recursive: true });
  }
});

test("passes executable arguments and consumer cwd to an owned guardian before postflight", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-runner-fixture-"));
  let calls = 0;
  try {
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
          ownedRun(
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
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
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

test.each([false, true])(
  "preserves nonzero exit evidence with postflight failure %s",
  async (failPostflight) => {
    let calls = 0,
      log = "";
    const postflight = new Error("postflight failed");
    try {
      const operation = runGuardedCommand(
        "private-command",
        ["secret"],
        "/tmp",
        env,
        {
          assertMutation: () => Promise.resolve(),
          preflight: () =>
            ++calls === 2 && failPostflight
              ? Promise.reject(postflight)
              : Promise.resolve(1),
          run: (
            _command,
            _args,
            _env,
            _acquire,
            _lock,
            _deadline,
            _grace,
            _cwd,
            privateLog,
          ) => {
            log = privateLog ?? "";
            return Promise.resolve(23);
          },
        },
      );
      if (!failPostflight) expect(await operation).toBe(23);
      else {
        const failure: unknown = await operation.catch(
          (error: unknown) => error,
        );
        expect(failure).toBeInstanceOf(AggregateError);
        if (!(failure instanceof AggregateError))
          throw new Error("Missing aggregate");
        expect(failure.errors).toHaveLength(2);
        expect(String(failure.errors[0])).toContain("23");
        expect(String(failure.errors[0])).not.toMatch(/secret|private-command/);
        expect(failure.errors[1]).toBe(postflight);
      }
    } finally {
      if (log) await rm(join(log, ".."), { force: true, recursive: true });
    }
  },
);
