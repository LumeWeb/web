import { useAccountApiDomain } from "@lumeweb/portal-framework-ui";
import { useSearchParams } from "react-router";

import { isExternalRedirect, sanitizeRedirectUrl } from "@/dataProviders/auth";

/**
 * Builds the absolute SSO redirect URL for a social provider:
 *
 *   {accountApiOrigin}/api/account/auth/sso/{provider}?return={returnPath}
 *
 * The query param is `return`: the account API's social-login start route
 * validates it with a same-site-relative whitelist. An absolute URL (any
 * host, even a same-portal subdomain), a protocol-relative path or a bare
 * path is rejected with 400 InvalidReturnUrl; only a path starting with a
 * single "/" and containing no "://" is accepted. The backend carries it in
 * the HMAC-signed social-auth session cookie through the provider hop and
 * back.
 *
 * The account origin comes from `useAccountApiDomain` (portal-framework-ui):
 * the canonical portal domain served by `/api/meta` (`framework.portalUrl`,
 * the same chain the Refine dataProviders/SDK build their API URLs from)
 * prefixed with the dashboard plugin-meta service subdomain — not the browser
 * hostname. Only when the portal config has not loaded does it degrade to the
 * legacy browser-derived `https://{accountSubdomain}` host.
 *
 * TODO: swap the hand-typed URL builder for the orval-generated
 * `getGetApiAccountAuthSsoProviderUrl` from @lumeweb/portal-sdk when a
 * backend spec documents the start-SSO flow (the `return` param and its
 * whitelist). Serialization matches orval's fetch-client URL builders:
 * `URLSearchParams` + `String()` coercion, provider id interpolated raw.
 *
 * Redirect chaining (`?to=` must survive the SSO hop: auth page → provider →
 * callback → auth-complete → final action target):
 *
 * - Internal target (relative path after `sanitizeRedirectUrl`): `return` is
 *   the target path itself (incl. its own query). After authentication the
 *   backend's /api/auth/complete 302s to that path on the account-site host
 *   (the dashboard API subdomain serves the same SPA), completing the hop
 *   directly.
 *
 * - External target (absolute URL on another origin — `sanitizeRedirectUrl`
 *   passes same-root-domain/localhost URLs through verbatim): `return` is
 *   `/?to={target}` — the account-site landing route `/` mounts AuthedIndex
 *   (dashboard plugin route "index"), which reads `?to` once-decoded and
 *   hard-navigates to the external target via `useRedirectIfAuthenticated`.
 *   The raw external URL is not sent as `return` itself (the backend
 *   whitelist would reject it); it is encoded once inside the landing path,
 *   which is then encoded once more by `URLSearchParams` below.
 *
 * Because the backend rejects absolute return URLs, SSO logins do not anchor
 * the destination to the browser's current origin — the post-auth landing is
 * always on the account site, where the relative target (or the `/?to=`
 * chain) is resolved.
 */
export function useSsoUrl(): (provider: string, redirectTo?: string) => string {
  const accountSubdomain = useAccountApiDomain();
  // Canonical `to` read: decoded exactly once via URLSearchParams (Refine's
  // useParsed double-decodes params.to, corrupting values with their own
  // %-sequences). sanitizeRedirectUrl carries the percent-encoded
  // decode-repair for double-encoded inputs.
  const [searchParams] = useSearchParams();

  return (provider: string, redirectTo?: string): string => {
    const toPath = sanitizeRedirectUrl(
      redirectTo ?? (searchParams.get("to") || "/"),
    );

    let returnUrl: string;
    if (isExternalRedirect(toPath)) {
      // Chain the external target through the account-site landing route
      // ("authed index" at "/"), single-encoding it exactly once — the
      // backend whitelist would reject the absolute URL as `return` itself.
      returnUrl = `/?to=${encodeURIComponent(toPath)}`;
    } else if (toPath.startsWith("/")) {
      // Relative internal target: sent verbatim, query preserved.
      returnUrl = toPath;
    } else {
      // sanitizeRedirectUrl may have passed an absolute URL through verbatim
      // (localhost dev); the backend only accepts relative paths, so strip it
      // to its path portion.
      try {
        const parsed = new URL(toPath);
        returnUrl = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        returnUrl = "/";
      }
    }

    const query = new URLSearchParams({ return: returnUrl }).toString();

    return `${accountSubdomain}/api/account/auth/sso/${provider}${query ? `?${query}` : ""}`;
  };
}
