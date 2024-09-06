import { HttpError, useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback } from "react";
import useApiUrl from "@/routes/account/hooks/useApiUrl";
import useSubscription from "@/routes/account/hooks/useSubscription.js";
import { SubscriptionBillingInfo } from "@/dataProviders/accountProvider.js";

export default function useSubmitBillingInfo() {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { mutate, isLoading: isSubmitting } = useCustomMutation();
  const { refetchSubscription } = useSubscription();

  const submitBillingInfo = useCallback(
    async (billingInfo: SubscriptionBillingInfo) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/billing`,
          method: "post",
          values: billingInfo,
        },
        {
          onSuccess() {
            open?.({
              type: "success",
              message: "Billing info updated successfully",
            });
            refetchSubscription();
          },
          onError(error: HttpError) {
            open?.({
              type: "error",
              message: `Failed to update billing info: ${error.message}`,
            });
          },
        },
      );
    },
    [mutate, open, apiUrl],
  );

  return {
    isSubmitting,
    submitBillingInfo,
  };
}
