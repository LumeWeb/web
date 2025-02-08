import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
// Mock useApiUrl instead of usePortalUrl
vi.mock("@/hooks/useApiUrl", () => ({
  useApiUrl: vi.fn(),
}));

vi.mock("@lumeweb/portal-sdk", () => ({
  Sdk: vi.fn().mockImplementation((apiUrl: string) => ({
    __isMockSdkInstance: true,
    account: vi.fn().mockReturnValue({
      create: vi.fn(),
      get: vi.fn(),
    }),
    apiUrl,
  })),
}));

// No need to manually mock @/store/portalStore anymore.
// The global vi.mock('zustand') handles this automatically for all stores
// that use createStore or create.

describe("useSdk", () => {
  // Declare variables that will hold the dynamically imported values
  let portalStore: any; // Will hold the store object
  let usePortalStore: any; // Will hold the hook function
  // Update variable name to reflect the mocked hook
  let mockUseApiUrl: any;
  let MockSdk: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Import the new mocked hook
    const apiUrlModule = await import("@/hooks/useApiUrl");
    mockUseApiUrl = vi.mocked(apiUrlModule.useApiUrl);
    // Set a default return value for the mocked hook
    mockUseApiUrl.mockReturnValue("https://test.com");


    const sdkModule = await import("@lumeweb/portal-sdk");
    MockSdk = vi.mocked(sdkModule.Sdk);

    // Dynamically import the store module after resetModules
    const portalStoreModule = await import("@/store/portalStore");
    portalStore = portalStoreModule.portalStore;
    usePortalStore = portalStoreModule.usePortalStore;

    // Dynamically import the hook to get access to the test-only export
    const useSdkModule = await import("./useSdk");
    useSdkModule.resetGloballyInitialized(); // Reset the global flag
  });

  it("should initialize the sdk when apiUrl is available", async () => {
    const { useSdk } = await import("./useSdk");
    const apiUrl = "https://api.test.com"; // Use an API URL
    mockUseApiUrl.mockReturnValue(apiUrl);

    const { result } = renderHook(() => useSdk());

    await waitFor(() => {
      expect(MockSdk).toHaveBeenCalledTimes(1);
      expect(MockSdk).toHaveBeenCalledWith(apiUrl); // Expect SDK initialized with apiUrl
    }, { timeout: 1000 });
    expect(result.current).toEqual(
      expect.objectContaining({
        __isMockSdkInstance: true,
        apiUrl: apiUrl, // Expect apiUrl property on mock SDK
      }),
    );
    expect(result.current).toBe(portalStore.getState().sdk); // Use the dynamically imported portalStore
  });

  it("should not initialize the sdk if apiUrl is not available", async () => {
    const { useSdk } = await import("./useSdk");
    mockUseApiUrl.mockReturnValue(""); // Mock useApiUrl to return empty string
    renderHook(() => useSdk());

    await waitFor(() => {
      expect(MockSdk).not.toHaveBeenCalled();
    });
  });

  it("should initialize only once across multiple hook instances", async () => {
    const { useSdk } = await import("./useSdk");
    const apiUrl = "https://api.test.com";
    mockUseApiUrl.mockReturnValue(apiUrl);

    // First instance
    const { result: result1, unmount: unmount1 } = renderHook(() => useSdk());

    await waitFor(() => {
      expect(MockSdk).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });

    const firstSdkInstance = portalStore.getState().sdk;

    // Second instance
    const { result: result2, unmount: unmount2 } = renderHook(() => useSdk());
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(MockSdk).toHaveBeenCalledTimes(1);
    expect(result2.current).toBe(firstSdkInstance);

    unmount1();
    unmount2();
  });

  it("should not re-initialize on rerenders", async () => {
    const { useSdk } = await import("./useSdk");
    const apiUrl = "https://api.test.com";
    mockUseApiUrl.mockReturnValue(apiUrl);

    const { result, rerender, unmount } = renderHook(() => useSdk());

    await waitFor(() => {
      expect(MockSdk).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
    expect(MockSdk).toHaveBeenCalledTimes(1); // Assert initial call happened
    const firstSdkInstance = portalStore.getState().sdk; // Use portalStore

    rerender();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(MockSdk).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(firstSdkInstance);

    unmount();
  });
});
