/** Validated controller configuration is shared by protocol and credential operations. */
import { createMemoryCredentialStore, normalizeScope } from "./credentials.ts";
import type { CredentialScope, CredentialStore } from "./credentials.ts";
import type {
  SiaAccessAdapter,
  SiaAccessOptions,
  SiaApplication,
} from "./access-types.ts";

export interface AccessEnvironment<Session> {
  readonly adapter: SiaAccessAdapter<Session>;
  readonly application: SiaApplication;
  readonly approvalTimeoutMs: number;
  readonly credentials: CredentialStore;
  readonly scope: CredentialScope;
}
export function createAccessEnvironment<Session>(
  options: SiaAccessOptions<Session>,
): AccessEnvironment<Session> {
  const scope = normalizeScope(options.application.appId, options.indexerUrl);
  const approvalTimeoutMs = options.approvalTimeoutMs ?? 300000;
  if (!Number.isFinite(approvalTimeoutMs) || approvalTimeoutMs <= 0)
    throw new TypeError("Invalid approval timeout");
  return Object.freeze({
    adapter: options.adapter,
    application: Object.freeze({ ...options.application, appId: scope.appId }),
    approvalTimeoutMs,
    credentials: options.credentials ?? createMemoryCredentialStore(),
    scope,
  });
}
