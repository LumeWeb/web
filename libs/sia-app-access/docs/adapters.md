# Adapters

An adapter implements the Sia operations used by `createSiaAccess`. Use `createSiaAdapter()` with SDK 0.2.0, or implement `SiaAccessAdapter<Session>` for another client.

## Released WASM adapter

Import `createSiaAdapter` and `SiaSession` from `@lumeweb/sia-app-access/sia`. Your application supplies `@siafoundation/sia-storage` 0.2.0 and serves its WASM assets. The root package does not import the SDK. Importing `/sia` or calling `createSiaAdapter()` does not initialize it; initialization happens when an adapter method needs the SDK.

Vite recognizes the optional peer when bundling a consuming application. A bundle that omits the SDK can construct the adapter but cannot run SDK operations; install the SDK before building an application that uses those operations.

Create the controller at application startup. The adapter is supplied through the `adapter` option:

```ts
import { createSiaAccess } from "@lumeweb/sia-app-access";
import { createSiaAdapter } from "@lumeweb/sia-app-access/sia";

export function createStorageAccess() {
  return createSiaAccess({
    application: {
      appId: "a".repeat(64),
      name: "My application",
      description: "Account access",
      serviceUrl: "https://app.example",
    },
    indexerUrl: "https://indexer.example/",
    adapter: createSiaAdapter(),
  });
}
```

Install `@siafoundation/sia-storage@0.2.0` in your application. Replace the addresses with your services and configure your bundler to serve the SDK's WASM assets before connecting.

Adapter instances from the same module share initialization. If initialization fails, the pending operation rejects and a later adapter call can retry. This recovery does not reset a failed `initSia()` call made directly through the SDK: that function can keep returning its cached rejection. Avoid loading the WASM module again while SDK objects are in use. Separate copies of the adapter module do not share this initialization state.

The adapter uses the SDK's `/wasm` classes under Node as well as in browsers. It does not use the SDK's Node N-API authorization implementation.

## Node initialization

Under Node's default SDK exports, the adapter loads installed WASM bytes without replacing global `fetch`. This also works when the native facade is absent. Applications can initialize the SDK themselves before the first adapter operation:

```ts
import { readFile } from "node:fs/promises";
import initializeWasm from "@siafoundation/sia-storage/wasm";

export async function prepareSiaWasm(): Promise<void> {
  const asset = new URL(import.meta.resolve("@siafoundation/sia-storage/wasm/sia_storage_wasm_bg.wasm"));
  await initializeWasm({ module_or_path: new Uint8Array(await readFile(asset)) });
}
```

If you initialize the SDK yourself, await `prepareSiaWasm()` before calling an adapter method. Other SDK users in the same process must also wait for this initialization. Do not start a competing initialization while it is pending.

## Current integration limits

Live authorization and saved-account reconnect have not been tested against a Sia service. Approval polling during cancellation and SDK execution in a worker also remain unverified. Offline tests use the actual SDK for initialization, phrase validation and key utilities; controlled handles cover resource ownership without claiming native allocation or network behavior.

## Custom adapters

Import `SiaAccessAdapter`, `AccessConnection` and `AccessSession` from the root package. `Session` is the type passed to your application's `withSession` callbacks.

| Adapter method                          | Return value and responsibility                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `begin(scope, application)`             | Return a new `AccessConnection<Session>` for the controller to use and dispose of                                          |
| `reconnect(scope, application, appKey)` | Return an `AccessSession<Session>`, or `null` if the key is unrecognized. Do not retain `appKey` after the promise settles |
| `validateRecoveryPhrase(phrase)`        | Return `PhraseValidation.Valid` or `PhraseValidation.Invalid`; reject if validation could not run                          |
| `generateRecoveryPhrase()`              | Return a phrase string; reject if generation fails                                                                         |

A rejected validation call means an operation failed, not that the user entered an invalid phrase. Likewise, return `null` from reconnect only for an unrecognized key; reject on an operational failure. Dispose of resources you allocate but do not return.

### Connections

A connection supplies `approvalUrl`, `waitForApproval()`, `matchesExistingAppKey(phrase)`, `register(phrase)` and `dispose()`. Once you return it, let the controller call those methods; do not reuse the connection elsewhere.

The controller validates the approval URL and waits for approval once. It validates the phrase, checks whether an existing-account phrase matches the approved app key when needed, and calls `register()` at most once. Validation and matching must leave the connection usable for correction. After `register()` is called, the connection must not be used to register again, even if the call rejects: the server may already have completed registration.

Calling `dispose()` must not throw, and repeated calls must be safe. If a connection method is still pending, delay freeing its native handles until that method finishes. In particular, do not free a builder while approval or registration is pending.

### Sessions

Registration and successful reconnect return an `AccessSession<Session>` with `value`, `exportAppKey()` and `dispose()`. `exportAppKey()` must return a fresh 32-byte buffer that the controller can clear without changing the session's retained key. Session disposal must also be safe to call repeatedly and must not throw.

The controller disposes of connections and sessions that arrive after cancellation instead of using them. Cancelling a command does not guarantee that its network requests stopped.

For a custom adapter returning SDK sessions, wrap the SDK so exported keys and disposal follow the controller's contract. This is the same resource handling used by the [released adapter](../src/sia.ts):

```ts
import type { Sdk } from "@siafoundation/sia-storage/wasm";
import type { AccessSession } from "@lumeweb/sia-app-access";
import type { SiaSession } from "@lumeweb/sia-app-access/sia";

export function ownedSdkSession(sdk: Sdk): AccessSession<SiaSession> {
  let disposed = false;
  return {
    value: sdk,
    exportAppKey() {
      if (disposed) throw new Error("Session is closed");
      const key = sdk.appKey();
      try {
        return key.export();
      } finally {
        key.free();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      sdk.free();
    },
  };
}
```

Keep this wrapper inside your adapter. Application code uses `withSession` rather than calling `dispose()` or retaining `sdk` itself.

## Session borrowing

`withSession` accepts work only while the controller is ready. Once accepted, its callback keeps the session alive until it finishes, even if the application disconnects or disposes of the controller meanwhile. New callbacks are rejected after disconnection.

Finish all session-dependent work inside the callback. Do not retain the session or return native handles that need it to stay alive. See [session ownership](getting-started.md#use-and-release-a-session).
