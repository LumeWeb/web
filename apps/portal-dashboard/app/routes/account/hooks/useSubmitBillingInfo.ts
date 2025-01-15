import { useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback } from "react";
import useApiUrl from "portal-shared/hooks/useApiUrl";
import useSubscription from "@/hooks/useSubscription.js";
import { AxiosError } from "axios";

interface Billing {
  name: string;
  email: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

interface BillingError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export type UpdateBillingErrors = Record<string, string>;

export default function useSubmitBillingInfo() {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { mutate, isLoading: isSubmitting } = useCustomMutation();
  const { refetchSubscription } = useSubscription();

  const submitBillingInfo = useCallback(
    async (billingInfo: Billing) => {
      return new Promise((resolve, reject) => {
        mutate(
          {
            url: `${apiUrl}/api/account/subscription/billing`,
            method: "put",
            values: billingInfo,
            errorNotification: false,
          },
          {
            onSuccess() {
              open?.({
                type: "success",
                message: "Billing info updated successfully",
              });
              refetchSubscription();
              resolve(null);
            },
            onError(error: AxiosError<UpdateBillingErrorResponse>) {
              if (error.response?.status === 400 && error.response.data) {
                const errorData = error.response.data as BillingError;
                if (errorData.details) {
                  reject(errorData.details);
                } else {
                  open?.({
                    type: "error",
                    message: errorData.message || "Invalid billing information",
                  });
                  reject(new Error(errorData.message));
                }
              } else {
                open?.({
                  type: "error",
                  message: `Failed to update billing info: ${error.message}`,
                });
                reject(error);
              }
            },
          },
        );
      });
    },
    [mutate, open, apiUrl, refetchSubscription],
  );

  return {
    isSubmitting,
    submitBillingInfo,
  };
}
