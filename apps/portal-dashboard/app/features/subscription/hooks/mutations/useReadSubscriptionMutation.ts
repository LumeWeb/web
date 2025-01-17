import { useCustomMutation } from "@refinedev/core";
import { Subscription, SubscriptionResponse } from "../../types/subscription.types";
import useApiUrl from "portal-shared/hooks/useApiUrl";

export function useReadSubscriptionMutation() {
  const apiUrl = useApiUrl();
  
  const { mutate, isLoading } = useCustomMutation<SubscriptionResponse>();

  const mutateAsync = async (): Promise<SubscriptionResponse> => {
    return new Promise((resolve, reject) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription`,
          method: "get"
        },
        {
          onSuccess: (response) => {
            if (!response?.data) {
              reject(new Error("Invalid server response - missing subscription data"));
              return;
            }
            resolve(response);
          },
          onError: (error) => {
            reject(error);
          }
        }
      );
    });
  };

  return {
    mutateAsync,
    isLoading
  };
}
