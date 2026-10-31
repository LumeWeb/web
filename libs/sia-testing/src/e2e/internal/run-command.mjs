// @ts-check
/** Supervises a consumer argument array while exclusion covers teardown and postflight. */
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { assertOwnedMutation, clusterLockPath, ownedRun } from "./owned-cluster-lease.mjs";
import { preflight } from "./service-preflight.mjs";
import { readHostServiceConfig } from "./config.ts";

/** @param {string[]} argv @param {string} [entry] */
export async function commandMain(argv, entry = fileURLToPath(import.meta.url)) {
  try {
    const separator = argv.indexOf("--");
    const flags = separator < 0 ? argv : argv.slice(0, separator);
    const { values } = parseArgs({ allowPositionals: false, args: flags, options: {
      cwd: { type: "string" }, help: { short: "h", type: "boolean" }, locked: { type: "boolean" },
    }, strict: true });
    if (values.help) {
      console.log("Usage: sia-testing-e2e --cwd <absolute consumer directory> -- <executable> [arguments...]");
      return 0;
    }
    const [command, ...args] = separator < 0 ? [] : argv.slice(separator + 1);
    if (!command || !values.cwd || !isAbsolute(values.cwd)) throw new Error("Explicit command and absolute cwd are required");
    // Consent is checked before the guardian can create its lock or inspect service identity.
    if (process.env.SIA_TEST_ALLOW_MUTATION !== "1") {
      console.error("E2E requires explicit mutation consent (SIA_TEST_ALLOW_MUTATION=1)");
      return 1;
    }
    readHostServiceConfig(process.env);
    if (values.locked) {
      try { await assertOwnedMutation(); } catch {
        console.error("E2E requires a verified inherited lease");
        return 1;
      }
      return await runGuardedCommand(command, args, values.cwd, process.env);
    }
    return await ownedRun(process.execPath, [entry, "--locked", "--cwd", values.cwd, "--", command, ...args], process.env, true, clusterLockPath, 7_200_000, 2000, values.cwd);
  } catch {
    console.error("E2E refused or failed; private inputs and diagnostics omitted");
    return 1;
  }
}

/** @param {string} command @param {string[]} args @param {string} cwd @param {NodeJS.ProcessEnv} env @param {import('./run-command.mjs').RunnerIO} [io] */
export async function runGuardedCommand(command, args, cwd, env, io = { assertMutation: assertOwnedMutation, preflight, run: ownedRun }) {
  if (!isAbsolute(cwd) || !command) throw new Error("Explicit command and absolute cwd are required");
  await io.assertMutation();
  readHostServiceConfig(env);
  await io.preflight(env);
  const directory = await mkdtemp(join(tmpdir(), "sia-e2e-run-"));
  let code = 1;
  /** @type {unknown[]} */
  const failures = [];
  try {
    code = await io.run(command, args, env, false, clusterLockPath, 7_100_000, 2000, cwd, join(directory, "private.log"));
  } catch (error) {
    failures.push(error);
  }
  // The inner guardian has reaped descendants before readiness is checked under the outer lease.
  try { await io.preflight(env); } catch (error) {
    if (code !== 0 && !failures.length) failures.push(new Error(`Consumer exited with code ${code}`));
    failures.push(error);
  }
  if (failures.length) throw new AggregateError(failures, "Runner or postflight failed");
  if (code === 0) await rm(directory, { recursive: true });
  return code;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  process.exitCode = await commandMain(process.argv.slice(2));
