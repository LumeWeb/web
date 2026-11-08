# Stores and selectors

Use `createSiaAccessStore` to read a controller through Zustand. The returned store exposes the controller's snapshots without copying them. Each call creates a separate store with its own subscriptions.

The package's React hooks create these stores for you and use `useSyncExternalStore`; they do not require Zustand. You can observe the same controller through both APIs. Separate controllers keep separate state, even when their application and indexer match.

## Readonly store contract

Import the factory from `@lumeweb/sia-app-access/zustand`. Construction imports neither Zustand nor React and performs no subscription or protocol work. The returned object is frozen.

| Method                | Behavior                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `getState()`          | Returns the controller's exact current snapshot                                                                                          |
| `getInitialState()`   | Returns the snapshot retained at adapter construction, or the supplied server snapshot                                                   |
| `subscribe(listener)` | Subscribes to controller publications; listener receives `(snapshot, previous)` only when snapshot identity changes; returns unsubscribe |

Change access through controller commands, not `setState`. The store has no `setState`, disposal method or middleware API. Unsubscribe when you stop observing it; disposing of the controller remains the responsibility of the code that created it.

For a view outside React, subscribe and render the current snapshot immediately:

```ts
import type { AccessSnapshot, SiaAccess } from "@lumeweb/sia-app-access";
import { createSiaAccessStore } from "@lumeweb/sia-app-access/zustand";

export function watchPhase<Session>(access: SiaAccess<Session>, render: (phase: string) => void) {
  const store = createSiaAccessStore(access);
  const unsubscribe = store.subscribe((snapshot) => render(snapshot.state.phase));
  render(store.getState().state.phase);
  return unsubscribe;
}
```

Call the returned unsubscribe function when the view closes. The application can still use the controller after that.

## Use Zustand's reader

Install Zustand `^5.0.14` to use its `useStore` hook with the readonly store:

```tsx
import { useMemo } from "react";
import { useStore } from "zustand";

interface PhaseViewProps<Session> {
  readonly access: SiaAccess<Session>;
}
export function PhaseView<Session>({ access }: PhaseViewProps<Session>) {
  const store = useMemo(() => createSiaAccessStore(access), [access]);
  const phase = useStore(store, (snapshot) => snapshot.state.phase);
  return <output>{phase}</output>;
}
```

Memoize by controller and, when supplied, server snapshot rather than constructing an adapter on every render. Keep server controllers separate for each request.

When a React hook and a Zustand store observe the same controller, their live reads return the same snapshot object. Their initial snapshots can differ; see [server snapshots](#server-snapshots).

## Selectors

Both native React and Zustand's standard reader use React external-store selection with `Object.is` result equality. Return a primitive or a controller-owned immutable object. Do not allocate a fresh object or tuple on every snapshot read; unchanged data must produce stable results. Derive further presentation from the selected value in the component, or use an application-owned selector cache.

Select the state object and derive a label after reading it, rather than returning a new object from the selector:

```tsx
import { AccessPhase } from "@lumeweb/sia-app-access";
import { useSiaAccessSelector } from "@lumeweb/sia-app-access/react";

export function ConnectionBadge<Session>({ access }: PhaseViewProps<Session>) {
  const state = useSiaAccessSelector(access, (snapshot) => snapshot.state);
  const label = state.phase === AccessPhase.Ready ? "Connected" : "Not connected";
  return <span className="connection-badge">{label}</span>;
}
```

Memoizing a selector function does not fix a selector that returns a new object on every call. Selectors only read state. Call controller commands to change access, and use `withSession` for work that needs the session.

## Server snapshots

`createSiaAccessStore(access, { serverSnapshot })` checks application ID and canonical indexer URL against the controller and throws on a mismatch. It retains that exact object for `getInitialState`; live reads always use `access.getSnapshot()`.

For example, construct a store with the snapshot your server rendered:

```ts
export function hydratedStore<Session>(access: SiaAccess<Session>, serverSnapshot: AccessSnapshot) {
  return createSiaAccessStore(access, { serverSnapshot });
}
```

Pass that same snapshot to the native React hook when both readers render the page. See the [hydration component](react.md#server-rendering-and-hydration).

Without an explicit server snapshot, initial state is the controller snapshot observed at construction. Each adapter retains its own initial state, so two adapters made at different times can have different initial snapshots while sharing live reads. Supply the same server snapshot if native React and Zustand must render the same hydration presentation.

A controller typed as `SiaAccessInteractions` gives the store an `AccessInteractionSnapshot`, including `presentation`. A custom `SiaAccess` controller only needs to supply the base `scope` and `state` snapshot. Both interfaces are supported.

Custom controllers must return stable immutable snapshots. To support interaction observation, their presentation and available actions must match their current state.
