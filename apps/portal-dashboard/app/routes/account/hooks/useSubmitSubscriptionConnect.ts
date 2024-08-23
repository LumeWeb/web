import { HttpError, useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback, useState } from "react";
import useApiUrl from "~/routes/account/hooks/useApiUrl";

import { useSubscriptionContext } from "~/routes/account/contexts/SubscriptionContext.js";

export default function useSubmitSubscriptionConnect() {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { mutate, isLoading: isSubmitting } = useCustomMutation();
  const { refetchSubscription } = useSubscriptionContext();

  const [onSuccess, setOnSuccess] = useState<() => void>(() => () => {});

  const connectPaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/connect`,
          method: "post",
          values: { payment_method_id: paymentMethodId },
        },
        {
          onSuccess() {
            open?.({
              type: "success",
              message: "Payment method connected successfully",
            });
            refetchSubscription?.();
            onSuccess();
          },
          onError(error: HttpError) {
            open?.({
              type: "error",
              message: `Failed to connect payment method: ${error.message}`,
            });
          },
        },
      );
    },
    [mutate, open, apiUrl],
  );

  return {
    isSubmitting,
    connectPaymentMethod,
    setConnectSuccessHandler: setOnSuccess,
  };
}
