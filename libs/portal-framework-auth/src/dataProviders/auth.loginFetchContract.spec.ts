import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock portal-framework-core the same way auth.spec.ts does (no localhost
// storage side effects).
vi.mock("@lumeweb/portal-framework-core", () => ({
  env: {
    VITE_PORTAL_DOMAIN: "example.com",
    VITE_PORTAL_DOMAIN_IS_ROOT: undefined,
  },
  getApiBaseUrl: () => false,
}));

import { Sdk } from "@lumeweb/portal-sdk";

import { createAuthProvider } from "./auth";

/*
 * Fetch-URL contract with the backend's shared `?return=` mechanism:
 * `return` threading is page-level navigation only — the backend answers a
 * ?return= request with 302 → /api/auth/complete → 302 → return, and a
 * fetch(redirect: "follow") call would chase that chain into the return
 * page's HTML and crash its unconditional JSON.parse. The SPA therefore
 * carries no `return` (or any query) on these endpoints: completion is the
 * no-return JSON token response, followed by the SPA navigating itself via
 * redirectTo. These specs pin that so the invariant survives refactors.
 */

const ACCOUNT_ORIGIN = "https://account.web.example.test";

const jsonOk = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
    status: 200,
  });

describe("auth provider fetch contract — never sends `return`", () => {
  let captured: string[];

  beforeEach(() => {
    captured = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        captured.push(String(input));
        return jsonOk({ token: "test-token" });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("OTP login() posts /api/auth/otp/validate with no query string", async () => {
    const provider = createAuthProvider(new Sdk("https://web.example.test"));

    const response = await provider.login({
      otp: "123456",
      redirectTo: "/dashboard",
    });

    expect(response.success).toBe(true);
    expect(captured).toHaveLength(1);
    const url = new URL(captured[0] ?? "");
    expect(url.origin).toBe(ACCOUNT_ORIGIN);
    expect(url.pathname).toBe("/api/auth/otp/validate");
    expect(url.search).toBe("");
    expect(url.searchParams.has("return")).toBe(false);
  });

  it("password login() posts /api/auth/login with no query string", async () => {
    const provider = createAuthProvider(new Sdk("https://web.example.test"));

    const response = await provider.login({
      email: "user@example.com",
      password: "secret",
      remember: true,
    });

    expect(response.success).toBe(true);
    expect(captured).toHaveLength(1);
    const url = new URL(captured[0] ?? "");
    expect(url.origin).toBe(ACCOUNT_ORIGIN);
    expect(url.pathname).toBe("/api/auth/login");
    expect(url.search).toBe("");
    expect(url.searchParams.has("return")).toBe(false);
  });
});
