// Import the mocked function after the mock is defined
import { usePortalMeta } from "@/hooks/usePortalMeta";
import { renderHook } from "@testing-library/react";
import { createMockPortalMeta } from "src/tests/portalMetaMocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useFeatureFlag } from "./useFeatureFlag";

// Mock dependencies by defining the mock inside the factory
vi.mock("@/hooks/usePortalMeta", () => {
  const usePortalMeta = vi.fn();
  return {
    usePortalMeta,
  };
});

describe("useFeatureFlag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation if needed for specific tests
    vi.mocked(usePortalMeta).mockReset();
  });

  it("should return false if feature_flags are missing in portalMeta", () => {
    vi.mocked(usePortalMeta).mockReturnValue(
      createMockPortalMeta({ feature_flags: undefined })
    );
    const { result } = renderHook(() => useFeatureFlag("myFeature"));
    expect(result.current).toBe(false);
  });

  it("should return false if the specific feature flag is missing", () => {
    mockFeatureFlags({ OTHER_FLAG: true });
    const { result } = renderHook(() => useFeatureFlag("myFeature"));
    expect(result.current).toBe(false);
  });

  function mockFeatureFlags(flags: Record<string, any>) {
    vi.mocked(usePortalMeta).mockReturnValue(
      createMockPortalMeta({ feature_flags: flags })
    );
  }

  it("should return true if the feature flag is true (case-insensitive)", () => {
    mockFeatureFlags({ MYFEATURE: "enabled" });
    const { result } = renderHook(() => useFeatureFlag("myFeature"));
    expect(result.current).toBe(true);
  });

  it("should handle feature flag casing and values correctly", () => {
    mockFeatureFlags({ 
      MYFEATURE: false,
      ANOTHER_FLAG: true 
    });

    // Test false flag with different casings
    expect(renderHook(() => useFeatureFlag("myFeature")).result.current).toBe(false);
    expect(renderHook(() => useFeatureFlag("MYFEATURE")).result.current).toBe(false);
    expect(renderHook(() => useFeatureFlag("MyFeature")).result.current).toBe(false);

    // Test true flag with different casings
    expect(renderHook(() => useFeatureFlag("another_flag")).result.current).toBe(true);
    expect(renderHook(() => useFeatureFlag("ANOTHER_FLAG")).result.current).toBe(true);
    expect(renderHook(() => useFeatureFlag("aNoThEr_FlAg")).result.current).toBe(true);
  });

  it("should handle non-boolean values for feature flags (should treat as falsy/truthy)", () => {
    mockFeatureFlags({ FALSY_FLAG: 0, TRUTHY_FLAG: "yes" });

    const { result: truthyResult } = renderHook(() =>
      useFeatureFlag("truthy_flag"),
    );
    expect(truthyResult.current).toBe(true); // "yes" is truthy

    const { result: falsyResult } = renderHook(() =>
      useFeatureFlag("falsy_flag"),
    );
    expect(falsyResult.current).toBe(false); // 0 is falsy
  });

  // Added test case for undefined portalMeta
  it("should return false if portalMeta is undefined", () => {
    vi.mocked(usePortalMeta).mockReturnValue(undefined);

    const { result } = renderHook(() => useFeatureFlag("myFeature"));

    expect(usePortalMeta).toHaveBeenCalled();
    expect(result.current).toBe(false);
  });
});
