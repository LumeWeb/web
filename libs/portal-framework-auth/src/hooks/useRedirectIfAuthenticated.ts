import { type GoConfig, useGo, useIsAuthenticated } from "@refinedev/core";
import { useEffect } from "react";

import { sanitizeRedirectUrl } from "@/dataProviders/auth";

/**
 * Redirects to a target path if the user is already authenticated.
 * Useful on login/register pages to bounce authenticated users away.
 *
 * @param fallback - Path to redirect to when no `?to=` override is needed (default: "/dashboard")
 * @param to - Override redirect target (e.g. from URL search params)
 * @param type - Navigation type: "replace" (default, for login/register) or "push" (for mid-flow like OTP)
 */
export function useRedirectIfAuthenticated(
  fallback = "/dashboard",
  to?: string | null,
  type: GoConfig["type"] = "replace",
): void {
  const { data: authData, isLoading: isAuthLoading } = useIsAuthenticated();
  const go = useGo();

  useEffect(() => {
    if (!isAuthLoading && authData?.authenticated) {
      const safeTo = to ? sanitizeRedirectUrl(to) : fallback;
      go({ to: safeTo, type });
    }
  }, [isAuthLoading, authData, to, fallback, type, go]);
}
