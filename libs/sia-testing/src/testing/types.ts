/** Scoped storage contracts keep fixture mutation handles separate from readable object data. */
import type { MockFaults, RequestReceipt } from "./controls.js";
declare const ownership: unique symbol;
export type ActorRef = Owned<"actor">;

export interface AppDefinition {
  readonly description: string;
  readonly id: string;
  readonly name: string;
  readonly serviceUrl: string;
}
export type BrowserAccess = Owned<"access">;
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
  readonly shares: ManagedShares;
}
export interface MockRunOptions {
  readonly app: AppDefinition;
  readonly limits?: Partial<RunLimits>;
  readonly signal?: AbortSignal;
}
export interface MockSia {
  actor(label: string): ActorRef;
  advanceTime(milliseconds: number): void;
  close(): Promise<void>;
  readonly faults: MockFaults;
  history(): readonly RequestReceipt[];
  reader(input: {
    readonly access: BrowserAccess;
    readonly as: ActorRef;
  }): ReadPort;
  run<T>(
    options: MockRunOptions,
    use: (run: MockRun) => Promise<T>,
  ): Promise<RunResult<T>>;
}
export interface ReadObject {
  readonly id: string;
  readonly metadata: Uint8Array;
  readonly sizeBytes: number;
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
export interface RunResult<T> {
  readonly summary: RunSummary;
  readonly value: T;
}
export interface RunSummary {
  readonly backend: "mock";
  readonly cleanup: "clean";
  readonly id: string;
  readonly logicalUploadedBytes: number;
}
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
