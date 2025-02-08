import { useCustom } from "@refinedev/core";
import type { CaseAnalyticsResponse } from "@lumeweb/portal-plugin-abuse-common";
import { TimeRange } from "@/ui/types/dashboard";

export interface UseCaseAnalyticsMultiResult {
  /**
   * Analytics data keyed by time range
   * @example { '24h': CaseAnalyticsResponse, '7d': CaseAnalyticsResponse }
   */
  data: Record<TimeRange, CaseAnalyticsResponse | undefined>;
  /** True if any of the time range queries are loading */
  isLoading: boolean;
  /** True if any of the time range queries errored */
  isError: boolean;
  /** Array of errors from failed queries */
  errors: unknown[];
}

export function useCaseAnalyticsMulti(
  timeRanges: TimeRange[],
): UseCaseAnalyticsMultiResult {
  // Deduplicate timeRanges to avoid duplicate requests
  const uniqueTimeRanges = Array.from(new Set(timeRanges));

  // Fetch each time range in parallel
  const results = uniqueTimeRanges.map((range) => {
    const endpoint =
      range === "all"
        ? "/abuse/analytics/cases"
        : `/abuse/analytics/cases/${range}`;

    return useCustom<CaseAnalyticsResponse>({
      url: endpoint,
      method: "get",
      queryOptions: {
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        select: (response) => ({
          ...response,
          data: {
            ...response.data,
            timeRange: range, // Add timeRange to response for identification
          },
        }),
      },
    });
  });

  // Combine results using original timeRanges order but deduplicated data
  const data = timeRanges.reduce(
    (acc, range) => ({
      ...acc,
      [range]: results[uniqueTimeRanges.indexOf(range)].data?.data,
    }),
    {} as Record<TimeRange, CaseAnalyticsResponse | undefined>,
  );

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const errors = results.map((result) => result.error).filter(Boolean);

  return {
    data,
    isLoading,
    isError,
    errors,
  };
}
