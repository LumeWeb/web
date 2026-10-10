import { describe, expect, it } from "vitest";
import {
  developerOptionsView,
  type DeveloperOptionsView,
} from "./DeveloperOptions";

/**
 * Node unit tests for the centralized developer-options UI surface. The
 * panel is the ONE place the developer options are edited and summarized;
 * its pure `developerOptionsView` derivation is pinned here: it reports the
 * toggle state, the configured stream base URL, and the DETERMINISTIC
 * effective backend the option produces (auto while native is enabled,
 * worker-only `media-worker` once native is disabled).
 */
describe("developerOptionsView (centralized developer-options surface)", () => {
  it("reports the toggle off state with the auto effective backend", () => {
    const view: DeveloperOptionsView = developerOptionsView({
      disableNativePlayback: false,
      nativeStreamBaseUrl: "",
    });
    expect(view.disableNativePlayback).toBe(false);
    expect(view.effectiveBackend).toBe("auto");
    expect(view.nativeStreamBaseUrl).toBe("");
  });

  it("reports the toggle on state with the worker-only effective backend", () => {
    const view = developerOptionsView({
      disableNativePlayback: true,
      nativeStreamBaseUrl: "https://stream.example/base",
    });
    expect(view.disableNativePlayback).toBe(true);
    expect(view.effectiveBackend).toBe("media-worker");
    expect(view.nativeStreamBaseUrl).toBe("https://stream.example/base");
  });
});
