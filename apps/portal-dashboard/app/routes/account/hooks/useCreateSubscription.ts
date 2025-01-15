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

      return mutate(
        {
          url: `${apiUrl}/api/account/subscription`,
          method: "post",
          values,
        },
        {
          onSuccess() {
            open?.({
              type: "success",
              message: "Subscription created successfully",
            });
            if (refetchSubscription) {
              refetchSubscription();
            }
          },
          onError(error: HttpError) {
            open?.({
              type: "error",
              message: `Failed to create subscription: ${error.message}`,
            });
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
