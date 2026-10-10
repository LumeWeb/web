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
 * - `nativeStreamBaseUrl`: the native stream endpoint base URL; empty (or
 *   blank) means native playback is unavailable, so the library's `auto`
 *   policy deterministically uses the media worker.
 */

import { createStore } from "zustand";

/** The centralized developer-option data object every consumer reads. */
export interface DeveloperOptions {
  /** Disable native (service-worker stream) playback; force the worker-only backend. */
  disableNativePlayback: boolean;
  /** Base URL of the native stream endpoint; empty means native playback is unavailable. */
  nativeStreamBaseUrl: string;
}

interface DeveloperOptionsState extends DeveloperOptions {
  setDisableNativePlayback: (value: boolean) => void;
  setNativeStreamBaseUrl: (value: string) => void;
}

export const useDeveloperOptionsStore = createStore<DeveloperOptionsState>()(
  (set) => ({
    // Native playback left enabled by default; no stream endpoint configured.
    disableNativePlayback: false,
    nativeStreamBaseUrl: "",
    setDisableNativePlayback: (value) => set({ disableNativePlayback: value }),
    // Trimmed so blank input means "unconfigured" (native unavailable).
    setNativeStreamBaseUrl: (value) =>
      set({ nativeStreamBaseUrl: value.trim() }),
  }),
);
