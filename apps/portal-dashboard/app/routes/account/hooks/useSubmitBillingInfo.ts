import { useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback } from "react";
import useApiUrl from "@/hooks/useApiUrl.js";
import useSubscription from "@/hooks/useSubscription.js";
import { SubscriptionBillingInfo } from "portal-shared/dataProviders/accountProvider";
import { AxiosError } from "axios";

interface UpdateBillingErrorResponse {
  errors: UpdateBillingErrorResponseItem[];
}

interface UpdateBillingErrorResponseItem {
  field: string;
  message: string;
}

export type UpdateBillingErrors = Record<string, string>;

export default function useSubmitBillingInfo() {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { mutate, isLoading: isSubmitting } = useCustomMutation();
  const { refetchSubscription } = useSubscription();

  const submitBillingInfo = useCallback(
    async (billingInfo: SubscriptionBillingInfo) => {
      return new Promise((resolve, reject) => {
        mutate(
          {
            url: `${apiUrl}/api/account/subscription/billing`,
            method: "post",
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
                const errorData = error.response.data;
                if (errorData.errors && Array.isArray(errorData.errors)) {
                  const formattedErrors =
                    errorData.errors.reduce<UpdateBillingErrors>((acc, err) => {
                      acc[err.field] = err.message;
                      return acc;
                    }, {});
                  reject(formattedErrors);
                } else {
                  open?.({
                    type: "error",
                    message: "Unexpected error format from server",
                  });
                  reject(new Error("Unexpected error format"));
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
