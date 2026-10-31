/** Private ownership callbacks for provisioning and exact known-resource cleanup. */
export interface CleanupOptions extends AdminOptions {
  accountKey?: string | undefined;
  created?: CreatedResources;
  quotaKey?: string;
  /** Caller must retain exclusive admin ownership through cleanup and persist each phase. */
  recoveryRecord?: (phase: CleanupPhase) => Promise<void>;
}
export type CleanupPhase =
  `${"account" | "connect-key" | "quota"}-${"delete-failed" | "delete-pending" | "deleted"}`;
export interface CreatedResources {
  connectKey?: string;
  quota?: boolean;
  recoveryPath?: string;
}
export interface ProvisionedResources extends CreatedResources {
  appID: string;
  quotaKey: string;
}
export interface ProvisionOptions extends AdminOptions {
  appID: string;
  fundTargetBytes?: number;
  /** Records fresh exact identities before the first admin mutation. */
  recovery?: ProvisionRecovery;
  storagePath?: string;
}
export interface ProvisionRecovery {
  /** Resolve only after file/directory sync in a 0700 directory with 0600 files.
   * The plan contains the minimum connect credential, never an admin password or seed.
   */
  persist(event: {
    readonly phase: RecoveryPhase;
    readonly plan: RecoveryPlan;
  }): Promise<void>;
}
export type RecoveryPhase =
  | "connect-key-create-pending"
  | "connect-key-created"
  | "intent"
  | "provision-failed"
  | "quota-create-pending"
  | "quota-created"
  | CleanupPhase;
/** Contains the minimum recovery credential; persist only in a private durable manifest. */
export interface RecoveryPlan {
  readonly appID: string;
  readonly connectKey: string;
  readonly quotaKey: string;
}
interface AdminOptions {
  adminURL: string | URL;
  fetchImpl?: FetchCall;
  password: string;
}
/** Keeps admin provisioning calls typed without including them in browser builds. */
type FetchCall = (url: URL, init: RequestInit) => Promise<Response>;
export function approveIndexd(options: {
  connectKey: string | undefined;
  fetchImpl?: FetchCall;
  indexdURL: string | URL;
  responseURL: string;
}): Promise<void>;
export function cleanupIndexd(options: CleanupOptions): Promise<void>;
export function parseConnectKeyResponse(value: unknown): string;
export function provisionIndexd(
  options: ProvisionOptions,
): Promise<ProvisionedResources>;
