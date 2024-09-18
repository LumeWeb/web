import { CustomResponse, HttpError, useCustom } from "@refinedev/core";
import type { SubscriptionResponse } from "@/dataProviders/accountProvider.js";
import useApiUrl from "@/hooks/useApiUrl.js";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

export default function useSubscription() {
  const apiUrl = useApiUrl();
  const {
    data: subscriptionData,
    isLoading: subscriptionIsLoading,
    isError: subscriptionIsError,
    refetch: refetchSubscription,
  } = useCustom<SubscriptionResponse>({
    url: `${apiUrl}/api/account/subscription`,
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

  return {
    subscriptionData: subscriptionData?.data,
    subscriptionIsLoading,
    refetchSubscription,
    subscriptionIsError,
  } satisfies {
    subscriptionData: SubscriptionResponse | undefined;
    subscriptionIsLoading: boolean;
    subscriptionIsError: boolean;
    refetchSubscription: <TPageData>(
      options?: RefetchOptions & RefetchQueryFilters<TPageData>,
    ) => Promise<
      QueryObserverResult<CustomResponse<SubscriptionResponse>, HttpError>
    >;
  };
}
