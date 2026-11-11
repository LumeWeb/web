# Decide what application access should own

`@lumeweb/sia-app-access` implements an account connection and its local credential lifecycle. You provide the adapter, application identity, indexer, and optional credential store. One controller has one active account session at a time for one application and indexer scope. It does not choose accounts for you. The controller owns the connection and session returned by the adapter. It does not own your screen, profile, file operations, sharing policy, or video player.

## Account path at a glance

```text
User choice       create account or connect existing
Approval          requesting approval; awaiting approval
Phrase            recovery phrase; invalid input or mismatch returns here
Registration      valid phrase starts one registration on the approved connection
Saving            registration returned a session; store write is pending
Ready             session can be borrowed; save acknowledgement confirms credentials

Other paths       reconnect reads a saved key; forget queues local removal
                 save failure keeps the session for retry or continuation
```

`authorize(AccessIntent.Create)` and `authorize(AccessIntent.Existing)` both request approval before accepting a phrase. Existing-account submission also calls `matchesExistingAppKey` on that approved connection. An invalid phrase or mismatch does not register; the user can correct the input on the same connection. A registration attempt has an unknown remote outcome until the adapter confirms it. Do not treat a failed or cancelled registration as proof that the server made no change.

The returned command result describes that command. `getSnapshot()` describes the controller's current state; a subscriber may have started another command by the time an earlier caller resumes. `AccessInteractionIdentity.sequence` names a UI interaction only within one controller. `activeSessionId` names a ready account session across controller instances but is not a credential.

## Assumptions you can keep or replace

| Decision     | What access does                                                                                        | What your application decides                                               |
| ------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Account flow | Requests approval, accepts a phrase, registers at most once per approved connection                     | Whether to offer create, existing, or saved-key reconnect                   |
| SDK          | Uses the supplied `SiaAccessAdapter`; the optional `/sia` adapter uses the SDK's WASM classes           | Which adapter to supply and how its WASM assets are served                  |
| Identity     | Normalizes the 64-hex-character application ID and HTTP or HTTPS indexer URL into one `CredentialScope` | Which app ID and indexer to use; a change selects a different stored record |
| Credentials  | Stores through the supplied `CredentialStore`, or a new memory store by default                         | Persistence, encryption, migration, and cross-tab coordination              |
| Saving       | Keeps a registered session after a failed write so the user can retry or continue without confirmation  | Whether to offer retry, warn, or allow continuation                         |
| Account work | Admits `withSession` and operation scopes only while ready                                              | Which calls to run and when to free their native child handles              |
| UI           | Publishes immutable state and action availability                                                       | Form values, messages, navigation, profile, and display policy              |
| Cleanup      | Retires connection and session handles and waits for admitted work                                      | When to disconnect, forget the local key, or dispose the controller         |

Controllers do not coordinate writes across shared stores or browser tabs. The default memory store can acknowledge a write and still lose the key on reload. `CredentialConfirmation.Confirmed` means a read supplied a key or a write was acknowledged; it does not promise durable or encrypted storage. `continueWithoutSaving()` reports `Unconfirmed` even if the failed write saved data before reporting an error. Read [credential ownership](credentials.md) before implementing a persistent store.

Access does not provide a keyless shared-object account. An application that supports both account access and keyless sharing needs its own mode selection; a sharing seed must not be treated as an account credential. Access also does not provision an application ID or choose an indexer. The [released adapter](adapters.md) shows how the Sia SDK fills the account side of this table.

### Fixed account behavior

A custom adapter changes the SDK operations, not the controller's steps. Account creation and existing-account connection both require approval and phrase submission before registration. `SiaAccessAdapter` has no token-only sign-in method. A provider with no approval or phrase step would need a different controller contract rather than a fake successful approval.

The controller keeps one ready session at a time. To expose multiple accounts at once, your application needs separate controllers and a credential store that coordinates writes across them. `forget()` only removes the local scoped credential; remote account revocation belongs to your service. These constraints are reasons to change the access API if your product needs different behavior, not switches you can set through `SiaAccessOptions`.

## Try an account lifecycle without a server

Save this block as `example.ts` in an ESM workspace package that depends on `@lumeweb/sia-app-access`. From the repository root, build `@lumeweb/sia-session` and `@lumeweb/sia-app-access` with `pnpm --filter @lumeweb/sia-session build` and `pnpm --filter @lumeweb/sia-app-access build`. Run `node --experimental-strip-types example.ts` with Node 26 from the package directory. Its controlled adapter accepts the input and returns a local session; it does not validate a real phrase, use WASM, or contact Sia. The output lets you see which actions actually change account state.

```ts
import { AccessIntent, createMemoryCredentialStore, createSiaAccess, PhraseValidation } from "@lumeweb/sia-app-access";
import type { AccessSession, SiaAccessAdapter } from "@lumeweb/sia-app-access";

type Documents = { read(path: string): Promise<string> };
const key = new Uint8Array(32).fill(7);
function makeSession(): AccessSession<Documents> {
  return {
    value: { read: async (path) => `document ${path}` },
    exportAppKey: () => Uint8Array.from(key),
    dispose() {},
  };
}
const adapter: SiaAccessAdapter<Documents> = {
  async begin() {
    return {
      approvalUrl: "https://approve.example/",
      waitForApproval: async () => undefined,
      matchesExistingAppKey: async () => true,
      register: async () => makeSession(),
      dispose() {},
    };
  },
  generateRecoveryPhrase: async () => "controlled input",
  validateRecoveryPhrase: async () => PhraseValidation.Valid,
  reconnect: async (_scope, _app, bytes) => (bytes.every((byte) => byte === 7) ? makeSession() : null),
};
const access = createSiaAccess({
  adapter,
  credentials: createMemoryCredentialStore(),
  application: {
    appId: "a".repeat(64),
    name: "Example",
    description: "Controlled example",
    serviceUrl: "https://app.example/",
  },
  indexerUrl: "https://indexer.example/",
});

console.log((await access.authorize(AccessIntent.Create)).kind);
console.log((await access.submitRecoveryPhrase("controlled input")).kind);
console.log(await access.withSession((documents) => documents.read("guide")));
await access.disconnect();
console.log((await access.reconnect()).kind);
console.log((await access.forget()).kind);
await access.dispose();
// approved
// ready
// document guide
// ready
// removed
```

`disconnect()` keeps the saved key, so `reconnect()` can read it from the same memory store. `forget()` removes that local record; it does not revoke anything on a server. To use the released WASM adapter, import `createSiaAccess` from `/sia`, omit `adapter`, and configure a real SDK environment as described in [Adapters](adapters.md#released-wasm-adapter). The controlled output is not evidence that a native authorization or remote registration works.

## Handle commands and snapshots separately

A React screen uses `useSiaAccessInteractions(access)` to read the snapshot. Outside React, pass an existing snapshot renderer directly to `observeSiaAccess(access, renderAccount)`; it delivers the current state and later changes, and returns an unsubscribe function. The [React example](getting-started.md#connect-your-ui) displays the approval URL. Submit the phrase in a later user action, without placing it in controller state:

```ts
import { AccessIntent, AccessOutcome } from "@lumeweb/sia-app-access";
import type { SiaAccessInteractions, SubmitRecoveryPhraseResult } from "@lumeweb/sia-app-access";

export async function beginExisting<Session>(access: SiaAccessInteractions<Session>) {
  const result = await access.authorize(AccessIntent.Existing);
  if (result.kind === AccessOutcome.Approved) return "Ask for the recovery phrase.";
  return `Connection ended: ${result.kind}`;
}

export async function submitPhrase<Session>(access: SiaAccessInteractions<Session>, phrase: string): Promise<SubmitRecoveryPhraseResult> {
  return access.submitRecoveryPhrase(phrase);
}
```

The application owns the controller until it calls `dispose()`; unmounting a view does not dispose it. Do not log the phrase or put it in a snapshot. [React task hooks](react.md#task-hooks) bind actions to a live interaction without owning the form.

## Choose the span of account work

For one bounded call, use `withSession()`. The callback and any child-handle cleanup must finish before it returns:

```ts
import type { SiaAccess } from "@lumeweb/sia-app-access";

interface Documents {
  read(path: string): Promise<Uint8Array>;
}

export function readDocument(access: SiaAccess<Documents>, path: string) {
  return access.withSession((documents) => documents.read(path));
}

export async function readSeveral(access: SiaAccess<Documents>, paths: readonly string[]) {
  const scope = access.openOperationScope();
  try {
    return await Promise.all(paths.map((path) => scope.run((documents) => documents.read(path))));
  } finally {
    await scope.close();
  }
}
```

`Documents` is a custom adapter's session type, not a method promised by the released Sia SDK. For that SDK, use its real methods and free any object handle before its callback settles. The [adapter guide](adapters.md#session-borrowing) describes the native contract.

`openOperationScope()` retains one parent borrow for independent calls. Disconnect closes its admission while accepted calls drain. Call `close()` after all callbacks are started, outside those callbacks; `closed` reports the scope's drain, not other borrowers' SDK cleanup. Hold one operation across an entire upload or stream that needs the session, including its dependent native cleanup. Splitting that work into unrelated short borrows can release the SDK before the task finishes.

A ready snapshot is not a reservation. A disconnect can occur before your next `withSession()` or `openOperationScope()`; these calls then reject with `SessionUnavailableError`. After accepting a callback, access keeps its session until that callback settles. Callback errors reach you unchanged, including non-`Error` values. See [the API reference](api.md#commands) for command outcomes and [command-local effects](api.md#command-local-effects) before reporting a cancelled write or registration as absent.

## End a controller without changing the wrong thing

| Call                                | Account session                                             | Local saved key                             | New session callbacks                     |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| `cancel()` during a pending command | Pending work retires; ready access is unchanged             | Unchanged                                   | Depends on the resulting state            |
| `disconnect()`                      | Retires after accepted work drains                          | Retained                                    | Refused until another connection succeeds |
| `forget()`                          | Retires; queued local removal may finish after cancellation | Removal is requested, not remote revocation | Refused until another connection succeeds |
| `dispose()`                         | Retires and waits for accepted work and cleanup             | Retained                                    | Permanently refused                       |

Await `disconnect()` or `dispose()` outside any callback that they must wait for. `forget()` reports whether local removal was acknowledged. A cancelled removal may still finish later; its `CredentialEffect.Remove` says it was started or queued, not that the key is gone. None of these calls revokes a remote account.
