import { useCustom } from "@refinedev/core";
import { SubscriptionResponse } from "../../types/subscription.types";
import useApiUrl from "portal-shared/hooks/useApiUrl";

export function useSubscription() {
  const apiUrl = useApiUrl();

  const { data, isLoading, refetch } = useCustom<SubscriptionResponse>({
    url: `${apiUrl}/api/account/subscription`,
    method: "get",
  });

  return {
    data,
    isLoading,
    refetch,
  };
}
