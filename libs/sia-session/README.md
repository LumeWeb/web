# Sia session

`@lumeweb/sia-session` is a lifetime tool for services that own a Sia SDK. It admits concurrent work and delays cleanup until the final borrow releases, even after replacement or closure. It does not create SDKs or manage account access. Apps connecting an account should start with [app access](../sia-app-access/docs/getting-started.md); authors of SDK-owning services can read [service usage](docs/usage.md) and [SDK ownership](docs/ownership.md).

## Get started

The package is private and ESM-only. From a consumer package in this pnpm workspace, add its workspace dependency:

```sh
pnpm add @lumeweb/sia-session@workspace:*
```

An SDK-owning service can adopt a connected WASM SDK through `createSessionFromClient`. This example reads an object's size and then closes the SDK. Its type import selects the WASM client explicitly:

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
        // The SDK must outlive the native object handle, including its cleanup.
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

For a shared SDK, keep the session inside its owning service until shutdown. Expose service operations to application code instead of passing its source to views. A source cannot replace or close the SDK. Do not call `sdk.free()` after successful adoption or pass that SDK to another disposal owner. `session.close()` waits for existing borrowers before calling the captured `free()` method with its original receiver.

Borrowed types from `createSessionFromClient` omit `free` and all symbol members, including disposal symbols. The runtime SDK object is unchanged; these types do not prevent a caller from bypassing ownership through a cast.

## Create or map a session

Import these functions from `@lumeweb/sia-session`:

| Function                                                                                 | Result                                                                                 |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `createSessionFromClient<Client extends SdkClient>(client, options?: SdkSessionOptions)` | `SdkSession<Omit<Client, "free" \| symbol>>`, with the supplied SDK already available. |
| `createSiaSdkSession<T>(options?: SdkSessionOptions)`                                    | An empty `SdkSession<T>`. `T` is the borrowed view your consumers need.                |
| `mapSiaSdkSession<T, View>(source: SdkSource<T>, select: SdkSelector<T, View>)`          | An `SdkSource<View>` with its parent's SDK IDs and lifetime.                           |
| `openSiaSdkOperationScope<T>(source: SdkSource<T>)`                                      | An `SdkOperationScope<T>` that retains one parent lease for independent operations.    |

An empty source rejects ordinary acquisition until `set` or `setHandle` supplies an SDK. None of these factories creates a new SDK connection.

An operation scope admits work through `run(work)` before returning its promise. `close()` denies new work immediately and waits for admitted callbacks, then releases its parent lease. Parent retirement closes admission too; `closed` observes that drain without starting closure. Closing twice returns the same promise. The scope cannot replace or dispose the parent SDK and exposes neither its SDK value nor another source. Do not await `close()` from a callback admitted by the same scope. `closed` does not wait for parent cleanup if another borrower keeps that SDK alive; SDK cleanup failures reach the parent's `clear()` or `close()` and `onError`, not `closed`. A failing external retirement unsubscribe rejects `closed` after the parent borrow is released.

A callback must free its native child handles before it settles, or retain its operation until a managed stream releases them. The scope cannot identify child handles returned from an SDK method.

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

`SdkSession<T>` selects the current SDK through `set` or `setHandle`; `clear`, `drain`, and `close` retire and wait for cleanup with different boundaries. Its `source` cannot call any of them. Read [SDK ownership](docs/ownership.md) for the method table, replacement, error paths, and what a caller must free after failed adoption.

### Custom handles and ownership limits

`setHandle` accepts a value with captured `dispose()` cleanup. Separate handles can share a value only when their cleanup leaves it safe for every other borrower. See [accepted and rejected handles](docs/ownership.md#rejected-adoption-and-shared-handles) for identity checks, receiver rules, and cleanup authority.

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

A cleanup barrier waits for all SDKs it captured, then rejects with `AggregateError` if any cleanup failed. Its `errors` contains the original cleanup failures. Listener failures do not reject cleanup barriers. Adoption errors and `withSdk` work failures reach their callers rather than being reported as listener failures. [Cleanup failure behavior](docs/ownership.md#report-cleanup-failures-without-losing-work-errors) explains how closure and `onError` report the same failure.

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
    // Aborting requests a stop; the lease stays held until native work settles.
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
