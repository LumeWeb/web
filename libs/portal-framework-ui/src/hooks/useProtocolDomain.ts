import { usePortalMeta } from "@/hooks/usePortalMeta";
import {
  env,
  getProtocolDomain,
  getCurrentLocation,
} from "@lumeweb/portal-framework-core";

export function useProtocolDomain(proto: string): string {
  const portalMeta = usePortalMeta();
  const domain = portalMeta?.domain || getCurrentLocation().hostname;

  return getProtocolDomain(proto, {
    isRootDomain: env.VITE_PORTAL_DOMAIN_IS_ROOT === "true",
  });
}
