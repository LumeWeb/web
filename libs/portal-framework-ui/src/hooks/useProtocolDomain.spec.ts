import { env as mockedEnv } from "@lumeweb/portal-app-shell/env";
// Mock dependencies
import { renderHook } from "@testing-library/react";
import { createMockPortalMeta } from "src/tests/portalMetaMocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import the mocked function *after* the vi.mock call
import { usePortalMeta as mockedUsePortalMeta } from "@/hooks/usePortalMeta";

// Import the hook under test *after* the mocks are defined
import { useProtocolDomain } from "./useProtocolDomain";

// Mock dependencies
vi.mock("@/hooks/usePortalMeta", () => {
  const usePortalMeta = vi.fn();
  return { usePortalMeta };
});

vi.mock("@lumeweb/portal-app-shell/env", () => ({
  env: {
    client: {
      VITE_PORTAL_DOMAIN_IS_ROOT: undefined,
    },
  },
}));

describe("useProtocolDomain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation for each test
    vi.mocked(mockedUsePortalMeta).mockReset();
    // Set default mock return value if needed for most tests
    vi.mocked(mockedUsePortalMeta).mockReturnValue(createMockPortalMeta());
    // Reset env mock
    mockedEnv.client.VITE_PORTAL_DOMAIN_IS_ROOT = undefined;
  });

  it("should combine protocol and domain", () => {
    const { result } = renderHook(() => useProtocolDomain("api"));
    expect(result.current).toBe("api.example.com");
  });

  it("should clean protocol strings", () => {
    const testCases = [
      { expected: "api.example.com", input: "api/" },
      { expected: "api.example.com", input: "http://api" },
      { expected: "api.example.com", input: "https://api" },
      { expected: ".example.com", input: "" },
      { expected: "api.example.com", input: "api." }, // Added test for trailing dot
      { expected: "api.example.com", input: "api..." }, // Added test for multiple trailing dots
      { expected: "api.example.com", input: "http://api///" }, // Added test for mixed cleaning
    ];

    testCases.forEach(({ expected, input }) => {
      const { result } = renderHook(() => useProtocolDomain(input));
      expect(result.current).toBe(expected);
    });
  });

  it("should fallback to window.location.hostname when no domain available", () => {
    const testCases = [
      { meta: undefined },
      { meta: {} },
      { meta: { domain: null } },
      { meta: { domain: "" } },
    ];

    testCases.forEach(({ meta }) => {
      vi.mocked(mockedUsePortalMeta).mockReturnValue(meta as any);
      const { result } = renderHook(() => useProtocolDomain("api"));
      expect(result.current).toBe(`api.${window.location.hostname}`);
    });
  });

  it("should handle protocol cleaning when falling back to hostname", () => {
    vi.mocked(mockedUsePortalMeta).mockReturnValue(undefined); // Trigger fallback

    const testCases = [
      { expected: `api.${window.location.hostname}`, input: "api/" },
      { expected: `api.${window.location.hostname}`, input: "http://api" },
      { expected: `api.${window.location.hostname}`, input: "https://api" },
      { expected: `.${window.location.hostname}`, input: "" },
      { expected: `api.${window.location.hostname}`, input: "api." },
    ];

    testCases.forEach(({ expected, input }) => {
      const { result } = renderHook(() => useProtocolDomain(input));
      expect(result.current).toBe(expected);
    });
  });

  it("should use root domain when VITE_PORTAL_DOMAIN_IS_ROOT is true", () => {
    mockedEnv.client.VITE_PORTAL_DOMAIN_IS_ROOT = "true";
    vi.mocked(mockedUsePortalMeta).mockReturnValue(
      createMockPortalMeta({ domain: "admin.dev.pinner.xyz" }),
    );

    const { result } = renderHook(() => useProtocolDomain("account"));
    expect(result.current).toBe("account.dev.pinner.xyz");
  });

  it("should keep subdomains when VITE_PORTAL_DOMAIN_IS_ROOT is false", () => {
    mockedEnv.client.VITE_PORTAL_DOMAIN_IS_ROOT = undefined;
    vi.mocked(mockedUsePortalMeta).mockReturnValue(
      createMockPortalMeta({ domain: "admin.dev.pinner.xyz" }),
    );

    const { result } = renderHook(() => useProtocolDomain("account"));
    expect(result.current).toBe("account.admin.dev.pinner.xyz");
  });

  it("should handle single-level domains with VITE_PORTAL_DOMAIN_IS_ROOT", () => {
    mockedEnv.client.VITE_PORTAL_DOMAIN_IS_ROOT = "true";
    vi.mocked(mockedUsePortalMeta).mockReturnValue(
      createMockPortalMeta({ domain: "localhost" }),
    );

    const { result } = renderHook(() => useProtocolDomain("api"));
    expect(result.current).toBe("api.localhost");
  });
});
