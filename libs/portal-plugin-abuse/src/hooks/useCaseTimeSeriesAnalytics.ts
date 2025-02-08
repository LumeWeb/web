import { CrudFilter, CrudOperators, useCustom } from "@refinedev/core";
import { QueryObserverResult } from "@tanstack/react-query";
import type { TimeRange } from "@/ui/types/dashboard";

type StringFilter = {
  field: string;
  operator: Extract<CrudOperators, "eq" | "ne" | "contains" | "ncontains">;
  value: string;
};

type TimeSeriesFilter = StringFilter; // You can expand this with other filter types

type TimeSeriesMetric = "open_cases" | "new_cases" | "resolved_cases";

interface UseCaseTimeSeriesAnalyticsOptions {
  metric: TimeSeriesMetric;
  timeRange: TimeRange;
  filters?: {
    caseType?: string;
    priority?: string;
  };
}

export interface CaseTimeSeriesResponse {
  data: number[];
  timeRange: TimeRange;
  metric: TimeSeriesMetric;
}

type UseCaseTimeSeriesAnalyticsResult = {
  data: number[];
  isLoading: QueryObserverResult<CaseTimeSeriesResponse>["isLoading"];
};

export function useCaseTimeSeriesAnalytics({
  metric,
  timeRange,
  filters = {},
}: UseCaseTimeSeriesAnalyticsOptions): UseCaseTimeSeriesAnalyticsResult {
  const { data, ...rest } = useCustom<CaseTimeSeriesResponse>({
    url: "/abuse/analytics/cases/time-series",
    method: "get",
    config: {
      filters: [
        { field: "metric", operator: "eq", value: metric } as TimeSeriesFilter,
        {
          field: "time_range",
          operator: "eq",
          value: timeRange,
        },
        ...(filters?.caseType
          ? [
              {
                field: "case_type",
                operator: "eq",
                value: filters.caseType,
              } as TimeSeriesFilter,
            ]
          : []),
        ...(filters.priority
          ? [
              {
                field: "priority",
                operator: "eq",
                value: filters.priority,
              } as TimeSeriesFilter,
            ]
          : []),
      ],
    },
    queryOptions: {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    },
  });

  return {
    data: (data?.data ?? []) as number[],
    isLoading: rest.isLoading,
  };
}
