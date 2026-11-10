/** The session alone chooses the current SDK and commits snapshots before notifying consumers. */
import { createNanoEvents } from "nanoevents";
import { SdkEntry } from "./internal/entry.ts";
import { createNotifications } from "./internal/notifications.ts";
import { adoptClient, adoptHandle } from "./internal/ownership.ts";
import { createSubscriptions } from "./internal/subscriptions.ts";
import {
  RetireReason,
  SdkSessionError,
  SdkSessionErrorCode,
  SdkState,
} from "./types.ts";
import type { Admission } from "./internal/ownership.ts";
import type { Listener } from "./internal/subscriptions.ts";
import type {
  AcquireOptions,
  SdkClient,
  SdkHandle,
  SdkLease,
  SdkObserver,
  SdkSession,
  SdkSessionOptions,
  SdkSnapshot,
  SdkSource,
  SdkWork,
  SetHandleOptions,
  SetOptions,
} from "./types.ts";

interface SessionEvents {
  change: Listener<SdkSnapshot>;
}

/**
 * Takes ownership of an existing SDK without creating or connecting another client.
 *
 * The session calls the captured `free()` method with its original receiver after
 * retirement and the final lease release. Callers must not free an adopted SDK.
 * Borrowed types omit `free` and symbol members; the SDK is not cloned or wrapped.
 *
 * @param client - An SDK whose cleanup ownership transfers on successful adoption.
 * @param options - Disposal notifications and error reporting for the session.
 * @returns An owner with a borrowed source to pass to independent consumers.
 * @throws SdkSessionError if the client is invalid or already owned.
 */
export function createSessionFromClient<Client extends SdkClient>(
  client: Client,
  options?: SdkSessionOptions,
): SdkSession<Omit<Client, "free" | symbol>> {
  const session = createSiaSdkSession<Omit<Client, "free" | symbol>>(options);
  session.set(client);
  return session;
}

/**
 * Creates an empty SDK owner whose source can be shared before a client is ready.
 *
 * Acquisitions fail until `set` or `setHandle` supplies a client. Replacements
 * retire the previous SDK without freeing it while admitted work still holds it.
 * This function does not create or connect SDK clients.
 *
 * @typeParam T - The borrowed SDK view exposed to consumers, without disposal methods.
 * @param options - Disposal notifications and error reporting for accepted SDKs.
 * @returns A reusable session that accepts clients until permanently closed.
 */
export function createSiaSdkSession<T>(
  options: SdkSessionOptions = {},
): SdkSession<T> {
  const events = createNanoEvents<SessionEvents>();
  const notifications = createNotifications(options);
  const observers = createSubscriptions();
  const pending = new Set<SdkEntry<T>>();
  let current: SdkEntry<T> | undefined;
  let snapshot: SdkSnapshot = Object.freeze({
    id: null,
    state: SdkState.Empty,
  });
  let closing: Promise<void> | undefined;

  function change(published: SdkSnapshot): void {
    events.emit("change", published);
    if (snapshot.state === SdkState.Closed) observers.clear();
  }
  function check(before: SdkSnapshot, expected?: SdkSnapshot): void {
    if (snapshot.state === SdkState.Closed)
      throw new SdkSessionError(SdkSessionErrorCode.Closed);
    if (
      snapshot !== before ||
      (expected !== undefined && expected !== snapshot)
    )
      throw new SdkSessionError(SdkSessionErrorCode.Conflict);
  }
  function acquire(acquireOptions?: AcquireOptions): SdkLease<T> {
    // An option getter can replace or close the SDK before admission starts.
    const expectedId = acquireOptions?.expectedId;
    const entry = current;
    if (!entry)
      throw new SdkSessionError(
        snapshot.state === SdkState.Closed
          ? SdkSessionErrorCode.Closed
          : SdkSessionErrorCode.Unavailable,
      );
    if (expectedId !== undefined && expectedId !== entry.id)
      throw new SdkSessionError(SdkSessionErrorCode.Stale);
    return entry.acquire();
  }

  /** Commit the replacement before retiring its predecessor; retirement can reenter and replace it again. */
  function install(admission: Admission<T>): symbol {
    const entry = new SdkEntry<T>(
      admission.id,
      admission.handle,
      (): boolean => current === entry,
      () => {
        pending.delete(entry);
      },
      notifications,
    );
    const previous = current;
    current = entry;
    pending.add(entry);
    const published = Object.freeze({
      id: entry.id,
      state: SdkState.Available as const,
    });
    snapshot = published;
    previous?.retire(RetireReason.Replaced);
    change(published);
    return entry.id;
  }
  function setClient(client: SdkClient & T, setOptions?: SetOptions): symbol {
    const before = snapshot;
    const expected = setOptions?.expectedSnapshot;
    const admission = adoptClient(client, current?.id, () =>
      check(before, expected),
    );
    return typeof admission === "symbol" ? admission : install(admission);
  }
  function setHandle(
    handle: SdkHandle<T>,
    setOptions?: SetHandleOptions,
  ): symbol {
    const before = snapshot;
    const expected = setOptions?.expectedSnapshot;
    const sharedValue = setOptions?.valueOwnership === "shared";
    return install(
      adoptHandle(handle, () => check(before, expected), sharedValue),
    );
  }

  const source: SdkSource<T> = Object.freeze({
    acquire,
    getSnapshot: () => snapshot,
    subscribe: (listener: SdkObserver) => {
      if (snapshot.state === SdkState.Closed) return () => undefined;
      return observers.subscribe<SdkSnapshot>(
        (callback) => events.on("change", callback),
        (published) => {
          // Reentrant changes make earlier snapshots obsolete during the same emission.
          if (snapshot === published)
            notifications.notify(listener, [], published.id);
        },
      );
    },
    async withSdk<R>(
      work: SdkWork<T, R>,
      acquireOptions?: AcquireOptions,
    ): Promise<R> {
      const lease = acquire(acquireOptions);
      try {
        return await work(
          lease.value,
          Object.freeze({
            id: lease.id,
            isCurrent: lease.isCurrent,
            onRetire: lease.onRetire,
          }),
        );
      } finally {
        lease.release();
      }
    },
  });
  return Object.freeze({
    clear: () => {
      if (closing) return closing;
      const previous = current;
      const done = wait(previous ? [previous] : []);
      current = undefined;
      const published = Object.freeze({
        id: null,
        state: SdkState.Empty as const,
      });
      snapshot = published;
      previous?.retire(RetireReason.Cleared);
      change(published);
      return done;
    },
    close: () => {
      if (closing) return closing;
      closing = wait([...pending]);
      const previous = current;
      current = undefined;
      const published = Object.freeze({
        id: null,
        state: SdkState.Closed as const,
      });
      snapshot = published;
      previous?.retire(RetireReason.Closed);
      change(published);
      return closing;
    },
    drain: () => wait([...pending].filter((entry) => entry.retired)),
    set: setClient,
    setHandle,
    source,
  });
}

/** A cleanup failure must not let close finish while another captured SDK is still in use. */
function wait<T>(entries: SdkEntry<T>[]): Promise<void> {
  const done = Promise.all(entries.map((entry) => entry.done)).then(
    (results) => {
      const failures = results.flatMap((result) =>
        result.ok ? [] : [result.error],
      );
      if (failures.length)
        throw new AggregateError(failures, "SDK cleanup failed");
    },
  );
  // A synchronous caller may initiate retirement without awaiting it; errors still reach onError.
  void done.catch(() => undefined);
  return done;
}
