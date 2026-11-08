/** Controller observation supports legacy snapshots and enhanced task metadata. */
import {
  useCallback,
  useDebugValue,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createSiaAccessStore } from "@/zustand";
import type { SiaAccessStore, SiaAccessStoreOptions } from "@/zustand";
import type {
  AccessInteractionSnapshot,
  AccessSnapshot,
  SiaAccess,
  SiaAccessInteractions,
  SiaAccessOperations,
} from "@/access-types";

export interface SiaAccessBinding<Session> {
  readonly commands: SiaAccessCommands<Session>;
  readonly snapshot: AccessSnapshot;
}
// These public interfaces remain open to declaration merging.
/* oxlint-disable typescript/no-empty-object-type */
export interface SiaAccessCommands<Session> extends Readonly<
  SiaAccessOperations<Session>
> {}
export interface SiaAccessInteractionBinding<
  Session,
> extends SiaAccessBinding<Session> {
  readonly snapshot: AccessInteractionSnapshot;
}
export interface SiaAccessInteractionReactOptions extends SiaAccessStoreOptions<AccessInteractionSnapshot> {}
export interface SiaAccessReactOptions extends SiaAccessStoreOptions {}
/* oxlint-enable typescript/no-empty-object-type */
export type SiaAccessSelector<Selection> = (
  snapshot: AccessSnapshot,
) => Selection;
export function useSiaAccess<Session>(
  access: SiaAccess<Session>,
  options?: SiaAccessReactOptions,
): SiaAccessBinding<Session> {
  const snapshot = useStoreSnapshot(useObservation(access, options), identity);
  const commands = useCommands(access);
  return useMemo(
    () => Object.freeze({ commands, snapshot }),
    [snapshot, commands],
  );
}
/** Focused metadata observation preserves the legacy custom-controller contract. */
export function useSiaAccessInteractions<Session>(
  access: SiaAccessInteractions<Session>,
  options?: SiaAccessInteractionReactOptions,
): SiaAccessInteractionBinding<Session> {
  const snapshot = useStoreSnapshot(useObservation(access, options), identity);
  const commands = useCommands(access);
  return useMemo(
    () => Object.freeze({ commands, snapshot }),
    [snapshot, commands],
  );
}
export function useSiaAccessSelector<Session, Selection>(
  access: SiaAccess<Session>,
  selector: SiaAccessSelector<Selection>,
  options?: SiaAccessReactOptions,
): Selection {
  return useStoreSnapshot(useObservation(access, options), selector);
}
function identity<Snapshot extends AccessSnapshot>(
  snapshot: Snapshot,
): Snapshot {
  return snapshot;
}
function useCommands<Session>(
  access: SiaAccess<Session>,
): SiaAccessCommands<Session> {
  return useMemo<SiaAccessCommands<Session>>(
    () =>
      Object.freeze({
        authorize: access.authorize.bind(access),
        cancel: access.cancel.bind(access),
        continueWithoutSaving: access.continueWithoutSaving.bind(access),
        disconnect: access.disconnect.bind(access),
        forget: access.forget.bind(access),
        generateRecoveryPhrase: access.generateRecoveryPhrase.bind(access),
        reconnect: access.reconnect.bind(access),
        retrySave: access.retrySave.bind(access),
        submitRecoveryPhrase: access.submitRecoveryPhrase.bind(access),
        withSession: access.withSession.bind(access),
      }),
    [access],
  );
}
function useObservation<Session>(
  access: SiaAccessInteractions<Session>,
  options?: SiaAccessInteractionReactOptions,
): SiaAccessStore<AccessInteractionSnapshot>;
function useObservation<Session>(
  access: SiaAccess<Session>,
  options?: SiaAccessReactOptions,
): SiaAccessStore;
function useObservation<Session>(
  access: SiaAccess<Session>,
  options?: SiaAccessReactOptions,
) {
  const serverSnapshot = options?.serverSnapshot;
  return useMemo(
    () =>
      createSiaAccessStore(
        access,
        serverSnapshot === undefined ? undefined : { serverSnapshot },
      ),
    [access, serverSnapshot],
  );
}
function useStoreSnapshot<Snapshot extends AccessSnapshot, Selection>(
  store: SiaAccessStore<Snapshot>,
  selector: (snapshot: Snapshot) => Selection,
): Selection {
  const getSnapshot = useCallback(
    () => selector(store.getState()),
    [store, selector],
  );
  const getServerSnapshot = useCallback(
    () => selector(store.getInitialState()),
    [store, selector],
  );
  const selection = useSyncExternalStore(
    store.subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  useDebugValue(selection);
  return selection;
}
