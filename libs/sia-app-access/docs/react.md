# React integration

The `/react` entry requires React 19 and reads controller snapshots with `useSyncExternalStore`. It does not require Zustand. Create the controller outside rendering and pass it to your hooks or provider. Mounting and unmounting UI neither starts authorization nor disposes of the controller; the code that created the controller manages its lifetime.

Applications that render DOM use matching React 19 and ReactDOM 19 versions. ReactDOM is not a runtime dependency of this library.

## Observe available actions

`createSiaAccess` returns a `SiaAccessInteractions<Session>` controller. Its snapshot includes `presentation.availability`, which tells your UI which commands are currently allowed:

```tsx
import { AccessIntent, AccessOutcome, type SiaAccessInteractions } from "@lumeweb/sia-app-access";
import { useSiaAccessInteractions } from "@lumeweb/sia-app-access/react";

interface AccessActionsProps<Session> {
  readonly access: SiaAccessInteractions<Session>;
}

export function AccessActions<Session>({ access }: AccessActionsProps<Session>) {
  const { snapshot, commands } = useSiaAccessInteractions(access);
  return (
    <button type="button" disabled={!snapshot.presentation.availability.authorize} onClick={() => void commands.authorize(AccessIntent.Existing)}>
      Connect existing account ({snapshot.state.phase})
    </button>
  );
}
```

The example renders the existing-account button; your application also renders approval and recovery forms. Await and inspect results when a handler needs to report completion. The controller may change between rendering a button and clicking it, so a command can still return unavailable.

`commands` is readonly and excludes `dispose`, `getSnapshot` and `subscribe`. Its methods stay bound to the controller even if you extract a function, and `withSession` keeps your session type.

For custom controllers that supply only `scope` and `state`, use `useSiaAccess(access, options?)`. It also returns `{ snapshot, commands }`. `useSiaAccessSelector(access, selector, options?)` reads a selected value. Use `useSiaAccessInteractions` when you also need `presentation`. See [selector stability](stores.md#selectors).

## Select a value for a small component

Return a primitive or an existing immutable object from a selector. This component only reads the phase:

```tsx
import { useSiaAccessSelector } from "@lumeweb/sia-app-access/react";

export function ConnectionStatus<Session>({ access }: AccessActionsProps<Session>) {
  const phase = useSiaAccessSelector(access, (snapshot) => snapshot.state.phase);
  return <output aria-label="Connection state">{phase}</output>;
}
```

Avoid returning a fresh object such as `{ phase: snapshot.state.phase }` on each read. See [selector examples](stores.md#selectors).

## Distribute a controller through context

Create the context outside rendering, then pass your controller to its provider. The provider does not create or dispose of the controller. This example uses an application-defined `Destination` session type:

```tsx
import type { ReactNode } from "react";
import type { SiaAccess } from "@lumeweb/sia-app-access";
import { createSiaAccessContext } from "@lumeweb/sia-app-access/react";

interface Destination {
  readSummary(): Promise<string>;
}
interface AccessOwnerProps {
  readonly access: SiaAccess<Destination>;
  readonly children?: ReactNode;
}

export const bindings = createSiaAccessContext<Destination>();
export function AccessOwner({ access, children }: AccessOwnerProps) {
  return <bindings.Provider access={access}>{children}</bindings.Provider>;
}
```

A child can read state and disconnect without another `access` prop:

```tsx
export function AccountStatus() {
  const { snapshot, commands } = bindings.useAccess();
  return (
    <section>
      <output>{snapshot.state.phase}</output>
      <button onClick={() => commands.disconnect()}>Disconnect</button>
    </section>
  );
}
```

Inside the provider, use `bindings.useAccess`, `useSelector` or `useInteractions` instead of passing the controller to each hook. Task hooks are available as `useApproval`, `useRecoveryPhrase` and `useSaveRecovery`. Calling them without a provider throws.

Interaction and task hooks require a controller whose snapshots include `presentation`. Keep the factory's inferred `SiaAccessInteractions` type when passing it around; annotating it as `SiaAccess` hides that field from TypeScript. A custom controller that lacks presentation cannot use these hooks.

## Task hooks

A task groups the data and actions for one part of authorization. Each hook returns `null` when that task is absent. Tasks do not store form inputs or expose the SDK session.

| Hook                   | Task data and actions                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `useSiaApproval`       | `interaction`, `progress`, `url`, `canCancel`, `cancel()`                                               |
| `useSiaRecoveryPhrase` | `interaction`, `intent`, submission/generation/cancel flags, `submit(string)`, `generate()`, `cancel()` |
| `useSiaSaveRecovery`   | `interaction`, save `progress`, original failure `effects`, retry/continuation/cancel flags and actions |

`ApprovalProgress.Requesting` has `url: null`; `ApprovalProgress.Awaiting` has a validated HTTP or HTTPS string URL without user information. Save recovery uses `SaveRecoveryProgress.Idle` or `Pending`; retry and continuation are disabled during pending saving. Retry never registers again.

The phrase task remains present during validation, with `canSubmit: false`. `submit` returns the controller's `SubmitRecoveryPhraseResult`; `generate` returns `GeneratedRecoveryPhrase`, which contains a phrase only when its kind is `AccessOutcome.Generated`. Your application decides whether to put that phrase in an input.

Do not keep a task after its controller or authorization flow changes. Its result-returning actions then return unavailable, and its cancel action does nothing.

Each authorization flow has an interaction sequence. The sequence increases when the controller accepts a new authorization and stays the same through phrase correction and saving. Cancel, disconnect, forget, reconnect and disposal end the interaction. A sequence from one controller does not identify a flow in another controller.

## Render approval and phrase entry

Use the approval task's URL when it is available. While the request is pending, the same component shows progress:

```tsx
import { useSiaApproval, useSiaRecoveryPhrase } from "@lumeweb/sia-app-access/react";

export function ApprovalControls<Session>({ access }: AccessActionsProps<Session>) {
  const task = useSiaApproval(access);
  if (!task) return null;
  return (
    <section>
      {task.url ? <a href={task.url}>Approve this application</a> : <p>Requesting approval…</p>}
      <button disabled={!task.canCancel} onClick={() => task.cancel()}>
        Cancel
      </button>
    </section>
  );
}

export function PhraseControls<Session>({ access }: AccessActionsProps<Session>) {
  const task = useSiaRecoveryPhrase(access);
  return task ? <RecoveryForm access={access} task={task} /> : null;
}
```

The application owns the form's input, backup checkbox and error message. This component ignores delayed results after edits, controller replacement or unmount:

```tsx
/** The application keeps phrase input and rejects async results after edits or replacement. */
import { useLayoutEffect, useRef, useState } from "react";
import type { RecoveryPhraseTask } from "@lumeweb/sia-app-access/react";

interface RecoveryFormProps<Session> {
  readonly access: SiaAccessInteractions<Session>;
  readonly task: RecoveryPhraseTask;
}

export function RecoveryForm<Session>({ access, task }: RecoveryFormProps<Session>) {
  const creating = task.intent === AccessIntent.Create;
  const [phrase, setPhrase] = useState("");
  const [issue, setIssue] = useState("");
  const [saved, setSaved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const revision = useRef(0);
  const sequence = task.interaction.sequence;
  // Cleanup runs before replacement layout effects can resolve an older request.
  useLayoutEffect(
    () => () => {
      revision.current++;
    },
    [access, sequence],
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const submitted = ++revision.current;
        void task.submit(phrase).then((outcome) => {
          if (submitted !== revision.current) return;
          const error = toRecoveryPhraseFieldError(outcome, {
            invalidPhrase: "This phrase isn't valid. Check it and try again.",
            phraseMismatch: "This phrase doesn't match the account you approved.",
          });
          if (error) setIssue(error.message);
        });
      }}>
      <h1>{creating ? "Keep your recovery phrase" : "Enter your recovery phrase"}</h1>
      <p>{creating ? "Generate your recovery phrase, then write it down and keep it private." : "Enter the recovery phrase you saved for this account."}</p>
      <label htmlFor="recovery-phrase">Recovery phrase</label>
      <input
        aria-describedby={issue ? "phrase-issue" : undefined}
        aria-invalid={Boolean(issue)}
        autoComplete="off"
        id="recovery-phrase"
        onChange={(event) => {
          revision.current++;
          setPhrase(event.currentTarget.value);
          setSaved(false);
          setIssue("");
        }}
        type={revealed ? "text" : "password"}
        value={phrase}
      />
      {issue && (
        <p className="error" id="phrase-issue" role="alert">
          {issue}
        </p>
      )}
      {creating && (
        <button
          className="secondary"
          disabled={!task.canGenerate}
          onClick={() => {
            const generated = ++revision.current;
            void task.generate().then((outcome) => {
              if (generated !== revision.current || outcome.kind !== AccessOutcome.Generated) return;
              setPhrase(outcome.phrase);
              setSaved(false);
              setIssue("");
            });
          }}
          type="button">
          Generate phrase
        </button>
      )}
      <button aria-pressed={revealed} className="secondary" disabled={!phrase} onClick={() => setRevealed(!revealed)} type="button">
        {revealed ? "Hide phrase" : "Show phrase"}
      </button>
      {creating && (
        <label className="check">
          <input checked={saved} onChange={(event) => setSaved(event.currentTarget.checked)} type="checkbox" />I saved my recovery phrase
        </label>
      )}
      <button disabled={!task.canSubmit || (creating && !saved) || !phrase.trim()} type="submit">
        {creating ? "Finish account setup" : "Connect account"}
      </button>
      <button className="text-button" disabled={!task.canCancel} onClick={() => task.cancel()} type="button">
        Cancel connection
      </button>
    </form>
  );
}
```

The revision changes on every edit, even if the user restores the same text. Layout cleanup invalidates handlers before replacement layout effects can resolve an older request. The controller's original outcomes are not rewritten.

## Recover saving without registering again

The save task appears when registration succeeded but saving the key could not be confirmed. Use its actions rather than starting authorization again:

```tsx
import { useSiaSaveRecovery } from "@lumeweb/sia-app-access/react";

export function SaveRecoveryControls<Session>({ access }: AccessActionsProps<Session>) {
  const task = useSiaSaveRecovery(access);
  if (!task) return null;
  return (
    <section>
      <p>Your account connected, but saving could not be confirmed.</p>
      <button disabled={!task.canRetrySave} onClick={() => void task.retrySave()}>
        Try saving again
      </button>
      <button disabled={!task.canContinueWithoutSaving} onClick={() => task.continueWithoutSaving()}>
        Continue anyway
      </button>
      <button disabled={!task.canCancel} onClick={() => task.cancel()}>
        Cancel
      </button>
    </section>
  );
}
```

Retry saving does not register the account again. Continuation keeps access ready with unconfirmed persistence. See [credential recovery](credentials.md).

## Keep forms application-owned

Manage input values, errors, dirty and touched state in your form. Call `submit(phrase)` from the submit handler: it can register an account and save credentials, so it must not run as a field validator.

Before applying an asynchronous result, check whether the user has edited the input, replaced the dialog or controller, or left the page. The task cannot make that decision for your form. Keep or clear earlier errors according to your UI's behavior, and reset only when the result warrants it. Unavailable, failed and cancelled results are not success.

The optional `/react-hook-form` entry converts invalid-phrase and phrase-mismatch outcomes to `{ type, message }`. Supply a message for each outcome; empty strings are allowed. Other outcomes return `undefined`, which means no mapped phrase error. It does not clear errors or imply success.

After checking that a result still belongs to the current input, a submit handler can call this helper to show a phrase error. The helper leaves existing errors and values alone when there is no mapped error:

```ts
import type { UseFormReturn } from "react-hook-form";
import type { SubmitRecoveryPhraseResult } from "@lumeweb/sia-app-access";
import { toRecoveryPhraseFieldError } from "@lumeweb/sia-app-access/react-hook-form";

interface PhraseFields {
  phrase: string;
}
export function applyPhraseCorrection(form: UseFormReturn<PhraseFields>, outcome: SubmitRecoveryPhraseResult) {
  const error = toRecoveryPhraseFieldError(outcome, {
    invalidPhrase: "Enter a valid recovery phrase.",
    phraseMismatch: "Use the recovery phrase for this account.",
  });
  if (error) form.setError("phrase", error);
}
```

The mapper works without React or React Hook Form installed. If your form uses RHF, install it in your application. See the [RHF and plain React examples](../tests/browser/react-interactions.tsx) and their [browser tests](../tests/browser/react-interactions.spec.ts).

## Renderless views

`SiaAccessView` calls its `children(binding)` callback. `SiaApprovalView`, `SiaRecoveryPhraseView` and `SiaSaveRecoveryView` call `children(task)` even when the task is null. Each accepts `access`; optional `serverSnapshot` is a direct prop. Context bindings expose `View`, `ApprovalView`, `RecoveryPhraseView` and `SaveRecoveryView` without the access prop.

For example, this view renders a connection button using the application's class name:

```tsx
import { SiaAccessView } from "@lumeweb/sia-app-access/react";

export function ConnectionPanel<Session>({ access }: AccessActionsProps<Session>) {
  return (
    <SiaAccessView access={access}>
      {({ snapshot, commands }) => (
        <section className="account-panel">
          <p>{snapshot.state.phase}</p>
          <button onClick={() => void commands.reconnect()}>Restore saved access</button>
        </section>
      )}
    </SiaAccessView>
  );
}
```

Views render no DOM or CSS. Supply your own markup, labels, accessibility and form handling. Call hooks before entering render callbacks, and run commands in event handlers rather than while rendering.

## Server rendering and hydration

Pass `options.serverSnapshot` to hooks, or `serverSnapshot` to views, to render a supplied snapshot on the server and during initial hydration. Its application ID and indexer URL must match the controller. Task hooks also need the snapshot's `presentation` field. See [store SSR behavior](stores.md#server-snapshots) if you use both native React hooks and Zustand.

A component can take the server snapshot as a prop without starting an operation:

```tsx
import type { AccessInteractionSnapshot } from "@lumeweb/sia-app-access";

export function HydratedPhase<Session>({
  access,
  serverSnapshot,
}: AccessActionsProps<Session> & {
  readonly serverSnapshot: AccessInteractionSnapshot;
}) {
  const { snapshot } = useSiaAccessInteractions(access, { serverSnapshot });
  return <output>{snapshot.state.phase}</output>;
}
```

Create separate controllers for server requests. Pass only snapshot data to the client, never a live SDK session.

Server rendering does not start authorization. Tasks created from serialized server data cannot start commands, even if their scope and sequence match the client. Their actions become usable only after the hook has switched to the live controller and activated those actions on the client. Use the current hook result in event handlers and handle unavailable results. Never serialize recovery input or credential bytes.
