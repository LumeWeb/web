# Credential ownership

A `CredentialScope` pairs an application ID with an indexer URL. Use both values in your storage key. The memory store compares both strings exactly; use the same values when reading and writing.

## Use memory storage

`createMemoryCredentialStore()` creates an independent store. Memory credentials do not survive a page reload or process restart.

```ts
import { createMemoryCredentialStore } from "@lumeweb/sia-app-access";

const credentials = createMemoryCredentialStore();
const scope = {
  appId: "a".repeat(64),
  indexerUrl: "https://indexer.example/",
};
const key = new Uint8Array(32).fill(1);
await credentials.write(scope, key);
key.fill(0);

const restored = await credentials.read(scope);
if (restored?.[0] !== 1) throw new Error("Expected an independent copy");
restored.fill(0);
await credentials.remove(scope);
await credentials.clear();
```

`write()` retains a copy before returning its promise. `read()` returns a fresh copy or `null` when no record exists. `remove()` deletes only the supplied scope; `clear()` removes every record in that store instance.

## Implement another store

Import `CredentialStore` from the root entry and implement its methods:

| Method                                              | Return type                   |
| --------------------------------------------------- | ----------------------------- |
| `read(scope: CredentialScope)`                      | `Promise<Uint8Array \| null>` |
| `write(scope: CredentialScope, appKey: Uint8Array)` | `Promise<void>`               |
| `remove(scope: CredentialScope)`                    | `Promise<void>`               |

Return an owned buffer from `read()`: the receiver may clear it after use. Copy any bytes you retain during `write()` before its promise resolves or rejects. A write may save data before reporting failure, so rejection does not prove that no credential was saved.

Storage and encryption policy belong to the application. The package provides no password vault or encrypted record format. Coordinate concurrent callers in your store when its backend requires ordering across tabs or processes.

## Interpret confirmation

`CredentialConfirmation.Confirmed` describes a store read that returned the reconnect key or an acknowledged write. It does not guarantee durability after a reload. `CredentialConfirmation.Unconfirmed` describes access without a confirmed save; the store may already contain the key.

Keep keys and recovery phrases out of logs and diagnostics. Clearing a JavaScript buffer cannot guarantee that every copy has been erased from memory.
