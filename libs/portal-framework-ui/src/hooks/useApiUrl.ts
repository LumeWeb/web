import { getApiBaseUrl, useFramework } from "@lumeweb/portal-framework-core";

export function useApiUrl() {
  const { framework, isLoading } = useFramework();

  if (!isLoading) {
    return framework?.portalUrl ?? getApiBaseUrl({ allowLocalhost: true });
  }

  // Use getApiBaseUrl from the core framework.
  // Pass allowLocalhost: true to enable localhost in dev environments.
  // preserveSubdomain defaults to respecting VITE_PORTAL_DOMAIN_IS_ROOT.
  const apiUrl = getApiBaseUrl({ allowLocalhost: true });

  // getApiBaseUrl returns false if localhost is disallowed and the current location is localhost.
  // Return an empty string in this case, consistent with the previous hook's behavior
  // for non-string results from useApiUrlBase.
  if (apiUrl === false) {
    return "";
  }

  // getApiBaseUrl already handles trailing slashes and normalization.
  return apiUrl;
}
