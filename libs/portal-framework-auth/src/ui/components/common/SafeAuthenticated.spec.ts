import { createElement } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SafeAuthenticated } from "./SafeAuthenticated";

let capturedProps: Record<string, unknown> | undefined;

vi.mock("@refinedev/core", () => ({
  Authenticated: (props: Record<string, unknown>) => {
    capturedProps = props;
    return null;
  },
}));

/**
 * Replicates Refine's `<Authenticated>` unauthenticated-fallback math plus
 * the @refinedev/react-router `go()` URL builder (query.to encoded once,
 * `to` passed verbatim), so the fallback URL contract is pinned byte-exact:
 * appendCurrentPathToQuery=true composes `?to=E1?to=E1` on top of the
 * provider's check() redirectTo; SafeAuthenticated pins appendCurrentPathToQuery
 * to false so the URL is exactly /login?to=E1.
 */
const buildFallbackUrl = (
  authenticatedRedirect: string,
  parsedTo: string,
  appendCurrentPathToQuery: boolean,
): string => {
  const config = {
    to: authenticatedRedirect,
    query:
      appendCurrentPathToQuery && parsedTo.length > 1
        ? { to: parsedTo }
        : undefined,
    type: "replace",
  };
  if (!config.query) return config.to;
  const query = { ...config.query };
  if (query.to) query.to = encodeURIComponent(query.to);
  const qs = Object.entries(query)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${config.to}?${qs}`;
};

describe("SafeAuthenticated", () => {
  it("pins appendCurrentPathToQuery to false", () => {
    render(createElement(SafeAuthenticated, { key: "authed" }, null));
    expect(capturedProps?.["appendCurrentPathToQuery"]).toBe(false);
    // NB: React `key` is not forwarded to props at runtime — it is honored
    // by React's reconciler (Refine requires it for instance stability).
    expect(capturedProps).toBeDefined();
  });

  it("forwards redirectOnFail, fallback and loading props", () => {
    render(
      createElement(
        SafeAuthenticated,
        {
          key: "authed",
          redirectOnFail: "/login",
          loading: "LOADING",
          fallback: "FALLBACK",
        },
        "CHILDREN",
      ),
    );
    expect(capturedProps?.["redirectOnFail"]).toBe("/login");
    expect(capturedProps?.["fallback"]).toBe("FALLBACK");
    expect(capturedProps?.["loading"]).toBe("LOADING");
    expect(capturedProps?.["children"]).toBe("CHILDREN");
  });

  it("fallback composition: check() redirectTo with ?to= stays exactly /login?to=E1 (not ?to=E1?to=E1)", () => {
    const target = "https://sia.example.com/auth/connect/abc123";
    const E1 = encodeURIComponent(target);
    const parsedTo = target; // once-decoded parsed.params.to (Refine decode ×2)

    // Refine default (appendCurrentPathToQuery=true): the E1?to=E1 corruption
    expect(buildFallbackUrl(`/login?to=${E1}`, parsedTo, true)).toBe(
      `/login?to=${E1}?to=${E1}`,
    );

    // SafeAuthenticated contract (appendCurrentPathToQuery=false): exact URL
    expect(buildFallbackUrl(`/login?to=${E1}`, parsedTo, false)).toBe(
      `/login?to=${E1}`,
    );
  });

  it("fallback composition without ?to=: plain /login, no appended query", () => {
    expect(buildFallbackUrl("/login", undefined as unknown as string, false)).toBe(
      "/login",
    );
  });
});
