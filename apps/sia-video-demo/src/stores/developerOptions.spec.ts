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
    useDeveloperOptionsStore.getState().setNativeStreamBaseUrl("");
  });

  it("defaults to native playback enabled with no stream base URL", () => {
    const state = useDeveloperOptionsStore.getState();
    expect(state.disableNativePlayback).toBe(false);
    expect(state.nativeStreamBaseUrl).toBe("");
  });

  it("flips only the native-disable option when toggled", () => {
    useDeveloperOptionsStore.getState().setDisableNativePlayback(true);
    const state = useDeveloperOptionsStore.getState();
    expect(state.disableNativePlayback).toBe(true);
    expect(state.nativeStreamBaseUrl).toBe("");
  });

  it("sets only the stream base URL when configured", () => {
    useDeveloperOptionsStore
      .getState()
      .setNativeStreamBaseUrl("https://stream.example/base");
    const state = useDeveloperOptionsStore.getState();
    expect(state.nativeStreamBaseUrl).toBe("https://stream.example/base");
    expect(state.disableNativePlayback).toBe(false);
  });

  it("trims the stream base URL so blank input means unavailable", () => {
    useDeveloperOptionsStore.getState().setNativeStreamBaseUrl("  ");
    expect(useDeveloperOptionsStore.getState().nativeStreamBaseUrl).toBe("");
  });
});

/** The store's data fields form the single options object every consumer reads. */
const OPTIONS_FIELDS: (keyof DeveloperOptions)[] = [
  "disableNativePlayback",
  "nativeStreamBaseUrl",
];

describe("developer options object shape", () => {
  it("carries exactly the centralized option fields", () => {
    const state = useDeveloperOptionsStore.getState();
    const options: DeveloperOptions = {
      disableNativePlayback: state.disableNativePlayback,
      nativeStreamBaseUrl: state.nativeStreamBaseUrl,
    };
    expect(Object.keys(options).sort()).toEqual([...OPTIONS_FIELDS].sort());
  });
});
