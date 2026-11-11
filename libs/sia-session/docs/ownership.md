# Own a Sia SDK inside a service

This guide is for code that creates or receives a Sia SDK and must keep it alive for concurrent work. Account applications use [app access](../../sia-app-access/docs/getting-started.md); it already owns the account SDK. Video creates separate playback SDKs in its worker. An account screen should not adopt either SDK again.

`@lumeweb/sia-session` tracks a connected client's lifetime. SDK creation and account decisions remain with the service supplying it. Its input is a client with `free()` or a handle with `dispose()`. `setHandle()` can accept a value that is not an SDK; the service supplying it must know what that disposer releases. The session cannot check an indexer, authenticate an app key, or free native child objects returned by arbitrary SDK methods.

## Where the SDK enters the owner

| Real integration                | SDK creation                                                                              | Adoption and cleanup                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Account access                  | `createSiaAdapter()` builds a Sia WASM `Builder`, then registers or reconnects a `Sdk`    | `AccessResources.installSession()` adopts the adapter's `AccessSession` handle. Its disposer calls `sdk.free()` after account work drains. |
| Video worker                    | `createDefaultSdk()` builds the SDK for the current app or sharing seed inside the worker | The worker composition adopts its SDK with `setHandle()`; source reads keep the old SDK alive while a new one replaces it.                 |
| A standalone SDK-backed service | The service receives a newly connected WASM `Sdk` from its creator                        | `createSessionFromClient(sdk)` or `set(sdk)` captures `free()`; the service gives callers operations rather than the session.              |

The account and worker have different owners and different SDK objects. The demo chooses between account and keyless-sharing modes; this session package does not select either mode. See [service usage](usage.md) for a Sia `object()` call whose native child closes before the SDK borrow ends.

## Replace a connected SDK without freeing an active read

This example is for a service that _itself_ creates replacement SDKs. `replace()` receives a promise for a **new, unowned** WASM `Sdk`; it takes responsibility for a result that arrives after the service has moved on. An app using access should call the access controller instead of constructing this owner.

```ts
import { createSiaSdkSession, SdkSessionError, SdkSessionErrorCode } from "@lumeweb/sia-session";
import type { Sdk } from "@siafoundation/sia-storage/wasm";

export function createReplaceableObjectService() {
  const owner = createSiaSdkSession<Omit<Sdk, "free" | symbol>>();
  return {
    async replace(pendingSdk: Promise<Sdk>): Promise<void> {
      const expectedSnapshot = owner.source.getSnapshot();
      const sdk = await pendingSdk;
      try {
        owner.set(sdk, { expectedSnapshot });
      } catch (error) {
        // AlreadyUsed means another owner may still be using this SDK.
        if (error instanceof SdkSessionError && (error.code === SdkSessionErrorCode.Conflict || error.code === SdkSessionErrorCode.Closed)) {
          sdk.free();
        }
        throw error;
      }
    },
    async size(objectKey: string): Promise<number> {
      return owner.source.withSdk(async (sdk) => {
        const object = await sdk.object(objectKey);
        try {
          return object.size();
        } finally {
          object.free();
        }
      });
    },
    close: owner.close,
  };
}
```

Once `set()` accepts the new SDK, the session frees the previous one after its final admitted read and child-object cleanup. A newly connected SDK whose `replace()` finishes late fails the snapshot check with `SdkSessionErrorCode.Conflict`; `replace()` frees that unused result. If the service has closed, the result fails with `Closed` and is freed by the same catch. A caller must supply a new SDK, not a reference to one the service already adopted; freeing an alias after `AlreadyUsed` would invalidate its owner.

This block is typed against Sia storage 0.2.0's WASM `Sdk`. It requires a real connection to run; no live Sia call was made for this guide. The SDK's type declarations require `ESNext.Disposable` in TypeScript's `lib`. An already adopted SDK must never be freed directly by the service or passed to another disposal owner.

| Moment                  | New work  | Work already using A                       | A's cleanup                  |
| ----------------------- | --------- | ------------------------------------------ | ---------------------------- |
| A is current            | Borrows A | Uses A                                     | Not scheduled                |
| B replaces A            | Borrows B | May finish using A; `isCurrent()` is false | Waits for A's last lease     |
| A's last lease releases | Borrows B | Finished                                   | Calls captured `free()` once |

The session selects B before A's retirement listeners run. A listener may replace B again before the outer `set()` call returns. Its returned ID identifies the accepted B; a fresh snapshot identifies the current SDK. Retirement does not cancel a native call or close an object that a borrower still holds.

## Pick the cleanup boundary

| Owner call                           | Immediate effect                                      | Completion promise                                                  | Can adopt another SDK? |
| ------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------- | ---------------------- |
| `set(client)` or `setHandle(handle)` | Selects a new current SDK and retires its predecessor | No promise; prior cleanup may remain pending                        | Yes                    |
| `clear()`                            | Publishes empty and retires the current SDK           | Waits for cleanup of the SDK this call removed                      | Yes                    |
| `drain()`                            | Does not change the current SDK                       | Waits for already retired, still-pending SDKs captured by this call | Yes                    |
| `close()`                            | Publishes closed and retires the current SDK          | Waits for all pending SDKs captured by this call                    | No                     |

`set()` and `setHandle()` return the accepted SDK's symbol ID. `set()` with the same current client and a matching expectation returns its existing ID. Clearing an empty source publishes another empty snapshot, which makes an older `expectedSnapshot` stale. Repeated `close()` calls return the same promise; `clear()` after closure returns that promise. A finished cleanup failure is not collected again by a later `drain()`.

A borrow admitted before `clear()` or `close()` keeps its SDK until it releases. Do not await cleanup from work whose lease that cleanup needs: release the lease, then await the owner's promise outside that work. Normal app operations should keep this ordering inside their SDK-owning service.

A service can keep a new connection active while `clear()` waits for reads on the old one. `drain()` waits for SDKs retired before that call, leaving the new connection available.

```ts
import { createSessionFromClient } from "@lumeweb/sia-session";
import type { Sdk } from "@siafoundation/sia-storage/wasm";

export function createReconnectableSizeService(first: Sdk) {
  const owner = createSessionFromClient(first);
  return {
    async size(key: string): Promise<number> {
      return owner.source.withSdk(async (sdk) => {
        const object = await sdk.object(key);
        try {
          return object.size();
        } finally {
          object.free();
        }
      });
    },
    async disconnect(): Promise<void> {
      await owner.clear();
    },
    reconnect(next: Sdk): void {
      owner.set(next);
    },
    waitForOldConnections: () => owner.drain(),
    close: owner.close,
  };
}
```

`disconnect()` retires the current SDK; the returned promise settles after any admitted `size()` call frees its native object. `reconnect()` assumes its argument is a new, unowned SDK. If it follows `disconnect()` before the old read completes, the new connection stays usable while the old one retires.

## Rejected adoption and shared handles

`set(client, { expectedSnapshot })` and `setHandle(handle, { expectedSnapshot })` accept only the exact snapshot captured before asynchronous setup. The snapshot contains no credential. A changed snapshot rejects a newly prepared client with `Conflict`, even if the state later looks the same. By contrast, `source.acquire({ expectedId })` rejects _new work_ on a different SDK with `Stale`; it does not adopt a client.

| Adoption result                                                             | Cleanup owner                                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Accepted `set()` or `setHandle()`                                           | Session, after the last lease releases                        |
| Rejected new client or handle (`Conflict`, `Closed`, or `InvalidHandle`)    | The creator, unless another owner already accepted it         |
| Reused client, handle descriptor, or exclusive object value (`AlreadyUsed`) | Its existing owner; never free a rejected alias a second time |

`setHandle()` accepts a capability view and a synchronous or asynchronous disposer. The descriptor is single-use. An object value is exclusive unless `{ valueOwnership: "shared" }` is supplied. Separate shared handles may refer to the same value only when disposing one leaves that value usable for other handles and outstanding borrowers. Shared values cannot later become exclusive clients. Primitive values have no object identity to track. Identity checks cover one loaded package implementation; they cannot detect hidden aliases or another loaded copy.

The session captures `free()` with its SDK receiver or `dispose()` with its handle receiver. It does not invoke an aliased symbol destructor as well. `createSessionFromClient` omits `free` and symbol members from its borrowed TypeScript view, but the runtime client is unchanged; a cast cannot enforce ownership.

A service may adopt a native child and its parent SDK as one handle. This example transfers both to the session and frees the child before the SDK. The creator must supply a new, unowned SDK.

```ts
import { createSiaSdkSession } from "@lumeweb/sia-session";
import type { Sdk } from "@siafoundation/sia-storage/wasm";

export async function createPinnedSizeService(sdk: Sdk, objectKey: string) {
  let object: Awaited<ReturnType<Sdk["object"]>>;
  try {
    object = await sdk.object(objectKey);
  } catch (error) {
    sdk.free();
    throw error;
  }

  const owner = createSiaSdkSession<{ size(): number }>();
  owner.setHandle({
    value: { size: () => object.size() },
    dispose() {
      try {
        object.free();
      } finally {
        sdk.free();
      }
    },
  });

  return {
    size: () => owner.source.withSdk((pinned) => pinned.size()),
    close: owner.close,
  };
}
```

## Report cleanup failures without losing work errors

A disposer may throw or reject. `clear()`, `drain()`, and `close()` wait for every entry they captured and reject with `AggregateError` containing the original cleanup values. `onError` receives each disposal failure as `SdkIssueKind.Disposal`. Successful cleanup calls `onDispose` with the SDK ID and `RetireReason` (`Replaced`, `Cleared`, or `Closed`). Listener failures reach `onError` as `SdkIssueKind.Listener` without reversing a replacement or rejecting a cleanup promise.

`withSdk()` passes its callback failure through unchanged; the owner's later cleanup failure is a separate outcome. If both matter, collect the operation result and the cleanup promise separately. Awaiting owner closure in a `finally` block can otherwise replace an earlier operation error with a cleanup error.

The service below starts closure after admitting its read. `Promise.allSettled()` retains both outcomes if `object()` fails and SDK cleanup also fails. It records issue kinds without logging native error values, which may contain credentials.

```ts
import { createSessionFromClient, type SdkIssueKind } from "@lumeweb/sia-session";
import type { Sdk } from "@siafoundation/sia-storage/wasm";

export async function readAndClose(sdk: Sdk, objectKey: string) {
  const issues: SdkIssueKind[] = [];
  const owner = createSessionFromClient(sdk, {
    onError: (issue) => {
      issues.push(issue.kind);
    },
  });
  const read = owner.source.withSdk(async (client) => {
    const object = await client.object(objectKey);
    try {
      return object.size();
    } finally {
      object.free();
    }
  });

  const [result, cleanup] = await Promise.allSettled([read, owner.close()]);
  return { result, cleanup, issues };
}
```
