import { CustomResponse, HttpError, useCustom } from "@refinedev/core";
import { SubscriptionResponse } from "portal-shared/dataProviders/accountProvider";
import useApiUrl from "portal-shared/hooks/useApiUrl";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

export default function useSubscription() {
  const apiUrl = useApiUrl();
  const {
    data: subscriptionData
  } = useCustom<SubscriptionResponse>({
    url: `${apiUrl}/api/account/subscription`,
    method: "get"
  });

  return {
    subscriptionData: subscriptionData?.data
  };
}
