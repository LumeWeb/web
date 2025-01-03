import { HttpError, useCustom } from "@refinedev/core";
import useApiUrl from "portal-shared/hooks/useApiUrl";

type UsageType = "upload" | "download" | "storage";

export interface UsageData {
  date: string; // ISO 8601 date string
  usage: number;
}

export function useUsageHistory(type: UsageType) {
  const apiUrl = useApiUrl();

  const { data, isLoading, isError, error } = useCustom<UsageData[]>({
    url: `${apiUrl}/api/account/usage/history/${type}`,
    method: "get",
    queryOptions: {
      retry: (failureCount, error) => {
        if ((error as HttpError)?.statusCode === 404) {
          return false;
        }
        return failureCount < 3;
      },
    },
  });

  if ((error as HttpError)?.statusCode === 404) {
    return {
      usageHistory: [],
      isLoading: false,
      isError: false,
    };
  }

  const processedData = data?.data ?? [];

  return {
    usageHistory: processedData,
    isLoading,
    isError,
  };
}
