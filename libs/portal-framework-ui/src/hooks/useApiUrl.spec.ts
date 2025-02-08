import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the dependency by defining the mock inside the factory
vi.mock("@lumeweb/portal-framework-core", async (importOriginal) => {
  const mod = await importOriginal<
    typeof import("@lumeweb/portal-framework-core")
  >();
  return {
    ...mod,
    getApiBaseUrl: vi.fn(), // Mock getApiBaseUrl
  };
});

import { useApiUrl } from "./useApiUrl";
// Import the mocked function after the mock is defined
import { getApiBaseUrl as mockedGetApiBaseUrl } from "@lumeweb/portal-framework-core";

describe("useApiUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation for each test
    vi.mocked(mockedGetApiBaseUrl).mockReset();
    // Set a default return value for getApiBaseUrl if needed for most tests
    vi.mocked(mockedGetApiBaseUrl).mockReturnValue("https://api.example.com");
  });

  it("should call getApiBaseUrl with allowLocalhost: true", () => {
    renderHook(() => useApiUrl());
    expect(mockedGetApiBaseUrl).toHaveBeenCalledWith({ allowLocalhost: true });
  });

  it("should return the API URL from getApiBaseUrl", () => {
    const mockApiUrl = "https://custom-api.example.com";
    vi.mocked(mockedGetApiBaseUrl).mockReturnValue(mockApiUrl);

    const { result } = renderHook(() => useApiUrl());

    expect(result.current).toBe(mockApiUrl);
  });

  it("should return an empty string if getApiBaseUrl returns false", () => {
    vi.mocked(mockedGetApiBaseUrl).mockReturnValue(false);

    const { result } = renderHook(() => useApiUrl());

    expect(result.current).toBe("");
  });

  // Add tests to cover various scenarios handled by getApiBaseUrl if needed,
  // but the primary responsibility of this hook's test is to ensure it calls
  // getApiBaseUrl correctly and handles its return value.
  // The getApiBaseUrl function itself should have its own comprehensive tests.
});
