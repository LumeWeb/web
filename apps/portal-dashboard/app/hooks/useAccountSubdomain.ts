import useProtocolDomain from "@/hooks/useProtocolDomain.js";
import usePluginMeta from "@/hooks/usePluginMeta.js";

export default function useAccountSubdomain(): string {
  const dashboardSubdomain = usePluginMeta("dashboard", "subdomain");

  return useProtocolDomain(dashboardSubdomain);
}
