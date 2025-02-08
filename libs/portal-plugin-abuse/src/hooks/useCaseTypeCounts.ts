import { useCaseAnalytics } from "./useCaseAnalytics";
import type { CaseType } from "@/types/case";
import type { TimeRange } from "@/ui/types/dashboard";

export type CaseTypeCounts = Record<CaseType | "all", number>;

export interface UseCaseTypeCountsResult {
  /** Object containing counts for each case type and 'all' */
  counts: CaseTypeCounts;
  /** True if the data is currently loading */
  isLoading: boolean;
  /** True if there was an error fetching the data */
  isError: boolean;
}

export function useCaseTypeCounts(timeRange: TimeRange): UseCaseTypeCountsResult {
  const { data, isLoading, isError } = useCaseAnalytics(timeRange);

  // Transform the analytics data into case type counts
  const counts = data?.data.case_type_distribution?.reduce(
    (acc, { name, count }) => ({ ...acc, [name]: count }),
    {} as Record<CaseType, number>
  ) || {} as Record<CaseType, number>;

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return {
    counts: {
      ...counts,
      all: total
    },
    isLoading,
    isError
  };
}
