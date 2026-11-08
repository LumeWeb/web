# Credential ownership

The controller passes a `CredentialScope` containing the lowercase application ID and canonical indexer URL to each store method. Use both values in your storage key. Changing either selects a different credential record.

## Default memory storage

Every controller without an explicit `credentials` option receives a new memory store. It does not survive a reload. `createMemoryCredentialStore()` can also be supplied explicitly or shared by controllers. Its `read` returns a copy, its `write` retains a copy, and `remove` affects only the supplied scope. Its additional `clear()` removes all records in that store instance.

For example, clearing the caller's buffer after a write does not erase the stored copy:

```ts
import { createMemoryCredentialStore } from "@lumeweb/sia-app-access";

const credentials = createMemoryCredentialStore();
const scope = { appId: "a".repeat(64), indexerUrl: "https://indexer.example/" };
const key = new Uint8Array(32).fill(1);
await credentials.write(scope, key);
key.fill(0);

const restored = await credentials.read(scope);
if (restored?.[0] !== 1) throw new Error("Expected the stored copy");
restored.fill(0);
await credentials.remove(scope);
```

Each controller orders its own storage operations. If multiple controllers or tabs share a store, provide any coordination they need in the application or store.

## Implement a custom store

Import `CredentialStore` from the root entry and implement its methods:

| Method                                              | Return type                   |
| --------------------------------------------------- | ----------------------------- |
| `read(scope: CredentialScope)`                      | `Promise<Uint8Array \| null>` |
| `write(scope: CredentialScope, appKey: Uint8Array)` | `Promise<void>`               |
| `remove(scope: CredentialScope)`                    | `Promise<void>`               |

Choose storage and encryption policy in the application. The library supplies no password vault, encrypted record format or migration.

Return a copy from `read()` if your store needs to keep the original key: the controller may clear the returned buffer. For `write()`, copy any bytes you need to retain before the promise resolves or rejects. A write that reports failure may already have saved data, so this rule also applies on rejection.

For development, this browser store survives a reload in the same tab. It stores unencrypted keys, so scripts running on the origin can read them. Choose storage and protection appropriate to your application before using real credentials; this is not a vault.

```ts
import type { CredentialScope, CredentialStore } from "@lumeweb/sia-app-access";

export function sessionCredentials(storage: Storage): CredentialStore {
  const record = (scope: CredentialScope) => `sia-access:${JSON.stringify([scope.appId, scope.indexerUrl])}`;
  return {
    async read(scope) {
      const hex = storage.getItem(record(scope));
      if (hex === null) return null;
      if (!/^[a-f0-9]{64}$/.test(hex)) throw new Error("Invalid saved key");
      return Uint8Array.from({ length: 32 }, (_, index) => Number.parseInt(hex.substring(index * 2, index * 2 + 2), 16));
    },
    async write(scope, bytes) {
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      storage.setItem(record(scope), hex);
    },
    async remove(scope) {
      storage.removeItem(record(scope));
    },
  };
}
```

Pass `sessionCredentials(window.sessionStorage)` as the controller's `credentials` option in client bootstrap code. The write converts input into a string before returning; reads allocate a new buffer. No recovery phrase is stored.

Keep keys and recovery phrases out of logs and diagnostics. Clearing a JavaScript buffer cannot guarantee that every copy has been erased from memory.

## Interpret save results

`CredentialConfirmation.Confirmed` means a store read returned the reconnect key or a write was acknowledged. It does not guarantee that the store will keep the key after a reload or that another tab will leave it unchanged. For example, the default memory store confirms writes but loses them on reload.

`CredentialConfirmation.Unconfirmed` means the application continued after a write whose success could not be confirmed. The store may already have saved the key. Report that uncertainty to the user rather than saying that nothing was saved.

After registration succeeds and saving fails, the controller retains that session for explicit recovery. `retrySave()` saves the retained key; it does not register again. `continueWithoutSaving()` makes that session ready with unconfirmed credentials. The application's UI chooses between these operations.

A UI can distinguish a confirmed save from continuation without confirmed saving:

```ts
import { AccessOutcome, CredentialConfirmation } from "@lumeweb/sia-app-access";
import type { ContinueWithoutSavingResult, RetrySaveResult } from "@lumeweb/sia-app-access";

export function saveMessage(result: RetrySaveResult | ContinueWithoutSavingResult): string {
  if (result.kind !== AccessOutcome.Ready) return "Access is not ready.";
  return result.credentials === CredentialConfirmation.Confirmed ? "The credential store acknowledged saving." : "Saving could not be confirmed.";
}
```

## Preserve write and removal ordering

`forget()` queues removal after earlier credential operations finish, including writes that save data and then report failure. `reconnect()` waits for earlier queued operations before reading. This order prevents an earlier save from writing the key back after the controller removes it.

Once `forget()` has queued a removal, `cancel()` can return a cancelled result while that removal still runs later. `CredentialEffect.Remove` means removal started or was queued; it does not confirm that the key was deleted. The returned result does not change when the storage operation finishes.

Disconnect and disposal do not remove credentials. Forget is local removal, not remote account revocation. Read [command-local effects](api.md#command-local-effects) when reporting partial failures to users.
