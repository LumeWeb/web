import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAccountApiDomain } from "@lumeweb/portal-framework-ui";

import { useSsoUrl } from "./useSsoUrl";

// The account host comes from the canonical config chain via
// useAccountApiDomain (portal config domain from /api/meta + plugin-meta
// subdomain), mocked here at its hook boundary. window.location stubs below
// do not influence the `return` value (the backend only accepts
// same-site relative return paths); they exist to keep isExternalRedirect's
// window.location.origin read defined across the spec.
vi.mock("@lumeweb/portal-framework-ui", () => ({
  useAccountApiDomain: vi.fn(),
}));

const wrapper =
  (entry: string) =>
  ({ children }: { children: unknown }) =>
    createElement(MemoryRouter, { initialEntries: [entry] }, children as never);

const hookAt = (entry: string) =>
  renderHook(() => useSsoUrl(), { wrapper: wrapper(entry) });

beforeEach(() => {
  vi.mocked(useAccountApiDomain).mockReturnValue("https://account.lumeweb.test");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const stubLocation = (href: string) => {
  const url = new URL(href);
  vi.stubGlobal("location", {
    hostname: url.hostname,
    href: url.href,
    origin: url.origin,
    port: url.port,
    protocol: url.protocol,
  });
};

describe("useSsoUrl — byte-exact return= handling", () => {
  it("passes an internal relative ?to= through as the return path, query preserved", () => {
    stubLocation("https://account.example.com/login");
    // Target carries its own query; decoded once from the ?to= read, then
    // single-encoded onto the SSO url by URLSearchParams.
    const target = "/dashboard?tab=api-keys&next=%2Fsecurity";
    const { result } = hookAt(`/login?to=${encodeURIComponent(target)}`);

    const url = result.current("google");

    expect(url).toBe(
      `https://account.lumeweb.test/api/account/auth/sso/google?return=${encodeURIComponent(target)}`,
    );
  });

  it("chains an external ?to= through the landing route with a single-encoded to=", () => {
    stubLocation("https://account.example.com/login");
    // D carries its own percent-encoded query; the builder decodes the ?to=
    // once, then encodes it exactly once inside the landing route — the
    // external URL itself is never sent as `return` (backend whitelist 400s
    // absolute return URLs).
    const target = "https://sia.example.com/auth/connect/abc?next=%2Fsettings";
    const { result } = hookAt(`/login?to=${encodeURIComponent(target)}`);

    const url = result.current("google");

    const landing = `/?to=${encodeURIComponent(target)}`;
    expect(url).toBe(
      `https://account.lumeweb.test/api/account/auth/sso/google?return=${encodeURIComponent(landing)}`,
    );
  });

  it("explicit redirectTo argument wins over the ?to= param (internal)", () => {
    stubLocation("https://account.example.com/login");
    const { result } = hookAt(
      `/login?to=${encodeURIComponent("/somewhere")}`,
    );
    const url = result.current("github", "/callback");
    expect(url).toBe(
      `https://account.lumeweb.test/api/account/auth/sso/github?return=${encodeURIComponent(
        "/callback",
      )}`,
    );
  });

  it("explicit external redirectTo is chained through the landing route", () => {
    stubLocation("https://account.example.com/login");
    const { result } = hookAt(`/login?to=%2Fdashboard`);
    const url = result.current("github", "https://sia.example.com/auth");
    const landing = `/?to=${encodeURIComponent("https://sia.example.com/auth")}`;
    expect(url).toBe(
      `https://account.lumeweb.test/api/account/auth/sso/github?return=${encodeURIComponent(landing)}`,
    );
  });

  it("strips a same-origin absolute redirect target to its relative path", () => {
    stubLocation("https://account.example.com/login");
    const { result } = hookAt(
      `/login?to=${encodeURIComponent("https://account.example.com/dashboard?x=1")}`,
    );
    expect(result.current("google")).toBe(
      "https://account.lumeweb.test/api/account/auth/sso/google?return=%2Fdashboard%3Fx%3D1",
    );
  });

  it("defaults to return=/ when no ?to= is present", () => {
    stubLocation("https://account.example.com/login");
    const { result } = hookAt("/login");
    expect(result.current("google")).toBe(
      "https://account.lumeweb.test/api/account/auth/sso/google?return=%2F",
    );
  });

  it("uses the canonical account origin verbatim, including its protocol (localhost dev)", () => {
    // A config-loaded account origin may be non-https (e.g. localhost dev) —
    // it must never be rewritten to https. The return value itself stays a
    // relative path (the backend whitelist cannot accept the browser origin).
    vi.mocked(useAccountApiDomain).mockReturnValue("http://account.localhost");
    stubLocation("http://localhost:5173/login");
    const { result } = hookAt("/login?to=%2Fdashboard");
    expect(result.current("google")).toBe(
      "http://account.localhost/api/account/auth/sso/google?return=%2Fdashboard",
    );
  });

  it("return is a relative path regardless of non-default browser port", () => {
    stubLocation("http://localhost:5173/login");
    const { result } = hookAt("/login?to=%2Fdashboard");
    expect(result.current("google")).toBe(
      "https://account.lumeweb.test/api/account/auth/sso/google?return=%2Fdashboard",
    );
  });
});
