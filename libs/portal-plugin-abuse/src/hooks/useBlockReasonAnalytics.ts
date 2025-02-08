import { useCustom } from "@refinedev/core";
import type { BlockReasonListResponse } from "@lumeweb/portal-plugin-abuse-common";
import { QueryObserverResult } from "@tanstack/react-query";

type AnalyticsTimeRange = "all" | "24h" | "7d" | "30d" | "90d";

interface UseBlockReasonAnalyticsOptions {
  timeRange: AnalyticsTimeRange;
}

interface UseBlockReasonAnalyticsResult {
  data: BlockReasonListResponse | undefined;
  isLoading: QueryObserverResult<BlockReasonListResponse>["isLoading"];
  isError: QueryObserverResult<BlockReasonListResponse>["isError"];
}

export function useBlockReasonAnalytics({
  timeRange,
}: UseBlockReasonAnalyticsOptions): UseBlockReasonAnalyticsResult {
  const { data, isLoading, isError } = useCustom<BlockReasonListResponse>({
    url: "/abuse/analytics/blocklist/block-reasons",
    method: "get",
    config: {
      filters: [
        {
          field: "time_range",
          operator: "eq",
          value: timeRange,
        },
      ],
    },
    queryOptions: {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    },
  });

  return {
    data: data?.data,
    isLoading,
    isError,
  };
}
