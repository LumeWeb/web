import { useCustom } from "@refinedev/core";
import type { CaseAnalyticsResponse } from "@lumeweb/portal-plugin-abuse-common";

type AnalyticsTimeRange = "all" | "24h" | "7d" | "30d";

const getEndpoint = (timeRange: AnalyticsTimeRange) => {
  if (timeRange === "all") return "/abuse/analytics/cases";
  return `/abuse/analytics/cases/${timeRange}`;
};

export function useCaseAnalytics(timeRange: AnalyticsTimeRange) {
  const endpoint = getEndpoint(timeRange);

  return useCustom<CaseAnalyticsResponse>({
    url: endpoint,
    method: "get",
    queryOptions: {
      // Cache for 5 minutes to prevent excessive API calls
      staleTime: 5 * 60 * 1000,
    },
  });
}
