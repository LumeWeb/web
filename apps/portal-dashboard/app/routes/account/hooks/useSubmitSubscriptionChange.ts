import { HttpError, useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback } from "react";
import { SubscriptionPlan } from "portal-shared/dataProviders/accountProvider";
import useSubscription from "@/hooks/useSubscription.js";
import useApiUrl from "portal-shared/hooks/useApiUrl";

import { useSubscriptionContext } from "@/routes/account/contexts/SubscriptionContext.js";

export default function useSubmitSubscriptionChange(fromContext = false) {
  const apiUrl = useApiUrl();
  const { open } = useNotification();

  const { refetchSubscription } = fromContext
    ? useSubscription()
    : useSubscriptionContext();

  const { mutate, isLoading: isPlanChanging } = useCustomMutation({
    onMutate: () => {
      // Validate we have a valid plan before mutation
      if (!plan?.id) {
        throw new Error("Cannot change to undefined plan");
      }
    }
  });

  const submitPlanChange = useCallback(
    async (plan: SubscriptionPlan | undefined, paymentMethodId?: string) => {
      if (!plan?.id) {
        console.warn("Attempted to submit plan change with no plan selected");
        return;
      }
      
      const values: { plan: string; payment_method_id?: string } = {
        plan: plan.id,
      };
      if (paymentMethodId) {
        values.payment_method_id = paymentMethodId;
      }

      mutate(
        {
          url: `${apiUrl}/api/account/subscription/plan`,
          method: "put",
          values,
        },
        {
          async onSuccess() {
            open?.({
              type: "success",
              message: "Subscription change initiated",
            });
            // Force refetch of subscription data
            await refetchSubscription();
          },
          onError(error: HttpError) {
            open?.({
              type: "error",
              message: `Failed to change subscription: ${error.message}`,
            });
          },
        },
      );
    },
    [mutate, open, refetchSubscription, apiUrl],
  );

  return {
    isPlanChanging,
    submitPlanChange,
  };
}
