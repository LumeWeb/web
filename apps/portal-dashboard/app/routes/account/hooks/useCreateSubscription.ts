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

      const result = await mutate(
        {
          url: `${apiUrl}/api/account/subscription`,
          method: "post",
          values,
        },
        {
          async onSuccess(data) {
            console.log('Subscription created:', {
              response: data,
              hasClientSecret: !!data.data?.payment?.client_secret,
              clientSecret: data.data?.payment?.client_secret,
              status: data.data?.status,
              planId: data.data?.plan?.id
            });
            open?.({
              type: "success",
              message: "Subscription created successfully",
            });
          },
          onError(error: HttpError) {
            console.error('Failed to create subscription:', error);
            open?.({
              type: "error",
              message: `Failed to create subscription: ${error.message}`,
            });
          },
        },
      );
      return result;
    },
    [mutate, open, apiUrl, refetchSubscription],
  );

  return {
    isCreating,
    createSubscription,
  };
}
