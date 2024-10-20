import { useCustom } from "@refinedev/core";
import type { SubscriptionPlansResponse } from "portal-shared/dataProviders/accountProvider";
import useApiUrl from "portal-shared/hooks/useApiUrl";

export default function useSubscriptionPlans() {
  const apiUrl = useApiUrl();
  const { data: plansData, isLoading: plansAreLoading } =
    useCustom<SubscriptionPlansResponse>({
      url: `${apiUrl}/api/account/subscription/plans`,
      method: "get",
    });

  return { plansData, plansAreLoading };
}
