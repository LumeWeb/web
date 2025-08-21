import memoize from "memoizee";

import type { PortalMeta } from "../types/portal";

import { getApiBaseUrl } from "./getApiBaseUrl";

const _fetchPortalMeta = memoize(
  async function (portalUrl?: string): Promise<PortalMeta> {
    const endpoint = "/api/meta";
    let fullEndpoint = "";

    if (portalUrl) {
      try {
        const portalUrlObj = new URL(portalUrl);
        portalUrlObj.pathname = endpoint;
        fullEndpoint = portalUrlObj.toString();

        if (!fullEndpoint.startsWith("http")) {
          fullEndpoint = `https://${fullEndpoint}`;
        }
      } catch (error) {
        throw new Error(`Invalid portal URL: ${portalUrl}`);
      }
    } else {
      const baseUrl = getApiBaseUrl({ currentUrl: portalUrl });
      if (!baseUrl) {
        throw new Error("Could not detect portal API endpoint");
      }
      fullEndpoint = `${baseUrl}${endpoint}`;
    }

    try {
      const response = await fetch(fullEndpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.domain) {
        throw new Error("Response does not contain required 'domain' property");
      }

      return data as PortalMeta;
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  },
  { promise: true },
);

// Test helper to clear memoization cache
export async function __test_clearCache() {
  await _fetchPortalMeta.clear?.();
}

export async function fetchPortalMeta(portalUrl?: string): Promise<PortalMeta> {
  return _fetchPortalMeta(portalUrl);
}

export function getPluginMeta<T = Record<string, unknown>>(
  meta: PortalMeta | undefined,
  pluginName: string,
  key?: string,
): T | undefined {
  const pluginMeta = meta?.plugins?.[pluginName]?.meta;
  if (!pluginMeta) return undefined;
  if (!key) return pluginMeta as T;

  return key.split(".").reduce((acc, part) => acc?.[part], pluginMeta) as T;
}
