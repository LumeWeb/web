import { HttpError, useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback, useState } from "react";
import useApiUrl from "~/routes/account/hooks/useApiUrl";

import { useSubscriptionContext } from "~/routes/account/contexts/SubscriptionContext.js";

export default function useSubmitSubscriptionCancellation() {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { mutate, isLoading: isSubmitting } = useCustomMutation();
  const { refetchSubscription } = useSubscriptionContext();

  const [onSuccess, setOnSuccess] = useState<() => void>(() => () => {});

  const cancelSubscription = useCallback(async () => {
    mutate(
      {
        url: `${apiUrl}/api/account/subscription/cancel`,
        method: "post",
        values: {},
      },
      {
        onSuccess() {
          open?.({
            type: "success",
            message: "Subscription cancelled successfully",
          });
          refetchSubscription?.();
          onSuccess();
        },
        onError(error: HttpError) {
          open?.({
            type: "error",
            message: `Failed to cancel subscription: ${error.message}`,
          });
        },
      },
    );
  }, [mutate, open, apiUrl]);

  return {
    isSubmitting,
    cancelSubscription: cancelSubscription,
    setCancelSuccessHandler: setOnSuccess,
  };
}
