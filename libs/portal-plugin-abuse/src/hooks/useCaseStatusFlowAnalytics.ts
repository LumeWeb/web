import { useCustom } from "@refinedev/core";
import type { StatusFlowGraph } from "@lumeweb/portal-plugin-abuse-common";
import { QueryObserverResult } from "@tanstack/react-query";

type AnalyticsTimeRange = "all" | "24h" | "7d" | "30d";

interface UseCaseStatusFlowAnalyticsOptions {
  timeRange: AnalyticsTimeRange;
  caseType?: string;
}

interface UseCaseStatusFlowAnalyticsResult {
  data: StatusFlowGraph | undefined;
  isLoading: QueryObserverResult<StatusFlowGraph>["isLoading"];
  isError: QueryObserverResult<StatusFlowGraph>["isError"];
}

export function useCaseStatusFlowAnalytics({
  timeRange,
  caseType,
}: UseCaseStatusFlowAnalyticsOptions): UseCaseStatusFlowAnalyticsResult {
  const { data, isLoading, isError } = useCustom<StatusFlowGraph>({
    url: "/abuse/analytics/cases/status-flow",
    method: "get",
    config: {
      filters: [
        {
          field: "time_range",
          operator: "eq",
          value: timeRange,
        },
        ...(caseType
          ? [
              {
                field: "case_type",
                operator: "eq",
                value: caseType,
              },
            ]
          : ([] as any)),
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
