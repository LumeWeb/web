import type { PortalMeta } from "@lumeweb/portal-framework-core";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePortalMeta } from "./usePortalMeta";

// Mock store state
let mockState = {
  meta: undefined as PortalMeta | undefined,
};

vi.mock("@/store/portalStore", () => ({
  usePortalStore: vi.fn((selector: any) => selector(mockState)),
}));

describe("usePortalMeta", () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockState = {
      meta: undefined,
    };
    vi.clearAllMocks();
  });

  it("should return meta from store", () => {
    const mockMeta = {
      domain: "test.com",
      feature_flags: {},
      plugins: {},
    };

    // Mock the store to return the mock meta
    mockState.meta = mockMeta;

    const { result } = renderHook(() => usePortalMeta());
    expect(result.current).toEqual(mockMeta);
  });

  it("should return undefined if meta is not in the store", () => {
    // mockState.meta is undefined by default in beforeEach
    const { result } = renderHook(() => usePortalMeta());
    expect(result.current).toBeUndefined();
  });
});
