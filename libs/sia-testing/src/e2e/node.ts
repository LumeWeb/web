/**
 * Public Node account API for tests that provide their own SDK client or page.
 * Admin credentials stay in Node; approval does not expose the connect key to
 * the consumer callback.
 */
import { isAbsolute } from "node:path";
import { readHostServiceConfig } from "./internal/config.js";
import { withAccount } from "./internal/disposable-account.js";

/** Account authority available to the callback without its private connect credential. */
export interface DisposableAccount {
  readonly appID: string;
  approve(responseURL: string): Promise<void>;
  readonly quotaKey: string;
  /** Await durable acknowledgment before funding; cleanup cannot infer an unrecorded registration. */
  recordAccountKey(accountKey: string): Promise<void>;
}

/** Explicit provisioning inputs; SDK registration remains the caller's responsibility. */
export interface DisposableAccountOptions {
  appID: string;
  /** Use zero when the test must not request host funding. */
  fundTargetBytes: number;
  service: E2EService;
}

/** Node-only settings containing admin credentials; do not send this object to a browser. */
export interface E2EService {
  readonly adminURL: URL;
  readonly indexdURL: URL;
  readonly password: string;
  readonly storagePath: string;
}

/**
 * Reads explicit service settings without contacting the cluster.
 * Configuration alone does not grant mutation authority; provisioning also
 * requires the runner's verified kernel lease.
 */
export function readE2EService(
  env: Readonly<Record<string, string | undefined>>,
): E2EService {
  const config = readHostServiceConfig(env);
  const storagePath = env.SIA_TEST_STORAGE_PATH;
  if (!storagePath || !isAbsolute(storagePath))
    throw new Error("Explicit absolute host storage path is required");
  return { ...config, storagePath };
}

/**
 * Runs a consumer callback with provisioning and cleanup for its disposable account.
 * The callback must record the SDK account key before waiting for funding and
 * close its SDK resources before returning. Callback and cleanup failures are
 * reported together, with private recovery data retained when cleanup is uncertain.
 */
export function withDisposableAccount<T>(
  options: DisposableAccountOptions,
  use: (account: DisposableAccount) => Promise<T>,
): Promise<T> {
  return withAccount(options, (account) => use(account));
}
