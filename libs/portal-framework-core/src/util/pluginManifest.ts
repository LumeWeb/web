import memoize from "memoizee";

import { getApiBaseUrl } from "../util/getApiBaseUrl";
import { fetchPortalMeta } from "./portalMeta";

const _getPortalPluginManifests = memoize(
  async (appName: string, portalUrl?: string) => {
    const baseUrl = getApiBaseUrl({ currentUrl: portalUrl });
    if (!baseUrl) {
      throw new Error("Could not detect base API url");
    }
    const url = new URL(baseUrl);
    url.searchParams.set("app", appName);
    const meta = await fetchPortalMeta(url.toString());

    if (!meta.plugins) {
      throw new Error(
        "Portal meta does not contain required 'plugins' property",
      );
    }

    const manifests: string[] = [];

    for (const pluginName in meta.plugins) {
      const plugin = meta.plugins[pluginName];
      if (plugin.web_bundles) {
        manifests.push(...plugin.web_bundles);
      }
    }

    return manifests;
  },
);

export async function getPortalPluginManifests(
  appName: string,
  portalUrl?: string,
) {
  return _getPortalPluginManifests(appName, portalUrl);
}
