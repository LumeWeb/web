import { CustomResponse, HttpError, useCustom } from "@refinedev/core";
import type { SubscriptionResponse } from "~/dataProviders/accountProvider";
import useApiUrl from "~/routes/account/hooks/useApiUrl";
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
    refetch: refetchSubscription,
  } = useCustom<SubscriptionResponse>({
    url: `${apiUrl}/api/account/subscription`,
    method: "get",
  });

  return {
    subscriptionData: subscriptionData?.data,
    subscriptionIsLoading,
    refetchSubscription,
  } satisfies {
    subscriptionData: SubscriptionResponse | undefined;
    subscriptionIsLoading: boolean;
    refetchSubscription: <TPageData>(
      options?: RefetchOptions & RefetchQueryFilters<TPageData>,
    ) => Promise<
      QueryObserverResult<CustomResponse<SubscriptionResponse>, HttpError>
    >;
  };
}
