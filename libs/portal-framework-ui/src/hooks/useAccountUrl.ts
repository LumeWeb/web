import {
  cleanTrailingSlashes,
  getCurrentLocation,
} from "@lumeweb/portal-framework-core";

import { useAccountSubdomain } from "@/hooks/useAccountSubdomain";
import { useApiUrl } from "@/hooks/useApiUrl";

const LEADING_SLASHES_REGEX = /^\/+/;

export function useAccountUrl(path: string) {
  const accountSubdomain = useAccountSubdomain();
  const apiUrl = useApiUrl();
  const { hostname: currentHostname, protocol } = getCurrentLocation();

  const normalizedPath = `/${String(path ?? "")
    .replace(LEADING_SLASHES_REGEX, "")
    .replace(/\/+$/, "")}`;

  if (!apiUrl) {
    return normalizedPath;
  }

  let parsedApiUrl: URL | undefined;

  try {
    parsedApiUrl = new URL(apiUrl);
    if (["127.0.0.1", "localhost"].includes(parsedApiUrl.hostname)) {
      return normalizedPath;
    }
  } catch {
    return normalizedPath;
  }

  let host = cleanTrailingSlashes(accountSubdomain || currentHostname);
  
  // If API URL host doesn't match expected account subdomain, use current host
  if (parsedApiUrl && parsedApiUrl.hostname !== accountSubdomain) {
    host = cleanTrailingSlashes(currentHostname);
  }

  return new URL(normalizedPath, `${protocol}//${host}`).toString();
}
