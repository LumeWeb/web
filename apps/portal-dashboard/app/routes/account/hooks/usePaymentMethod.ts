import {
  useCustomMutation,
  useNotification,
  BaseRecord,
} from "@refinedev/core";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import useApiUrl from "portal-shared/hooks/useApiUrl";
import { useSubscriptionContext } from "../contexts/SubscriptionContext";

interface PaymentSetupResponse extends BaseRecord {
  client_secret: string;
}

interface UpdatePaymentResponse extends BaseRecord {
  success: boolean;
}

interface UpdatePaymentPayload {
  payment_method_id: string;
}

export default function usePaymentMethod() {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { refetchSubscription } = useSubscriptionContext();

  const {
    data: paymentSetup,
    isLoading: isInitializing,
    refetch: initializePayment,
  } = useQuery({
    queryKey: ["payment-setup"],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/api/account/subscription/payment`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch payment setup");
      }
      return response.json() as Promise<PaymentSetupResponse>;
    },
    enabled: false,
  });

  const { mutate: savePayment, isLoading: isSaving } =
    useCustomMutation<UpdatePaymentResponse>();

  const savePaymentMethod = useCallback(
    async (paymentMethodId: string, onSuccess?: () => void) => {
      savePayment(
        {
          url: `${apiUrl}/api/account/subscription/payment`,
          method: "put",
          values: {
            payment_method_id: paymentMethodId,
          },
        },
        {
          onSuccess() {
            open?.({
              type: "success",
              message: "Payment method updated successfully",
            });
            refetchSubscription();
            onSuccess?.();
          },
          onError(error) {
            open?.({
              type: "error",
              message: `Failed to update payment method: ${error.message}`,
            });
          },
        },
      );
    },
    [savePayment, open, apiUrl, refetchSubscription],
  );

  return {
    clientSecret: paymentSetup?.client_secret,
    isInitializing,
    isSaving,
    initializePayment,
    savePaymentMethod,
  };
}
