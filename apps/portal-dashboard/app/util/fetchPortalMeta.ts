import memoize from "memoizee";
import getApiBaseUrl from "./getApiBaseUrl";
import { PortalMeta } from "~/stores/app";

const _fetchPortalMeta = memoize(
  function (portalUrl?: string): PortalMeta {
    const endpoint = "/api/meta";
    const baseUrl = getApiBaseUrl();
    let fullEndpoint = "";
    if (baseUrl) {
      fullEndpoint = `${baseUrl}${endpoint}`;
    }
    if (portalUrl) {
      fullEndpoint = `${portalUrl}${endpoint}`;

      if (!fullEndpoint.startsWith("http")) {
        fullEndpoint = `https://${fullEndpoint}`;
      }
    } else {
      if (!baseUrl) {
        throw new Error("Could not detect portal API endpoint");
      }
    }

    return fetch(fullEndpoint)
      .then((response) => response.json())
      .catch((error) => {
        console.error("Failed to fetch portal url:", error);
      });
  },
  { promise: true },
);

export default function fetchPortalMeta(portalUrl?: string) {
  return _fetchPortalMeta(portalUrl);
}
