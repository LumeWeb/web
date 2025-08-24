import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import the mocked dependencies *after* the vi.mock calls
import { usePortalMeta as mockedUsePortalMeta } from "@/hooks/usePortalMeta";
import {
  createMockPlugin,
  createMockPortalMeta,
} from "@/tests/portalMetaMocks";

import { usePluginMeta } from "./usePluginMeta";

// Mock dependencies
vi.mock("@/hooks/usePortalMeta", () => {
  // Define the mock *inside* the factory
  const usePortalMeta = vi.fn();
  return {
    usePortalMeta,
  };
});

describe("usePluginMeta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Access the mock function via the import and reset it
    vi.mocked(mockedUsePortalMeta).mockReset();
  });

  it("should return undefined if portalMeta is undefined", () => {
    vi.mocked(mockedUsePortalMeta).mockReturnValue(undefined);

    const { result } = renderHook(() => usePluginMeta("test-plugin"));

    expect(result.current).toBeUndefined();
  });

  it("should return undefined if plugins are missing in portalMeta", () => {
    vi.mocked(mockedUsePortalMeta).mockReturnValue(undefined);

    const { result } = renderHook(() => usePluginMeta("test-plugin"));

    expect(result.current).toBeUndefined();
  });

  it("should return undefined if the specific plugin is missing", () => {
    vi.mocked(mockedUsePortalMeta).mockReturnValue(
      createMockPortalMeta({
        plugins: {
          otherPlugin: createMockPlugin(),
        },
      }),
    );

    const { result } = renderHook(() => usePluginMeta("test-plugin"));

    expect(result.current).toBeUndefined();
  });

  it("should return the full plugin meta if key is not provided", () => {
    const mockPluginMeta = { setting1: "value1", setting2: 123 };
    vi.mocked(mockedUsePortalMeta).mockReturnValue(
      createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }),
    );

    const { result } = renderHook(() => usePluginMeta("test-plugin"));

    expect(result.current).toEqual(mockPluginMeta);
  });

  it("should return the nested property value if key is provided", () => {
    const mockPluginMeta = { settings: { nested: { value: "deep" } } };
    vi.mocked(mockedUsePortalMeta).mockReturnValue(
      createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }),
    );

    const { result } = renderHook(() =>
      usePluginMeta("test-plugin", "settings.nested.value"),
    );

    expect(result.current).toBe("deep");
  });

  it("should return undefined if the nested property path is invalid", () => {
    const mockPluginMeta = { settings: { nested: { value: "deep" } } };
    vi.mocked(mockedUsePortalMeta).mockReturnValue(
      createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }),
    );

    const { result } = renderHook(() =>
      usePluginMeta("test-plugin", "settings.other.value"),
    );

    expect(result.current).toBeUndefined();
  });

  it("should return undefined if the key path starts from a non-object", () => {
    const mockPluginMeta = { settings: "not an object" };
    vi.mocked(mockedUsePortalMeta).mockReturnValue(
      createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }),
    );

    const { result } = renderHook(() =>
      usePluginMeta("test-plugin", "settings.nested.value"),
    );

    expect(result.current).toBeUndefined();
  });

  it("should handle different return types for the meta", () => {
    const mockPluginMeta = { count: 5, enabled: true };
    vi.mocked(mockedUsePortalMeta).mockReturnValue(
      createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }),
    );

    const { result } = renderHook(() =>
      usePluginMeta<{ count: number; enabled: boolean }>("test-plugin"),
    );

    expect(result.current).toEqual({ count: 5, enabled: true });
  });

  it("should handle different return types for a specific key", () => {
    const mockPluginMeta = { count: 5, enabled: true };
    vi.mocked(mockedUsePortalMeta).mockReturnValue(
      createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }),
    );

    const { result } = renderHook(() =>
      usePluginMeta<boolean>("test-plugin", "enabled"),
    );

    expect(result.current).toBe(true);
  });
});
