import useProtocolDomain from "@/hooks/useProtocolDomain";
import usePluginMeta from "@/hooks/usePluginMeta";

export default function useAccountSubdomain(): string {
  const dashboardSubdomain = usePluginMeta("dashboard", "subdomain");

  return useProtocolDomain(dashboardSubdomain);
}
