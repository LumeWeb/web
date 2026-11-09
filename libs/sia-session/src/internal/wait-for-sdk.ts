/** A waiter owns its subscriptions; each acquisition attempt owns its lease until handoff. */
import { SdkSessionError, SdkSessionErrorCode, SdkState } from "../types.ts";
import type { SdkLease, SdkSource, Unsubscribe } from "../types.ts";

type LeaseResolver<T> = (lease: SdkLease<T>) => void;
type WaitRejection = (reason: unknown) => void;

/** Stop accepting callbacks before provider cleanup; cleanup can reenter before the promise settles. */
class SdkWaiter<T> {
  #attempting = false;
  #changedDuringAttempt = false;
  readonly #reject: WaitRejection;
  readonly #resolve: LeaseResolver<T>;
  readonly #signal: AbortSignal | undefined;
  readonly #source: SdkSource<T>;
  #stopped = false;
  #unsubscribe: undefined | Unsubscribe;
  constructor(
    source: SdkSource<T>,
    signal: AbortSignal | undefined,
    resolve: LeaseResolver<T>,
    reject: WaitRejection,
  ) {
    this.#source = source;
    this.#signal = signal;
    this.#resolve = resolve;
    this.#reject = reject;
  }
  start(): void {
    if (this.#signal?.aborted) {
      this.#abort();
      return;
    }
    this.#signal?.addEventListener("abort", this.#abort, { once: true });
    try {
      this.#unsubscribe = this.#source.subscribe(this.#changed);
      if (this.#stopped) this.#detach();
      else this.#attempt();
    } catch (error) {
      this.#fail(error);
    }
  }

  readonly #abort = () => this.#fail(this.#signal?.reason);

  /** Only a successful handoff transfers an attempt's retention to the caller. */
  #attempt(): void {
    if (this.#stopped) return;
    if (this.#attempting) {
      // A source can notify synchronously while acquire is still returning its lease.
      this.#changedDuringAttempt = true;
      return;
    }
    this.#attempting = true;
    try {
      let retry = true;
      while (retry && !this.#stopped) {
        retry = false;
        this.#changedDuringAttempt = false;
        if (this.#signal?.aborted) {
          this.#abort();
          return;
        }
        let lease: SdkLease<T> | undefined;
        try {
          const snapshot = this.#source.getSnapshot();
          if (snapshot.state === SdkState.Closed) {
            this.#fail(new SdkSessionError(SdkSessionErrorCode.Closed));
            return;
          }
          if (snapshot.state !== SdkState.Available) {
            if (this.#changedDuringAttempt)
              retry = this.#source.getSnapshot() !== snapshot;
            continue;
          }
          try {
            lease = this.#source.acquire({ expectedId: snapshot.id });
          } catch (error) {
            try {
              retry =
                !this.#stopped &&
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === SdkSessionErrorCode.Stale &&
                this.#source.getSnapshot() !== snapshot;
            } catch {
              // A diagnostic snapshot failure cannot replace the acquisition error.
            }
            if (!retry) this.#fail(error);
            continue;
          }
          if (this.#stopped) return;
          if (this.#signal?.aborted) {
            this.#abort();
            return;
          }
          if (!lease.isCurrent()) {
            const obsolete = lease;
            lease = undefined;
            obsolete.release();
            // A stable snapshot gives no new SDK to acquire; wait for its next notification.
            retry = this.#source.getSnapshot() !== snapshot;
            continue;
          }
          this.#handoff(lease);
          lease = undefined;
        } catch (error) {
          // Handoff can fail after notifications stop but before the promise settles.
          if (this.#stopped) this.#reject(error);
          else this.#fail(error);
        } finally {
          // Each attempt owns its lease until handoff, including failures in supplied methods.
          try {
            lease?.release();
          } catch (error) {
            this.#fail(error);
          }
        }
      }
    } finally {
      this.#attempting = false;
    }
  }

  readonly #changed = () => {
    // A synchronous callback must wait until its unsubscribe function is available for handoff.
    if (this.#unsubscribe) this.#attempt();
  };

  #detach(): void {
    const unsubscribe = this.#unsubscribe;
    this.#unsubscribe = undefined;
    try {
      unsubscribe?.();
    } finally {
      this.#signal?.removeEventListener("abort", this.#abort);
    }
  }

  #fail(error: unknown): void {
    if (this.#stopped) return;
    this.#stopped = true;
    try {
      this.#detach();
    } catch {
      // Cleanup failure must not replace cancellation or the source's original failure.
    }
    // AbortSignal reasons can be non-Error values and must reach the waiter unchanged.
    this.#reject(error);
  }

  #handoff(lease: SdkLease<T>): void {
    this.#stopped = true;
    this.#detach();
    this.#resolve(lease);
  }
}

/**
 * Starts one cancellable wait without taking ownership of the supplied source.
 * Source closure and cancellation reject the wait; a successful handoff transfers
 * only the acquired lease to its caller.
 */
export function waitForSdk<T>(
  source: SdkSource<T>,
  signal?: AbortSignal,
): Promise<SdkLease<T>> {
  return new Promise((resolve, reject) => {
    new SdkWaiter(source, signal, resolve, reject).start();
  });
}
