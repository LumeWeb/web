import { env } from "../env";
import { getCurrentLocation } from "./location";

export function cleanProtocolString(str: string): string {
  return str.replace(/^https?:\/\//, "").replace(/\.+$/, "");
}

export function cleanTrailingSlashes(str: string): string {
  return str.replace(/\/+$/, "");
}

export function getAccountSubdomain(
  dashboardSubdomain: string | undefined,
  options: { isRootDomain?: boolean } = {},
): string {
  if (!dashboardSubdomain) {
    return getCurrentLocation().hostname;
  }

  return getProtocolDomain(dashboardSubdomain, options);
}

export function getProtocolDomain(
  proto: string,
  { isRootDomain = env.VITE_PORTAL_DOMAIN_IS_ROOT } = {},
): string {
  // Clean protocol string
  const cleanProto = cleanTrailingSlashes(cleanProtocolString(proto));

  const domain = getCurrentLocation().hostname;

  if (!isRootDomain) {
    const parts = domain.split(".");
    const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : domain;
    return `${cleanProto}.${rootDomain}`;
  }

  return `${cleanProto}.${domain}`;
}
