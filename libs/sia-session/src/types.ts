/** SDK sources expose borrowed clients; only their session controls replacement and cleanup. */
export enum RetireReason {
  Cleared = "cleared",
  Closed = "closed",
  Replaced = "replaced",
}
export enum SdkIssueKind {
  Disposal = "disposal",
  Listener = "listener",
}
export enum SdkSessionErrorCode {
  AlreadyUsed = "already-used",
  Closed = "closed",
  Conflict = "conflict",
  InvalidHandle = "invalid-handle",
  Released = "released",
  Stale = "stale",
  Unavailable = "unavailable",
}
export enum SdkState {
  Available = "available",
  Closed = "closed",
  Empty = "empty",
}
export interface AcquireOptions {
  readonly expectedId?: symbol;
}

export interface AvailableSdkSnapshot {
  readonly id: symbol;
  readonly state: SdkState.Available;
}

export interface LeaseContext {
  readonly id: symbol;
  /** Returns false after this lease releases or its SDK is no longer current. */
  isCurrent(this: void): boolean;
  /**
   * Observes this SDK's retirement once; an already retired lease notifies immediately.
   * Releasing the lease removes pending listeners. Registering after release throws
   * SdkSessionError with code Released.
   * @returns A function that cancels this listener without releasing the lease.
   */
  onRetire(this: void, listener: RetireListener): Unsubscribe;
}

/** Retirement callbacks receive the reason without taking disposal ownership. */
export type RetireListener = (reason: RetireReason) => unknown;

/** Minimum SDK shape for transferring native cleanup to a session. */
export interface SdkClient {
  /** The owning session calls this method with the SDK receiver after its final use. */
  free(): void;
}

export interface SdkDisposeEvent {
  readonly id: symbol;
  readonly reason: RetireReason;
}

/** Receives successful cleanup notifications without delaying cleanup completion. */
export type SdkDisposeListener = (event: SdkDisposeEvent) => unknown;

export interface SdkHandle<T> {
  /**
   * Frees the adapted SDK after retirement and the last lease release.
   * The session preserves the handle receiver and waits for returned cleanup work.
   */
  dispose(): PromiseLike<void> | void;
  readonly value: T;
}

export interface SdkIssue {
  readonly error: unknown;
  readonly id: null | symbol;
  readonly kind: SdkIssueKind;
}
/** Receives cleanup and listener failures; its own failures do not escape the session. */
export type SdkIssueListener = (issue: SdkIssue) => unknown;
export interface SdkLease<T> extends LeaseContext {
  /**
   * Ends this use and removes its retirement listeners; repeated calls have no effect.
   * A retired SDK can begin cleanup when its final lease releases. The lease's
   * value is inaccessible afterward, even if another peer still holds the SDK.
   */
  release(this: void): void;
  readonly value: T;
}
/** Snapshot observers read current state separately from the change notification. */
export type SdkObserver = () => unknown;
/** Child work retains one parent SDK without gaining replacement or disposal authority. */
export interface SdkOperationScope<T> {
  /** Stops new work and waits for admitted callbacks before releasing the parent lease. */
  close(this: void): Promise<void>;
  /** Resolves after local closure and all admitted work; parent cleanup may finish later. */
  readonly closed: Promise<void>;
  /** Admits a callback before returning its promise, preserving its failure value. */
  run<R>(this: void, work: SdkWork<T, R>): Promise<R>;
}
/** A projection changes the borrowed view without creating another SDK owner. */
export type SdkSelector<T, View> = (sdk: T) => View;
export interface SdkSession<T> {
  /**
   * Removes the current SDK immediately and waits for that SDK's retained work and cleanup.
   * The session remains reusable; clearing an empty session still changes its snapshot.
   * After permanent closure, returns the existing close promise without reopening.
   */
  clear(this: void): Promise<void>;
  /**
   * Permanently rejects new admission, retires the current SDK and waits for outstanding cleanup.
   * Repeated calls return the same promise. Awaiting it inside a retained callback
   * deadlocks if that callback must finish before its lease can release.
   */
  close(this: void): Promise<void>;
  /**
   * Waits for SDKs already retired at the time of this call, excluding the current SDK.
   * Later retirements are outside this wait; captured cleanup failures reject it.
   */
  drain(this: void): Promise<void>;
  /**
   * Adopts a client using its captured free method and retires the previous SDK.
   * Setting the same current client returns its existing ID after expectation checks.
   * Rejected unused clients remain caller-owned; accepted SDKs must not be freed by callers.
   * @param options - An optional expected snapshot to reject obsolete setup results.
   * @returns The accepted SDK's identity, which survives until that SDK retires.
   * @throws SdkSessionError for closure, invalid input, conflicts or known SDK reuse.
   */
  set(this: void, client: SdkClient & T, options?: SetOptions): symbol;
  /**
   * Adopts an adapter's value and cleanup method without requiring a free method on the view.
   * Handles remain single-use. By default, object values cannot have another owner;
   * shared values require independently safe cleanup for every handle.
   * A failed adoption does not invoke the supplied disposer.
   * @param options - Snapshot check and optional shared-value ownership.
   * @returns The accepted SDK view's identity.
   * @throws SdkSessionError for closure, invalid input, conflicts or known identity reuse.
   */
  setHandle(
    this: void,
    handle: SdkHandle<T>,
    options?: SetHandleOptions,
  ): symbol;
  readonly source: SdkSource<T>;
}
export interface SdkSessionOptions {
  /** Runs after successful SDK cleanup; listener failure is reported without undoing disposal. */
  readonly onDispose?: SdkDisposeListener;
  /** Receives cleanup and listener failures; this reporter's own failures are ignored. */
  readonly onError?: SdkIssueListener;
}
export type SdkSnapshot = AvailableSdkSnapshot | UnavailableSdkSnapshot;
export interface SdkSource<T> {
  /**
   * Retains the current SDK synchronously; the caller must release the returned lease.
   * An expected ID rejects work based on an obsolete observation instead of borrowing a replacement.
   * @throws SdkSessionError with code Unavailable, Closed or Stale when admission fails.
   */
  acquire(this: void, options?: AcquireOptions): SdkLease<T>;
  /** Returns a stable observation until the next change, with no SDK or credentials. */
  getSnapshot(this: void): SdkSnapshot;
  /**
   * Observes state changes without retaining an SDK; callbacks can run synchronously.
   * Read getSnapshot for current state rather than treating notifications as event history.
   * @returns A function that unsubscribes this observer without closing the source.
   */
  subscribe(this: void, listener: SdkObserver): Unsubscribe;
  /**
   * Retains one SDK until the callback's result settles, preserving callback failures.
   * Returning a stream or native handle does not retain the SDK for its later use;
   * those resources need an explicit lease through their cleanup.
   * @param work - Work using the borrowed SDK and its retirement context.
   * @param options - An optional expected SDK ID for admission.
   * @returns The callback result, or a rejection if admission or callback work fails.
   */
  withSdk<R>(
    this: void,
    work: SdkWork<T, R>,
    options?: AcquireOptions,
  ): Promise<R>;
}
/** Callback settlement ends the short borrow, including rejection. */
export type SdkWork<T, R> = (
  sdk: T,
  context: LeaseContext,
) => PromiseLike<R> | R;
export interface SetHandleOptions extends SetOptions {
  /** Shared values can have separate handles; their disposers must not invalidate each other's leases. */
  readonly valueOwnership?: "exclusive" | "shared";
}
export interface SetOptions {
  readonly expectedSnapshot?: SdkSnapshot;
}
export interface UnavailableSdkSnapshot {
  readonly id: null;
  readonly state: SdkState.Closed | SdkState.Empty;
}
/** Stops one observation without closing its source or releasing an SDK lease. */
export type Unsubscribe = () => void;

/** Fixed messages avoid turning rejected SDK values into diagnostic output. */
export class SdkSessionError extends Error {
  readonly code: SdkSessionErrorCode;
  /** Creates a typed failure from its code without inspecting an SDK value. */
  constructor(code: SdkSessionErrorCode) {
    super(`SDK session: ${code}`);
    this.name = "SdkSessionError";
    this.code = code;
  }
}
