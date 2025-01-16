import { HttpError, useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback } from "react";
import { SubscriptionPlan } from "portal-shared/dataProviders/accountProvider";
import useApiUrl from "portal-shared/hooks/useApiUrl";
export default function useCreateSubscription(refetchSubscription?: () => Promise<any>) {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { mutate, isLoading: isCreating } = useCustomMutation();

  const createSubscription = useCallback(
    async (plan: SubscriptionPlan) => {
      const values: { plan_id: string } = {
        plan_id: plan.id,
      };

      return await mutate(
        {
          url: `${apiUrl}/api/account/subscription`,
          method: "post",
          values,
        },
        {
          onSuccess(data) {
            return data;
          },
          onError(error: HttpError) {
            throw error;
          },
        },
      );
    },
    [mutate, open, apiUrl, refetchSubscription],
  );

  return {
    isCreating,
    createSubscription,
  };
}
