/** Guarded Node provisioning for consumer-owned SDK pages and processes. */
import { isAbsolute } from "node:path";
import { readHostServiceConfig } from "./internal/config.js";
import { withAccount } from "./internal/disposable-account.js";

export interface DisposableAccount {
  readonly appID: string;
  approve(responseURL: string): Promise<void>;
  readonly quotaKey: string;
  /** Resolve only after the acknowledged identity is durably recorded. */
  recordAccountKey(accountKey: string): Promise<void>;
}

export interface DisposableAccountOptions {
  appID: string;
  fundTargetBytes: number;
  service: E2EService;
}

export interface E2EService {
  readonly adminURL: URL;
  readonly indexdURL: URL;
  readonly password: string;
  readonly storagePath: string;
}

export function readE2EService(
  env: Readonly<Record<string, string | undefined>>,
): E2EService {
  const config = readHostServiceConfig(env);
  const storagePath = env.SIA_TEST_STORAGE_PATH;
  if (!storagePath || !isAbsolute(storagePath))
    throw new Error("Explicit absolute host storage path is required");
  return { ...config, storagePath };
}

export function withDisposableAccount<T>(
  options: DisposableAccountOptions,
  use: (account: DisposableAccount) => Promise<T>,
): Promise<T> {
  return withAccount(options, (account) => use(account));
}
