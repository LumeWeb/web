import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock portal-framework-core to control env and getApiBaseUrl
vi.mock("@lumeweb/portal-framework-core", () => ({
  env: {
    VITE_PORTAL_DOMAIN: "example.com",
    VITE_PORTAL_DOMAIN_IS_ROOT: undefined,
  },
  getApiBaseUrl: () => "https://example.com",
}));

import { createAuthProvider, isExternalRedirect, sanitizeRedirectUrl } from "./auth";

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

  describe("percent-encoding awareness (decode-retry)", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it("should repair a fully percent-encoded allowed absolute URL (decoded exactly once)", () => {
      expect(
        sanitizeRedirectUrl(
          "https%3A%2F%2Fsia.example.com%2Fauth%2Fconnect%2Fabc123",
        ),
      ).toBe("https://sia.example.com/auth/connect/abc123");
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("should repair a percent-encoded relative path", () => {
      expect(sanitizeRedirectUrl("%2Fdashboard%3Ftab%3Dpinned")).toBe(
        "/dashboard?tab=pinned",
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("should repair a double-encoded same-root URL to its once-decoded value", () => {
      const doubleEncoded =
        "https%3A%2F%2Fsia.example.com%2Fauth%3Fnext%3D%252Fsettings";
      expect(sanitizeRedirectUrl(doubleEncoded)).toBe(
        "https://sia.example.com/auth?next=%2Fsettings",
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("should repair a percent-encoded localhost URL", () => {
      expect(
        sanitizeRedirectUrl("http%3A%2F%2Flocalhost%3A3000%2Fdashboard"),
      ).toBe("http://localhost:3000/dashboard");
    });

    it("should reject (silently) a percent-encoded value whose decoded target is disallowed", () => {
      expect(sanitizeRedirectUrl("https%3A%2F%2Fevil.com%2Fphish")).toBe(
        "/dashboard",
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("should decode a value whose own query carries percent-sequences that fail URL parsing and repair it", () => {
      // D with own query `?next=%2Fsettings`: new URL() succeeds for D
      // itself, but an upstream double-encode of the whole value doesn't.
      const raw =
        "https%3A%2F%2Fsia.example.com%2Fauth%2Fconnect%2Fabc%3Fnext%3D%252Fsettings";
      expect(sanitizeRedirectUrl(raw)).toBe(
        "https://sia.example.com/auth/connect/abc?next=%2Fsettings",
      );
    });

    it("should warn loudly and reject an unreadable percent-encoded target", () => {
      // Decodes to "//evil.com" which is a blocked protocol-relative path
      // (second decode-repair is not attempted: decode exactly once).
      expect(sanitizeRedirectUrl("%2F%2Fevil.com")).toBe("/dashboard");
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("%2F%2Fevil.com"),
      );
    });

    it("should warn loudly and reject a percent-encoded value whose repair fails", () => {
      // Once-decoded -> "://sia.example.com" — still unparseable, and beyond
      // the single decode-repair the value is rejected loudly.
      expect(sanitizeRedirectUrl("%3A%2F%2Fsia.example.com")).toBe(
        "/dashboard",
      );
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it("should warn loudly and reject malformed percent-encoding", () => {
      expect(sanitizeRedirectUrl("%E0%A4%A")).toBe("/dashboard");
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });
  });
});

describe("createAuthProvider register() redirect chain", () => {
  beforeEach(() => {
    vi.stubGlobal("location", {
      hostname: "account.example.com",
      href: "https://account.example.com/register",
      origin: "https://account.example.com",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createSdk(registerResult: { success: boolean }) {
    return {
      account: () => ({
        register: vi.fn().mockResolvedValue(registerResult),
      }),
      setAuthToken: vi.fn(),
    } as any;
  }

  it("should return an internal redirect target directly (chain preserved) after register", async () => {
    const sdk = createSdk({ success: true });
    const provider = createAuthProvider(sdk);
    const internalTarget = `/app-login?app=TestApp&to=${encodeURIComponent(
      "https://sia.example.com/auth/connect/abc123",
    )}`;

    const result = await provider.register!({
      email: "a@b.com",
      firstName: "A",
      lastName: "B",
      password: "pw",
      redirectTo: internalTarget,
    });

    expect(result.success).toBe(true);
    // Level-preserving: internal path returned verbatim (single encoding intact)
    expect(result.redirectTo).toBe(internalTarget);
  });

  it("should keep routing an external target through /login?to= after register", async () => {
    const sdk = createSdk({ success: true });
    const provider = createAuthProvider(sdk);
    const externalTo = "https://sia.example.com/auth/connect/abc123";

    const result = await provider.register!({
      email: "a@b.com",
      firstName: "A",
      lastName: "B",
      password: "pw",
      redirectTo: externalTo,
    });

    expect(result.redirectTo).toBe(`/login?to=${encodeURIComponent(externalTo)}`);
  });

  it("should land on /login when no redirectTo is given", async () => {
    const sdk = createSdk({ success: true });
    const provider = createAuthProvider(sdk);

    const result = await provider.register!({
      email: "a@b.com",
      firstName: "A",
      lastName: "B",
      password: "pw",
    });

    expect(result.redirectTo).toBe("/login");
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
