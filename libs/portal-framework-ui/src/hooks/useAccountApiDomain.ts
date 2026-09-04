import {
  cleanProtocolString,
  getAccountSubdomain,
  getApiBaseUrl,
  useFramework,
} from "@lumeweb/portal-framework-core";

import { usePluginMeta } from "@/hooks/usePluginMeta";

/**
 * Resolves the absolute origin of the account API
 * (`https://account.<portal-domain>`) from the canonical portal config
 * rather than the browser host.
 *
 * Canonical chain (mirrors `resolveDashboardApiUrl` in portal-plugin-dashboard
 * and the SDK/dataProvider base-URL wiring in portal-framework-core):
 *
 *   Config({ portalServer }) → portalConfig.domain → `/api/meta` served by
 *   the vite middleware → framework.portalUrl (PortalMeta.domain) →
 *   getApiBaseUrl({ currentUrl: portalUrl }) → API root host, with the
 *   service subdomain from the dashboard plugin meta.
 *
 * One root host is resolved and the `account.` subdomain is prepended in both
 * the canonical (config-loaded) and fallback (browser-derived) paths, so the
 * two can never diverge:
 *
 * - When config is loaded, `getApiBaseUrl` resolves the canonical root from
 *   `portalUrl` (no subdomain stripping needed — it is already the root).
 * - Before config loads, `getApiBaseUrl` derives the API base from the
 *   browser location and strips the dashboard subdomain down to the root
 *   (matching `getAccountSubdomain`'s root-domain logic), then the same
 *   `account.` prefix applies.
 *
 * Passing `preserveSubdomain` is deliberately omitted: `getApiBaseUrl`
 * already merges its value with `env.VITE_PORTAL_DOMAIN_IS_ROOT` via `||`, so
 * the hook riding that flag would be a no-op that can never influence the
 * result. Root-mode and non-root mode behavior flows from the env/default
 * inside `getApiBaseUrl`. The protocol and port of the resolved base are
 * preserved (dev localhost keeps `http` and its port for the
 * `account.localhost:<port>` vhost).
 */
export function useAccountApiDomain(): string {
  const { framework } = useFramework();
  const subdomain = usePluginMeta<string>("dashboard", "subdomain");

  const portalUrl = framework?.portalUrl;

  if (subdomain) {
    try {
      const apiUrl = getApiBaseUrl(
        portalUrl ? { currentUrl: portalUrl } : {},
      );

      if (apiUrl) {
        // `host` (not `hostname`) carries the port, so a dev API base like
        // `http://localhost:8080` becomes `http://account.localhost:8080` —
        // the addressed origin must keep the port; the dev stack vhosts the
        // account service on the same port under the `account.` host.
        const apiDomain = new URL(apiUrl);
        const prefix = cleanProtocolString(subdomain);

        return prefix
          ? `${apiDomain.protocol}//${prefix}.${apiDomain.host}`
          : `${apiDomain.protocol}//${apiDomain.host}`;
      }
    } catch {
      // Unparseable/browser-inaccessible API URL — degrade below.
    }
  }

  return `https://${getAccountSubdomain(subdomain)}`;
}
