import { beforeEach, describe, expect, it } from "vitest";
import type { DeveloperOptions } from "./developerOptions";
import { useDeveloperOptionsStore } from "./developerOptions";

/**
 * Node unit tests for the ONE centralized developer-mode configuration
 * model. Every developer option lives in this single store; player
 * components read it and the UI surface writes it. No feature flags
 * scattered across player components.
 */
describe("developer options store (centralized developer-mode configuration)", () => {
  beforeEach(() => {
    // Restore the documented defaults between tests (single module-level store).
    useDeveloperOptionsStore.getState().setDisableNativePlayback(false);
    useDeveloperOptionsStore.getState().setDisableWorkerPlayback(false);
  });

  it("defaults to native playback enabled", () => {
    const state = useDeveloperOptionsStore.getState();
    expect(state.disableNativePlayback).toBe(false);
  });

  it("flips the native-disable option when toggled", () => {
    useDeveloperOptionsStore.getState().setDisableNativePlayback(true);
    const state = useDeveloperOptionsStore.getState();
    expect(state.disableNativePlayback).toBe(true);
    expect(state.disableWorkerPlayback).toBe(false);
  });

  it("disables native playback when worker playback is enabled", () => {
    useDeveloperOptionsStore.getState().setDisableWorkerPlayback(true);
    const state = useDeveloperOptionsStore.getState();
    expect(state.disableWorkerPlayback).toBe(true);
    expect(state.disableNativePlayback).toBe(false);
  });
});

/** The store's data fields form the single options object every consumer reads. */
const OPTIONS_FIELDS: (keyof DeveloperOptions)[] = [
  "disableNativePlayback",
  "disableWorkerPlayback",
];

describe("developer options object shape", () => {
  it("carries exactly the centralized option fields", () => {
    const state = useDeveloperOptionsStore.getState();
    const options: DeveloperOptions = {
      disableNativePlayback: state.disableNativePlayback,
      disableWorkerPlayback: state.disableWorkerPlayback,
    };
    expect(Object.keys(options).sort()).toEqual([...OPTIONS_FIELDS].sort());
  });
});
