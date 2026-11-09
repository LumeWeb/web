/** Narrow client views retain the parent SDK without creating another disposal owner. */
import { SdkSessionError, SdkSessionErrorCode } from "./types.ts";
import type {
  AcquireOptions,
  SdkLease,
  SdkObserver,
  SdkSelector,
  SdkSource,
  SdkWork,
} from "./types.ts";

interface SelectedView<View> {
  readonly value: View;
}

/**
 * Exposes a smaller SDK view while retaining the parent's identities and lifetimes.
 *
 * Selection runs for each acquisition or short operation. Mapping attempts parent
 * release after selection or lease construction fails, preserving the original error.
 * Selected methods must preserve the SDK's receiver, for example by calling it
 * through a closure instead of copying it.
 *
 * @param source - A borrowed source; mapping does not take disposal ownership.
 * @param select - Builds the consumer's view from the admitted SDK.
 * @returns A source with the parent's snapshots and SDK IDs, but projected values.
 */
export function mapSiaSdkSession<T, View>(
  source: SdkSource<T>,
  select: SdkSelector<T, View>,
): SdkSource<View> {
  return Object.freeze({
    acquire(options?: AcquireOptions): SdkLease<View> {
      const lease = source.acquire(options);
      let selected: SelectedView<View> | undefined;
      try {
        selected = { value: select(lease.value) };
        return Object.freeze<SdkLease<View>>({
          id: lease.id,
          isCurrent: () => lease.isCurrent(),
          onRetire: (listener) => lease.onRetire(listener),
          release: () => {
            if (selected) {
              selected = undefined;
              lease.release();
            }
          },
          get value() {
            if (!selected)
              throw new SdkSessionError(SdkSessionErrorCode.Released);
            return selected.value;
          },
        });
      } catch (error) {
        try {
          lease.release();
        } catch {
          // A supplied release failure must not replace the selection or construction error.
        }
        throw error;
      }
    },
    getSnapshot: () => source.getSnapshot(),
    subscribe: (listener: SdkObserver) => source.subscribe(listener),
    withSdk<R>(work: SdkWork<View, R>, options?: AcquireOptions): Promise<R> {
      return source.withSdk(
        (sdk, context) => work(select(sdk), context),
        options,
      );
    },
  });
}
