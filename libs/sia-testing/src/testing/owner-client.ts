/** Owner clients retain opaque local references while authenticated connections carry wire tokens. */
import { createMockCalls, readObject } from "./client.js";
import type { MockCredential } from "./runtime.js";
import type { MockConnection } from "./transport.js";
import type {
  OwnerShareDetails,
  OwnerSharePort,
  OwnerShareRef,
  PageRequest,
  ReadPage,
} from "./types.js";

/** Wire tokens become client-local handles so JSON copies cannot be passed back as references. */
export function createMockOwnerShares(
  connection: MockConnection,
  credential: MockCredential,
): OwnerSharePort {
  const { call, lifetime } = createMockCalls(connection, credential);
  const tokens = new WeakMap<OwnerShareRef, string>();
  const references = new Map<string, OwnerShareRef>();
  const pending = new Set<Promise<unknown>>();
  let closing: Promise<void> | undefined;
  function execute<T>(action: () => Promise<T>): Promise<T> {
    const promise = Promise.resolve().then(() => {
      if (lifetime.signal.aborted) throw failure("closed");
      return action();
    });
    pending.add(promise);
    void promise.then(
      () => pending.delete(promise),
      () => pending.delete(promise),
    );
    return promise;
  }
  function token(ref: OwnerShareRef): string {
    const value = tokens.get(ref);
    if (!value) throw failure("foreign-handle");
    return value;
  }
  /** Reject malformed protocol data before it can acquire a local reference. */
  function details(value: unknown): OwnerShareDetails {
    if (
      !isRecord(value) ||
      typeof value.ref !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
        value.ref,
      ) ||
      typeof value.description !== "string" ||
      !isRecord(value.statistics) ||
      !integer(value.statistics.objectCount) ||
      !integer(value.statistics.logicalBytes) ||
      (value.expiresAt !== undefined &&
        (typeof value.expiresAt !== "string" ||
          !Number.isFinite(Date.parse(value.expiresAt))))
    )
      throw failure("invalid-input");
    let ref = references.get(value.ref);
    if (!ref) {
      ref = Object.freeze(Object.create(null)) as OwnerShareRef;
      tokens.set(ref, value.ref);
      references.set(value.ref, ref);
    }
    return {
      description: value.description,
      ref,
      ...(value.expiresAt === undefined ? {} : { expiresAt: value.expiresAt }),
      statistics: {
        logicalBytes: Number(value.statistics.logicalBytes),
        objectCount: Number(value.statistics.objectCount),
      },
    };
  }
  async function page<T>(
    operation: string,
    input: PageRequest,
    parse: (value: unknown) => T,
    ref?: OwnerShareRef,
  ): Promise<ReadPage<T>> {
    const { limit, offset, signal } = input;
    if (!integer(offset) || !integer(limit) || limit === 0)
      throw failure("invalid-input");
    const value: unknown = await (
      await call(
        operation,
        { limit, offset, ...(ref === undefined ? {} : { ref: token(ref) }) },
        signal,
      )
    ).json();
    if (
      !isRecord(value) ||
      !Array.isArray(value.items) ||
      value.items.length > limit ||
      !integer(value.nextOffset) ||
      value.nextOffset !== offset + value.items.length ||
      value.done !== value.items.length < limit
    )
      throw failure("invalid-input");
    return {
      done: value.done,
      items: value.items.map(parse),
      nextOffset: Number(value.nextOffset),
    };
  }
  return {
    close() {
      lifetime.abort();
      closing ??= Promise.allSettled([...pending]).then(() => {
        references.clear();
      });
      return closing;
    },
    detail(ref, options = {}) {
      const { signal } = options;
      return execute(async () =>
        details(
          await (await call("owner-share", { ref: token(ref) }, signal)).json(),
        ),
      );
    },
    list(input) {
      const pageInput = { ...input };
      return execute(() => page("owner-shares", pageInput, details));
    },
    objects(ref, input) {
      const pageInput = { ...input };
      return execute(() =>
        page("owner-share-objects", pageInput, readObject, ref),
      );
    },
  };
}
function failure(code: string): Error & { code: string } {
  return Object.assign(new Error("Owner share request failed"), { code });
}
function integer(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
