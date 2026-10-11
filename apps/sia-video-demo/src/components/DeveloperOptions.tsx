/**
 * The ONE centralized developer-options UI surface. Reads the single
 * developer-options store, renders the native-disable toggle, and summarizes
 * the DETERMINISTIC effective backend the current options produce (via the
 * pure `developerOptionsView`). Player components only read the store.
 */

import { useStore } from "zustand";
import { resolvePlaybackBackend } from "../lib/playbackBackend";
import type { DeveloperOptions } from "../stores/developerOptions";
import { useDeveloperOptionsStore } from "../stores/developerOptions";
import type { SiaPlaybackBackend } from "@lumeweb/sia-video-source";

/** The derived facts the developer-options panel renders. */
export interface DeveloperOptionsView {
  /** The native-disable toggle state (the checkbox's `checked`). */
  readonly disableNativePlayback: boolean;
  /** The worker-disable toggle state (the checkbox's `checked`). */
  readonly disableWorkerPlayback: boolean;
  /** The deterministic backend the current options produce. */
  readonly effectiveBackend: SiaPlaybackBackend;
}

/**
 * The centralized developer-options panel: the single UI surface for every
 * developer option (rendered inside the "Developer tools" disclosure).
 */
export function DeveloperOptionsPanel() {
  const disableNativePlayback = useStore(
    useDeveloperOptionsStore,
    (s) => s.disableNativePlayback,
  );
  const disableWorkerPlayback = useStore(
    useDeveloperOptionsStore,
    (s) => s.disableWorkerPlayback,
  );
  const setDisableNativePlayback = useStore(
    useDeveloperOptionsStore,
    (s) => s.setDisableNativePlayback,
  );
  const setDisableWorkerPlayback = useStore(
    useDeveloperOptionsStore,
    (s) => s.setDisableWorkerPlayback,
  );
  const view = developerOptionsView({
    disableNativePlayback,
    disableWorkerPlayback,
  });

  return (
    <section className="bg-canvas-subtle border-border-default mb-4 rounded-lg border p-4">
      <h2 className="m-0 mb-2 text-sm font-semibold">Developer options</h2>
      <label className="flex cursor-pointer items-center gap-2 text-[13px]">
        <input
          checked={view.disableNativePlayback}
          onChange={(event) => setDisableNativePlayback(event.target.checked)}
          type="checkbox"
        />
        Disable native (service-worker) playback
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-[13px]">
        <input
          checked={view.disableWorkerPlayback}
          onChange={(event) => setDisableWorkerPlayback(event.target.checked)}
          type="checkbox"
        />
        Disable web-worker playback
      </label>
      <p className="text-fg-muted m-1 mb-2 text-xs">
        Effective playback backend: {view.effectiveBackend}
      </p>
    </section>
  );
}

/**
 * Pure derivation of the panel's display facts from the centralized options:
 * the toggle state and the deterministic effective backend.
 */
export function developerOptionsView(
  options: DeveloperOptions,
): DeveloperOptionsView {
  return {
    disableNativePlayback: options.disableNativePlayback,
    disableWorkerPlayback: options.disableWorkerPlayback,
    effectiveBackend: resolvePlaybackBackend(options),
  };
}
