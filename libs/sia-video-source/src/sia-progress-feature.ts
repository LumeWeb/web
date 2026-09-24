/**
 * An OPTIONAL custom Video.js v10 player feature that derives reader
 * progress/state from the host's typed `sia-worker-milestone-change` events
 * (real worker `LOG` milestones, never log-text parsing) into a small
 * semantic state, plus the shared selector that reads it back out.
 *
 * Deliberately opt-in, standalone, and NOT part of `siaFeatures`: diagnostic/
 * progress telemetry is not a required contract of the default player. Apps
 * that want it compose it explicitly
 * (`features: [...videoFeatures, ...siaFeatures, siaProgressFeature]`), which
 * keeps default player state lean.
 *
 * The derivation is boolean/counter facts only:
 *
 * - `read.window-start`: sets `reading` to true and increments `reads`;
 * - `read.window-complete`: the active read ends, so `retrying` clears (and
 *   `reading` drops, since the window is no longer in flight);
 * - `read.retry`: sets `retrying` to true and increments `retries`;
 * - `bytes.read`: updates `bytesRead` from the worker's cumulative scalar
 *   (`detail.bytes`);
 * - `read.stalled`: the read/retry window is dead, so both clear;
 * - `sia-load-change { accepted: false }`: the whole state resets, because a
 *   load boundary (fresh source/load, reload/reattach replay, recovery
 *   restart, detach) supersedes everything the previous load's reader
 *   reported.
 *
 * Each derived milestone also records `last` (the milestone `name`, its
 * `position` when the worker's detail carried one, and the owning
 * `requestId`), so a small diagnostic readout can name where the reader is
 * without subscribing to raw milestones.
 *
 * Requirements: the host dispatches this event only for worker `LOG` messages
 * it actually receives, and the wire forwards reader milestones
 * (`read.*`/`bytes.*`, debug severity) only at a `debug` HELLO `log`
 * threshold, i.e. the host logger must be at `debug`. A host set louder than
 * that yields a state that stays inert except for the load-boundary reset;
 * nothing breaks, there is only less telemetry to derive from.
 */
import { definePlayerFeature, type PlayerFeature } from '@videojs/core/dom';
import type { Media } from '@videojs/media';
import { createSelector } from '@videojs/store';
import {
  siaLoadChange,
  type SiaLoadChangeDetail,
  siaWorkerMilestoneChange,
  type SiaWorkerMilestoneDetail,
} from './sia-video-source.ts';
import { workerLogEventName } from './protocol.ts';

/** The reader-progress facts a consumer reads off the player store. */
export interface SiaProgressState {
  /**
   * Cumulative bytes the worker reported via `bytes.read` milestones (whole
   * 1 MiB boundaries of the CURRENT load; resets at every load boundary).
   */
  bytesRead: number;
  /** The most recent derived milestone, or absent before the first one. */
  last?:
    | undefined
    | {
        name: string;
        position?: number;
        requestId: null | number;
      };
  /** Whether the current load is inside a read window. */
  reading: boolean;
  /** Total read windows opened for the current load. */
  reads: number;
  /** Total retry attempts for the current load. */
  retries: number;
  /** Whether the reader is actively retrying the current read window. */
  retrying: boolean;
}

/**
 * A media capable of emitting the Sia milestone/load events. The video.js
 * `Media` contract keys `addEventListener` to the packaged `MediaEvents`, so
 * this widens the listener surface for this library's two custom events (a
 * structural view the `SiaVideoSource` host satisfies; it forwards element
 * events to host listeners for the types that have a listener).
 */
type SiaProgressCapable = Pick<Media, 'addEventListener' | 'removeEventListener'> & {
  /** The one load-acceptance event this feature listens for. */
  addEventListener(
    type: typeof siaLoadChange,
    listener: (event: CustomEvent<SiaLoadChangeDetail>) => void,
    options?: { signal?: AbortSignal },
  ): void;
  /** The one worker-milestone event this feature listens for. */
  addEventListener(
    type: typeof siaWorkerMilestoneChange,
    listener: (event: CustomEvent<SiaWorkerMilestoneDetail>) => void,
    options?: { signal?: AbortSignal },
  ): void;
};

/** Inert state: nothing has been read (or a load boundary reset the state). */
function inertProgressState(): SiaProgressState {
  return {
    bytesRead: 0,
    last: undefined,
    reading: false,
    reads: 0,
    retries: 0,
    retrying: false,
  };
}

/** The `read.window-start` / `read.window-complete` / `read.stalled` detail position, when scalar. */
function milestonePosition(detail: Readonly<Record<string, unknown>>): number | undefined {
  return typeof detail.position === 'number' ? detail.position : undefined;
}

/**
 * The OPTIONAL Video.js v10 reader-progress feature. Combine it into a
 * `@videojs/store` player store with the non-React `combine(...)` API (or
 * `createPlayer` from the stack's React subpath) to publish reader progress
 * next to the packaged playback/error features. It only depends on
 * `@videojs/core/dom` and `@videojs/store`, so a non-React v10 consumer needs
 * neither the React subpath of the video.js stack nor React itself.
 */
export const siaProgressFeature: PlayerFeature<SiaProgressState> = definePlayerFeature({
  attach({ get, set, signal, target }) {
    const media = target.media as SiaProgressCapable;
    // Two listeners, not one on a union: `CustomEvent.type` is a plain string,
    // so a discriminated narrowing on the event name is impossible. Separate
    // closures keep each payload's types exact.
    const onLoadChange = (event: CustomEvent<SiaLoadChangeDetail>): void => {
      const detail = event.detail;
      if (!detail) return;
      // A load boundary supersedes the whole state: everything the previous
      // load's reader reported is dropped. An `accepted: true` changes
      // nothing, since it carries no reader facts.
      if (!detail.accepted) set(inertProgressState());
    };
    const onMilestone = (event: CustomEvent<SiaWorkerMilestoneDetail>): void => {
      const detail = event.detail;
      if (!detail) return;
      const milestone = detail;
      const last: SiaProgressState['last'] = {
        name: milestone.name,
        position: milestonePosition(milestone.detail),
        requestId: milestone.requestId,
      };
      switch (milestone.name) {
        case workerLogEventName.bytesRead: {
          // The worker crosses each whole-1 MiB boundary exactly once, so the
          // scalar is monotonic per load. A non-scalar detail is not a byte
          // fact: record only the provenance (`last`), never the count.
          const { bytes } = milestone.detail;
          if (typeof bytes === 'number') set({ bytesRead: bytes, last });
          else set({ last });
          return;
        }
        case workerLogEventName.readRetry:
          // The window stays in flight (`reading` untouched); the retry is the
          // visible fact.
          set({ last, retries: get().retries + 1, retrying: true });
          return;
        case workerLogEventName.readStalled:
          // The watchdog aborted the read; nothing of the window is in flight.
          set({ last, reading: false, retrying: false });
          return;
        case workerLogEventName.readWindowComplete:
          set({ last, reading: false, retrying: false });
          return;
        case workerLogEventName.readWindowStart:
          set({ last, reading: true, reads: get().reads + 1 });
          return;
        default:
          return;
      }
    };
    media.addEventListener(siaLoadChange, onLoadChange, { signal });
    media.addEventListener(siaWorkerMilestoneChange, onMilestone, { signal });
  },
  name: 'siaProgress',
  state: inertProgressState,
});

/**
 * Reads the Sia reader-progress state off a player store's flat state;
 * `undefined` when the store was built without `siaProgressFeature`. This is
 * the single selector both non-React store consumers and React
 * `usePlayer(selectSiaProgress)` subscribe with, so every consumer sees
 * identical state.
 */
export const selectSiaProgress = createSelector(siaProgressFeature);
