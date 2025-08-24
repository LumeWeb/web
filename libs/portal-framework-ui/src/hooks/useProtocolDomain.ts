import {
  env,
  getCurrentLocation,
  getProtocolDomain,
} from "@lumeweb/portal-framework-core";

import { usePortalMeta } from "@/hooks/usePortalMeta";

export function useProtocolDomain(proto: string): string {
  const portalMeta = usePortalMeta();
  const domain = portalMeta?.domain || getCurrentLocation().hostname;

  return getProtocolDomain(proto, {
    isRootDomain: env.VITE_PORTAL_DOMAIN_IS_ROOT === "true",
  });
}
