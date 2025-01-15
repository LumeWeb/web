import { useCustom } from "@refinedev/core";
import { SubscriptionResponse } from "portal-shared/dataProviders/accountProvider";
import useApiUrl from "portal-shared/hooks/useApiUrl";

export default function useSubscription() {
  const apiUrl = useApiUrl();
  const { data: subscriptionData } = useCustom<SubscriptionResponse>({
    url: `${apiUrl}/api/account/subscription`,
    method: "get",
  });

  return {
    subscriptionData: subscriptionData?.data,
  };
}
