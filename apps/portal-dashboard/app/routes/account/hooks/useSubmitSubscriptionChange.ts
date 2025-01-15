import { HttpError, useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback } from "react";
import { SubscriptionPlan } from "portal-shared/dataProviders/accountProvider";
import useSubscription from "@/hooks/useSubscription.js";
import useApiUrl from "portal-shared/hooks/useApiUrl";

import { useSubscriptionContext } from "@/routes/account/contexts/SubscriptionContext.js";

export default function useSubmitSubscriptionChange(fromContext = false) {
  const apiUrl = useApiUrl();
  const { open } = useNotification();

  const subscription = fromContext ? useSubscription() : useSubscriptionContext();
  const { mutate, isLoading: isPlanChanging } = useCustomMutation();

  const submitPlanChange = useCallback(
    async (plan: SubscriptionPlan | undefined, paymentMethodId?: string) => {
      if (!plan?.id) {
        console.warn("Attempted to submit plan change with no plan selected");
        return;
      }
      
      const values: { plan_id: string; payment_method_id?: string } = {
        plan_id: plan.id,
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
            // Don't refetch immediately after plan change
            // Let the normal polling handle updates
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
    [mutate, open, subscription, apiUrl],
  );

  return {
    isPlanChanging,
    submitPlanChange,
  };
}
