import { useCustom } from "@refinedev/core";
import type { SubscriptionPlan } from "../../types/subscription.types";
import useApiUrl from "portal-shared/hooks/useApiUrl";

interface PlansResponse {
  plans: SubscriptionPlan[];
}

export function useSubscriptionPlans() {
  const apiUrl = useApiUrl();
  const {
    data: plansData,
    isLoading: plansAreLoading,
    refetch: refetchPlans,
  } = useCustom<PlansResponse>({
    url: `${apiUrl}/api/account/subscription/plans`,
    method: "get",
  });

  console.log("useSubscriptionPlans - raw response:", plansData);
  console.log("useSubscriptionPlans - plans array:", plansData?.data);

  return {
    plansData,
    plansAreLoading,
    refetchPlans,
  };
}
