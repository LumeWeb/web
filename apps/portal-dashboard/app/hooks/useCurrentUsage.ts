import { HttpError, useCustom } from "@refinedev/core";
import useApiUrl from "portal-shared/hooks/useApiUrl";

interface CurrentUsageData {
  storage: number;
  download: number;
  upload: number;
}

export type CurrentUsageHook = {
  upload: CurrentUsageData["upload"];
  download: CurrentUsageData["download"];
  storage: CurrentUsageData["storage"];
  isLoading: boolean;
  isError: boolean;
};

export function useCurrentUsage(): CurrentUsageHook {
  const apiUrl = useApiUrl();

  const { data, isLoading, isError, error } = useCustom<CurrentUsageData>({
    url: `${apiUrl}/api/account/usage/current`,
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
      upload: 0,
      download: 0,
      storage: 0,
      isLoading: false,
      isError: true,
    };
  }

  return {
    upload: data?.data.upload!,
    download: data?.data.download!,
    storage: data?.data.storage!,
    isLoading,
    isError,
  };
}
