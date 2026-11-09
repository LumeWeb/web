/** Native cancellation stays separate from the platform-free SDK source contract. */
import { waitForSdk } from "./internal/wait-for-sdk.ts";
import { createSubscriptions } from "./internal/subscriptions.ts";
import type {
  LeaseContext,
  RetireReason,
  SdkLease,
  SdkSource,
} from "./types.ts";

export interface AbortOptions {
  readonly signal?: AbortSignal;
}
export interface LeaseAbortSignal {
  /**
   * Stops forwarding retirement and caller cancellation without releasing the lease.
   * Caller cancellation is detached even if retirement unsubscribe throws;
   * the unsubscribe error still propagates to this caller.
   */
  dispose(): void;
  readonly signal: AbortSignal;
}

/**
 * Waits for an available SDK and retains it before returning its lease.
 *
 * Unlike `source.acquire`, an empty source keeps this request pending. Closure
 * rejects it; caller cancellation preserves the signal's reason. Cancellation
 * stops affecting acquisition once the lease has been handed to the caller.
 *
 * @param source - The source to observe and acquire from; it remains caller-owned.
 * @param options - An optional signal for cancelling the pending acquisition.
 * @returns A lease the caller must release, even if retirement precedes resumption.
 * @remarks Failed handoffs attempt lease release without replacing the original error.
 */
export function acquireSdkWhenAvailable<T>(
  source: SdkSource<T>,
  options: AbortOptions = {},
): Promise<SdkLease<T>> {
  return waitForSdk(source, options.signal);
}

/**
 * Links lease retirement and optional caller cancellation to a native abort signal.
 *
 * Already retired work produces an aborted signal. Aborting this signal does not
 * release the SDK lease or prove that native work stopped; the consumer retains
 * its lease until its operation and dependent cleanup finish.
 *
 * @param context - The retained operation's retirement and currentness context.
 * @param options - Optional caller cancellation whose reason is forwarded unchanged.
 * @returns A signal and a disposer to detach both subscriptions when work finishes.
 */
export function createLeaseAbortSignal(
  context: LeaseContext,
  options: AbortOptions = {},
): LeaseAbortSignal {
  const controller = new AbortController();
  const subscriptions = createSubscriptions();
  const signal = options.signal;
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  subscriptions.subscribe<RetireReason>(
    (listener) => context.onRetire(listener),
    (reason) => controller.abort(reason),
  );
  if (signal)
    subscriptions.subscribe<Event>((listener) => {
      signal.addEventListener("abort", listener, { once: true });
      return () => signal.removeEventListener("abort", listener);
    }, abort);
  if (signal?.aborted) abort();
  return { dispose: subscriptions.clear, signal: controller.signal };
}
