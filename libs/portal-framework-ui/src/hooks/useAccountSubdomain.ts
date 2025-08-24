import { getAccountSubdomain } from "@lumeweb/portal-framework-core";

import { usePluginMeta } from "@/hooks/usePluginMeta";

export function useAccountSubdomain(): string {
  const dashboardSubdomain = usePluginMeta<string>("dashboard", "subdomain");

  return getAccountSubdomain(dashboardSubdomain);
}
