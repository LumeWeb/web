import { type GoConfig, useGo } from "@refinedev/core";
import { useCallback } from "react";

import { isAbsoluteRedirect, sanitizeRedirectUrl } from "@/dataProviders/auth";

export type NavigateToRedirect = (
  redirectTo: string | null | undefined,
  fallback?: string,
  type?: GoConfig["type"],
) => void;

/**
 * Single terminal-nav decision point for sanitized redirect targets:
 *
 * - performs a full browser hard-nav (`window.location.replace`) when the
 *   target is an absolute URL (cross- or same-origin) — Refine's `go()` can
 *   only navigate internal React routes, and same-origin absolutes may point
 *   at API/OAuth endpoints;
 * - otherwise navigates the internal path through Refine's `go()` so Refine
 *   state (router, notifications, auth store) stays consistent.
 *
 * Every consumer (login success handlers, AppLoginIndex cancel,
 * useRedirectIfAuthenticated) funnels through this helper so absolute vs
 * internal handling can never drift apart.
 */
export function useNavigateToRedirect(): NavigateToRedirect {
  const go = useGo();

  return useCallback<NavigateToRedirect>(
    (redirectTo, fallback, type = "replace") => {
      const target = sanitizeRedirectUrl(redirectTo ?? fallback);
      if (isAbsoluteRedirect(target)) {
        window.location.replace(target);
        return;
      }
      go({ to: target, type });
    },
    [go],
  );
}
