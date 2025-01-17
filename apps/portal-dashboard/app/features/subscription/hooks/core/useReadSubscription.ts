import { useCustom } from "@refinedev/core";
import { SubscriptionResponse } from "../../types/subscription.types";
import useApiUrl from "portal-shared/hooks/useApiUrl";

export function useReadSubscription() {
  const apiUrl = useApiUrl();

  const { data, isLoading } = useCustom<SubscriptionResponse>({
    url: `${apiUrl}/api/account/subscription`,
    method: "get",
  });

  return {
    data,
    isLoading,
  };
}
