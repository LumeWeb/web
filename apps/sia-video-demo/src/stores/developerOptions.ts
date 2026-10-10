/**
 * The ONE centralized developer-mode configuration model. Every developer
 * option of the demo lives in this single zustand store, and the single
 * developer-options UI surface (the `DeveloperOptionsPanel` inside the
 * "Developer tools" disclosure) is the only place the options are edited.
 * player components read the store, never own feature flags.
 *
 * Options today:
 * - `disableNativePlayback`: force the deterministic worker-only backend
 *   (see `resolvePlaybackBackend`).
 */

import { createStore } from "zustand";

/** The centralized developer-option data object every consumer reads. */
export interface DeveloperOptions {
  /** Disable native (service-worker stream) playback; force the worker-only backend. */
  disableNativePlayback: boolean;
}

interface DeveloperOptionsState extends DeveloperOptions {
  setDisableNativePlayback: (value: boolean) => void;
}

export const useDeveloperOptionsStore = createStore<DeveloperOptionsState>()(
  (set) => ({
    // Native playback left enabled by default.
    disableNativePlayback: false,
    setDisableNativePlayback: (value) => set({ disableNativePlayback: value }),
  }),
);
