import { useList } from "@refinedev/core";
import type {
  OperationFiltersResponse,
  OperationFiltersResponseData,
} from "@lumeweb/portal-sdk";

interface UseOperationFiltersReturn {
  data?: OperationFiltersResponseData;
  isLoading: boolean;
  error?: Error;
}

/**
 * Hook to fetch operation filter options from the API
 * Returns available statuses, operations, and protocols for filtering
 */
export function useOperationFilters(): UseOperationFiltersReturn {
  const { data, isLoading, error } = useList<OperationFiltersResponse>({
    resource: "operations.filters",
  });

  // The filters endpoint returns a single object, not an array
  // So we need to extract the first item if it exists
  const filterData = data?.data?.data as OperationFiltersResponseData;

  return {
    data: filterData,
    isLoading,
    error: error ? new Error(error.message) : undefined,
  };
}
