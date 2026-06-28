import type { PortalMeta } from "@lumeweb/portal-framework-core";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { appStore } from "@/store/appStore";

import { usePortalMeta } from "./usePortalMeta";

describe("usePortalMeta", () => {
  beforeEach(() => {
    appStore.setState({ meta: undefined });
  });

  it("should return meta from store", () => {
    const mockMeta = {
      domain: "test.com",
      feature_flags: {},
      plugins: {},
    };

    // Mock the store to return the mock meta
    appStore.setState({ meta: mockMeta as PortalMeta });

    const { result } = renderHook(() => usePortalMeta());
    expect(result.current).toEqual(mockMeta);
  });

  it("should return undefined if meta is not in the store", () => {
    // mockState.meta is undefined by default in beforeEach
    const { result } = renderHook(() => usePortalMeta());
    expect(result.current).toBeUndefined();
  });
});
