import type { PortalMeta } from "@lumeweb/portal-framework-core";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { appStore } from "@/store/appStore";
import {
  createMockPlugin,
  createMockPortalMeta,
} from "@/tests/portalMetaMocks";

import { usePluginMeta } from "./usePluginMeta";

describe("usePluginMeta", () => {
  beforeEach(() => {
    appStore.setState({ meta: undefined });
  });

  it("should return undefined if portalMeta is undefined", () => {
    const { result } = renderHook(() => usePluginMeta("test-plugin"));

    expect(result.current).toBeUndefined();
  });

  it("should return undefined if plugins are missing in portalMeta", () => {
    appStore.setState({ meta: createMockPortalMeta() });

    const { result } = renderHook(() => usePluginMeta("test-plugin"));

    expect(result.current).toBeUndefined();
  });

  it("should return undefined if the specific plugin is missing", () => {
    appStore.setState({
      meta: createMockPortalMeta({
        plugins: {
          otherPlugin: createMockPlugin(),
        },
      }) as PortalMeta,
    });

    const { result } = renderHook(() => usePluginMeta("test-plugin"));

    expect(result.current).toBeUndefined();
  });

  it("should return the full plugin meta if key is not provided", () => {
    const mockPluginMeta = { setting1: "value1", setting2: 123 };
    appStore.setState({
      meta: createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }) as PortalMeta,
    });

    const { result } = renderHook(() => usePluginMeta("test-plugin"));

    expect(result.current).toEqual(mockPluginMeta);
  });

  it("should return the nested property value if key is provided", () => {
    const mockPluginMeta = { settings: { nested: { value: "deep" } } };
    appStore.setState({
      meta: createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }) as PortalMeta,
    });

    const { result } = renderHook(() =>
      usePluginMeta("test-plugin", "settings.nested.value"),
    );

    expect(result.current).toBe("deep");
  });

  it("should return undefined if the nested property path is invalid", () => {
    const mockPluginMeta = { settings: { nested: { value: "deep" } } };
    appStore.setState({
      meta: createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }) as PortalMeta,
    });

    const { result } = renderHook(() =>
      usePluginMeta("test-plugin", "settings.other.value"),
    );

    expect(result.current).toBeUndefined();
  });

  it("should return undefined if the key path starts from a non-object", () => {
    const mockPluginMeta = { settings: "not an object" };
    appStore.setState({
      meta: createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }) as PortalMeta,
    });

    const { result } = renderHook(() =>
      usePluginMeta("test-plugin", "settings.nested.value"),
    );

    expect(result.current).toBeUndefined();
  });

  it("should handle different return types for the meta", () => {
    const mockPluginMeta = { count: 5, enabled: true };
    appStore.setState({
      meta: createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }) as PortalMeta,
    });

    const { result } = renderHook(() =>
      usePluginMeta<{ count: number; enabled: boolean }>("test-plugin"),
    );

    expect(result.current).toEqual({ count: 5, enabled: true });
  });

  it("should handle different return types for a specific key", () => {
    const mockPluginMeta = { count: 5, enabled: true };
    appStore.setState({
      meta: createMockPortalMeta({
        plugins: {
          "test-plugin": createMockPlugin(mockPluginMeta),
        },
      }) as PortalMeta,
    });

    const { result } = renderHook(() =>
      usePluginMeta<boolean>("test-plugin", "enabled"),
    );

    expect(result.current).toBe(true);
  });
});
