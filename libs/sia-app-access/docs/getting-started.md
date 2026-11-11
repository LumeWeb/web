# Connect your application

The access package coordinates authorization and credential saving through an application-supplied `SiaAccessAdapter<Session>`. Use this controller for an account; it owns the SDK returned by its adapter, so app screens should not create a second `@lumeweb/sia-session` owner. It is private; these examples assume a workspace dependency or a local archive.

## Construct the controller

Choose a stable 64-character hexadecimal application ID. Supply an adapter for your backend and replace the example service addresses with your own.

```ts
import { AccessOutcome, createSiaAccess, type SiaAccessAdapter, type SiaAccessInteractions } from "@lumeweb/sia-app-access";

interface DocumentSession {
  read(name: string): Promise<Uint8Array>;
}

export function createApplicationAccess(adapter: SiaAccessAdapter<DocumentSession>) {
  return createSiaAccess({
    adapter,
    application: {
      appId: "a".repeat(64),
      name: "My app",
      description: "Application storage",
      serviceUrl: "https://app.example/",
    },
    indexerUrl: "https://indexer.example/",
  });
}
```

Create one controller in application bootstrap, outside view rendering. On a server, create a separate controller for each request so users cannot share sessions.

The adapter supplies connection approval, phrase generation and validation, and saved-key reconnect. An approved connection matches existing-account phrases and registers a session. Its `dispose()` requests retirement without throwing; admitted native work must retain its handles. Return a promise from `dispose()` if native cleanup can finish after the call, so `disconnect()` waits for it. A session's `exportAppKey()` returns a fresh caller-owned 32-byte key. The [source contracts](../src/access-types.ts) define ownership and method results.

The default credential store is private to that controller and loses keys on reload. Supply a [custom store](credentials.md) when your application needs persistent storage.

## Connect your UI

React screens read state and commands through the packaged hook. It owns the subscription, while the application owns the controller and its form values.

```tsx
import { AccessIntent, AccessPhase } from "@lumeweb/sia-app-access";
import type { SiaAccessInteractions } from "@lumeweb/sia-app-access";
import { useSiaAccessInteractions } from "@lumeweb/sia-app-access/react";

export function AccountChoices<Session>({ access }: { access: SiaAccessInteractions<Session> }) {
  const { commands, snapshot } = useSiaAccessInteractions(access);
  const available = snapshot.presentation.availability;
  return (
    <section>
      <p>{snapshot.state.phase}</p>
      {snapshot.state.phase === AccessPhase.AwaitingApproval && <a href={snapshot.state.approvalUrl}>Approve this application</a>}
      <button type="button" disabled={!available.reconnect} onClick={() => void commands.reconnect()}>
        Restore saved access
      </button>
      <button type="button" disabled={!available.authorize} onClick={() => void commands.authorize(AccessIntent.Existing)}>
        Connect existing account
      </button>
    </section>
  );
}
```

Bind phrase submission to your form's own state. The [onboarding example](onboarding.md) shows approval, phrase correction and save recovery in a full screen. Unmounting this component stops observation but does not dispose the controller.

For plain TypeScript, import `observeSiaAccess` from the root package and pass it an existing snapshot renderer: `const stop = observeSiaAccess(access, renderAccount)`. It delivers the current snapshot and later changes, then `stop()` ends observation. No separate snapshot-read callback is needed.

Call `access.reconnect()` when the application chooses to try saved credentials. A missing-credentials result means the user needs an account choice; an operational failure is a different outcome:

```ts
export async function restoreMessage<Session>(access: SiaAccessInteractions<Session>) {
  const result = await access.reconnect();
  if (result.kind === AccessOutcome.Ready) return "Signed in.";
  if (result.kind === AccessOutcome.MissingCredentials) return "Choose an account.";
  if (result.kind === AccessOutcome.Failed) return `Sign-in failed: ${result.failure}`;
  return "Sign-in did not finish.";
}
```

Bind the account choices to user actions. Authorization remains pending until approval finishes; `AccessOutcome.Approved` means the user can submit a recovery phrase. A successful submission returns `AccessOutcome.Ready`. Invalid input and an existing-key mismatch allow correction without registering an account.

Await command results when reporting completion. An unavailable or cancelled result is not success. Read [the result unions](api.md#commands) before handling effect fields.

If registration succeeds but saving fails, offer `retrySave()` or `continueWithoutSaving()`. Both use the retained session without registering again. Continuation leaves saving unconfirmed. See [save results](credentials.md#interpret-save-results).

## Use and release a session

An SDK-backed service can run one complete operation inside `withSession(work)`. Keep this borrow inside the service so screens call its methods rather than pass SDK callbacks. Its callback receives the adapter's inferred session type:

```ts
export function documentSize(access: SiaAccessInteractions<DocumentSession>) {
  return access.withSession(async (documents) => {
    const bytes = await documents.read("document");
    return bytes.byteLength;
  });
}
```

Await every operation that depends on the session inside the callback. Convert native results to ordinary data before returning, and release child resources required by your backend. Do not return live streams or native handles, or retain the session for later use.

The controller can disconnect between a ready result and the next call. `withSession()` then rejects with `SessionUnavailableError`. Application callback errors reach the caller unchanged.

A closing view unsubscribes. The application that created the controller calls `dispose()` when it no longer needs access. Disconnect and disposal deny new session work but keep the session alive until admitted callbacks settle.

`cancel()` cancels pending access commands and does nothing while ready. `disconnect()` ends local access but keeps saved credentials. `forget()` also queues local credential removal. These operations do not revoke a remote account or stop requests already sent.
