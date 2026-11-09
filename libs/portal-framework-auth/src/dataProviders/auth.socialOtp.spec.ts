import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@lumeweb/portal-framework-core", () => ({
  env: { VITE_PORTAL_DOMAIN: "example.com", VITE_PORTAL_DOMAIN_IS_ROOT: undefined },
  getApiBaseUrl: () => false,
}));

import { Sdk } from "@lumeweb/portal-sdk";
import { createAuthProvider } from "./auth";

afterEach(() => vi.unstubAllGlobals());

describe("social OTP completion", () => {
  it("keeps a cookie-only challenge unauthenticated until OTP succeeds", async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.pathname === "/api/auth/ping") {
        return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
      }
      return new Response(JSON.stringify({ token: "completed-login" }), {
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetch);
    const provider = createAuthProvider(new Sdk("https://example.com"));
    const successes: string[] = [];
    provider.on("authCheckSuccess", ({ token }) => successes.push(token));

    expect((await provider.check()).authenticated).toBe(false);
    expect(successes).toEqual([]);
    const target = "/?to=https%3A%2F%2Fapp.example.com%2Fcallback%3Fx%3D1";
    const response = await provider.login({ otp: "123456", redirectTo: target });
    expect(response.success).toBe(true);
    expect(response.redirectTo).toBe(target);
    expect(successes).toEqual(["completed-login"]);
    expect(String(fetch.mock.calls[1]![0])).toBe("https://account.example.com/api/auth/otp/validate");
  });
});
