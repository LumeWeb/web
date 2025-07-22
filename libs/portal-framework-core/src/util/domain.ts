import { env } from "../env";
import { getCurrentLocation } from "./location";

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
  const cleanProto = proto
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .replace(/\.+$/, "");

  const domain = getCurrentLocation().hostname;

  if (isRootDomain) {
    const parts = domain.split(".");
    const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : domain;
    return `${cleanProto}.${rootDomain}`;
  }

  return `${cleanProto}.${domain}`;
}
