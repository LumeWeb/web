import type { PortalMeta } from "@lumeweb/portal-framework-core";
import { fetchPortalMeta, getCurrentLocation } from "@lumeweb/portal-framework-core";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { appStore } from "@/store/appStore";

import { usePortalUrl } from "./usePortalUrl";

// Mock location helpers and fetchPortalMeta
vi.mock("@lumeweb/portal-framework-core", async (importOriginal) => {
  const mod =
    await importOriginal<typeof import("@lumeweb/portal-framework-core")>();
  return {
    ...mod,
    fetchPortalMeta: vi.fn(),
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
let consoleErrorSpy: vi.SpyInstance;

beforeEach(async () => {
  vi.clearAllMocks();
  appStore.setState({
    isMetaLoading: false,
    meta: undefined,
    portalUrl: "",
  });

  const coreModule = await import("@lumeweb/portal-framework-core");
  mockedFetchPortalMeta = vi.mocked(coreModule.fetchPortalMeta);
  mockedFetchPortalMeta?.mockReset?.();

  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
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

    const { result } = renderHook(() => usePortalUrl());

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
      );
    });
    await waitFor(() => {
      expect(appStore.getState().portalUrl).toBe("https://example.com");
      expect(appStore.getState().meta).toEqual(mockMeta);
      expect(appStore.getState().isMetaLoading).toBe(false);
      expect(result.current).toBe("https://example.com");
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should handle invalid meta domain by falling back to current origin", async () => {
    const mockMeta: PortalMeta = {
      domain: "",
      feature_flags: {},
      plugins: {},
    };
    mockedFetchPortalMeta.mockResolvedValue(mockMeta);

    const { result } = renderHook(() => usePortalUrl());

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
      );
      expect(appStore.getState().portalUrl).toBe("http://localhost:3000");
      expect(appStore.getState().meta).toEqual(mockMeta);
      expect(appStore.getState().isMetaLoading).toBe(false);
      expect(result.current).toBe("http://localhost:3000");
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should fetch meta using the existing valid portalUrl", async () => {
    const initialPortalUrl = "https://existing.com";
    appStore.setState({ portalUrl: initialPortalUrl });
    const mockMetaData = {
      domain: "existing.com",
      feature_flags: {},
      plugins: {},
    };
    mockedFetchPortalMeta.mockResolvedValue(mockMetaData);

    const { result } = renderHook(() => usePortalUrl());

    expect(result.current).toBe(initialPortalUrl);

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(
        initialPortalUrl,
        expect.any(Object),
      );
      expect(appStore.getState().portalUrl).toBe(initialPortalUrl);
      expect(appStore.getState().meta).toEqual(mockMetaData);
      expect(appStore.getState().isMetaLoading).toBe(false);
      expect(result.current).toBe(initialPortalUrl);
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should handle fetch error when initial URL is invalid", async () => {
    const error = new Error("Fetch failed");
    mockedFetchPortalMeta.mockRejectedValue(error);

    const { result } = renderHook(() => usePortalUrl());

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
      );
      expect(appStore.getState().portalUrl).toBe("http://localhost:3000");
      expect(appStore.getState().meta).toBeUndefined();
      expect(appStore.getState().isMetaLoading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching portal meta from",
        undefined,
        expect.any(Error),
      );
      expect(result.current).toBe("http://localhost:3000");
    });
  });

  it("should handle fetch error when initial URL is valid", async () => {
    const initialPortalUrl = "https://existing.com";
    appStore.setState({ portalUrl: initialPortalUrl });
    const error = new Error("Fetch failed");
    mockedFetchPortalMeta.mockRejectedValue(error);

    const { result } = renderHook(() => usePortalUrl());

    expect(result.current).toBe(initialPortalUrl);

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(
        initialPortalUrl,
        expect.any(Object),
      );
      expect(appStore.getState().meta).toBeUndefined();
      expect(appStore.getState().isMetaLoading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching portal meta from",
        initialPortalUrl,
        expect.any(Error),
      );
      expect(result.current).toBe(initialPortalUrl);
    });
  });

  it("should return the current portalUrl from the store", () => {
    appStore.setState({ portalUrl: "https://test.com" });

    const { result } = renderHook(() => usePortalUrl());

    expect(result.current).toBe("https://test.com");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should return a valid URL format even if the stored URL is missing protocol", async () => {
    appStore.setState({ portalUrl: "test.com" });
    const mockMeta: PortalMeta = {
      domain: "test.com",
      feature_flags: {},
      plugins: {},
    };
    mockedFetchPortalMeta.mockResolvedValue(mockMeta);

    const { result } = renderHook(() => usePortalUrl());

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
      );
      expect(appStore.getState().portalUrl).toBe("https://test.com");
      expect(appStore.getState().meta).toEqual(mockMeta);
      expect(appStore.getState().isMetaLoading).toBe(false);
      expect(result.current).toBe("https://test.com");
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should not fetch again if initial fetch attempted and portalUrl is valid", async () => {
    const initialPortalUrl = "https://valid.com";
    appStore.setState({ portalUrl: initialPortalUrl });
    const mockMeta: PortalMeta = {
      domain: "valid.com",
      feature_flags: {},
      plugins: {},
    };
    mockedFetchPortalMeta.mockResolvedValue(mockMeta);

    const { rerender, result } = renderHook(() => usePortalUrl());

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledTimes(1);
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(
        initialPortalUrl,
        expect.any(Object),
      );
      expect(appStore.getState().meta).toEqual(mockMeta);
      expect(result.current).toBe(initialPortalUrl);
    });

    rerender();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockedFetchPortalMeta).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(initialPortalUrl);
  });

  it("should fetch again if initial fetch attempted but portalUrl is still invalid", async () => {
    appStore.setState({ portalUrl: "invalid-url" });
    const mockMeta: PortalMeta = {
      domain: "example.com",
      feature_flags: {},
      plugins: {},
    };

    mockedFetchPortalMeta.mockResolvedValueOnce({ domain: "" } as PortalMeta);
    mockedFetchPortalMeta.mockResolvedValueOnce(mockMeta);

    const { rerender, result } = renderHook(() => usePortalUrl());

    await waitFor(() => {
      expect(mockedFetchPortalMeta).toHaveBeenCalledTimes(1);
      expect(mockedFetchPortalMeta).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
      );
      expect(appStore.getState().portalUrl).toBe("http://localhost:3000");
      expect(appStore.getState().meta).toEqual({ domain: "" });
      expect(result.current).toBe("http://localhost:3000");
    });

    appStore.setState({
      meta: { domain: "valid.com", feature_flags: {}, plugins: {} },
      portalUrl: "https://valid.com",
    });

    rerender();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockedFetchPortalMeta).toHaveBeenCalledTimes(1);
    expect(result.current).toBe("https://valid.com");
  });

  it("should clean up pending requests on unmount", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");

    mockedFetchPortalMeta.mockImplementation(
      (_portalUrl?: string, options?: { signal?: AbortSignal }) => {
        return new Promise<PortalMeta>((_, reject) => {
          options?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      },
    );

    const { unmount } = renderHook(() => usePortalUrl());

    await waitFor(() => {
      expect(appStore.getState().isMetaLoading).toBe(true);
    });

    unmount();

    await waitFor(() => {
      expect(abortSpy).toHaveBeenCalled();
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
