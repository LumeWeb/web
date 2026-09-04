import { type GoConfig, useIsAuthenticated } from "@refinedev/core";
import { useEffect } from "react";

import { useNavigateToRedirect } from "@/hooks/useNavigateToRedirect";

/**
 * Redirects to a target path if the user is already authenticated.
 * Useful on login/register pages to bounce authenticated users away.
 *
 * @param fallback - Path to redirect to when no `?to=` override is needed (default: "/dashboard")
 * @param to - Override redirect target (e.g. the once-decoded `to` search param)
 * @param type - Navigation type: "replace" (default, for login/register) or "push" (for mid-flow like OTP)
 *
 * Navigation always goes through the shared sanitized terminal-nav helper
 * (`useNavigateToRedirect`): the target is sanitized (with percent-encoded
 * decode-repair) and absolute URLs (cross- or same-origin) hard-nav while
 * internal paths `go()`.
 */
export function useRedirectIfAuthenticated(
  fallback = "/dashboard",
  to?: string | null,
  type: GoConfig["type"] = "replace",
): void {
  const { data: authData, isLoading: isAuthLoading } = useIsAuthenticated();
  const navigateToRedirect = useNavigateToRedirect();

  useEffect(() => {
    if (!isAuthLoading && authData?.authenticated) {
      navigateToRedirect(to ?? undefined, fallback, type);
    }
  }, [isAuthLoading, authData, to, fallback, type, navigateToRedirect]);
}
