import { usePluginMeta } from "@/hooks/usePluginMeta";
import { env, getAccountSubdomain } from "@lumeweb/portal-framework-core";

export function useAccountSubdomain(): string {
  const dashboardSubdomain = usePluginMeta<string>("dashboard", "subdomain");

  return getAccountSubdomain(dashboardSubdomain, {
    isRootDomain: env.VITE_PORTAL_DOMAIN_IS_ROOT === "true",
  });
}
