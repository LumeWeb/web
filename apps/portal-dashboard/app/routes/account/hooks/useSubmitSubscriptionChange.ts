import { HttpError, useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback } from "react";
import { SubscriptionPlan } from "portal-shared/dataProviders/accountProvider";
import useSubscription from "@/hooks/useSubscription.js";
import useApiUrl from "portal-shared/hooks/useApiUrl";

export default function useSubmitSubscriptionChange() {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { subscriptionData } = useSubscription();

  const { mutate, isLoading: isPlanChanging } = useCustomMutation();

  const submitPlanChange = useCallback(
    async (plan: SubscriptionPlan | undefined) => {
      if (!plan?.id) {
        console.warn("Attempted to submit plan change with no plan selected");
        return;
      }

      const values: { plan_id: string } = {
        plan_id: plan.id,
      };

      const isNewSubscription = !subscriptionData;
      const endpoint = isNewSubscription ? 
        `${apiUrl}/api/account/subscription` :
        `${apiUrl}/api/account/subscription/plan`;

      mutate(
        {
          url: endpoint,
          method: isNewSubscription ? "post" : "put",
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
    [mutate, open, apiUrl],
  );

  return {
    isPlanChanging,
    submitPlanChange,
  };
}
