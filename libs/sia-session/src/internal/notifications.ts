/** Callback failures are observed without interrupting an accepted ownership transition. */
import { SdkIssueKind } from "../types.ts";
import type { SdkDisposeEvent, SdkSessionOptions } from "../types.ts";

export type Notifications = ReturnType<typeof createNotifications>;
type NotificationListener<Args extends unknown[]> = (...args: Args) => unknown;

/**
 * Keeps callback exception handling separate from SDK selection and lease ownership.
 * Returned promises are observed for failures, but do not delay disposal completion.
 */
export function createNotifications(options: SdkSessionOptions) {
  const onError = options.onError;
  const onDispose = options.onDispose;
  function report(error: unknown, id: null | symbol, kind: SdkIssueKind): void {
    try {
      void Promise.resolve(onError?.(Object.freeze({ error, id, kind }))).catch(
        () => undefined,
      );
    } catch {
      // Reporting failures cannot undo an accepted SDK or interrupt other listeners.
    }
  }
  function notify<Args extends unknown[]>(
    listener: NotificationListener<Args>,
    args: Args,
    id: null | symbol,
  ): void {
    try {
      void Promise.resolve(listener(...args)).catch((error: unknown) =>
        report(error, id, SdkIssueKind.Listener),
      );
    } catch (error) {
      report(error, id, SdkIssueKind.Listener);
    }
  }
  return {
    disposed(event: SdkDisposeEvent) {
      if (onDispose) notify(onDispose, [event], event.id);
    },
    notify,
    report,
  };
}
