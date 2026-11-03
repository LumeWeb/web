/** Owner inspection joins held reads before their run can release its state. */
import { invalidInput } from "./diagnostics.js";
import type { createRequestControls, RequestSelector } from "./controls.js";
import type {
  ActorRef,
  OwnerSharePort,
  PageRequest,
  ReadPage,
} from "./types.js";

/** Track calls before their first microtask so immediate close still joins them. */
export function createOwnerSharePort(input: {
  actor: ActorRef;
  authorize(): void;
  controls: ReturnType<typeof createRequestControls>;
  read: Omit<OwnerSharePort, "close">;
  signal: AbortSignal;
  track<T>(action: () => Promise<T>): Promise<T>;
}): OwnerSharePort {
  const abort = new AbortController();
  const pending = new Set<Promise<unknown>>();
  let closing: Promise<void> | undefined;
  function request<T>(
    operation: RequestSelector["operation"],
    signal: AbortSignal | undefined,
    action: () => Promise<T>,
  ): Promise<T> {
    const callSignal = AbortSignal.any([
      input.signal,
      abort.signal,
      ...(signal ? [signal] : []),
    ]);
    const promise = Promise.resolve().then(() => {
      if (abort.signal.aborted)
        throw Object.assign(new Error("Owner port is closed"), {
          code: "closed",
        });
      input.authorize();
      return input.track(async () => {
        const receipt = await input.controls.begin(
          input.actor,
          operation,
          undefined,
          callSignal,
        );
        try {
          callSignal.throwIfAborted();
          input.authorize();
          const value = await action();
          receipt.status = "completed";
          return value;
        } catch (error) {
          receipt.status = callSignal.aborted ? "cancelled" : "failed";
          throw error;
        }
      });
    });
    pending.add(promise);
    void promise.then(
      () => pending.delete(promise),
      () => pending.delete(promise),
    );
    return promise;
  }
  return {
    close() {
      abort.abort();
      closing ??= Promise.allSettled([...pending]).then(() => undefined);
      return closing;
    },
    detail(ref, options = {}) {
      return request("owner-share", options.signal, () =>
        input.read.detail(ref),
      );
    },
    list(page) {
      const { limit, offset, signal } = page;
      return request("owner-shares", signal, () =>
        input.read.list({ limit, offset }),
      );
    },
    objects(ref, page) {
      const { limit, offset, signal } = page;
      return request("owner-share-objects", signal, () =>
        input.read.objects(ref, { limit, offset }),
      );
    },
  };
}
export function ownerPage<T>(
  items: readonly T[],
  { limit, offset }: PageRequest,
): ReadPage<T> {
  validateOwnerPage({ limit, offset });
  const rows = items.slice(offset, offset + limit);
  return {
    done: rows.length < limit,
    items: rows,
    nextOffset: offset + rows.length,
  };
}
export function validateOwnerPage({ limit, offset }: PageRequest): void {
  if (!Number.isSafeInteger(offset) || offset < 0)
    throw invalidInput("offset", "offset must be a nonnegative safe integer");
  if (!Number.isSafeInteger(limit) || limit <= 0)
    throw invalidInput("limit", "limit must be a positive safe integer");
}
