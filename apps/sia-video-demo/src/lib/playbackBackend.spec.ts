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
const NO_BASE: DeveloperOptions = {
  disableNativePlayback: false,
  nativeStreamBaseUrl: "",
};
const DISABLED_WITH_BASE: DeveloperOptions = {
  disableNativePlayback: true,
  nativeStreamBaseUrl: "https://stream.example/base",
};

describe("resolvePlaybackBackend", () => {
  it("keeps the auto policy while native playback is enabled", () => {
    expect(resolvePlaybackBackend(NO_BASE)).toBe("auto");
  });

  it("selects the worker-only backend when native playback is disabled even with a stream base URL configured", () => {
    expect(resolvePlaybackBackend(DISABLED_WITH_BASE)).toBe("media-worker");
  });
});
