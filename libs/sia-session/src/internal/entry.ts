/** One SDK entry owns admitted leases and defers its destructor until retirement and final release. */
import { createNanoEvents } from "nanoevents";
import {
  SdkIssueKind,
  SdkSessionError,
  SdkSessionErrorCode,
} from "../types.ts";
import type { RetireReason, SdkHandle, SdkLease } from "../types.ts";
import type { Notifications } from "./notifications.ts";
import { createSubscriptions } from "./subscriptions.ts";
import type { Listener } from "./subscriptions.ts";

export type DisposalResult = DisposalFailure | DisposalSuccess;
type CompletionCallback = () => void;
type CurrentCheck = () => boolean;
interface DisposalFailure {
  readonly error: unknown;
  readonly ok: false;
}
type DisposalResolver = (result: DisposalResult) => void;
interface DisposalSuccess {
  readonly ok: true;
}
interface EntryEvents {
  retire: Listener<RetireReason>;
}

/** Entry-local state cannot choose the session's current SDK or publish its snapshots. */
export class SdkEntry<T> {
  readonly done: Promise<DisposalResult>;
  readonly id: symbol;
  /** Retirement can precede final lease release and cleanup; drain waits for those entries. */
  get retired(): boolean {
    return this.#reason !== null;
  }
  #cleanupStarted = false;
  readonly #events = createNanoEvents<EntryEvents>();
  #handle: SdkHandle<T> | undefined;
  readonly #isCurrent: CurrentCheck;
  #leaseCount = 0;
  // Disposal notifications outlive source closure when a retired SDK still has borrowers.
  readonly #notifications: Notifications;
  readonly #onComplete: CompletionCallback;
  #reason: null | RetireReason = null;

  /** Captures completion bookkeeping without invoking SDK cleanup or caller callbacks. */
  constructor(
    id: symbol,
    handle: SdkHandle<T>,
    isCurrent: CurrentCheck,
    onComplete: CompletionCallback,
    notifications: Notifications,
  ) {
    this.id = id;
    this.#handle = handle;
    this.#isCurrent = isCurrent;
    this.#onComplete = onComplete;
    this.#notifications = notifications;
    this.done = new Promise((resolve) => {
      this.#resolveDisposal = resolve;
    });
  }

  /** Retains this entry; only the session decides whether new admission is allowed. */
  acquire(): SdkLease<T> {
    this.#leaseCount++;
    let released = false;
    const subscriptions = createSubscriptions();
    const readValue = () => {
      if (released || !this.#handle)
        throw new SdkSessionError(SdkSessionErrorCode.Released);
      return this.#handle.value;
    };
    return Object.freeze<SdkLease<T>>({
      id: this.id,
      isCurrent: () => !released && this.#isCurrent(),
      onRetire: (listener) => {
        if (released) throw new SdkSessionError(SdkSessionErrorCode.Released);
        if (this.#reason !== null) {
          this.#notifications.notify(listener, [this.#reason], this.id);
          return () => undefined;
        }
        return subscriptions.once<RetireReason>(
          (callback) => this.#events.on("retire", callback),
          (reason) => this.#notifications.notify(listener, [reason], this.id),
        );
      },
      release: () => {
        if (released) return;
        released = true;
        subscriptions.clear();
        this.#leaseCount--;
        this.#cleanup();
      },
      get value() {
        return readValue();
      },
    });
  }

  /** Retirement callbacks can release the final lease before notification returns. */
  retire(reason: RetireReason): void {
    this.#reason = reason;
    this.#events.emit("retire", reason);
    this.#cleanup();
  }

  /** A disposer can reenter, so it must be marked started before calling SDK code. */
  #cleanup(): void {
    if (this.#reason === null || this.#leaseCount !== 0 || this.#cleanupStarted)
      return;
    const handle = this.#handle;
    if (!handle) return;
    this.#cleanupStarted = true;
    this.#handle = undefined;
    const reason = this.#reason;
    try {
      void Promise.resolve(handle.dispose()).then(
        () => this.#completeCleanup(reason, { ok: true }),
        (error: unknown) => this.#completeCleanup(reason, { error, ok: false }),
      );
    } catch (error) {
      this.#completeCleanup(reason, { error, ok: false });
    }
  }

  /** Remove completed failures before external hooks can start a reentrant drain. */
  #completeCleanup(reason: RetireReason, result: DisposalResult): void {
    this.#onComplete();
    if (result.ok)
      this.#notifications.disposed(Object.freeze({ id: this.id, reason }));
    else
      this.#notifications.report(result.error, this.id, SdkIssueKind.Disposal);
    this.#resolveDisposal(result);
  }

  #resolveDisposal: DisposalResolver = () => undefined;
}
