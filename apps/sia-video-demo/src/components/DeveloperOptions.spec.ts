import { describe, expect, it } from "vitest";
import {
  developerOptionsView,
  type DeveloperOptionsView,
} from "./DeveloperOptions";

/**
 * Node unit tests for the centralized developer-options UI surface. The
 * panel is the ONE place the developer options are edited and summarized;
 * its pure `developerOptionsView` derivation is pinned here: it reports the
 * toggle state and the DETERMINISTIC effective backend the option produces
 * (auto while native is enabled, worker-only `media-worker` once native is
 * disabled).
 */
describe("developerOptionsView (centralized developer-options surface)", () => {
  it("reports the toggle off state with the auto effective backend", () => {
    const view: DeveloperOptionsView = developerOptionsView({
      disableNativePlayback: false,
      disableWorkerPlayback: false,
    });
    expect(view.disableNativePlayback).toBe(false);
    expect(view.effectiveBackend).toBe("auto");
  });

  it("reports the toggle on state with the worker-only effective backend", () => {
    const view = developerOptionsView({
      disableNativePlayback: true,
      disableWorkerPlayback: false,
    });
    expect(view.disableNativePlayback).toBe(true);
    expect(view.disableWorkerPlayback).toBe(false);
    expect(view.effectiveBackend).toBe("media-worker");
  });

  it("reports native playback when worker playback is disabled", () => {
    const view = developerOptionsView({
      disableNativePlayback: false,
      disableWorkerPlayback: true,
    });
    expect(view.disableWorkerPlayback).toBe(true);
    expect(view.effectiveBackend).toBe("service-worker");
  });
});
