/// <reference types="node" />
/**
 * Creates and removes the exact Indexd resources needed for SDK connection tests.
 * Random quota and connect-key identities are recorded before creation so an
 * uncertain response leaves enough information for operator recovery.
 *
 * Live requests require mutation consent and a verified cluster lease. Injected
 * fetch implementations support offline fixtures without deployment access.
 * Cleanup acts only on acknowledged run-owned identities; it never searches for
 * other accounts or treats an unconfirmed registration as proof of absence.
 */
import { assertMutationAllowed } from "./owned-cluster-lease.mjs";
import { createRecoveryRecord, writeRecoveryRecord } from "./recovery.mjs";
import { dirname } from "node:path";
import { readFile, rm, statfs } from "node:fs/promises";
import { randomBytes } from "node:crypto";

const appIDPattern = /^[0-9a-f]{64}$/i;
// A stalled body must not prevent cleanup from reaching later owned resources.
const requestTimeoutMs = 10_000;

/**
 * Approves one SDK connection using the private connect key on its selected app origin.
 * A redirect or unrelated route must not receive that credential. The unused
 * response body is cancelled without hiding an unsuccessful approval status.
 *
 * @param {{
 *   connectKey: string | undefined;
 *   indexdURL: string | URL;
 *   responseURL: string;
 *   fetchImpl?: (url: URL, init: RequestInit) => Promise<Response>;
 * }} options
 */
export async function approveIndexd({
  connectKey,
  fetchImpl = fetch,
  indexdURL,
  responseURL,
}) {
  const origin = new URL(indexdURL),
    target = new URL(responseURL);
  if (
    target.origin !== origin.origin ||
    target.username ||
    target.password ||
    target.search ||
    target.hash ||
    !/^\/auth\/connect\/[^/]+$/.test(target.pathname) ||
    !connectKey
  )
    throw new Error("Invalid owned approval target");
  if (fetchImpl === fetch) await assertMutationAllowed();
  const response = await fetchImpl(target, {
    body: JSON.stringify({ approve: true }),
    headers: {
      "authorization": auth(connectKey),
      "content-type": "application/json",
    },
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  const approvalFailure = response.ok
    ? undefined
    : new Error(`Indexd approval failed (${response.status})`);
  try {
    await response.body?.cancel();
  } catch (error) {
    if (approvalFailure) {
      const failure = new AggregateError(
        [approvalFailure, error],
        "Indexd approval and response cleanup failed",
        { cause: error },
      );
      throw failure;
    }
    throw error;
  }
  if (approvalFailure) throw approvalFailure;
}

/**
 * Deletes only acknowledged identities, never resources found by discovery.
 * When a recorder is supplied, its pending write must succeed before that
 * resource's DELETE. A failure must not skip later independent cleanup, and
 * unknown registration keeps its recovery record even after key cleanup.
 *
 * @param {import('./indexd-provision.mjs').CleanupOptions} options
 */
export async function cleanupIndexd({
  accountKey,
  adminURL,
  created,
  fetchImpl = fetch,
  password,
  quotaKey,
  recoveryRecord,
}) {
  if (fetchImpl === fetch) await assertMutationAllowed();
  if (created?.recoveryPath) {
    const path = created.recoveryPath;
    const intent = /** @type {unknown} */ (
      JSON.parse(await readFile(path, "utf8"))
    );
    if (!intent || typeof intent !== "object" || Array.isArray(intent))
      throw new Error("Invalid private recovery record");
    const suppliedRecord = recoveryRecord;
    recoveryRecord = async (phase) => {
      await writeRecoveryRecord(path, {
        ...intent,
        ...(accountKey && { accountKey }),
        phase,
      });
      await suppliedRecord?.(phase);
    };
  }
  const base = new URL(adminURL);
  /** @type {unknown[]} */
  const errors = [];
  /**
   * A failed pending record must skip this resource without skipping the others.
   * @param {'account' | 'connect-key' | 'quota'} resource
   * @param {() => Promise<unknown>} operation
   */
  async function remove(resource, operation) {
    try {
      await recoveryRecord?.(`${resource}-delete-pending`);
      await operation();
      await recoveryRecord?.(`${resource}-deleted`);
    } catch (error) {
      errors.push(error);
      try {
        await recoveryRecord?.(`${resource}-delete-failed`);
      } catch (recordError) {
        errors.push(recordError);
      }
    }
  }
  if (accountKey)
    await remove("account", () =>
      call(
        base,
        password,
        "DELETE",
        `/account/${encodeURIComponent(accountKey)}`,
        undefined,
        fetchImpl,
      ),
    );
  if (created?.connectKey)
    await remove("connect-key", async () => {
      // Account deletion is asynchronous; its row still holds the key until
      // Indexd's account pruner removes the account's objects and slabs.
      const deadline = Date.now() + 10_000;
      for (;;) {
        try {
          await call(
            base,
            password,
            "DELETE",
            `/apps/connect/keys/${encodeURIComponent(created.connectKey)}`,
            undefined,
            fetchImpl,
          );
          break;
        } catch (error) {
          if (
            !accountKey ||
            !(error instanceof Error) ||
            !("status" in error) ||
            error.status !== 500 ||
            !("detail" in error) ||
            error.detail !== "failed to delete app connect key: key in use" ||
            Date.now() >= deadline
          )
            throw error;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    });
  if (created?.quota && quotaKey)
    await remove("quota", () =>
      call(
        base,
        password,
        "DELETE",
        `/quotas/${encodeURIComponent(quotaKey)}`,
        undefined,
        fetchImpl,
      ),
    );
  if (errors.length) throw new AggregateError(errors, "Indexd cleanup failed");
  // No confirmed account means an interrupted registration may need operator review.
  if (accountKey && created?.recoveryPath)
    await rm(dirname(created.recoveryPath), { recursive: true });
}

/**
 * Rejects successful POST responses that cannot acknowledge a created connect key.
 * An empty or malformed response must not grant cleanup authority.
 *
 * @param {unknown} value
 */
export function parseConnectKeyResponse(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    !("key" in value) ||
    typeof value.key !== "string" ||
    !value.key
  ) {
    throw new Error("Indexd did not return a connect key");
  }
  return value.key;
}

/**
 * Creates a fresh quota and connect key for one Builder approval.
 * The exact plan is recorded before mutation. A supplied recorder owns its
 * storage; otherwise this helper retains its own private recovery file.
 *
 * @param {import('./indexd-provision.mjs').ProvisionOptions} options
 * @returns {Promise<import('./indexd-provision.mjs').ProvisionedResources>}
 */
export async function provisionIndexd(options) {
  if ("quotaKey" in options)
    throw new Error("Provisioning requires fresh random quota names");
  const {
    adminURL,
    appID,
    fetchImpl = fetch,
    fundTargetBytes = 0,
    password,
    recovery,
    storagePath = process.env.SIA_TEST_STORAGE_PATH,
  } = options;
  if (fetchImpl === fetch) {
    await assertMutationAllowed();
    if (!storagePath?.startsWith("/"))
      throw new Error("Explicit host storage path is required");
    const disk = await statfs(storagePath, { bigint: true });
    if (disk.bavail * disk.bsize < 8n * 1024n ** 3n)
      throw new Error("Storage reserve missing");
  }
  let recorder = recovery;
  /** @type {string | undefined} */
  let recoveryPath;
  if (!recorder) {
    const path = await createRecoveryRecord();
    recoveryPath = path;
    recorder = { persist: (event) => writeRecoveryRecord(path, event) };
  }
  const plan = Object.freeze({
    appID,
    connectKey: randomBytes(32).toString("hex"),
    quotaKey: `sj_${randomBytes(14).toString("hex")}`,
  });
  const created = await provisionFromPlan({
    adminURL,
    appID,
    fetchImpl,
    fundTargetBytes,
    password,
    persist: (event) => recorder.persist(event),
    plan,
  });
  return { ...created, ...(recoveryPath && { recoveryPath }) };
}

/**
 * Indexd's password-only Basic authentication requires an empty username.
 * @param {string} password
 */
function auth(password) {
  return `Basic ${Buffer.from(`:${password}`).toString("base64")}`;
}

/**
 * Sends a bounded admin request and retains status and server detail for retry decisions.
 * Cleanup recognizes Indexd's temporary connect-key-in-use failure without
 * retrying unrelated errors. Server details must stay off public output.
 *
 * @param {URL} base
 * @param {string} password
 * @param {string} method
 * @param {string} path
 * @param {Record<string, unknown> | undefined} body
 * @param {NonNullable<import('./indexd-provision.mjs').ProvisionOptions['fetchImpl']>} fetchImpl
 * @returns {Promise<unknown>}
 */
async function call(base, password, method, path, body, fetchImpl = fetch) {
  const response = await fetchImpl(endpoint(base, path), {
    headers: {
      Authorization: auth(password),
      ...(body && { "content-type": "application/json" }),
    },
    method,
    // Redirects can replace the owned resource path while retaining admin authority.
    redirect: "error",
    signal: AbortSignal.timeout(requestTimeoutMs),
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!response.ok)
    throw Object.assign(
      new Error(`Indexd admin request failed (${response.status})`),
      { detail: (await response.text()).trim(), status: response.status },
    );
  if (response.status === 204) return undefined;
  // Stock Indexd returns an empty 200 body for successful quota PUTs.
  const text = await response.text();
  return text.trim() ? JSON.parse(text) : undefined;
}

/**
 * Admin resources live under /api regardless of any path in the supplied base URL.
 * @param {string | URL} base
 * @param {string} path
 */
function endpoint(base, path) {
  return new URL(`/api${path}`, base);
}

/**
 * Applies the recorded plan only after exact resource absence is established.
 * Quota PUT has no conditional-create operation, so the shared lease must exclude
 * cooperating writers throughout provisioning. Arbitrary admins can still race it.
 * Pending phases retain exact identities after commit/response uncertainty;
 * they do not confer ownership.
 *
 * @param {import('./indexd-provision.mjs').ProvisionOptions & {
 * plan: import('./indexd-provision.mjs').RecoveryPlan,
 * persist: import('./indexd-provision.mjs').ProvisionRecovery['persist']
 * }} options
 * @returns {Promise<import('./indexd-provision.mjs').ProvisionedResources>}
 */
async function provisionFromPlan({
  adminURL,
  appID,
  fetchImpl,
  fundTargetBytes,
  password,
  persist,
  plan,
}) {
  const base = new URL(adminURL);
  if (base.username || base.password || !password || !appIDPattern.test(appID))
    throw new Error("Invalid private provisioning options");
  const { connectKey, quotaKey } = plan;
  const created = { connectKey: undefined, quota: false };
  /** @param {import('./indexd-provision.mjs').RecoveryPhase} phase */
  const record = (phase) => persist(Object.freeze({ phase, plan }));
  await record("intent");
  for (const path of [
    `/quotas/${quotaKey}`,
    `/apps/connect/keys/${connectKey}`,
  ]) {
    const response = await fetchImpl(endpoint(base, path), {
      headers: { Authorization: auth(password) },
      method: "GET",
      redirect: "error",
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
    // An empty or malformed successful response is still existence, never absence.
    await response.body?.cancel();
    if (response.status !== 404)
      throw new Error("Exact resource absence was not established");
  }
  try {
    await record("quota-create-pending");
    await call(
      base,
      password,
      "PUT",
      `/quotas/${quotaKey}`,
      {
        description: "disposable sia-testing Builder",
        fundTargetBytes,
        maxPinnedData: 1_000_000_000,
        totalUses: 1,
      },
      fetchImpl,
    );
    created.quota = true;
    await record("quota-created");
    await record("connect-key-create-pending");
    const response = await call(
      base,
      password,
      "POST",
      "/apps/connect/keys",
      { key: connectKey, quota: quotaKey },
      fetchImpl,
    );
    if (
      parseConnectKeyResponse(response) !== connectKey ||
      !response ||
      typeof response !== "object" ||
      !("quota" in response) ||
      response.quota !== quotaKey
    )
      throw new Error("Connect key response did not match private intent");
    created.connectKey = connectKey;
    await record("connect-key-created");
    return { ...created, appID, quotaKey };
  } catch (error) {
    const failures = [error];
    try {
      await record("provision-failed");
    } catch (recordError) {
      failures.push(recordError);
    }
    try {
      await cleanupIndexd({
        adminURL: base,
        created,
        fetchImpl,
        password,
        quotaKey,
        recoveryRecord: record,
      });
    } catch (cleanupError) {
      failures.push(cleanupError);
    }
    if (failures.length > 1) {
      const failure = new AggregateError(
        failures,
        "Indexd provisioning or recovery failed",
        { cause: error },
      );
      throw failure;
    }
    throw error;
  }
}
