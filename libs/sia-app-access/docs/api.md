# API reference

The root entry exports `createSiaAccess`, `SessionUnavailableError`, lifecycle models and `createMemoryCredentialStore`. It does not load React or the SDK. Source declarations live in [access-types.ts](../src/access-types.ts) and [credentials.ts](../src/credentials.ts).

## Controller options

The root `createSiaAccess<Session>(options)` returns `SiaAccessInteractions<Session>`, which extends `SiaAccess<Session>`. Its `adapter` is required. The `/sia` entry also exports `createSiaAccess(options)` for `SiaSession`; it uses `createSiaAdapter()` when `adapter` is omitted. Invalid scope or timeout configuration throws synchronously.

| Option              | Contract                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `adapter`           | Required `SiaAccessAdapter<Session>`; determines the session type                        |
| `application`       | Required `appId`, `name`, `description`, `serviceUrl`; optional `callbackUrl`, `logoUrl` |
| `indexerUrl`        | Required HTTP or HTTPS URL without user information, query or fragment                   |
| `credentials`       | Optional `CredentialStore`; defaults to a new memory store for this controller           |
| `approvalTimeoutMs` | Positive finite number; defaults to `300000`                                             |
| `onSubscriberError` | Optional callback for exceptions thrown by subscribers; its own exceptions are swallowed |
| `onResourceError`   | Optional callback for detached SDK cleanup failures; its own exceptions are swallowed    |

Application IDs contain 64 hexadecimal characters and normalize to lowercase. The indexer URL normalizes through `URL`; its canonical `href` and the application ID form `CredentialScope`. Application metadata does not change that identity.

The timeout starts after `begin()` returns and the controller exposes the approval URL. It does not limit the time spent initializing the SDK, requesting a connection, entering a phrase, registering or saving credentials. `cancel()` remains available while commands are pending.

## Commands

Use exported string enums, for example `AccessIntent.Existing` and `AccessOutcome.Ready`. Runtime serialized strings below are reference values, not substitutes for enum members in TypeScript calls.

| Method                         | Result union                          | Successful result                          | Other outcomes                                                  |
| ------------------------------ | ------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `authorize(intent)`            | `Promise<AuthorizeResult>`            | `approved`, requesting phrase input        | failed, cancelled, unavailable                                  |
| `reconnect()`                  | `Promise<ReconnectResult>`            | ready with confirmed credentials           | missing-credentials, failed, cancelled, unavailable             |
| `submitRecoveryPhrase(phrase)` | `Promise<SubmitRecoveryPhraseResult>` | ready with confirmed credentials           | invalid-phrase, phrase-mismatch, failed, cancelled, unavailable |
| `retrySave()`                  | `Promise<RetrySaveResult>`            | ready with confirmed credentials           | failed, cancelled, unavailable                                  |
| `continueWithoutSaving()`      | `ContinueWithoutSavingResult`         | ready with unconfirmed credentials         | unavailable                                                     |
| `forget()`                     | `Promise<ForgetResult>`               | removed, acknowledging local store removal | failed, cancelled, unavailable                                  |
| `generateRecoveryPhrase()`     | `Promise<GeneratedRecoveryPhrase>`    | generated with transient `phrase`          | failed with phrase-generation failure, cancelled, unavailable   |

For example, a sign-in handler can distinguish missing credentials from a failed reconnect:

```ts
import { AccessOutcome, type SiaAccess } from "@lumeweb/sia-app-access";

export async function restoreMessage<Session>(access: SiaAccess<Session>): Promise<string> {
  const result = await access.reconnect();
  switch (result.kind) {
    case AccessOutcome.Ready:
      return "Signed in with saved access.";
    case AccessOutcome.MissingCredentials:
      return "Choose an account to connect.";
    case AccessOutcome.Cancelled:
      return "Sign-in cancelled.";
    case AccessOutcome.Unavailable:
      return "Sign-in is not available in the current state.";
    case AccessOutcome.Failed:
      return `Sign-in failed: ${result.failure}`;
  }
}
```

`unavailable` means the call was not allowed and started no work. Results are immutable and describe only that call. A subscriber can start another command before your `await` resumes, so `getSnapshot()` may already show a different operation.

Failed command results include `failure`, `recovery` and `effects`; a failed `reconnect()` caused by a credential-store read also returns that call's `cause`. Snapshots do not contain the cause. Cancelled results include `effects`. The exception is `generateRecoveryPhrase()`, whose failure and cancellation results have no effect fields. Check the command's result type before reading those properties.

`cancel()` returns `void`. `disconnect()` and terminal `dispose()` stop admission synchronously and return promises for admitted work and SDK cleanup, including connection cleanup that the adapter returns as a promise. Cleanup failures reject them. A connection returned by `begin()` after cancellation is retired when it arrives; `disconnect()` and `dispose()` wait for that acquisition and its cleanup. If an adapter never settles an acquisition, those cleanup promises remain pending. Disconnect retains credentials. Cancel has no effect in ready state. `withSession<Result>(work)` returns `Promise<Result>`, rejects calls made without a ready session with `SessionUnavailableError` (`code: "SIA_SESSION_UNAVAILABLE"`), and propagates application callback failures unchanged. See [session ownership](getting-started.md#use-and-release-a-session).

`openOperationScope()` is available only while ready. Its `run(work)` admits independent work, and `close()` stops new work and waits for its accepted callbacks. Access disconnect or disposal also closes it. The scope exposes no SDK value or source outside `run`; an SDK-specific adapter must release its native child handles before its callback settles. Its passive `closed` promise does not wait for parent SDK cleanup if other borrowers remain.

A service can admit several object reads together and retain each result, including individual read failures. The scope closes after every accepted callback has freed its native child.

```ts
import type { SiaAccess } from "@lumeweb/sia-app-access";
import type { SiaSession } from "@lumeweb/sia-app-access/sia";

export async function inspectObjectSizes(access: SiaAccess<SiaSession>, keys: readonly string[]): Promise<PromiseSettledResult<number>[]> {
  const scope = access.openOperationScope();
  const reads = keys.map((key) =>
    scope.run(async (sdk) => {
      const object = await sdk.object(key);
      try {
        return object.size();
      } finally {
        object.free();
      }
    }),
  );
  const results = await Promise.allSettled(reads);
  await scope.close();
  return results;
}
```

`copyActiveAppKeySeed()` returns fresh caller-owned bytes while ready; callers clear them after use. `activeAppKeyHex()` returns a string for the existing native-stream auth source, or `null` when not ready. Strings cannot be scrubbed. Neither key appears in a snapshot.

## When commands are allowed

`authorize()` and `reconnect()` can start while disconnected or after a recoverable failure, when no connection or session is retained. Calling `authorize()` again while it is pending returns unavailable. Concurrent `reconnect()` calls share the pending promise; reconnecting while ready returns unavailable. Phrase submission needs an approved connection and cannot overlap another access command.

An invalid phrase or a phrase mismatch leaves the approved connection open so the user can correct the input. A mismatch means an existing-account phrase does not match the approved app key; it does not mean the account is missing. Neither result registers an account. If the phrase check cannot run, the controller closes the connection and reports a failure with `AccessRecovery.Authorize`.

`retrySave()` and `continueWithoutSaving()` need the session kept after a save failure. Retrying saves that session without registering again. Concurrent `forget()` calls share the pending result. Forget cancels other access work and queues removal after earlier credential operations finish.

A user choice can call either recovery command and report whether storage confirmed the key. A failed retry may have queued a credential write; its effect says what started, not what the store ultimately kept.

```ts
import { AccessOutcome, CredentialConfirmation, CredentialEffect } from "@lumeweb/sia-app-access";
import type { SiaAccess } from "@lumeweb/sia-app-access";

export async function resolveSaveChoice<Session>(access: SiaAccess<Session>, choice: "retry" | "continue"): Promise<string> {
  const result = choice === "retry" ? await access.retrySave() : access.continueWithoutSaving();
  if (result.kind === AccessOutcome.Ready) {
    return result.credentials === CredentialConfirmation.Confirmed ? "Saved access was confirmed." : "Connected; saving could not be confirmed.";
  }
  if (result.kind === AccessOutcome.Failed) {
    return result.effects.credentials === CredentialEffect.Write ? "The save may have reached storage. Try again." : "Saving did not start. Try again.";
  }
  return `Access is ${result.kind}.`;
}
```

To remove a local key, inspect `forget()` separately from `disconnect()`. A failed or cancelled removal does not confirm that the key is absent.

```ts
import { AccessOutcome, CredentialEffect } from "@lumeweb/sia-app-access";
import type { SiaAccess } from "@lumeweb/sia-app-access";

export async function endAccount<Session>(access: SiaAccess<Session>, removeSavedKey: boolean): Promise<string> {
  if (!removeSavedKey) {
    await access.disconnect();
    return "Signed out; saved access remains.";
  }
  const result = await access.forget();
  switch (result.kind) {
    case AccessOutcome.Removed:
      return "Local saved access was removed.";
    case AccessOutcome.Failed:
      return "Local removal failed; check saved access before reconnecting.";
    case AccessOutcome.Cancelled:
      return result.effects.credentials === CredentialEffect.Remove ? "Removal was queued and may finish after cancellation." : "Removal stopped before storage work started.";
    case AccessOutcome.Unavailable:
      return "Removal is unavailable in the current state.";
  }
}
```

`generateRecoveryPhrase()` is allowed while disconnected or waiting for phrase input. Starting another access command, or calling `cancel()`, `disconnect()` or `dispose()`, cancels pending generation. Disposed controllers do not accept new commands or `withSession` callbacks. Session callbacks already running can still finish; see [session ownership](getting-started.md#use-and-release-a-session).

To stop a pending connection request, call `cancel()` on the same controller. To remove saved credentials, inspect the result of `forget()`:

```ts
import { AccessIntent, AccessOutcome, type SiaAccess } from "@lumeweb/sia-app-access";

export function beginConnection<Session>(access: SiaAccess<Session>) {
  const completion = access.authorize(AccessIntent.Create);
  return { completion, cancel: () => access.cancel() };
}

export async function forgetMessage<Session>(access: SiaAccess<Session>): Promise<string> {
  const result = await access.forget();
  return result.kind === AccessOutcome.Removed ? "Saved access was removed." : "Removal was not confirmed.";
}
```

Disconnecting without removal uses `access.disconnect()` instead.

## Snapshots and subscriptions

`getSnapshot()` includes a nonsecret `activeSessionId` while ready, or `null` otherwise. It changes when a new account SDK becomes active, including across controller replacements; saving the current key does not change it. The snapshot returns the same immutable object until the next update. `subscribe(listener)` takes a no-argument listener and returns an unsubscribe function; it does not call the listener immediately. A listener added during a notification starts receiving later updates. Disposal notifies listeners of the final snapshot before removing them.

For results tied to the current account, compare the session ID after the read before publishing it. A disconnect can happen between the initial observation and `withSession()` admission.

```ts
import { SessionUnavailableError, type SiaAccess } from "@lumeweb/sia-app-access";
import type { SiaSession } from "@lumeweb/sia-app-access/sia";

export async function currentObjectSize(access: SiaAccess<SiaSession>, objectKey: string): Promise<number | null> {
  const sessionId = access.getSnapshot().activeSessionId;
  if (sessionId === null) return null;

  try {
    const size = await access.withSession(async (sdk) => {
      const object = await sdk.object(objectKey);
      try {
        return object.size();
      } finally {
        object.free();
      }
    });
    return access.getSnapshot().activeSessionId === sessionId ? size : null;
  } catch (error) {
    if (error instanceof SessionUnavailableError) return null;
    throw error;
  }
}
```

A throwing listener does not prevent other listeners from running. If a listener causes another snapshot update, the controller notifies listeners of the newer snapshot and stops sending the older notification.

Use `observeSiaAccess(access, render)` from the root package when a plain TypeScript view needs both the current snapshot and later changes. Pass your existing render function directly; no callback that reads `getSnapshot()` is needed. It subscribes before the initial read, skips duplicate snapshot identities, and returns an unsubscribe function. If the first render throws, it unsubscribes and rethrows that value. Later listener failures follow the controller's `onSubscriberError` policy.

React callers use `useSiaAccessInteractions(access)` instead. End plain TypeScript observation when the view closes; the application that created the controller decides when to dispose of it.

`AccessSnapshot` contains `scope` and `state`. `AccessInteractionSnapshot` adds `presentation`. Neither carries credential bytes or recovery phrases.

| `AccessPhase` member                                              | Additional state data                 |
| ----------------------------------------------------------------- | ------------------------------------- |
| `Disconnected`, `Disposed`, `Forgetting`, `Restoring`             | None                                  |
| `RequestingApproval`, `ValidatingPhrase`, `Registering`, `Saving` | `intent`                              |
| `AwaitingApproval`                                                | `intent`, `approvalUrl`               |
| `RecoveryPhrase`                                                  | `intent`, optional correction `issue` |
| `Ready`                                                           | `credentials` confirmation            |
| `Failed`                                                          | `failure`, `recovery`, `effects`      |

`presentation` contains `availability`, nullable `interaction`, and nullable `approval`, `phrase` and `saveRecovery` models. Use `availability` to disable controls for actions that are not currently allowed. A command checks the state again when called and may still return unavailable.

The interaction sequence identifies an authorization flow within one controller. Matching sequences from different controllers do not make their tasks interchangeable.

## Command-local effects

`AccessEffects` contains `registration: RegistrationEffect` and `credentials: CredentialEffect`. It describes the returning command, not global account state or other controllers.

| Enum member                     | Meaning                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `RegistrationEffect.None`       | This command did not dispatch registration                                          |
| `RegistrationEffect.Registered` | Registration returned confirmation                                                  |
| `RegistrationEffect.Unknown`    | Registration was attempted without a definitive reply before this command finished  |
| `RegistrationEffect.Rejected`   | The indexer confirmed that the attempted registration did not create an app account |
| `CredentialEffect.None`         | This command did not start or queue a credential write or removal                   |
| `CredentialEffect.Write`        | A credential write started or was queued                                            |
| `CredentialEffect.Remove`       | A credential removal started or was queued                                          |

An operation can report failure after changing the server or credential store. In particular, a registration error can mean the server registered the account but its response was lost. Do not call `register()` again on that connection; start a new authorization flow.

Cancellation returns a result promptly, but SDK calls and queued credential changes can still finish afterward. Their completion does not change the result already returned. A save retry reports no registration effect because the earlier call performed that registration.

Use the effects when deciding what a failure message can safely claim:

```ts
import { AccessOutcome, RegistrationEffect } from "@lumeweb/sia-app-access";
import type { SubmitRecoveryPhraseResult } from "@lumeweb/sia-app-access";

export function registrationMessage(result: SubmitRecoveryPhraseResult): string {
  if (result.kind !== AccessOutcome.Failed && result.kind !== AccessOutcome.Cancelled) return "";
  if (result.effects.registration === RegistrationEffect.Unknown) {
    return "Registration may have completed. Restart authorization instead of reusing the connection.";
  }
  if (result.effects.registration === RegistrationEffect.Rejected) {
    return "Registration was rejected. Start a new authorization with another connect key.";
  }
  return result.effects.registration === RegistrationEffect.Registered ? "Registration succeeded, but access setup did not finish." : "Registration was not started by this call.";
}
```

`CredentialConfirmation.Confirmed` means a store read supplied the reconnect key or a write was acknowledged. `Unconfirmed` means continuation without a write acknowledgement; bytes may already exist. Neither guarantees persistent storage or prevents another controller or tab from changing the saved key. [Credential ownership](credentials.md) defines buffer and ordering obligations.
