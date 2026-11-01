/// <reference types="node" />
// @ts-check
/**
 * Checks the installed native SDK through a local observing proxy without
 * replacing its HTTP transport. Routing checks require evidence of forwarded
 * requests and rejected credentials; funded scenarios also validate observed
 * token deadlines or revocation.
 *
 * Guardians retain the shared cluster lock through descendant teardown and
 * postflight. Private recovery records remain until the supervisor and its parent
 * have both verified cleanup. Fixture mode uses owned local workers and never
 * reads deployment configuration.
 */
import { settlePhases } from "../src/e2e/internal/lifecycle.mjs";
import { packageRoot } from "./workspace.mjs";
import {
  assertMutationAllowed,
  clusterLockPath,
  runWithGuardian,
  verifyNativeLease,
} from "../src/e2e/internal/owned-cluster-lease.mjs";
import { preflight } from "../src/e2e/internal/service-preflight.mjs";
import {
  lstat,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { SharedTokenObserver } from "../tests/e2e/support/shared-token-observer.ts";
import {
  createRecoveryRecord,
  writeRecoveryRecord,
} from "../src/e2e/internal/recovery.mjs";
import {
  nativeAppOrigin,
  scopedProxyEnvironment,
  startSharedTokenProxy,
} from "../tests/e2e/native/shared-token-proxy.mjs";
import { validateFinalSnapshot } from "../tests/e2e/native/shared-token-checks.ts";

const self = fileURLToPath(import.meta.url);
let stage = "arguments";
try {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      fixture: { type: "string" },
      help: { short: "h", type: "boolean" },
      locked: { type: "boolean" },
      scenario: { type: "string" },
    },
    strict: true,
  });
  if (values.help)
    console.log(
      "Usage: check-native-token-expiry.mjs [--scenario routing|key-expiry|revocation] [--help]",
    );
  else {
    const scenario = values.scenario ?? "routing";
    if (
      !["key-expiry", "revocation", "routing"].includes(scenario) ||
      values.fixture === ""
    )
      throw new Error("Invalid native token arguments");
    stage = "lease";
    process.exitCode = await entry({
      fixturePath: values.fixture,
      locked: values.locked ?? false,
      scenario,
    });
  }
} catch {
  // Parser and SDK errors can include credentials; only the known phase is public.
  console.error(
    `Native token check failed during ${stage}; private inputs omitted`,
  );
  process.exitCode = 1;
}

/** Fixture mode never reads deployment configuration; it uses the same guardians and subprocess path.
 * @param {{fixturePath: string | undefined, locked: boolean, scenario: string}} options
 */
async function entry({ fixturePath, locked, scenario }) {
  const fixture = fixturePath ? await readFixture(fixturePath) : null;
  const lockPath = fixture ? fixture.lockPath : clusterLockPath;
  if (!locked) {
    const manifest = fixture
      ? fixture.manifestPath
      : scenario === "routing"
        ? undefined
        : await createRecoveryRecord();
    const code = await runWithGuardian(
      process.execPath,
      [
        self,
        `--scenario=${scenario}`,
        ...(fixturePath ? [`--fixture=${fixturePath}`] : []),
        "--locked",
      ],
      { ...process.env, SIA_NATIVE_TOKEN_MANIFEST: manifest },
      true,
      lockPath,
      fixture ? fixture.deadlineMs + 3000 : 1_200_000,
      fixture ? fixture.graceMs : 2000,
      packageRoot,
    );
    if (!fixture && manifest && code === 0) {
      const recovery = record(JSON.parse(await readFile(manifest, "utf8")));
      if (recovery.cleanupVerified !== true || recovery.parentVerified !== true)
        throw new Error("Unverified recovery record");
      await writeRecoveryRecord(manifest, recovery);
      await rm(dirname(manifest), { recursive: true });
    } else if (manifest && code !== 0) {
      console.log(
        JSON.stringify({
          category: "private-recovery-retained",
          path: manifest,
        }),
      );
    }

    return code;
  }
  stage = "lease ownership";
  await verifyNativeLease(process.env.SIA_NATIVE_TOKEN_LOCK_FD, lockPath);
  if (fixture) {
    await writeRecoveryRecord(fixture.manifestPath, {
      kind: "fixture-recovery",
    });
    const status = await readFile("/proc/self/stat", "utf8");
    await writeFile(
      `${dirname(fixture.manifestPath)}/supervisor.json`,
      JSON.stringify({
        pid: process.pid,
        started: status
          .slice(status.lastIndexOf(")") + 2)
          .trim()
          .split(/\s+/)[19],
      }),
      { flag: "wx", mode: 0o600 },
    );
    const code = await runWithGuardian(
      process.execPath,
      [fixture.workerPath],
      process.env,
      false,
      lockPath,
      fixture.deadlineMs,
      fixture.graceMs,
      packageRoot,
    );
    if (code !== 0) throw new Error("Owned fixture failed");
  } else await main(scenario);
  return 0;
}

/** Checks SDK observations before accepting cleanup; every teardown phase still runs after failure.
 * @param {string} scenario
 */
async function main(scenario) {
  stage = "environment";
  await assertMutationAllowed();
  const env = { ...process.env };
  if (
    scenario !== "routing" &&
    process.env.SIA_NATIVE_TOKEN_ALLOW_FUNDED !== "1"
  )
    throw new Error("Scenario opt-in missing");
  const before = await preflight(env);
  const manifest = process.env.SIA_NATIVE_TOKEN_MANIFEST;
  const diagnostics = manifest
    ? dirname(manifest)
    : await mkdtemp(join(tmpdir(), "sia-e2e-run-"));
  const appOrigin = nativeAppOrigin(
    required(env, "SIA_TEST_INDEXD_URL"),
    required(env, "SIA_TEST_ADMIN_URL"),
  );
  const observer = new SharedTokenObserver(appOrigin);
  const proxy = await startSharedTokenProxy({ appOrigin, observer });
  const failures = await settlePhases([
    {
      phase: "business",
      run: async () => {
        stage = "native subprocess";
        const code = await runWithGuardian(
          fileURLToPath(
            new URL("../node_modules/.bin/vitest", import.meta.url),
          ),
          [
            "run",
            "--project",
            "real-native-token-expiry",
            "--disableConsoleIntercept",
          ],
          {
            ...scopedProxyEnvironment(env, proxy.url),
            SIA_NATIVE_TOKEN_CONTROL: proxy.controlURL,
            SIA_NATIVE_TOKEN_MANIFEST: manifest,
            SIA_NATIVE_TOKEN_PROBE: "1",
            SIA_NATIVE_TOKEN_SCENARIO: scenario,
          },
          false,
          clusterLockPath,
          1_020_000,
          2000,
          packageRoot,
          join(diagnostics, "native.log"),
        );
        if (code !== 0) throw new Error("Native subprocess failed");
        stage = "observation drainage";
        await proxy.drain();
        const snapshot = observer.snapshot();
        if (
          proxy.routing().forwardedRequests === 0 ||
          !snapshot.observations.some((item) => item.status === 401)
        )
          throw new Error("Missing real routing evidence");
        if (scenario !== "routing")
          validateFinalSnapshot(snapshot, proxy.evidence());
        console.log(
          JSON.stringify({
            category: "installed-native-sdk-real-app-routing",
            cutoffExecuted: scenario !== "routing",
            evidence: proxy.evidence(),
            forwardedRequests: proxy.routing().forwardedRequests,
            maximumDeliveredExpiryMs:
              snapshot.conservativeMaximumDeliveredExpiryMs,
            statuses: snapshot.observations.map((item) => item.status),
          }),
        );
      },
    },
    { phase: "proxy-close", run: () => proxy.close() },
    {
      phase: "postflight",
      run: async () => {
        const after = await preflight(env);
        console.log(
          JSON.stringify({
            bytes: before - after,
            category: "locked-storage-delta",
            cleanup: "owned-descendants-exited-proxy-closed",
            scenario,
          }),
        );
      },
    },
  ]);
  if (manifest) {
    // Only the bootstrap may remove credentials, after its guardian has reaped the complete supervisor tree.
    failures.push(
      ...(await settlePhases([
        {
          phase: "recovery-verification",
          run: async () => {
            const recovery = record(
              JSON.parse(await readFile(manifest, "utf8")),
            );
            if (!failures.length && recovery.cleanupVerified === true)
              await writeRecoveryRecord(manifest, {
                ...recovery,
                parentVerified: true,
              });
            else {
              console.log(
                JSON.stringify({
                  category: "private-recovery-retained",
                  path: manifest,
                }),
              );
              throw new Error("Incomplete scenario or cleanup");
            }
          },
        },
      ])),
    );
  }
  if (!manifest && !failures.length) await rm(diagnostics, { recursive: true });
  if (failures.length) {
    console.error(
      JSON.stringify({
        category: "native-phase-failures",
        phases: failures.map((item) => item.phase),
      }),
    );
    throw new Error("Native phases failed");
  }
}
/** Only an owned private fixture directory may replace the deployment inputs. */
/** @param {string} path */
async function readFixture(path) {
  if (
    process.env.SIA_NATIVE_TOKEN_FIXTURE !== "1" ||
    !/^\/tmp\/sia-native-cutoff-run-[^/]+\/fixture\.json$/.test(path)
  )
    throw new Error("Invalid fixture");
  const directory = dirname(path),
    file = await lstat(path),
    parent = await lstat(directory);
  if (
    !parent.isDirectory() ||
    parent.uid !== process.getuid?.() ||
    (parent.mode & 0o777) !== 0o700 ||
    (await realpath(directory)) !== directory ||
    !file.isFile() ||
    file.uid !== process.getuid?.() ||
    (file.mode & 0o777) !== 0o600
  )
    throw new Error("Invalid fixture");
  const value = record(JSON.parse(await readFile(path, "utf8")));
  const { deadlineMs, graceMs, lockPath, manifestPath, workerPath } = value;
  if (
    typeof deadlineMs !== "number" ||
    deadlineMs < 100 ||
    deadlineMs > 5000 ||
    typeof graceMs !== "number" ||
    graceMs < 10 ||
    graceMs > 500 ||
    lockPath !== `${directory}/lock` ||
    manifestPath !== `${directory}/recovery.json` ||
    workerPath !== `${directory}/worker.mjs`
  )
    throw new Error("Invalid fixture");
  const worker = await lstat(workerPath);
  if (
    !worker.isFile() ||
    worker.uid !== process.getuid?.() ||
    (worker.mode & 0o777) !== 0o600
  )
    throw new Error("Invalid fixture");
  return { deadlineMs, graceMs, lockPath, manifestPath, workerPath };
}
/** @param {unknown} value @returns {Record<string, unknown>} */
function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid structured input");
  return /** @type {Record<string, unknown>} */ (value);
}
/** @param {NodeJS.ProcessEnv} env @param {string} key */
function required(env, key) {
  const value = env[key];
  if (!value) throw new Error("Missing required setting");
  return value;
}
