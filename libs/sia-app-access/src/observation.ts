/** Immediate observation lets plain TypeScript views read current and later account snapshots without wiring a second store. */
import type { AccessSnapshot } from "./access-types.ts";

export interface AccessObservationSource<Snapshot extends AccessSnapshot> {
  getSnapshot(): Snapshot;
  subscribe(listener: () => void): () => void;
}
export type AccessSnapshotObserver<Snapshot extends AccessSnapshot> = (
  snapshot: Snapshot,
) => void;

/** Subscribes before reading the current snapshot so changes during setup are not lost. */
export function observeSiaAccess<Snapshot extends AccessSnapshot>(
  access: AccessObservationSource<Snapshot>,
  listener: AccessSnapshotObserver<Snapshot>,
): () => void {
  let previous: Snapshot | undefined;
  const publish = () => {
    const snapshot = access.getSnapshot();
    if (snapshot === previous) return;
    previous = snapshot;
    listener(snapshot);
  };
  const unsubscribe = access.subscribe(publish);
  try {
    publish();
  } catch (error) {
    unsubscribe();
    throw error;
  }
  return unsubscribe;
}
