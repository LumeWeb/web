import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useSafeRedirectTarget } from "./useSafeRedirectTarget";

const wrapper =
  (entry: string) =>
  ({ children }: { children: unknown }) =>
    createElement(MemoryRouter, { initialEntries: [entry] }, children as never);

const hookAt = (entry: string) =>
  renderHook(() => useSafeRedirectTarget(), { wrapper: wrapper(entry) });

const stubLocation = (hostname: string) => {
  vi.stubGlobal("location", {
    hostname,
    href: `https://${hostname}/login`,
    origin: `https://${hostname}`,
  });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSafeRedirectTarget — decode exactly once, sanitize the once-decoded value", () => {
  it("returns nulls when no ?to= param is present", () => {
    stubLocation("account.example.com");
    const { result } = hookAt("/login");
    expect(result.current.rawTo).toBeNull();
    expect(result.current.redirectTo).toBeNull();
    expect(result.current.isExternal).toBe(false);
  });

  it("reads the once-encoded value decoded EXACTLY once (level-for-level)", () => {
    stubLocation("account.example.com");
    // D carries its own percent-encoded query; it is encoded once when written.
    const target = "https://sia.example.com/auth/connect/abc?next=%2Fsettings";
    const { result } = hookAt(`/login?to=${encodeURIComponent(target)}`);
    expect(result.current.rawTo).toBe(target);
    expect(result.current.redirectTo).toBe(target);
    expect(result.current.isExternal).toBe(true);
  });

  it("percent-encoded input: rawTo keeps its encoding layer and sanitize decodes it exactly once (repair)", () => {
    stubLocation("account.example.com");
    // Refine's useParsed would run qs.parse plus decodeURIComponent
    // (decode ×2 — corrupting values that carry their own % sequences).
    // useSafeRedirectTarget hands rawTo over with its one layer intact and
    // sanitizeRedirectUrl decode-retries exactly once: repaired input.
    const target = "https://sia.example.com/x";
    const onceEncoded = encodeURIComponent(target);
    const { result } = hookAt(`/login?to=${encodeURIComponent(onceEncoded)}`);
    expect(result.current.rawTo).toBe(onceEncoded);
    expect(result.current.redirectTo).toBe(target);
  });

  it("double-encoded input that cannot be repaired is rejected loudly", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    stubLocation("account.example.com");
    const doubleEncoded = encodeURIComponent(
      encodeURIComponent("https://cli.example.com/x"),
    );
    const { result } = hookAt(`/login?to=${encodeURIComponent(doubleEncoded)}`);
    expect(result.current.redirectTo).toBe("/dashboard");
    // isExternal=false: the fallback is a plain internal navigation
    expect(result.current.isExternal).toBe(false);
    warnSpy.mockRestore();
  });

  it("sanitizes cross-origin targets to /dashboard", () => {
    stubLocation("account.example.com");
    const { result } = hookAt(
      `/login?to=${encodeURIComponent("https://evil.com/x")}`,
    );
    expect(result.current.redirectTo).toBe("/dashboard");
    expect(result.current.isExternal).toBe(false);
  });

  it("flags same-root-domain targets as external", () => {
    stubLocation("account.example.com");
    const { result } = hookAt(
      `/login?to=${encodeURIComponent("https://sia.example.com/auth/connect/abc")}`,
    );
    expect(result.current.isExternal).toBe(true);
  });

  it("keeps relative targets internal", () => {
    stubLocation("account.example.com");
    const { result } = hookAt(
      `/login?to=${encodeURIComponent("/app-login?app=X")}`,
    );
    expect(result.current.rawTo).toBe("/app-login?app=X");
    expect(result.current.redirectTo).toBe("/app-login?app=X");
    expect(result.current.isExternal).toBe(false);
  });
});
