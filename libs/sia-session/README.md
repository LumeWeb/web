# Sia session

`@lumeweb/sia-session` lets components borrow one Sia SDK while one owner controls its cleanup. A lease keeps an SDK alive until its borrower finishes, even after replacement or closure. The package uses nanoevents and has no SDK or framework runtime dependency.

## Get started

The package is private and ESM-only. From a consumer package in this pnpm workspace, add its workspace dependency:

```sh
pnpm add @lumeweb/sia-session@workspace:*
```

Pass a WASM SDK your application has already connected to `createSessionFromClient`. This example reads an object's size and then closes the SDK. Its type import selects the WASM client explicitly:

```ts
import { createSessionFromClient } from "@lumeweb/sia-session";
import type { Sdk } from "@siafoundation/sia-storage/wasm";

async function readObjectSize(sdk: Sdk, objectKey: string): Promise<number> {
  const session = createSessionFromClient(sdk);
  try {
    return await session.source.withSdk(async (client) => {
      const object = await client.object(objectKey);
      try {
        return object.size();
      } finally {
        object.free();
      }
    });
  } finally {
    await session.close();
  }
}
```

The result is the object's size as a number. The object handle has its own cleanup; the session manages only the SDK. This package does not connect to Sia, create accounts or load WASM.

The Sia storage 0.2.0 WASM client exposes `free()`. The native Node client selected by that SDK package's root Node export does not, so it cannot be passed directly to `createSessionFromClient`. For other clients, use `setHandle` with cleanup your application actually owns rather than assuming a `free` method exists.

SDK 0.2.0's WASM declarations reference `Symbol.dispose`. Include `ESNext.Disposable` (or a library set that contains it) in your TypeScript `lib` configuration when compiling these SDK examples. That requirement comes from the SDK types, not this package's root entry.

For an application-wide SDK, keep the session until shutdown and pass `session.source` to components. A source cannot replace or close the SDK. Do not call `sdk.free()` after successful adoption or pass that SDK to another disposal owner. `session.close()` waits for existing borrowers before calling the captured `free()` method with its original receiver.

Borrowed types from `createSessionFromClient` omit `free` and all symbol members, including disposal symbols. The runtime SDK object is unchanged; these types do not prevent a caller from bypassing ownership through a cast.

## Create or map a session

Import these functions from `@lumeweb/sia-session`:

| Function                                                                                 | Result                                                                                 |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `createSessionFromClient<Client extends SdkClient>(client, options?: SdkSessionOptions)` | `SdkSession<Omit<Client, "free" \| symbol>>`, with the supplied SDK already available. |
| `createSiaSdkSession<T>(options?: SdkSessionOptions)`                                    | An empty `SdkSession<T>`. `T` is the borrowed view your consumers need.                |
| `mapSiaSdkSession<T, View>(source: SdkSource<T>, select: SdkSelector<T, View>)`          | An `SdkSource<View>` with its parent's SDK IDs and lifetime.                           |

An empty source rejects ordinary acquisition until `set` or `setHandle` supplies an SDK. None of these factories creates a new SDK connection.

Mapping runs `select` for each acquisition or short operation. If selection or mapped-lease construction fails, mapping attempts to release the parent lease and preserves the original error even if a supplied release method throws. Release of a mapped lease releases its parent lease. Mapping forwards observations and does not gain replacement or disposal authority. Selected views can contain primitive values, including `undefined`.

Preserve SDK method receivers when building a view:

```ts
import { mapSiaSdkSession } from "@lumeweb/sia-session";
import type { SdkSource } from "@lumeweb/sia-session";
import type { Sdk } from "@siafoundation/sia-storage/wasm";

function objectReader(source: SdkSource<Omit<Sdk, "free" | symbol>>) {
  return mapSiaSdkSession(source, (sdk) => ({
    object: (key: string) => sdk.object(key),
  }));
}
```

Copying `sdk.object` into the view would lose its SDK receiver.

## Owner API

`SdkSession<T>` exposes the owner methods below. Its `source` is an `SdkSource<T>`. These methods do not require a receiver and can be passed as callbacks.

| Method                                                  | Return          | Behavior                                                                                                                                                                             |
| ------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `set(client: SdkClient & T, options?: SetOptions)`      | `symbol`        | Captures `client.free`, adopts the SDK and retires its predecessor. Setting the same current standard client again returns its existing ID after expectation checks.                 |
| `setHandle(handle: SdkHandle<T>, options?: SetOptions)` | `symbol`        | Adopts a custom value and captures its disposer. Accepted handles cannot be reused, including while current.                                                                         |
| `clear()`                                               | `Promise<void>` | Immediately publishes an empty source and retires its current SDK. Waits only for the SDK removed by this call, not for other previously retired SDKs. The session remains reusable. |
| `drain()`                                               | `Promise<void>` | Waits for SDKs already retired and still pending cleanup when called. Excludes the active SDK and later retirements.                                                                 |
| `close()`                                               | `Promise<void>` | Permanently publishes a closed source, rejects new admission and waits for every pending SDK captured at closure. Repeated calls return the same promise.                            |

Clearing an empty session still creates a new snapshot. After closure, `clear()` returns the existing close promise. A completed cleanup failure is no longer pending and is not collected by a later `drain()`.

Replacement becomes current before the predecessor's retirement callbacks run. Those callbacks can replace or close the session again before the outer `set` returns. The returned symbol identifies the SDK that call accepted; use a fresh snapshot to find the current SDK.

The session invokes a retired SDK's captured cleanup once, after its final lease releases. Retirement cannot undo requests already sent, and the package does not force cleanup after a timeout. Do not await `clear`, `drain` or `close` from work retaining an SDK that the promise must wait for. Release that retention and await cleanup outside it.

### Custom handles and ownership limits

`SdkClient` requires `free(): void`. `SdkHandle<T>` contains a readonly `value: T` and a `dispose(): void | PromiseLike<void>` method. The session preserves the handle receiver and waits for asynchronous custom cleanup. Use `setHandle` when cleanup is asynchronous or the adopted value is a capability view rather than a standard SDK client.

Both adoption methods share object-identity checks across clients, handle descriptors and object values. A claimed object cannot gain another disposal owner by changing roles, even after retirement or cleanup. Admission rechecks those claims after caller-controlled getters. Primitive handle values have no object identity to track. A rejected unused client or handle remains caller-owned; rejection does not call its disposer.

Identity checks apply within one loaded package implementation. They cannot detect every hidden alias, wrapper or separately loaded copy. Create one owner for each SDK and share its source. The session captures a cleanup method at adoption and does not also invoke an aliased symbol destructor.

## Source API

`SdkSource<T>` exposes receiver-independent methods to consumers:

| Method                                                      | Return        | Behavior                                                                                                                                                           |
| ----------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `acquire(options?: AcquireOptions)`                         | `SdkLease<T>` | Synchronously retains the current SDK. Throws if it is empty, closed or fails the expected-ID check. Never waits implicitly.                                       |
| `withSdk<R>(work: SdkWork<T, R>, options?: AcquireOptions)` | `Promise<R>`  | Retains one SDK until the callback's value or promise settles, including rejection. Always releases that lease afterward. Acquisition failures reject the promise. |
| `getSnapshot()`                                             | `SdkSnapshot` | Returns the current frozen state without an SDK or credentials. The same object is returned until the next state change.                                           |
| `subscribe(listener: SdkObserver)`                          | `Unsubscribe` | Observes future state changes without retaining an SDK. The callback receives no arguments; read `getSnapshot()` for state.                                        |

`subscribe` does not deliver an initial notification. Unsubscribe is idempotent and suppresses a pending listener even during an emission. Closure notifies existing observers and removes them; subscribing after closure returns a no-op unsubscribe. Notifications are synchronous, but a callback can return a promise whose rejection is reported. Nested changes can make earlier notifications obsolete, so observers see current state rather than a complete event history.

`withSdk` passes `(sdk, context)` to its callback and preserves callback errors and rejections. `context` is a `LeaseContext`; it does not include `release`. Do not return a native handle or unfinished stream and expect its SDK to remain alive after the callback settles. Use an explicit lease until that resource and its dependent cleanup finish.

### Lease API

`SdkLease<T>` extends `LeaseContext`:

| Member                               | Type          | Behavior                                                                                                                               |
| ------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                 | `symbol`      | Identifies the retained SDK, even after replacement.                                                                                   |
| `value`                              | `T`           | The borrowed SDK or mapped view. Reading it after release throws `SdkSessionError` with code `Released`.                               |
| `isCurrent()`                        | `boolean`     | Returns false after release or once this SDK is no longer current. Retirement does not otherwise invalidate the borrowed value.        |
| `onRetire(listener: RetireListener)` | `Unsubscribe` | Notifies once with the retirement reason. An already retired lease notifies immediately. Registration after release throws `Released`. |
| `release()`                          | `void`        | Ends retention and removes pending retirement listeners. Repeated calls have no effect.                                                |

`LeaseContext` contains only `id`, `isCurrent` and `onRetire`. A short operation's context stops being current when `withSdk` releases its lease, even if the SDK remains selected. Unsubscribing retirement notifications does not release a lease.

The package freezes the sessions, sources, leases and snapshots it creates. `withSdk` contexts from its owned sources are frozen too. SDK objects and mapped values are not frozen or cloned.

### Snapshots and expectation checks

`SdkSnapshot` is `AvailableSdkSnapshot | UnavailableSdkSnapshot`:

| State                | Value         | `id`                      |
| -------------------- | ------------- | ------------------------- |
| `SdkState.Empty`     | `"empty"`     | `null`                    |
| `SdkState.Available` | `"available"` | The current SDK's symbol. |
| `SdkState.Closed`    | `"closed"`    | `null`                    |

`AcquireOptions` has `readonly expectedId?: symbol`. Pass an available snapshot's `id` to `acquire` or `withSdk` to reject work aimed at an SDK that has been replaced.

`SetOptions` has `readonly expectedSnapshot?: SdkSnapshot`. Capture `source.getSnapshot()` before asynchronous setup, then pass that exact object to `set` or `setHandle`. A different current snapshot rejects adoption with `Conflict`. Matching field values in a copied snapshot do not satisfy this check. Clearing an already empty session invalidates the earlier snapshot too.

## Notifications and cleanup failures

`SdkSessionOptions` accepts these optional callbacks:

| Option      | Named type           | Payload                                                                                                                                 |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `onDispose` | `SdkDisposeListener` | `SdkDisposeEvent`: readonly `id: symbol` and `reason: RetireReason`. Runs after successful cleanup.                                     |
| `onError`   | `SdkIssueListener`   | `SdkIssue`: readonly `error: unknown`, `id` (`symbol` or `null`), and `kind: SdkIssueKind`. Receives cleanup and notification failures. |

`SdkIssueKind.Disposal` is `"disposal"`; `SdkIssueKind.Listener` is `"listener"`. An issue's `id` is the relevant SDK symbol, or `null` for a source notification without an available SDK.

`RetireReason` values are `Cleared = "cleared"`, `Closed = "closed"` and `Replaced = "replaced"`. Retirement is immediate; disposal can happen later while borrowers finish.

Notification callbacks return `unknown` so ordinary functions and async callbacks are accepted. Returned promises are observed for failure but do not delay cleanup completion. Listener exceptions and rejections reach `onError` without interrupting other listeners or reversing an accepted transition. The error reporter's own failures are ignored. There is no automatic logging.

A cleanup barrier waits for all SDKs it captured, then rejects with `AggregateError` if any cleanup failed. Its `errors` contains the original cleanup failures. Listener failures do not reject cleanup barriers. Adoption errors and `withSdk` work failures reach their callers rather than being reported as listener failures.

If you await closure in a `finally` block, a closure rejection follows normal JavaScript rules and can replace an earlier operation error. Handle those two failures separately when both must be retained.

## Native cancellation and waiting

Import platform helpers and their types from `@lumeweb/sia-session/abort`. The root entry requires no DOM or ambient Node declarations. The `/abort` entry uses native `AbortSignal` and `AbortController` at runtime; its public declarations reference `AbortSignal`.

| Export                                                                     | Return                 | Behavior                                                                                                                     |
| -------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `createLeaseAbortSignal(context: LeaseContext, options?: AbortOptions)`    | `LeaseAbortSignal`     | Forwards SDK retirement and optional caller cancellation to a native signal. Already retired work creates an aborted signal. |
| `acquireSdkWhenAvailable<T>(source: SdkSource<T>, options?: AbortOptions)` | `Promise<SdkLease<T>>` | Waits while the source is empty, then retains an SDK. Rejects on closure, cancellation or a supplied source's failure.       |

`AbortOptions` has `readonly signal?: AbortSignal`. `LeaseAbortSignal` has readonly `signal: AbortSignal` and `dispose(): void`.

The first abort wins. Its reason is the caller's original cancellation reason or a `RetireReason` value. Aborting does not release the SDK lease or prove native work has stopped. Keep retention until the operation and dependent cleanup finish. `dispose()` detaches both subscriptions without aborting the signal or releasing retention; repeated disposal has no effect. With a custom context, a retirement unsubscribe error still propagates from disposal after caller cancellation has been detached.

A waiting acquisition owns its pending subscriptions. Failed handoff attempts release the acquired lease, including when a supplied lease's `isCurrent` or a source's unsubscribe throws. Cancellation and source failures preserve their original rejection even if unsubscribe also fails. Cancellation stops affecting acquisition after successful handoff. The SDK can retire before the awaiting caller resumes; the caller must still release the returned lease.

This wrapper keeps an explicit lease through cancellation-aware work and detaches the linkage before release:

```ts
import { acquireSdkWhenAvailable, createLeaseAbortSignal } from "@lumeweb/sia-session/abort";
import type { SdkSource } from "@lumeweb/sia-session";

type AbortWork<T, R> = (sdk: T, signal: AbortSignal) => Promise<R>;

async function waitAndRun<T, R>(source: SdkSource<T>, work: AbortWork<T, R>, signal?: AbortSignal): Promise<R> {
  const lease = await acquireSdkWhenAvailable(source, { signal });
  try {
    const linked = createLeaseAbortSignal(lease, { signal });
    try {
      return await work(lease.value, linked.signal);
    } finally {
      linked.dispose();
    }
  } finally {
    lease.release();
  }
}
```

The work must observe the supplied signal to cancel. Use `lease.isCurrent()` or `context.isCurrent()` before publishing a result that must belong to the current SDK; cancellation alone cannot reject a late result from work that ignores it.

## Error reference

The root exports `SdkSessionError`, an `Error` subclass constructed with `new SdkSessionError(code: SdkSessionErrorCode)`. It has readonly `code: SdkSessionErrorCode`. Its `name` is `"SdkSessionError"` and its message is `"SDK session: <code>"`, without SDK inspection.

| Code            | Value              | Cause                                                                                     |
| --------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| `AlreadyUsed`   | `"already-used"`   | An SDK identity or custom handle was already claimed by a disposal owner.                 |
| `Closed`        | `"closed"`         | Acquisition or adoption targets a permanently closed session, or a waiting source closes. |
| `Conflict`      | `"conflict"`       | Adoption no longer matches its captured or expected snapshot.                             |
| `InvalidHandle` | `"invalid-handle"` | A client or handle lacks a valid descriptor or callable cleanup method.                   |
| `Released`      | `"released"`       | Code reads a released lease's value or registers retirement on a released lease.          |
| `Stale`         | `"stale"`          | Acquisition's `expectedId` does not match the current available SDK.                      |
| `Unavailable`   | `"unavailable"`    | Ordinary acquisition targets an empty source.                                             |

Application callbacks, selectors and custom getters can fail with their own errors. Cancellation can reject with a non-Error reason. Cleanup barriers use `AggregateError`, so not every rejection is an `SdkSessionError`.

## Named callback types

These types are exported from the root along with the interfaces and enums described above:

| Type                   | Signature                                                |
| ---------------------- | -------------------------------------------------------- |
| `SdkObserver`          | `() => unknown`                                          |
| `RetireListener`       | `(reason: RetireReason) => unknown`                      |
| `SdkWork<T, R>`        | `(sdk: T, context: LeaseContext) => R \| PromiseLike<R>` |
| `SdkSelector<T, View>` | `(sdk: T) => View`                                       |
| `SdkDisposeListener`   | `(event: SdkDisposeEvent) => unknown`                    |
| `SdkIssueListener`     | `(issue: SdkIssue) => unknown`                           |
| `Unsubscribe`          | `() => void`                                             |

Only the root and `/abort` entry points are exported. Internal helpers are not package imports.

## Scope and checks

Sources and SDK objects are not a worker transport. Create another SDK in a worker or implement a separate remote protocol. The package does not implement RPC, connection pools or account policy.

From the repository root, run:

```sh
pnpm --filter @lumeweb/sia-session typecheck
pnpm --filter @lumeweb/sia-session test
pnpm --filter @lumeweb/sia-session lint
pnpm --filter @lumeweb/sia-session format:check
pnpm --filter @lumeweb/sia-session test:contracts
pnpm --filter @lumeweb/sia-session test:package
```

Source tests run without building the package. Contract tests build emitted declarations and check the root without DOM or ambient Node types. Package tests build and pack the library, then run isolated npm and pnpm consumers through Vitest. These checks do not connect to a live Sia account.
