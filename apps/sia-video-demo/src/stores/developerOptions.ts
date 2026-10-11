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
 * - `disableWorkerPlayback`: force the native service-worker backend.
 */

import { createStore } from "zustand";

/** The centralized developer-option data object every consumer reads. */
export interface DeveloperOptions {
  /** Disable native (service-worker stream) playback; force the worker-only backend. */
  disableNativePlayback: boolean;
  /** Disable package worker playback; force native playback when available. */
  disableWorkerPlayback: boolean;
}

interface DeveloperOptionsState extends DeveloperOptions {
  setDisableNativePlayback: (value: boolean) => void;
  setDisableWorkerPlayback: (value: boolean) => void;
}

export const useDeveloperOptionsStore = createStore<DeveloperOptionsState>()(
  (set) => ({
    // Native playback left enabled by default.
    disableNativePlayback: false,
    disableWorkerPlayback: false,
    // Enabling one backend disables the other, so the store cannot hold a
    // configuration with no playback backend.
    setDisableNativePlayback: (value) =>
      set({ disableNativePlayback: value, ...(value ? { disableWorkerPlayback: false } : {}) }),
    setDisableWorkerPlayback: (value) =>
      set({ disableWorkerPlayback: value, ...(value ? { disableNativePlayback: false } : {}) }),
  }),
);
