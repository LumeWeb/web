# Build a service around a Sia SDK

This guide is for code that **owns an SDK**, such as an adapter or playback service. If your app connects an account, start with [app access](../../sia-app-access/docs/getting-started.md): it creates and owns the account SDK through the Sia adapter. An account screen should call access commands, read snapshots, and call its storage service's ordinary methods. It should not create a second session or manage SDK leases.

`@lumeweb/sia-session` does not connect to Sia. An SDK-owning service receives or creates an SDK, adopts it once, and gives other code methods backed by its borrowed source. [Owner actions](ownership.md) cover replacement, rejected adoption, and cleanup failures. Video worker SDKs are separate from the main-thread account SDK; neither owner can pass its SDK object into the other isolate.

## Hide the borrow inside the service

This example uses the Sia storage 0.2.0 WASM `Sdk`. The code that creates the SDK transfers it to this service and must not call `sdk.free()` afterward. The service closes it when its own lifetime ends. A normal caller sees `size()` and `close()`, not the SDK or a callback:

```ts
import { createSessionFromClient } from "@lumeweb/sia-session";
import type { Sdk } from "@siafoundation/sia-storage/wasm";

export function createObjectSizeService(sdk: Sdk) {
  const owner = createSessionFromClient(sdk);
  return {
    async size(objectKey: string): Promise<number> {
      return owner.source.withSdk(async (client) => {
        const object = await client.object(objectKey);
        try {
          return object.size();
        } finally {
          // The native object must close before the parent SDK borrow ends.
          object.free();
        }
      });
    },
    close: owner.close,
  };
}
```

Multiple `size()` calls may run at once. If `close()` starts during a read, it denies new borrows and waits for admitted reads and their object cleanup before freeing the SDK. A rejected `object()` call still releases the parent borrow. The method callback and native cleanup stay inside the service; a screen never needs to pair `acquire()` with `release()`.

The example requires a connected WASM SDK and an object key supplied by your service. Live Sia behavior remains untested. SDK 0.2.0's WASM declarations require `ESNext.Disposable` in the TypeScript `lib`. For an actual account, [the released access adapter](../../sia-app-access/docs/adapters.md#released-wasm-adapter) creates and owns the SDK, so use `access.withSession()` inside an account operation service rather than adopting it again.

## Choose the borrow boundary inside an SDK-owning service

| Service work                                                  | Internal primitive                 | What ends the borrow                                              |
| ------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------- |
| One read, write, or upload that includes native child cleanup | `source.withSdk(work)`             | The callback settles, including its cleanup                       |
| A managed stream whose native child stays open after setup    | `source.acquire()`                 | The stream's release closes the child and releases the lease      |
| Independent tasks admitted under one parent SDK               | `openSiaSdkOperationScope(source)` | Its `close()` drains admitted tasks and releases the parent lease |

A callback that returns a native stream before its release leaves the SDK unprotected. Keep the callback pending through release, or have the SDK-owning service return a managed stream whose `release()` ends its explicit lease. The session cannot identify or free native objects returned by arbitrary SDK methods. [The source API](../README.md#source-api) describes `acquire`, `withSdk`, and snapshots; [the operation scope contract](../README.md#create-or-map-a-session) covers independent tasks.

Retirement stops _new_ work on the retired SDK but does not abort native calls. An old borrow can finish after a replacement; check its `isCurrent()` result before publishing state tied to the current account or connection. Never await the owner's `clear()` or `close()` from a callback that still holds the SDK it must free. [Native cancellation](../README.md#native-cancellation-and-waiting) can ask a call to stop, but the borrow stays until its work and child cleanup finish.
