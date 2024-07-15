import useProtocolDomain from "portal-shared/hooks/useProtocolDomain";
import usePluginMeta from "portal-shared/hooks/usePluginMeta";

export default function useAccountSubdomain(): string {
  const dashboardSubdomain = usePluginMeta("dashboard", "subdomain");

  return useProtocolDomain(dashboardSubdomain);
}
