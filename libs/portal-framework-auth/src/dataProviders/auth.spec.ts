import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock portal-framework-core to control env and getApiBaseUrl
vi.mock("@lumeweb/portal-framework-core", () => ({
  env: {
    VITE_PORTAL_DOMAIN: "example.com",
    VITE_PORTAL_DOMAIN_IS_ROOT: undefined,
  },
  getApiBaseUrl: () => "https://example.com",
}));

import { isExternalRedirect, sanitizeRedirectUrl } from "./auth";

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

describe("isExternalRedirect", () => {
  beforeEach(() => {
    vi.stubGlobal("location", {
      hostname: "account.example.com",
      href: "https://account.example.com/login",
      origin: "https://account.example.com",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return false for relative paths", () => {
    expect(isExternalRedirect("/dashboard")).toBe(false);
  });

  it("should return false for same origin", () => {
    expect(
      isExternalRedirect("https://account.example.com/dashboard"),
    ).toBe(false);
  });

  it("should return true for same-root-domain but different origin (cross-subdomain)", () => {
    expect(
      isExternalRedirect("https://sia.example.com/auth/connect/123"),
    ).toBe(true);
  });

  it("should return true for external domains", () => {
    expect(isExternalRedirect("https://evil.com/dashboard")).toBe(true);
  });

  it("should return true for different protocol on same host", () => {
    expect(
      isExternalRedirect("http://account.example.com/dashboard"),
    ).toBe(true);
  });

  it("should return true for different port on same host", () => {
    expect(
      isExternalRedirect("https://account.example.com:3000/dashboard"),
    ).toBe(true);
  });

  it("should return false for invalid URLs", () => {
    expect(isExternalRedirect("not-a-url")).toBe(false);
  });
});
