// @ts-check
/**
 * Runs a consumer command while a guardian holds the cluster mutation lock.
 * The outer guardian outlives the command and its descendant cleanup, so a
 * runner exit cannot let another writer enter before postflight completes.
 * Child diagnostics stay in a bounded private file; the CLI reports only
 * configuration or supervision failures without echoing credentials.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  assertMutationAllowed,
  clusterLockPath,
  runWithGuardian,
} from "./owned-cluster-lease.mjs";
import { preflight } from "./service-preflight.mjs";
import { readHostServiceConfig } from "./config.ts";

/**
 * Parses an executable and argument array without invoking a shell.
 * The outer invocation starts the guardian; --locked must prove its inherited
 * lease before preflight or consumer execution can begin.
 *
 * @param {string[]} argv
 * @param {string} [entry] Entrypoint to restart beneath the outer guardian.
 */
export async function commandMain(
  argv,
  entry = fileURLToPath(import.meta.url),
) {
  try {
    const separator = argv.indexOf("--");
    const flags = separator < 0 ? argv : argv.slice(0, separator);
    const { values } = parseArgs({
      allowPositionals: false,
      args: flags,
      options: {
        cwd: { type: "string" },
        help: { short: "h", type: "boolean" },
        locked: { type: "boolean" },
      },
      strict: true,
    });
    if (values.help) {
      console.log(
        "Usage: sia-testing-e2e --cwd <absolute consumer directory> -- <executable> [arguments...]",
      );
      return 0;
    }
    const [command, ...args] = separator < 0 ? [] : argv.slice(separator + 1);
    if (!command || !values.cwd || !isAbsolute(values.cwd))
      throw new Error("Explicit command and absolute cwd are required");
    // Consent is checked before the guardian can create its lock or inspect service identity.
    if (process.env.SIA_TEST_ALLOW_MUTATION !== "1") {
      console.error(
        "E2E requires explicit mutation consent (SIA_TEST_ALLOW_MUTATION=1)",
      );
      return 1;
    }
    readHostServiceConfig(process.env);
    // --locked selects the inner invocation; it does not itself prove lock ownership.
    if (values.locked) {
      try {
        await assertMutationAllowed();
      } catch {
        console.error("E2E requires a verified inherited lease");
        return 1;
      }
      return await runGuardedCommand(command, args, values.cwd, process.env);
    }
    return await runWithGuardian(
      process.execPath,
      [entry, "--locked", "--cwd", values.cwd, "--", command, ...args],
      process.env,
      true,
      clusterLockPath,
      7_200_000,
      2000,
      values.cwd,
    );
  } catch {
    // Configuration and SDK errors can contain credentials; keep them off the public channel.
    console.error(
      "E2E refused or failed; private inputs and diagnostics omitted",
    );
    return 1;
  }
}

/**
 * Runs readiness checks around a consumer process under an existing lease.
 * The inner guardian drains output and reaps descendants before returning.
 * Failed runs retain their diagnostics directory; removal is allowed only
 * after a zero exit code and successful postflight.
 *
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 * @param {NodeJS.ProcessEnv} env
 * @param {import('./run-command.mjs').RunnerIO} [io]
 */
export async function runGuardedCommand(
  command,
  args,
  cwd,
  env,
  io = {
    assertMutation: assertMutationAllowed,
    preflight,
    run: runWithGuardian,
  },
) {
  if (!isAbsolute(cwd) || !command)
    throw new Error("Explicit command and absolute cwd are required");
  await io.assertMutation();
  readHostServiceConfig(env);
  await io.preflight(env);
  const directory = await mkdtemp(join(tmpdir(), "sia-e2e-run-"));
  let code = 1;
  /** @type {unknown[]} */
  const failures = [];
  try {
    code = await io.run(
      command,
      args,
      env,
      false,
      clusterLockPath,
      7_100_000,
      2000,
      cwd,
      join(directory, "private.log"),
    );
  } catch (error) {
    failures.push(error);
  }
  // The inner guardian has reaped descendants before readiness is checked under the outer lease.
  try {
    await io.preflight(env);
  } catch (error) {
    // A numeric exit code must survive alongside postflight failure without exposing argv.
    if (code !== 0 && !failures.length)
      failures.push(new Error(`Consumer exited with code ${code}`));
    failures.push(error);
  }
  if (failures.length)
    throw new AggregateError(failures, "Runner or postflight failed");
  if (code === 0) await rm(directory, { recursive: true });
  return code;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  process.exitCode = await commandMain(process.argv.slice(2));
