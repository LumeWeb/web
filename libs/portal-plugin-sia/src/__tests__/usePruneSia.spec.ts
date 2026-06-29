import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseCustomMutation = vi.fn();

vi.mock("@refinedev/core", () => ({
  useCustomMutation: (...args: any[]) => mockUseCustomMutation(...args),
}));

vi.mock("@/capabilities/refineConfig", () => ({
  DATA_PROVIDER_NAME: "sia",
}));

import { usePruneSia } from "../hooks/usePruneSia";

describe("usePruneSia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCustomMutation.mockReset();
  });

  it("calls useCustomMutation once on mount", () => {
    mockUseCustomMutation.mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    });

    usePruneSia();

    expect(mockUseCustomMutation).toHaveBeenCalledTimes(1);
  });

  it("exposes isLoading state from useCustomMutation", () => {
    mockUseCustomMutation.mockReturnValue({
      mutate: vi.fn(),
      isLoading: true,
    });

    const result = usePruneSia();

    expect(result.isLoading).toBe(true);
  });

  it("returns isLoading=false when not mutating", () => {
    mockUseCustomMutation.mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    });

    const result = usePruneSia();

    expect(result.isLoading).toBe(false);
  });

  it("mutate calls useCustomMutation's mutate with correct url, method, and dataProviderName", () => {
    const mockMutate = vi.fn();
    mockUseCustomMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });

    const result = usePruneSia();

    result.mutate();

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      {
        url: "/prune",
        method: "post",
        values: {},
        dataProviderName: "sia",
      },
      undefined,
    );
  });

  it("mutate passes through options as second argument", () => {
    const mockMutate = vi.fn();
    mockUseCustomMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });

    const result = usePruneSia();
    const onSuccess = vi.fn();

    result.mutate({ onSuccess });

    expect(mockMutate).toHaveBeenCalledWith(
      {
        url: "/prune",
        method: "post",
        values: {},
        dataProviderName: "sia",
      },
      { onSuccess },
    );
  });
});
