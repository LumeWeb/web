import { useCustom } from "@refinedev/core";
import type { CaseTypeSourceMatrixResponse } from "@lumeweb/portal-plugin-abuse-common";
import { QueryObserverResult } from "@tanstack/react-query";

type AnalyticsTimeRange = "all" | "24h" | "7d" | "30d";

interface UseCaseTypeSourceMatrixAnalyticsOptions {
  timeRange: AnalyticsTimeRange;
  caseType?: CaseType;
}

interface UseCaseTypeSourceMatrixAnalyticsResult {
  data: CaseTypeSourceMatrixResponse | undefined;
  isLoading: QueryObserverResult<CaseTypeSourceMatrixResponse>["isLoading"];
  isError: QueryObserverResult<CaseTypeSourceMatrixResponse>["isError"];
}

export function useCaseTypeSourceMatrixAnalytics({
  timeRange,
  caseType,
}: UseCaseTypeSourceMatrixAnalyticsOptions): UseCaseTypeSourceMatrixAnalyticsResult {
  const { data, isLoading, isError } = useCustom<CaseTypeSourceMatrixResponse>({
    url: "/abuse/analytics/cases/type-source-matrix",
    method: "get",
    config: {
      filters: [
        {
          field: "time_range",
          operator: "eq",
          value: timeRange,
        },
        ...(caseType ? [{
          field: "case_type",
          operator: "eq",
          value: caseType,
        }] : []),
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
