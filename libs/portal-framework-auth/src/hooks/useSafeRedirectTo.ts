import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";

import {
  isAbsoluteRedirect,
  sanitizeRedirectUrl,
} from "@/dataProviders/auth";

/**
 * Returns the sanitized `?to=` redirect target for the current route.
 *
 * Refine's `useLogin` reads `to` straight from parsed route params and treats
 * any absolute value as a client-route path, which produces a mangled history
 * entry (e.g. `/app-login/https:/...`). This hook strips a non-relative `to`
 * out of the URL (replace, no history entry) so Refine never navigates it,
 * while still returning the sanitized target for callers to handle as a full
 * browser navigation.
 */
export function useSafeRedirectTo(): null | string {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTo = searchParams.get("to");

  // Captured once on mount; must not change after `to` is stripped below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeTo = useMemo(
    () => (rawTo ? sanitizeRedirectUrl(rawTo) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const normalized = useRef(false);
  useEffect(() => {
    // Normalize once on mount; `to` does not change during a login session.
    if (normalized.current) return;
    normalized.current = true;
    if (
      rawTo &&
      (isAbsoluteRedirect(rawTo) || rawTo !== sanitizeRedirectUrl(rawTo))
    ) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("to");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return safeTo;
}
