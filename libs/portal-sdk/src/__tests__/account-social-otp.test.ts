import { afterEach, describe, expect, it, vi } from "vitest";
import { AccountApi } from "@/account";

afterEach(() => vi.unstubAllGlobals());

describe("social login OTP cookie transport", () => {
  it("submits the challenge cookie without a return redirect or bearer token", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ token: "completed-login" }), {
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetch);
    const account = new AccountApi("https://example.com");
    account.setToken("stale-login-token");

    const result = await account.validateOtp({ otp: "123456" });

    expect(result.success).toBe(true);
    const [input, init] = fetch.mock.calls[0]!;
    expect(input).toBe("https://account.example.com/api/auth/otp/validate");
    expect(init.credentials).toBe("include");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ otp: "123456" });
    expect(new Headers(init.headers).has("Authorization")).toBe(false);

    await account.ping();
    expect(new Headers(fetch.mock.calls[1]![1].headers).get("Authorization"))
      .toBe("Bearer completed-login");
  });

  it("does not turn an invalid OTP into a completed session", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Invalid OTP code" }), { status: 400 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ping: "pong" })));
    vi.stubGlobal("fetch", fetch);
    const account = new AccountApi("https://example.com");

    const result = await account.validateOtp({ otp: "999999" });
    expect(result.success).toBe(false);
    await account.ping();
    expect(new Headers(fetch.mock.calls[1]![1].headers).has("Authorization")).toBe(false);
  });
});
