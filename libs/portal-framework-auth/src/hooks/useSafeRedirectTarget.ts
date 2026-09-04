import { useSearchParams } from "react-router";

import { isExternalRedirect, sanitizeRedirectUrl } from "@/dataProviders/auth";

export interface SafeRedirectTarget {
  /** Whether `redirectTo` is a cross-origin navigation (hard-nav target). */
  isExternal: boolean;
  /** The `to` search param exactly as decoded once by `URLSearchParams`
   * (intentionally not run through a second decodeURIComponent). Null when
   * the param is absent.
   */
  rawTo: string | null;
  /**
   * `rawTo` after `sanitizeRedirectUrl` (which carries percent-encoded
   * decode-repair). Null when the param is absent.
   */
  redirectTo: string | null;
}

/**
 * Canonical reader for the `to`/redirect query param.
 *
 * Root cause neutralized here: Refine (@refinedev/react-router) writes the
 * `to` query param with exactly one `encodeURIComponent`, but both Refine's
 * built-in useLogin/useRegister (via `useParsed().params`) and Refine's
 * `<Authenticated>` fallback
 * read it back with an extra `decodeURIComponent` (decode ×2 on read) — a
 * value containing its own percent-encoding gets corrupted on read, and the
 * built-in login onSuccess even prefers this raw value over the auth
 * provider's sanitized response.
 *
 * Use this hook instead of `useParsed().params?.to` anywhere `to` is read:
 * it decodes exactly once and runs the value through
 * `sanitizeRedirectUrl` before anyone can navigate with it.
 */
export function useSafeRedirectTarget(): SafeRedirectTarget {
  const [searchParams] = useSearchParams();

  const rawTo = searchParams.get("to");
  const redirectTo = rawTo ? sanitizeRedirectUrl(rawTo) : null;
  const isExternal = redirectTo ? isExternalRedirect(redirectTo) : false;

  return { isExternal, rawTo, redirectTo };
}
