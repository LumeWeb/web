# React integration

The `/react` entry requires React 19 and reads controller snapshots with `useSyncExternalStore`. It does not require Zustand. Create the controller outside rendering and pass it to your hooks or provider. Mounting and unmounting UI neither starts authorization nor disposes of the controller; the code that created the controller manages its lifetime.

Applications that render DOM use matching React 19 and ReactDOM 19 versions. ReactDOM is not a runtime dependency of this library.

## Observe available actions

`createSiaAccess` returns a `SiaAccessInteractions<Session>` controller. Its snapshot includes `presentation.availability`, which tells your UI which commands are currently allowed:

```tsx
import { AccessIntent, type SiaAccessInteractions } from "@lumeweb/sia-app-access";
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

Inside the provider, use `bindings.useAccess`, `useSelector` or `useInteractions` instead of passing the controller to each hook. Calling a context hook without a provider throws.

Interaction observation requires a controller whose snapshots include `presentation`. Keep the factory's inferred `SiaAccessInteractions` type when passing it around; annotating it as `SiaAccess` hides that field from TypeScript. A custom controller that lacks presentation cannot use these hooks.

## Renderless views

`SiaAccessView` calls its `children(binding)` callback. It accepts `access`; optional `serverSnapshot` is a direct prop. Context bindings expose `View` without the access prop.

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

Pass `options.serverSnapshot` to hooks, or `serverSnapshot` to views, to render a supplied snapshot on the server and during initial hydration. Its application ID and indexer URL must match the controller. See [store SSR behavior](stores.md#server-snapshots) if you use both native React hooks and Zustand.

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

Server rendering observes the supplied snapshot without subscribing or starting authorization. Run commands in application event handlers. Never serialize recovery input or credential bytes.
