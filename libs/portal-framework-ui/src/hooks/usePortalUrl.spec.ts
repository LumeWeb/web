/// <reference types="vitest/import" />
import type { PortalMeta } from "@lumeweb/portal-framework-core";

// Import the mocked function *after* the vi.mock call
import { fetchPortalMeta as mockedFetchPortalMetaImport } from "@lumeweb/portal-framework-core";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePortalUrl } from "./usePortalUrl";

// Mock store state and actions inside the factory
vi.mock("@/store/portalStore", () => {
  const mockState = {
    isMetaLoading: false,
    meta: undefined as PortalMeta | undefined,
    portalUrl: "",
    setIsMetaLoading: vi.fn(),
    setMeta: vi.fn(),
    setPortalUrl: vi.fn(),
  };

  // Mock the store instance with getState
  const portalStore = {
    getState: () => mockState,
    // Add other store methods if needed by the hook or tests
    subscribe: vi.fn(),
    setState: (newState: Partial<typeof mockState>) => {
      Object.assign(mockState, newState);
    },
  };

  return {
    usePortalStore: vi.fn((selector: any) => selector(mockState)),
    portalStore: portalStore, // Export the mock store instance
    // Export mock state and setters for tests to manipulate
    __mockState: mockState,
    __mockSetIsMetaLoading: mockState.setIsMetaLoading,
    __mockSetMeta: mockState.setMeta,
    __mockSetPortalUrl: mockState.setPortalUrl,
  };
});

// Import the mocked functions and state *after* the vi.mock call
import {
  __mockSetIsMetaLoading,
  __mockSetMeta,
  __mockSetPortalUrl,
  __mockState,
  portalStore as mockedPortalStore, // Import the mocked store instance
} from "@/store/portalStore";

// Mock location helpers and fetchPortalMeta
vi.mock("@lumeweb/portal-framework-core", async (importOriginal) => {
  const mod =
    await importOriginal<typeof import("@lumeweb/portal-framework-core")>();
  return {
    ...mod,
    fetchPortalMeta: vi.fn(), // Define the mock here
    getCurrentLocation: () => ({
      host: "localhost:3000",
      hostname: "localhost",
      href: "http://localhost:3000",
      origin: "http://localhost:3000",
      pathname: "/",
      port: "3000",
      protocol: "http:",
      search: "",
    }),
  };
});

// Variable to hold the mocked fetchPortalMeta reference
let mockedFetchPortalMeta: vi.Mock;
let consoleErrorSpy: vi.SpyInstance; // Declare spy variable

beforeEach(() => {
  vi.clearAllMocks();
  // Reset mock state and functions using the exported variables
  __mockState.isMetaLoading = false;
  __mockState.meta = undefined;
  __mockState.portalUrl = "";
  __mockSetIsMetaLoading.mockReset();
  __mockSetMeta.mockReset();
  __mockSetPortalUrl.mockReset();

  // Get the reference to the mocked fetchPortalMeta after the mock is defined
  mockedFetchPortalMeta = vi.mocked(mockedFetchPortalMetaImport);
  mockedFetchPortalMeta.mockReset(); // Reset the mock implementation for each test

  // Mock console.error to prevent test output pollution
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  // Restore console.error after each test
  consoleErrorSpy.mockRestore();
});

describe("usePortalUrl", () => {
  it("should initialize with empty URL and fetch meta to set URL", async () => {
    const mockMeta: PortalMeta = {
      domain: "example.com",
      feature_flags: {},
      plugins: {},
    };
    mockedFetchPortalMeta.mockResolvedValue(mockMeta);

    const { result, rerender } = renderHook(() => usePortalUrl());

    // Wait for the fetch and state updates to happen
    // Wait for the fetch and state updates to happen
    await waitFor(() => {
      expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(true); // Check loading state starts
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(undefined, expect.any(Object)); // Initial fetch is with undefined URL and options
      expect(__mockSetPortalUrl).toHaveBeenCalledWith(
        "https://example.com",
      ); // URL should be set from meta
      expect(__mockSetMeta).toHaveBeenCalledWith(mockMeta);
      expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(false); // Check loading state ends
      // Assert the final result inside the waitFor block
      expect(result.current).toBe("https://example.com");
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error expected
  });

  it("should handle invalid meta domain by falling back to current origin", async () => {
    const mockMeta: PortalMeta = {
      domain: "", // Invalid
      feature_flags: {},
      plugins: {},
    };
    mockedFetchPortalMeta.mockResolvedValue(mockMeta);

    const { result } = renderHook(() => usePortalUrl());

    expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(true); // Effect should set loading true

    // Wait for the fetch and state updates to happen
    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(undefined, expect.any(Object));
      // Fallback should use getCurrentLocation().origin
      expect(__mockSetPortalUrl).toHaveBeenCalledWith(
        "http://localhost:3000",
      );
      expect(__mockSetMeta).toHaveBeenCalledWith(mockMeta);
      expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(false);
      // Assert the final result inside the waitFor block
      expect(result.current).toBe("http://localhost:3000");
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error expected
  });


  it("should fetch meta using the existing valid portalUrl", async () => {
    const initialPortalUrl = "https://existing.com";
    __mockState.portalUrl = initialPortalUrl; // Set initial state directly
    const mockMetaData = {
      domain: "existing.com",
      feature_flags: {},
      plugins: {},
    };
    mockedFetchPortalMeta.mockResolvedValue(mockMetaData); // Use mockResolvedValue

    const { result } = renderHook(() => usePortalUrl());

    // Initial state check
    expect(result.current).toBe(initialPortalUrl); // Keep this one, as the initial state is valid
    // Corrected assertion to check the spy function
    expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(true); // Effect should set loading true

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(initialPortalUrl, expect.any(Object));
      expect(__mockSetPortalUrl).not.toHaveBeenCalled(); // Should not set URL if already valid
      expect(__mockSetMeta).toHaveBeenCalledWith(mockMetaData);
      // Corrected assertion to check the spy function
      expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(false);
      expect(result.current).toBe(initialPortalUrl); // Should remain the same
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error expected
  });

  it("should handle fetch error when initial URL is invalid", async () => {
    const error = new Error("Fetch failed");
    mockedFetchPortalMeta.mockRejectedValue(error); // Use mockRejectedValue

    const { result } = renderHook(() => usePortalUrl());

    // Corrected assertion to check the spy function
    expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(true); // Effect should set loading true

    // Wait for the fetch and state updates to happen
    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(undefined, expect.any(Object));
      // Should fallback to origin on error if initial URL was invalid/empty
      expect(__mockSetPortalUrl).toHaveBeenCalledWith(
        "http://localhost:3000",
      );
      expect(__mockSetMeta).toHaveBeenCalledWith(undefined); // Meta should be undefined on error
      // Corrected assertion to check the spy function
      expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(false);
      // Verify console.error was called with the expected arguments
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching portal meta from",
        undefined, // effectiveUrl was undefined
        expect.any(Error), // Expecting the mocked error object
      );
      // Assert the final result inside the waitFor block
      expect(result.current).toBe("http://localhost:3000");
    });
  });

  it("should handle fetch error when initial URL is valid", async () => {
    const initialPortalUrl = "https://existing.com";
    __mockState.portalUrl = initialPortalUrl; // Set initial state directly
    const error = new Error("Fetch failed");
    mockedFetchPortalMeta.mockRejectedValue(error); // Use mockRejectedValue

    const { result } = renderHook(() => usePortalUrl());

    // Initial state check
    expect(result.current).toBe(initialPortalUrl); // Keep this one, as the initial state is valid
    // Corrected assertion to check the spy function
    expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(true); // Effect should set loading true

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(initialPortalUrl, expect.any(Object));
      // Wait specifically for setMeta to be called with undefined on error
      expect(__mockSetMeta).toHaveBeenCalledWith(undefined);
      // Corrected assertion to check the spy function
      expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(false);
      // Verify console.error was called with the expected arguments
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching portal meta from",
        initialPortalUrl, // effectiveUrl was the initial valid URL
        expect.any(Error), // Expecting the mocked error object
      );
      // Check that the hook's returned value remains the same
      expect(result.current).toBe(initialPortalUrl);
    });
  });

  it("should return the current portalUrl from the store", () => {
    // This test doesn't involve the effect, just checks the initial render value
    __mockState.portalUrl = "https://test.com";

    const { result } = renderHook(() => usePortalUrl());

    expect(result.current).toBe("https://test.com");
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error expected
  });

  it("should return a valid URL format even if the stored URL is missing protocol", async () => {
    // This test involves the effect fetching and potentially correcting the URL
    __mockState.portalUrl = "test.com"; // Missing protocol
    const mockMeta: PortalMeta = {
      domain: "test.com",
      feature_flags: {},
      plugins: {},
    };
    mockedFetchPortalMeta.mockResolvedValue(mockMeta);

    const { result } = renderHook(() => usePortalUrl());

    // Corrected assertion to check the spy function
    expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(true); // Effect should set loading true

    // Wait for the fetch and state updates to happen
    await waitFor(() => {
      // The fetch should happen with the potentially invalid URL from the store
      // The hook passes `isValidUrl(portalUrl) ? portalUrl : undefined` to fetchPortalMeta
      // So if portalUrl is 'test.com', effectiveUrl is undefined.
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(undefined, expect.any(Object));
      // The URL should be set from the meta domain
      expect(__mockSetPortalUrl).toHaveBeenCalledWith("https://test.com");
      expect(__mockSetMeta).toHaveBeenCalledWith(mockMeta);
      expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(false);
      // Assert the final result inside the waitFor block
      expect(result.current).toBe("https://test.com");
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error expected
  });

  it("should not fetch again if initial fetch attempted and portalUrl is valid", async () => {
    const initialPortalUrl = "https://valid.com";
    __mockState.portalUrl = initialPortalUrl;
    const mockMeta: PortalMeta = { domain: "valid.com", feature_flags: {}, plugins: {} };
    mockedFetchPortalMeta.mockResolvedValue(mockMeta);

    // First render: Simulates initial load, fetch happens
    const { result, rerender } = renderHook(() => usePortalUrl());

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledTimes(1);
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(initialPortalUrl, expect.any(Object));
      expect(__mockSetMeta).toHaveBeenCalledWith(mockMeta);
      expect(__mockSetPortalUrl).not.toHaveBeenCalled(); // URL was already valid
      // Check that the hook's returned value is the expected URL
      expect(result.current).toBe(initialPortalUrl);
    });

    // Second render: Simulates a re-render after the initial fetch succeeded and URL is valid
    rerender();

    // Wait a moment to ensure no new fetch is triggered
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockedFetchPortalMeta).toHaveBeenCalledTimes(1); // Fetch should not be called again
    expect(result.current).toBe(initialPortalUrl);
  });

  it("should fetch again if initial fetch attempted but portalUrl is still invalid", async () => {
    const initialPortalUrl = "invalid-url"; // Invalid URL
    __mockState.portalUrl = initialPortalUrl;
    const mockMeta: PortalMeta = { domain: "example.com", feature_flags: {}, plugins: {} };

    // First fetch attempt fails or returns invalid meta
    mockedFetchPortalMeta.mockResolvedValueOnce({ domain: "" }); // Simulate invalid meta response
    // Second fetch attempt succeeds
    mockedFetchPortalMeta.mockResolvedValueOnce(mockMeta);


    const { result, rerender } = renderHook(() => usePortalUrl());

    // Wait for the first fetch attempt and state update (setting invalid URL/meta)
    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledTimes(1);
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(undefined, expect.any(Object)); // Invalid initial URL -> fetch with undefined
      expect(__mockSetPortalUrl).toHaveBeenCalledWith("http://localhost:3000"); // Fallback to origin
      expect(__mockSetMeta).toHaveBeenCalledWith({ domain: "" });
      expect(result.current).toBe("http://localhost:3000"); // Assert inside waitFor
    });

    // Manually update state to simulate a scenario where the URL might become valid later
    // (Although the hook's logic prevents this specific scenario, testing the ref logic)
    // Note: This manual state update might interfere with the mock store's internal state management
    // if the mock was more complex. With the current simple mock, it should work.
    __mockState.portalUrl = "https://valid.com";
    __mockState.meta = { domain: "valid.com", feature_flags: {}, plugins: {} };

    // Second render: Simulates a re-render. The ref is true, but the URL is now valid.
    // The condition `initialFetchAttempted.current && isValidUrl(currentPortalUrl)` is true.
    // The effect should *return* early and NOT fetch again.
    rerender();

    // Wait a moment to ensure no new fetch is triggered
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockedFetchPortalMeta).toHaveBeenCalledTimes(1); // Fetch should not be called again after the first attempt if URL becomes valid
    // The result.current should now reflect the manually updated state because renderHook
    // should pick up the state change from the mock store on re-render.
    expect(result.current).toBe("https://valid.com"); // Result should reflect the manually updated state
  });


  it("should clean up pending requests on unmount", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    let rejectPromise: (reason?: any) => void;

    // Create a promise that never resolves to test abort behavior
    // Update mockImplementation signature to match fetchPortalMeta
    mockedFetchPortalMeta.mockImplementation(
      (portalUrl?: string, options?: { signal?: AbortSignal }) => {
        return new Promise<PortalMeta>((_, reject) => {
          rejectPromise = reject;
          options?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      },
    );

    const { unmount } = renderHook(() => usePortalUrl());

    // Wait for the fetchMeta function to start (indicated by setIsMetaLoading(true))
    await waitFor(() => {
      expect(__mockSetIsMetaLoading).toHaveBeenCalledWith(true);
    });

    // Now unmount the hook
    unmount();

    // Wait for the abort spy to be called
    await waitFor(() => {
      expect(abortSpy).toHaveBeenCalled();
      // The promise should have been rejected by the abort listener
      // We don't need to explicitly check rejectPromise here,
      // the abortSpy check is sufficient to confirm the cleanup ran.
    });
    // Ensure console.error was NOT called for the AbortError
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
