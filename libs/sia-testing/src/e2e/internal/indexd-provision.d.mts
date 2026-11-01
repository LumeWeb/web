/** Provisioning acknowledgments and private recovery contracts for exact-resource cleanup. */
/** Cleanup accepts acknowledged identities; a pending recovery plan alone permits no deletion. */
export interface CleanupOptions extends AdminOptions {
  /** SDK identity acknowledged by the consumer, not inferred from a failed registration. */
  accountKey?: string | undefined;
  created?: CreatedResources;
  quotaKey?: string;
  /** The caller retains the admin lease; a failed pending write skips that resource's DELETE. */
  recoveryRecord?: (phase: CleanupPhase) => Promise<void>;
}
/** Durable delete states retained when a response or recording operation is uncertain. */
export type CleanupPhase =
  `${"account" | "connect-key" | "quota"}-${"delete-failed" | "delete-pending" | "deleted"}`;
/** Only successful creation acknowledgments grant authority to delete these resources. */
export interface CreatedResources {
  connectKey?: string;
  quota?: boolean;
  /** Retained for unknown registration or failed cleanup; it may contain a connect credential. */
  recoveryPath?: string;
}
/** Quota and approval resources prepared before consumer-managed SDK registration. */
export interface ProvisionedResources extends CreatedResources {
  appID: string;
  quotaKey: string;
}
/** Inputs for fresh resources; caller-supplied quota identities are not accepted. */
export interface ProvisionOptions extends AdminOptions {
  appID: string;
  /** Zero requests no host funding, allowing metadata-only test accounts. */
  fundTargetBytes?: number;
  /** Records fresh exact identities before the first admin mutation. */
  recovery?: ProvisionRecovery;
  storagePath?: string;
}
/** A recorder must acknowledge durable intent before its corresponding admin request. */
export interface ProvisionRecovery {
  /** Resolve only after file/directory sync in a 0700 directory with 0600 files.
   * The plan contains the minimum connect credential, never an admin password or seed.
   */
  persist(event: {
    readonly phase: RecoveryPhase;
    readonly plan: RecoveryPlan;
  }): Promise<void>;
}
/** Durable states locate incomplete provisioning and cleanup after uncertain responses. */
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
/** Node-side admin credentials with an HTTP substitution point for offline fixtures. */
interface AdminOptions {
  adminURL: string | URL;
  fetchImpl?: FetchCall;
  password: string;
}
/** Offline fixtures substitute HTTP calls here; production defaults to Node's fetch. */
type FetchCall = (url: URL, init: RequestInit) => Promise<Response>;
/** Approval is restricted to the selected app origin and its connection route. */
export function approveIndexd(options: {
  connectKey: string | undefined;
  fetchImpl?: FetchCall;
  indexdURL: string | URL;
  responseURL: string;
}): Promise<void>;
/** Attempts independent acknowledged resources and retains recording and deletion failures. */
export function cleanupIndexd(options: CleanupOptions): Promise<void>;
/** Malformed success bodies cannot establish ownership of a created connect key. */
export function parseConnectKeyResponse(value: unknown): string;
/** Records exact fresh identities before mutation and returns only acknowledged resources. */
export function provisionIndexd(
  options: ProvisionOptions,
): Promise<ProvisionedResources>;
