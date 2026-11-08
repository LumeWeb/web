/** Dependency-free readonly stores expose controller snapshots to React or Zustand without mirroring. */
import type {
  AccessInteractionSnapshot,
  AccessSnapshot,
  SiaAccess,
  SiaAccessInteractions,
} from "./access-types.ts";

export interface SiaAccessStore<
  Snapshot extends AccessSnapshot = AccessSnapshot,
> {
  readonly getInitialState: () => Snapshot;
  readonly getState: () => Snapshot;
  readonly subscribe: (
    listener: SiaAccessStoreListener<Snapshot>,
  ) => () => void;
}
export type SiaAccessStoreListener<
  Snapshot extends AccessSnapshot = AccessSnapshot,
> = (snapshot: Snapshot, previous: Snapshot) => void;
export interface SiaAccessStoreOptions<
  Snapshot extends AccessSnapshot = AccessSnapshot,
> {
  readonly serverSnapshot?: Snapshot;
}

export function createSiaAccessStore<Session>(
  access: SiaAccessInteractions<Session>,
  options?: SiaAccessStoreOptions<AccessInteractionSnapshot>,
): SiaAccessStore<AccessInteractionSnapshot>;
export function createSiaAccessStore<Session>(
  access: SiaAccess<Session>,
  options?: SiaAccessStoreOptions,
): SiaAccessStore;
export function createSiaAccessStore<Session>(
  access: SiaAccess<Session>,
  options?: SiaAccessStoreOptions,
): SiaAccessStore {
  const current = access.getSnapshot();
  const server = options?.serverSnapshot;
  if (
    server &&
    (server.scope.appId !== current.scope.appId ||
      server.scope.indexerUrl !== current.scope.indexerUrl)
  ) {
    throw new Error(
      "Server snapshot scope does not match the access controller.",
    );
  }
  // Hydration must read the object that the application rendered on the server.
  const initial = server ?? current;
  return Object.freeze({
    getInitialState: () => initial,
    getState: () => access.getSnapshot(),
    subscribe(listener: SiaAccessStoreListener) {
      let previous = access.getSnapshot();
      return access.subscribe(() => {
        const snapshot = access.getSnapshot();
        if (snapshot === previous) return;
        const before = previous;
        previous = snapshot;
        listener(snapshot, before);
      });
    },
  });
}
