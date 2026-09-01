import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock portal-framework-core to control env and getApiBaseUrl
vi.mock("@lumeweb/portal-framework-core", () => ({
  env: {
    VITE_PORTAL_DOMAIN: "example.com",
    VITE_PORTAL_DOMAIN_IS_ROOT: undefined,
  },
  getApiBaseUrl: () => "https://example.com",
}));

import {
  createAuthProvider,
  isAbsoluteRedirect,
  sanitizeRedirectUrl,
} from "./auth";

describe("sanitizeRedirectUrl", () => {
  beforeEach(() => {
    vi.stubGlobal("location", {
      hostname: "account.example.com",
      href: "https://account.example.com/login",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("relative paths", () => {
    it("should allow relative paths starting with /", () => {
      expect(sanitizeRedirectUrl("/dashboard")).toBe("/dashboard");
    });

    it("should allow relative paths with multiple segments", () => {
      expect(sanitizeRedirectUrl("/auth/connect/abc123")).toBe(
        "/auth/connect/abc123",
      );
    });

    it("should allow root path", () => {
      expect(sanitizeRedirectUrl("/")).toBe("/");
    });

    it("should reject protocol-relative URLs (//evil.com)", () => {
      expect(sanitizeRedirectUrl("//evil.com")).toBe("/dashboard");
    });

    it("should reject backslash-prefixed relative URLs (/\\evil.com)", () => {
      expect(sanitizeRedirectUrl("/\\evil.com")).toBe("/dashboard");
    });

    it("should reject tab-obfuscated protocol-relative URLs (/\\t/evil.com)", () => {
      expect(sanitizeRedirectUrl("/\t/evil.com")).toBe("/dashboard");
    });

    it("should reject newline-obfuscated backslash (/\\n/evil.com)", () => {
      expect(sanitizeRedirectUrl("/\n/evil.com")).toBe("/dashboard");
    });

    it("should reject CR-obfuscated backslash (/\\r/evil.com)", () => {
      expect(sanitizeRedirectUrl("/\r/evil.com")).toBe("/dashboard");
    });

    it("should allow regular relative path with whitespace in query", () => {
      expect(sanitizeRedirectUrl("/callback?tab=\ta")).toBe("/callback?tab=a");
    });
  });

  describe("localhost", () => {
    it("should allow localhost URLs", () => {
      expect(sanitizeRedirectUrl("http://localhost:3000/dashboard")).toBe(
        "http://localhost:3000/dashboard",
      );
    });

    it("should allow 127.0.0.1 URLs", () => {
      expect(sanitizeRedirectUrl("http://127.0.0.1:5173/auth/connect/123")).toBe(
        "http://127.0.0.1:5173/auth/connect/123",
      );
    });
  });

  describe("same-root-domain", () => {
    it("should allow same subdomain", () => {
      expect(
        sanitizeRedirectUrl("https://account.example.com/dashboard"),
      ).toBe("https://account.example.com/dashboard");
    });

    it("should allow different subdomain on same root domain", () => {
      expect(
        sanitizeRedirectUrl("https://sia.example.com/auth/connect/abc123"),
      ).toBe("https://sia.example.com/auth/connect/abc123");
    });

    it("should allow root domain itself", () => {
      expect(sanitizeRedirectUrl("https://example.com/dashboard")).toBe(
        "https://example.com/dashboard",
      );
    });
  });

  describe("external domains", () => {
    it("should reject external domains and redirect to dashboard", () => {
      expect(sanitizeRedirectUrl("https://evil.com/auth/connect/123")).toBe(
        "/dashboard",
      );
    });

    it("should reject domains that share a substring but not root domain", () => {
      expect(
        sanitizeRedirectUrl("https://example.com.evil.com/auth/connect/123"),
      ).toBe("/dashboard");
    });

    it("should reject multi-label TLD spoofing attempts", () => {
      expect(
        sanitizeRedirectUrl("https://evil.attacker.com/auth/connect/123"),
      ).toBe("/dashboard");
    });
  });

  describe("edge cases", () => {
    it("should return dashboard for undefined", () => {
      expect(sanitizeRedirectUrl(undefined)).toBe("/dashboard");
    });

    it("should return dashboard for empty string", () => {
      expect(sanitizeRedirectUrl("")).toBe("/dashboard");
    });

    it("should return dashboard for invalid URLs", () => {
      expect(sanitizeRedirectUrl("not-a-url")).toBe("/dashboard");
    });
  });
});

describe("isAbsoluteRedirect", () => {
  it("should return false for relative paths", () => {
    expect(isAbsoluteRedirect("/dashboard")).toBe(false);
  });

  it("should return true for same-origin absolute URLs", () => {
    expect(
      isAbsoluteRedirect("https://account.example.com/api/auth/oauth/authorize?response_type=code"),
    ).toBe(true);
  });

  it("should return true for cross-origin absolute URLs", () => {
    expect(isAbsoluteRedirect("https://sia.example.com/auth/connect/123")).toBe(
      true,
    );
  });

  it("should return false for invalid URLs", () => {
    expect(isAbsoluteRedirect("not-a-url")).toBe(false);
  });
});

describe("createAuthProvider check() redirect", () => {
  beforeEach(() => {
    vi.stubGlobal("location", {
      hostname: "account.example.com",
      href: "https://account.example.com/",
      origin: "https://account.example.com",
      search: "",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createSdk(pingResult: { data: { token?: string } } | { error: Error }) {
    return {
      account: () => ({
        ping: vi.fn().mockResolvedValue(pingResult),
      }),
      setAuthToken: vi.fn(),
    } as any;
  }

  it("should redirect to /login without ?to= when no to param present", async () => {
    vi.stubGlobal("location", {
      hostname: "account.example.com",
      href: "https://account.example.com/",
      origin: "https://account.example.com",
      search: "",
    });

    const sdk = createSdk({ error: new Error("unauthorized") });
    const provider = createAuthProvider(sdk);
    const result = await provider.check();

    expect(result.authenticated).toBe(false);
    expect(result.redirectTo).toBe("/login");
  });

  it("should preserve ?to= cross-subdomain URL when redirecting unauthenticated user", async () => {
    const toUrl = "https://sia.example.com/auth/connect/abc123";
    vi.stubGlobal("location", {
      hostname: "account.example.com",
      href: `https://account.example.com/?to=${encodeURIComponent(toUrl)}`,
      origin: "https://account.example.com",
      search: `?to=${encodeURIComponent(toUrl)}`,
    });

    const sdk = createSdk({ error: new Error("unauthorized") });
    const provider = createAuthProvider(sdk);
    const result = await provider.check();

    expect(result.authenticated).toBe(false);
    expect(result.redirectTo).toBe(
      `/login?to=${encodeURIComponent(toUrl)}`,
    );
  });

  it("should sanitize external ?to= to /dashboard when redirecting unauthenticated user", async () => {
    vi.stubGlobal("location", {
      hostname: "account.example.com",
      href: "https://account.example.com/?to=https://evil.com/path",
      origin: "https://account.example.com",
      search: "?to=https%3A%2F%2Fevil.com%2Fpath",
    });

    const sdk = createSdk({ error: new Error("unauthorized") });
    const provider = createAuthProvider(sdk);
    const result = await provider.check();

    expect(result.authenticated).toBe(false);
    expect(result.redirectTo).toBe(
      `/login?to=${encodeURIComponent("/dashboard")}`,
    );
  });

  it("should preserve relative ?to= path when redirecting unauthenticated user", async () => {
    vi.stubGlobal("location", {
      hostname: "account.example.com",
      href: "https://account.example.com/?to=/dashboard",
      origin: "https://account.example.com",
      search: "?to=/dashboard",
    });

    const sdk = createSdk({ error: new Error("unauthorized") });
    const provider = createAuthProvider(sdk);
    const result = await provider.check();

    expect(result.authenticated).toBe(false);
    expect(result.redirectTo).toBe(`/login?to=${encodeURIComponent("/dashboard")}`);
  });
});
