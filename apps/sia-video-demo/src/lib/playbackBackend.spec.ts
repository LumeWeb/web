import { describe, expect, it } from "vitest";
import type { DeveloperOptions } from "../stores/developerOptions";
import { resolvePlaybackBackend } from "./playbackBackend";

/**
 * Node unit tests for deterministic developer-options to playback-backend
 * mapping. The option must produce an exact backend choice: native left
 * enabled keeps the library's `auto` policy (native stream first, worker
 * fallback); disabling native is the deterministic WORKER-ONLY choice
 * (`media-worker`), independent of any other option value.
 */

/** Full centralized options objects (the mapping must ignore the rest). */
const NATIVE_ENABLED: DeveloperOptions = {
  disableNativePlayback: false,
  disableWorkerPlayback: false,
};
const NATIVE_DISABLED: DeveloperOptions = {
  disableNativePlayback: true,
  disableWorkerPlayback: false,
};
const WORKER_DISABLED: DeveloperOptions = {
  disableNativePlayback: false,
  disableWorkerPlayback: true,
};

describe("resolvePlaybackBackend", () => {
  it("keeps the auto policy while native playback is enabled", () => {
    expect(resolvePlaybackBackend(NATIVE_ENABLED)).toBe("auto");
  });

  it("selects the worker-only backend when native playback is disabled", () => {
    expect(resolvePlaybackBackend(NATIVE_DISABLED)).toBe("media-worker");
  });

  it("selects native playback when worker playback is disabled", () => {
    expect(resolvePlaybackBackend(WORKER_DISABLED)).toBe("service-worker");
  });
});
