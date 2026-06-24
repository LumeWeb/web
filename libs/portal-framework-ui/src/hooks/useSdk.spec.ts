import { Sdk } from "@lumeweb/portal-sdk";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/hooks/useApiUrl", () => ({
  useApiUrl: vi.fn(),
}));

let mockSdkInstance: { apiUrl: string; isMock: boolean };

vi.mock("@lumeweb/portal-sdk", () => ({
  Sdk: vi.fn().mockImplementation(function (this: any, apiUrl: string) {
    mockSdkInstance = { apiUrl, isMock: true };
    return mockSdkInstance;
  }),
}));

import { useApiUrl as mockedUseApiUrl } from "@/hooks/useApiUrl";
import { appStore } from "@/store/appStore";

import { resetGloballyInitialized, useSdk } from "./useSdk";

describe("useSdk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appStore.setState({ sdk: null });
    resetGloballyInitialized();
    vi.mocked(mockedUseApiUrl).mockReturnValue("https://api.test.com");
  });

  afterEach(() => {
    vi.clearAllMocks();
    appStore.setState({ sdk: null });
    resetGloballyInitialized();
  });

  it("should initialize the sdk when apiUrl is available", async () => {
    const apiUrl = "https://api.test.com";
    vi.mocked(mockedUseApiUrl).mockReturnValue(apiUrl);

    const { result } = renderHook(() => useSdk());

    await waitFor(
      () => {
        expect(Sdk).toHaveBeenCalledTimes(1);
        expect(Sdk).toHaveBeenCalledWith(apiUrl);
      },
      { timeout: 1000 },
    );
    expect(result.current).toEqual(
      expect.objectContaining({
        apiUrl,
        isMock: true,
      }),
    );
    expect(result.current).toBe(appStore.getState().sdk);
  });

  it("should not initialize the sdk if apiUrl is not available", async () => {
    vi.mocked(mockedUseApiUrl).mockReturnValue("");
    renderHook(() => useSdk());

    await waitFor(() => {
      expect(Sdk).not.toHaveBeenCalled();
    });
  });

  it("should initialize only once across multiple hook instances", async () => {
    const apiUrl = "https://api.test.com";
    vi.mocked(mockedUseApiUrl).mockReturnValue(apiUrl);

    const { result: result1, unmount: unmount1 } = renderHook(() => useSdk());

    await waitFor(
      () => {
        expect(Sdk).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 },
    );

    const firstSdkInstance = appStore.getState().sdk;

    const { result: result2, unmount: unmount2 } = renderHook(() => useSdk());
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(Sdk).toHaveBeenCalledTimes(1);
    expect(result2.current).toBe(firstSdkInstance);

    expect(result1.current).toBe(result2.current);

    unmount1();
    unmount2();
  });

  it("should not re-initialize on rerenders", async () => {
    const apiUrl = "https://api.test.com";
    vi.mocked(mockedUseApiUrl).mockReturnValue(apiUrl);

    const { rerender, result, unmount } = renderHook(() => useSdk());

    await waitFor(
      () => {
        expect(Sdk).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 },
    );
    const firstSdkInstance = appStore.getState().sdk;

    rerender();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(Sdk).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(firstSdkInstance);

    unmount();
  });
});
