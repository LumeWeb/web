import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  cleanProtocolString as mockedCleanProtocolString,
  env as mockedEnv,
  getAccountSubdomain as mockedGetAccountSubdomain,
  getApiBaseUrl as mockedGetApiBaseUrl,
  useFramework as mockedUseFramework,
} from "@lumeweb/portal-framework-core";

import { usePluginMeta as mockedUsePluginMeta } from "@/hooks/usePluginMeta";

// Import after mocks so the mocked module is in place first.
import { useAccountApiDomain } from "./useAccountApiDomain";

vi.mock("@lumeweb/portal-framework-core", () => {
  return {
    cleanProtocolString: vi.fn(
      (str: string) => str?.replace(/^https?:\/\//, "").replace(/\.+$/, "") ?? "",
    ),
    env: {},
    getAccountSubdomain: vi.fn(),
    getApiBaseUrl: vi.fn(),
    useFramework: vi.fn(),
  };
});

vi.mock("@/hooks/usePluginMeta", () => {
  const usePluginMeta = vi.fn();
  return { usePluginMeta };
});

const CANONICAL_PORTAL_URL = "https://tunnel.pinner.xyz";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(mockedUsePluginMeta).mockReturnValue("account");
  vi.mocked(mockedUseFramework).mockReturnValue({
    framework: { portalUrl: CANONICAL_PORTAL_URL },
    isLoading: false,
  } as never);
  vi.mocked(mockedGetApiBaseUrl).mockImplementation(
    ({ currentUrl }: { currentUrl?: string } = {}) =>
      // Emulate getApiBaseUrl: normalize against the given portal config URL.
      currentUrl ?? "https://tunnel.pinner.xyz",
  );
  vi.mocked(mockedGetAccountSubdomain).mockReturnValue(
    "account.from-browser-host.test",
  );
});

describe("useAccountApiDomain", () => {
  it("derives the origin from the canonical portal config, not the browser host", () => {
    const { result } = renderHook(() => useAccountApiDomain());

    expect(mockedGetApiBaseUrl).toHaveBeenCalledWith({
      currentUrl: CANONICAL_PORTAL_URL,
      preserveSubdomain: true, // !env.VITE_PORTAL_DOMAIN_IS_ROOT
    });
    expect(result.current).toBe("https://account.tunnel.pinner.xyz");
    expect(mockedGetAccountSubdomain).not.toHaveBeenCalled();
  });

  it("respects VITE_PORTAL_DOMAIN_IS_ROOT in the preserveSubdomain flag", () => {
    mockedEnv.VITE_PORTAL_DOMAIN_IS_ROOT = true;

    renderHook(() => useAccountApiDomain());

    expect(mockedGetApiBaseUrl).toHaveBeenCalledWith({
      currentUrl: CANONICAL_PORTAL_URL,
      preserveSubdomain: false,
    });
  });

  it("keeps the protocol from the normalized API base (e.g. localhost http)", () => {
    vi.mocked(mockedGetApiBaseUrl).mockReturnValue("http://localhost:8080");

    const { result } = renderHook(() => useAccountApiDomain());

    expect(result.current).toBe("http://account.localhost:8080");
  });

  it("falls back to the browser-derived host when no portal URL is loaded", () => {
    vi.mocked(mockedUseFramework).mockReturnValue({
      framework: null,
      isLoading: true,
    } as never);

    const { result } = renderHook(() => useAccountApiDomain());

    expect(mockedGetAccountSubdomain).toHaveBeenCalledWith("account");
    expect(result.current).toBe("https://account.from-browser-host.test");
  });

  it("falls back to the browser-derived host when plugin meta is missing", () => {
    vi.mocked(mockedUsePluginMeta).mockReturnValue(undefined);

    const { result } = renderHook(() => useAccountApiDomain());

    expect(mockedGetApiBaseUrl).not.toHaveBeenCalled();
    expect(mockedGetAccountSubdomain).toHaveBeenCalledWith(undefined);
    expect(result.current).toBe("https://account.from-browser-host.test");
  });

  it("falls back when the config-derived API URL is unparseable", () => {
    vi.mocked(mockedGetApiBaseUrl).mockReturnValue(":::not-a-url");

    const { result } = renderHook(() => useAccountApiDomain());

    expect(mockedGetAccountSubdomain).toHaveBeenCalledWith("account");
    expect(result.current).toBe("https://account.from-browser-host.test");
  });

  it("cleans protocol prefixes from the plugin-meta subdomain", () => {
    vi.mocked(mockedUsePluginMeta).mockReturnValue("https://account.");

    const { result } = renderHook(() => useAccountApiDomain());

    expect(mockedCleanProtocolString).toHaveBeenCalledWith("https://account.");
    expect(result.current).toBe("https://account.tunnel.pinner.xyz");
  });
});
