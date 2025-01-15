import { HttpError, useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback } from "react";
import { SubscriptionPlan } from "portal-shared/dataProviders/accountProvider";
import useApiUrl from "portal-shared/hooks/useApiUrl";
import { useSubscriptionContext } from "../contexts/SubscriptionContext";

export default function useCreateSubscription() {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { mutate, isLoading: isCreating } = useCustomMutation();
  const { refetchSubscription } = useSubscriptionContext();

  const createSubscription = useCallback(
    async (plan: SubscriptionPlan, paymentMethodId?: string) => {
      const values: { plan: string; payment_method_id?: string } = {
        plan: plan.id,
      };
      if (paymentMethodId) {
        values.payment_method_id = paymentMethodId;
      }

      mutate(
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
            refetchSubscription();
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
