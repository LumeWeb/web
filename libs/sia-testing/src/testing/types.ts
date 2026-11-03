/** Scoped storage contracts keep fixture mutation handles separate from readable object data. */
import type { MockMutationFaults } from "./mutations.js";
import type { MockFaults, RequestReceipt } from "./controls.js";
declare const ownership: unique symbol;
export type ActorRef = Owned<"actor">;

export interface AppDefinition {
  readonly description: string;
  readonly id: string;
  readonly name: string;
  readonly serviceUrl: string;
}
export type ApplicationObject = Owned<"application-object"> & {
  readonly id: string;
};
export interface ApplicationPort {
  close(): Promise<void>;
  delete(
    object: ApplicationObject,
    options?: { readonly signal?: AbortSignal },
  ): Promise<void>;
  events(input: {
    readonly cursor: null | ObjectCursor;
    readonly limit: number;
    readonly signal?: AbortSignal;
  }): Promise<EventPage>;
  inspect(
    object: ApplicationObject,
    options?: { readonly signal?: AbortSignal },
  ): Promise<"missing" | "pinned" | "uploaded">;
  pin(
    object: ApplicationObject,
    options?: { readonly signal?: AbortSignal },
  ): Promise<void>;
  upload(input: {
    readonly file: TestFile;
    readonly metadata: Uint8Array;
    readonly name: string;
    readonly signal?: AbortSignal;
  }): Promise<ApplicationObject>;
}
export type BrowserAccess = Owned<"access">;
export interface EventPage {
  readonly done: boolean;
  readonly events: readonly ObjectEvent[];
  readonly nextCursor: null | ObjectCursor;
}
export interface LiveRun {
  readonly backend: "live";
  readonly id: string;
  readonly objects: ManagedObjects;
  readonly ownerAccess: BrowserAccess;
  readonly shares: ManagedShares;
}
export interface LiveRunSummary {
  readonly backend: "live";
  readonly cleanup: "clean" | "uncertain";
  readonly id: string;
  readonly journalFile: string;
  readonly logicalUploadedBytes: number;
  readonly observedShardBytes: number;
}
export interface ManagedObjects {
  delete(object: TestObject): Promise<void>;
  inspect(object: TestObject): Promise<"missing" | "present">;
  upload(input: {
    readonly file: TestFile;
    readonly metadata: Uint8Array;
    readonly name: string;
  }): Promise<TestObject>;
}
export interface ManagedShares {
  attach(share: TestShare, object: TestObject): Promise<void>;
  create(input: {
    readonly expiresAt?: Date;
    readonly objects: readonly TestObject[];
  }): Promise<TestShare>;
  detach(share: TestShare, object: TestObject): Promise<void>;
  revoke(share: TestShare): Promise<void>;
}
export interface MockManagedShares extends ManagedShares {
  create(
    input: Parameters<ManagedShares["create"]>[0] & {
      readonly description?: string;
    },
  ): Promise<TestShare>;
}
export interface MockOptions {
  readonly clock?: "realtime" | { readonly start: string };
  readonly quotaBytes?: number;
}
export interface MockRun {
  readonly auth: {
    approve(url: string): Promise<void>;
    deny(url: string): Promise<void>;
    readonly fixturePhrase: string;
    readonly kind: "approval";
    readonly registrationAccess: BrowserAccess;
  };
  readonly backend: "mock";
  readonly id: string;
  readonly mock: MockSia;
  readonly objects: ManagedObjects;
  readonly ownerAccess: BrowserAccess;
  readonly shares: MockManagedShares;
}
export interface MockRunOptions {
  readonly app: AppDefinition;
  readonly limits?: Partial<RunLimits>;
  readonly signal?: AbortSignal;
}
export interface MockRunSummary {
  readonly backend: "mock";
  readonly cleanup: "clean";
  readonly id: string;
  readonly logicalUploadedBytes: number;
}
export interface MockSia {
  /** The label appears in driver receipts; only the returned reference selects this actor. */
  actor(label: string): ActorRef;
  advanceTime(milliseconds: number): void;
  application(input: {
    readonly access: BrowserAccess;
    readonly as: ActorRef;
  }): ApplicationPort;
  close(): Promise<void>;
  readonly faults: MockFaults;
  history(): readonly RequestReceipt[];
  readonly mutationFaults: MockMutationFaults;
  ownerShares(input: {
    readonly access: BrowserAccess;
    readonly as: ActorRef;
  }): OwnerSharePort;
  publish(input: { readonly access: BrowserAccess }): Promise<void>;
  reader(input: {
    readonly access: BrowserAccess;
    readonly as: ActorRef;
  }): ReadPort;
  run<T>(
    options: MockRunOptions,
    use: (run: MockRun) => Promise<T>,
  ): Promise<RunResult<T, MockRunSummary>>;
}
export interface ObjectCursor {
  readonly after: string;
  readonly id: string;
}
export interface ObjectEvent {
  readonly deleted: boolean;
  readonly id: string;
  readonly updatedAt: string;
}
export interface OwnerShareDetails {
  readonly description: string;
  readonly expiresAt?: string;
  readonly ref: OwnerShareRef;
  readonly statistics: {
    readonly logicalBytes: number;
    readonly objectCount: number;
  };
}
export interface OwnerSharePort {
  close(): Promise<void>;
  detail(
    share: OwnerShareRef,
    options?: { readonly signal?: AbortSignal },
  ): Promise<OwnerShareDetails>;
  list(page: PageRequest): Promise<ReadPage<OwnerShareDetails>>;
  objects(
    share: OwnerShareRef,
    page: PageRequest,
  ): Promise<ReadPage<ReadObject>>;
}
export type OwnerShareRef = Owned<"owner-share">;
export interface PageRequest {
  readonly limit: number;
  readonly offset: number;
  readonly signal?: AbortSignal;
}
export interface ReadObject {
  readonly id: string;
  readonly metadata: Uint8Array;
  readonly sizeBytes: number;
}
export interface ReadPage<T> {
  readonly done: boolean;
  readonly items: readonly T[];
  readonly nextOffset: number;
}
export interface ReadPort {
  close(): Promise<void>;
  download(
    object: Pick<ReadObject, "id">,
    range?: {
      readonly length?: number;
      readonly offset?: number;
      readonly signal?: AbortSignal;
    },
  ): Promise<ReadableStream<Uint8Array>>;
  object(
    id: string,
    options?: { readonly signal?: AbortSignal },
  ): Promise<ReadObject>;
  objects(input: {
    readonly limit: number;
    readonly offset: number;
    readonly signal?: AbortSignal;
  }): Promise<{
    readonly done: boolean;
    readonly nextOffset: number;
    readonly objects: readonly ReadObject[];
  }>;
}
export interface RunLimits {
  readonly maxLogicalUploadBytes: number;
  readonly maxObjects: number;
  readonly maxShares: number;
}
export interface RunResult<T, Summary extends RunSummary = RunSummary> {
  readonly summary: Summary;
  readonly value: T;
}
export type RunSummary = LiveRunSummary | MockRunSummary;
export type SiaRun = LiveRun | MockRun;
export interface TestFile {
  readonly name: string;
  open(): ReadableStream<Uint8Array>;
  readonly sha256: string;
  readonly sizeBytes: number;
}
export type TestObject = Owned<"object"> & {
  readonly id: string;
  readonly sha256: string;
  readonly sizeBytes: number;
};
export type TestShare = Owned<"share"> & {
  readonly access: BrowserAccess;
  readonly id: string;
};
interface Owned<Kind extends string> {
  readonly [ownership]: Kind;
}
