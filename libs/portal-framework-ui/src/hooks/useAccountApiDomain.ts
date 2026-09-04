import {
  cleanProtocolString,
  env,
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
 *   getApiBaseUrl({ currentUrl: portalUrl, ... }) → API root host, with the
 *   service subdomain from the dashboard plugin meta.
 *
 * Legacy fallback (browser-derived, same as `useAccountSubdomain`) applies
 * only while the portal config or plugin meta has not loaded.
 */
export function useAccountApiDomain(): string {
  const { framework } = useFramework();
  const subdomain = usePluginMeta<string>("dashboard", "subdomain");

  const portalUrl = framework?.portalUrl;

  if (portalUrl && subdomain) {
    try {
      const apiUrl = getApiBaseUrl({
        currentUrl: portalUrl,
        preserveSubdomain: !env.VITE_PORTAL_DOMAIN_IS_ROOT,
      });

      if (apiUrl) {
        const apiDomain = new URL(apiUrl);
        const prefix = cleanProtocolString(subdomain);

        return prefix
          ? `${apiDomain.protocol}//${prefix}.${apiDomain.hostname}`
          : `${apiDomain.protocol}//${apiDomain.hostname}`;
      }
    } catch {
      // Unparseable API URL — degrade to the legacy browser-derived host.
    }
  }

  return `https://${getAccountSubdomain(subdomain)}`;
}
