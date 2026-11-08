# API reference

The root entry exports `createSiaAccess`, `SessionUnavailableError`, lifecycle models and `createMemoryCredentialStore`. It does not load React or the SDK. Source declarations live in [access-types.ts](../src/access-types.ts) and [credentials.ts](../src/credentials.ts).

## Controller options

`createSiaAccess<Session>(options)` returns `SiaAccessInteractions<Session>`, which extends `SiaAccess<Session>`. Invalid scope or timeout configuration throws synchronously.

| Option              | Contract                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `adapter`           | Required `SiaAccessAdapter<Session>`; determines the session type                        |
| `application`       | Required `appId`, `name`, `description`, `serviceUrl`; optional `callbackUrl`, `logoUrl` |
| `indexerUrl`        | Required HTTP or HTTPS URL without user information, query or fragment                   |
| `credentials`       | Optional `CredentialStore`; defaults to a new memory store for this controller           |
| `approvalTimeoutMs` | Positive finite number; defaults to `300000`                                             |
| `onSubscriberError` | Optional callback for exceptions thrown by subscribers; its own exceptions are swallowed |

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

Failed command results include `failure`, `recovery` and `effects`; cancelled results include `effects`. The exception is `generateRecoveryPhrase()`, whose failure and cancellation results have no effect fields. Check the command's result type before reading those properties.

`cancel()`, `disconnect()` and `dispose()` return `void`. Disposal permanently ends the controller; disconnect retains credentials. Cancel has no effect in ready state. `withSession<Result>(work)` returns `Promise<Result>`, rejects calls made without a ready session with `SessionUnavailableError` (`code: "SIA_SESSION_UNAVAILABLE"`), and propagates application callback failures unchanged. See [session ownership](getting-started.md#use-and-release-a-session).

## When commands are allowed

`authorize()` and `reconnect()` can start while disconnected or after a recoverable failure, when no connection or session is retained. Calling `authorize()` again while it is pending returns unavailable. Concurrent `reconnect()` calls share the pending promise; reconnecting while ready returns unavailable. Phrase submission needs an approved connection and cannot overlap another access command.

An invalid phrase or a phrase mismatch leaves the approved connection open so the user can correct the input. A mismatch means an existing-account phrase does not match the approved app key; it does not mean the account is missing. Neither result registers an account. If the phrase check cannot run, the controller closes the connection and reports a failure with `AccessRecovery.Authorize`.

`retrySave()` and `continueWithoutSaving()` need the session kept after a save failure. Retrying saves that session without registering again. Concurrent `forget()` calls share the pending result. Forget cancels other access work and queues removal after earlier credential operations finish.

`generateRecoveryPhrase()` is allowed while disconnected or waiting for phrase input. Starting another access command, or calling `cancel()`, `disconnect()` or `dispose()`, cancels pending generation. Disposed controllers do not accept new commands or `withSession` callbacks. Session callbacks already running can still finish; see [session ownership](getting-started.md#use-and-release-a-session).

To stop a pending connection request, call `cancel()` on the same controller. To remove saved credentials, inspect the result of `forget()`:

```ts
import { AccessIntent } from "@lumeweb/sia-app-access";

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

`getSnapshot()` returns the same immutable object until the next snapshot update. `subscribe(listener)` takes a no-argument listener and returns an unsubscribe function; it does not call the listener immediately. A listener added during a notification starts receiving later updates. Disposal notifies listeners of the final snapshot before removing them.

A throwing listener does not prevent other listeners from running. If a listener causes another snapshot update, the controller notifies listeners of the newer snapshot and stops sending the older notification.

Subscribe, then read the initial snapshot so the view does not wait for an update:

```ts
import type { AccessSnapshot } from "@lumeweb/sia-app-access";

export function observeAccess<Session>(access: SiaAccess<Session>, render: (snapshot: AccessSnapshot) => void) {
  const update = () => render(access.getSnapshot());
  const unsubscribe = access.subscribe(update);
  update();
  return unsubscribe;
}
```

Call the returned function when the view closes. The application that created the controller decides when to dispose of it.

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

| Enum member                     | Meaning                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `RegistrationEffect.None`       | This command did not dispatch registration                                            |
| `RegistrationEffect.Registered` | Registration returned confirmation                                                    |
| `RegistrationEffect.Unknown`    | Registration was attempted, but no success was confirmed before this command finished |
| `CredentialEffect.None`         | This command did not start or queue a credential write or removal                     |
| `CredentialEffect.Write`        | A credential write started or was queued                                              |
| `CredentialEffect.Remove`       | A credential removal started or was queued                                            |

An operation can report failure after changing the server or credential store. In particular, a registration error can mean the server registered the account but its response was lost. Do not call `register()` again on that connection; start a new authorization flow.

Cancellation returns a result promptly, but SDK calls and queued credential changes can still finish afterward. Their completion does not change the result already returned. A save retry reports no registration effect because the earlier call performed that registration.

Use the effects when deciding what a failure message can safely claim:

```ts
import { RegistrationEffect } from "@lumeweb/sia-app-access";
import type { SubmitRecoveryPhraseResult } from "@lumeweb/sia-app-access";

export function registrationMessage(result: SubmitRecoveryPhraseResult): string {
  if (result.kind !== AccessOutcome.Failed && result.kind !== AccessOutcome.Cancelled) return "";
  if (result.effects.registration === RegistrationEffect.Unknown) {
    return "Registration may have completed. Restart authorization instead of reusing the connection.";
  }
  return result.effects.registration === RegistrationEffect.Registered ? "Registration succeeded, but access setup did not finish." : "Registration was not started by this call.";
}
```

`CredentialConfirmation.Confirmed` means a store read supplied the reconnect key or a write was acknowledged. `Unconfirmed` means continuation without a write acknowledgement; bytes may already exist. Neither guarantees persistent storage or prevents another controller or tab from changing the saved key. [Credential ownership](credentials.md) defines buffer and ordering obligations.
