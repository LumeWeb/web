import { describe, expect, it } from "vitest";

import {
  CapabilityLoadError,
  FeatureLoadError,
  PluginInitError,
  PluginLoadError,
} from "./errors";
import { NamespacedId } from "./types/plugin";

describe("Custom Errors", () => {
  const testCases = [
    {
      Class: CapabilityLoadError,
      message: "Failed to load capability: core:capability",
      name: "CapabilityLoadError",
    },
    {
      Class: FeatureLoadError,
      message: "Failed to load feature: core:feature",
      name: "FeatureLoadError",
    },
    {
      Class: PluginInitError,
      message: "Failed to initialize plugin: core:plugin",
      name: "PluginInitError",
    },
    {
      Class: PluginLoadError,
      message: "Failed to load plugin: core:plugin",
      name: "PluginLoadError",
    },
  ];

  it.each(testCases)("should create $name", ({ Class, message, name }) => {
    const cause = new Error("Original error");
    const error = new Class(
      ("core:" + name.split("Error")[0].toLowerCase()) as NamespacedId,
      cause,
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(name);
    expect(error.message).toBe(message);
    expect(error.cause).toBe(cause);
  });

  it("should handle errors without cause", () => {
    const error = new PluginLoadError("core:plugin" as NamespacedId, undefined as any);
    expect(error.cause).toBeUndefined();
  });
});
