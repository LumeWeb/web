/// <reference types="node" />
// @ts-check
/**
 * Rejects a cluster run if the supplied service identity or readiness has changed.
 * PID and executable path alone cannot distinguish a restarted or replaced
 * process, so checks also bind its UID, start ticks, arguments and binary hash.
 *
 * The cluster API must report the expected topology and height. A synced
 * recent tip, ready hosts and the storage reserve are required before payload
 * writes and after cleanup. This module observes the service without starting,
 * mining or stopping it.
 */
import { createHash } from "node:crypto";
import { readFile, realpath, statfs } from "node:fs/promises";

/**
 * Checks the selected process and service readiness before or after a test command.
 * Start ticks are checked again after HTTP reads because the PID can be reused
 * while those requests are in flight. The return value is available storage bytes.
 *
 * @param {NodeJS.ProcessEnv} env
 */
export async function preflight(env) {
  const pid = integer(env, "SIA_TEST_CLUSTER_PID", 1);
  const uid = integer(env, "SIA_TEST_CLUSTER_UID", 0);
  const height = integer(env, "SIA_TEST_CHAIN_HEIGHT", 0);
  const ticks = required(env, "SIA_TEST_CLUSTER_START_TICKS");
  const binary = required(env, "SIA_TEST_CLUSTER_BINARY");
  const statePath = required(env, "SIA_TEST_CLUSTER_STATE");
  const storagePath = required(env, "SIA_TEST_STORAGE_PATH");
  const hash = required(env, "SIA_TEST_CLUSTER_SHA256");
  const cluster = localOrigin(required(env, "SIA_TEST_CLUSTER_URL"));
  const admin = localOrigin(required(env, "SIA_TEST_ADMIN_URL"));
  const password = required(env, "SIA_TEST_ADMIN_PASSWORD");
  if (
    !/^\d+$/.test(ticks) ||
    !/^[a-f0-9]{64}$/.test(hash) ||
    ![binary, statePath, storagePath].every((path) => path.startsWith("/"))
  )
    throw new Error("Invalid explicit service identity");
  const processPath = `/proc/${pid}`;
  const status = await readFile(`${processPath}/status`, "utf8");
  const args = (await readFile(`${processPath}/cmdline`, "utf8")).split("\0");
  const started = async () => {
    const text = await readFile(`${processPath}/stat`, "utf8");
    return text
      .slice(text.lastIndexOf(")") + 2)
      .trim()
      .split(/\s+/)[19];
  };
  if (
    (await started()) !== ticks ||
    !new RegExp(`^Uid:\\s+${uid}\\s+${uid}\\s+${uid}\\s+${uid}$`, "m").test(
      status,
    ) ||
    (await realpath(`${processPath}/exe`)) !== binary ||
    !args.includes(`-dir=${statePath}`) ||
    !args.includes("-hostd=30") ||
    !args.includes("-indexd=1") ||
    !args.includes("-renterd=0")
  )
    throw new Error("Cluster process identity mismatch");
  if (
    createHash("sha256")
      .update(await readFile(`${processPath}/exe`))
      .digest("hex") !== hash
  )
    throw new Error("Cluster binary hash mismatch");
  const observedHeight = record(await json(new URL("/height", cluster)));
  const nodes = await json(new URL("/nodes", cluster));
  if (!Array.isArray(nodes)) throw new Error("Invalid cluster nodes");
  const types = nodes.map((node) => record(node).type);
  if (
    observedHeight.height !== height ||
    types.filter((type) => type === "hostd").length !== 30 ||
    types.filter((type) => type === "indexd").length !== 1 ||
    types.filter((type) => type === "renterd").length !== 0 ||
    types.length !== 31
  )
    throw new Error("Cluster topology or height changed");
  const headers = {
    authorization: `Basic ${Buffer.from(`:${password}`).toString("base64")}`,
  };
  const [state, consensus, hosts] = await Promise.all(
    ["/api/state", "/api/consensus/state", "/api/stats/hosts"].map(
      async (path) => record(await json(new URL(path, admin), headers)),
    ),
  );
  if (
    !Array.isArray(consensus.prevTimestamps) ||
    typeof consensus.prevTimestamps[0] !== "string"
  )
    throw new Error("Invalid readiness body");
  const timestamp = Date.parse(consensus.prevTimestamps[0]);
  if (
    state.synced !== true ||
    record(consensus.index).height !== height ||
    !Number.isFinite(timestamp) ||
    Date.now() - timestamp >= 3 * 60 * 60 * 1000 ||
    timestamp > Date.now() ||
    hosts.goodForUpload !== 30 ||
    hosts.failedScans !== 0 ||
    (await started()) !== ticks
  )
    throw new Error("Cluster readiness or process identity changed");
  const disk = await statfs(storagePath, { bigint: true });
  const available = disk.bavail * disk.bsize;
  if (available < 10200547328n) throw new Error("Storage reserve missing");
  return Number(available);
}

/**
 * Rejects invalid process and height settings before they reach identity checks.
 * @param {NodeJS.ProcessEnv} env
 * @param {string} key
 * @param {number} minimum
 */
function integer(env, key, minimum) {
  const text = required(env, key),
    value = Number(text);
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(value) || value < minimum)
    throw new Error("Invalid service identity setting");
  return value;
}
/**
 * Bounds readiness requests and body reads without following a different service URL.
 * @param {URL} url
 * @param {Record<string, string>} headers
 * @returns {Promise<unknown>}
 */
async function json(url, headers = {}) {
  const response = await fetch(url, {
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Readiness HTTP failure");
  return response.json();
}
/**
 * Rejects URL paths and queries that root-relative readiness requests would discard.
 * @param {string} value
 */
function localOrigin(value) {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("Invalid loopback service origin");
  return url;
}
/**
 * Rejects bodies that cannot supply named readiness fields.
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid readiness body");
  return /** @type {Record<string, unknown>} */ (value);
}
/**
 * Missing settings must fail rather than selecting a different process or service.
 * @param {NodeJS.ProcessEnv} env
 * @param {string} key
 */
function required(env, key) {
  const value = env[key];
  if (!value) throw new Error("Missing explicit service setting");
  return value;
}
