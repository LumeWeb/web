import { env, Framework, getApiBaseUrl, getPluginMeta } from "@lumeweb/portal-framework-core";

/**
 * Resolves the dashboard API URL based on framework configuration
 */
export function resolveDashboardApiUrl(framework: Framework): string {
  const apiUrl = getApiBaseUrl({
    currentUrl: framework.portalUrl,
    preserveSubdomain: !env.VITE_PORTAL_DOMAIN_IS_ROOT,
  });

  if (!apiUrl) {
    throw new Error("Failed to get API base URL");
  }

  const subdomain = getPluginMeta(framework.meta!, "dashboard", "subdomain");
  if (!subdomain) {
    throw new Error("Failed to get subdomain from plugin metadata");
  }

  try {
    const apiDomain = new URL(apiUrl);
    return `${apiDomain.protocol}//${subdomain}.${apiDomain.hostname}/api`;
  } catch (error) {
    throw new Error(`Failed to construct API URL: ${error.message}`);
  }
}