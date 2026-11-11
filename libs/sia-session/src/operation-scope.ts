/** A dependent operation scope pins one SDK while independent admitted callbacks drain. */
import { SdkSessionError, SdkSessionErrorCode } from "./types.ts";
import type {
  LeaseContext,
  SdkLease,
  SdkOperationScope,
  SdkSource,
  SdkWork,
} from "./types.ts";

/** Coordinates admitted work and closure around one retained parent lease. */
class OperationScopeState<T> {
  readonly closed: Promise<void>;
  private active = 0;
  private closing = false;
  private readonly context: LeaseContext;
  private drained = false;

  constructor(private readonly lease: SdkLease<T>) {
    this.closed = new Promise<void>((resolve, reject) => {
      this.resolveClosed = resolve;
      this.rejectClosed = reject;
    });
    void this.closed.catch(() => undefined);
    this.context = Object.freeze({
      id: lease.id,
      isCurrent: lease.isCurrent,
      onRetire: lease.onRetire,
    });
  }

  close(): Promise<void> {
    if (!this.closing) {
      this.closing = true;
      this.drain();
    }
    return this.closed;
  }

  observeRetirement(): void {
    // Retirement can run during registration; do not install an obsolete unsubscribe afterward.
    let unsubscribe: () => void;
    try {
      unsubscribe = this.lease.onRetire(() => {
        void this.close();
      });
    } catch (error) {
      // A failed retirement subscription must not leave the parent SDK pinned.
      try {
        this.lease.release();
      } catch {
        // Preserve the admission failure when an external source also fails release.
      }
      throw error;
    }
    if (this.closing) unsubscribe();
    else this.stopRetirement = unsubscribe;
  }

  async run<R>(work: SdkWork<T, R>): Promise<R> {
    if (this.closing) throw new SdkSessionError(SdkSessionErrorCode.Closed);
    this.active++;
    try {
      return await work(this.lease.value, this.context);
    } finally {
      this.active--;
      this.drain();
    }
  }

  private drain(): void {
    if (!this.closing || this.active !== 0 || this.drained) return;
    this.drained = true;
    let failure: unknown;
    let failed = false;
    try {
      this.stopRetirement();
    } catch (error) {
      failure = error;
      failed = true;
    }
    // A broken unsubscribe cannot strand the parent SDK or replace a work error.
    try {
      this.lease.release();
    } catch (error) {
      if (!failed) failure = error;
      failed = true;
    }
    if (failed) this.rejectClosed(failure);
    else this.resolveClosed();
  }

  private rejectClosed: (error: unknown) => void = () => undefined;
  private resolveClosed: () => void = () => undefined;
  private stopRetirement: () => void = () => undefined;
}

/** Opens a child scope without transferring cleanup authority from the SDK owner. */
export function openSiaSdkOperationScope<T>(
  parent: SdkSource<T>,
): SdkOperationScope<T> {
  const state = new OperationScopeState(parent.acquire());
  state.observeRetirement();
  return Object.freeze({
    close: () => state.close(),
    closed: state.closed,
    run: <R>(work: SdkWork<T, R>) => state.run(work),
  });
}
