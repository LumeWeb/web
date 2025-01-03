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

  const { mutate, isLoading: isPlanChanging } = useCustomMutation();

  const submitPlanChange = //useCallback(
    async (plan: SubscriptionPlan, paymentMethodId?: string) => {
      const values: { plan: string; payment_method_id?: string } = {
        plan: plan.identifier,
      };
      if (paymentMethodId) {
        values.payment_method_id = paymentMethodId;
      }

      mutate(
        {
          url: `${apiUrl}/api/account/subscription/change`,
          method: "post",
          values,
        },
        {
          async onSuccess() {
            open?.({
              type: "success",
              message: "Subscription change initiated",
            });
            // Force refetch of subscription data
            refetchSubscription();
          },
          onError(error: HttpError) {
            open?.({
              type: "error",
              message: `Failed to change subscription: ${error.message}`,
            });
          },
        },
      );
    }; /*,
    [mutate, open, refetchSubscription, apiUrl],
  );*/

  return {
    isPlanChanging,
    submitPlanChange,
  };
}
