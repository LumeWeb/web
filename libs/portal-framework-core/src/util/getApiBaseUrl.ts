import { env } from "../env";
import { getCurrentLocation } from "./location";

const IPLoopbackRegex =
  /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;

export interface ApiUrlOptions {
  allowLocalhost?: boolean;
  currentUrl?: string;
  preserveSubdomain?: boolean; // When true, keeps full hostname including subdomains
}

export function getApiBaseUrl(options: ApiUrlOptions = {}): false | string {
  const {
    allowLocalhost = false,
    currentUrl = getCurrentLocation().href,
    preserveSubdomain: explicitPreserveSubdomain,
  } = options;

  // Read from env
  const preserveSubdomain =
    env.VITE_PORTAL_DOMAIN_IS_ROOT || explicitPreserveSubdomain;

  // Parse URL (use https as default for parsing if no protocol)
  const urlObject = new URL(
    currentUrl.startsWith("http") ? currentUrl : `https://${currentUrl}`,
  );

  const isLocalEnvironment =
    urlObject.hostname === "localhost" ||
    IPLoopbackRegex.test(urlObject.hostname);
  const isAnyIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(urlObject.hostname);

  // Disallow localhost if not explicitly allowed
  if (isLocalEnvironment && !allowLocalhost) {
    return false;
  }

  // Determine target hostname and port
  let targetHostname = urlObject.hostname;
  let targetPort = urlObject.port; // Start with the original port
  let targetProtocol = urlObject.protocol; // Start with the original protocol

  // If we are *not* preserving the subdomain AND it's *not* a local environment AND it's *not* an IP
  // This means it's a standard FQDN where we should find the root domain.
  if (!preserveSubdomain && !isLocalEnvironment && !isAnyIp) {
    const hostParts = urlObject.hostname.split(".");
    if (hostParts.length > 2) {
      // Get the last two parts of the domain (e.g., 'example.com' from 'subdomain.example.com')
      targetHostname = hostParts.slice(-2).join(".");
      targetPort = ""; // Remove port when stripping subdomain
    }
    // If hostParts.length <= 2, it's already likely a root domain,
    // targetHostname remains urlObject.hostname. targetPort will be handled by normalizeUrl.
    targetProtocol = urlObject.protocol; // Keep original protocol before normalizeUrl adjusts it
  }

  // Construct and normalize the final URL
  return normalizeUrl(
    `${targetProtocol}//${targetHostname}${targetPort ? ":" + targetPort : ""}`,
  );
}

/**
 * Normalizes a URL to ensure consistent format:
 * - Forces HTTPS protocol unless it's localhost or loopback IP
 * - Removes trailing slashes
 * - Removes default ports
 */
export function normalizeUrl(url: string): string {
  // Use http as default for parsing if no protocol
  const tempUrl = /^[a-zA-Z]+:\/\//.test(url) ? url : `http://${url}`;
  const urlObject = new URL(tempUrl);

  const isLocalhostOrLoopback =
    urlObject.hostname === "localhost" ||
    IPLoopbackRegex.test(urlObject.hostname);
  const isAnyIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(urlObject.hostname);

  // Determine final protocol
  let finalProtocol = urlObject.protocol;

  if (isLocalhostOrLoopback || isAnyIp) {
    // Preserve parsed protocol for local/IPs (defaults to http if none was in input string)
    finalProtocol = urlObject.protocol;
  } else {
    // Force https for all other cases (hostnames)
    finalProtocol = "https:";
  }

  // Remove default ports
  let port = urlObject.port;
  if (
    (port === "80" && finalProtocol === "http:") ||
    (port === "443" && finalProtocol === "https:")
  ) {
    port = "";
  }

  // Construct final URL
  const baseUrl =
    `${finalProtocol}//${urlObject.hostname}${port ? ":" + port : ""}`.replace(
      /\/$/,
      "",
    );
  return baseUrl.replace(/\/$/, "");
}
