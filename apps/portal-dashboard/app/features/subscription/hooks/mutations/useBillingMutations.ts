import { HttpError, useCustomMutation } from "@refinedev/core";
import { BillingInfo } from "../../types/billing.types";
import useApiUrl from "portal-shared/hooks/useApiUrl";

interface BillingResponse {
  billing: BillingInfo;
}

interface BillingError extends HttpError {
  errors?: {
    [key: string]:
      | string
      | boolean
      | string[]
      | { key: string; message: string };
  };
}

export interface UseBillingMutationsResult {
  updateBillingInfo: (billing: BillingInfo) => Promise<BillingResponse>;
  isLoading: boolean;
}

export function useBillingMutations(): UseBillingMutationsResult {
  const apiUrl = useApiUrl();
  const { mutate, isLoading } = useCustomMutation<BillingResponse>();

  const updateBillingInfo = async (billing: BillingInfo): Promise<BillingResponse> => {
    return new Promise((resolve, reject) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/billing`,
          method: "put",
          values: billing,
        },
        {
          onSuccess: (response) => {
            if (!response?.data?.billing) {
              reject(new Error("Invalid server response - missing billing data"));
              return;
            }
            resolve(response.data);
          },
          onError: (error: HttpError) => {
            const enhancedError = error as BillingError;
            if (enhancedError.errors) {
              // Transform detailed validation errors if present
              const messages = Object.entries(enhancedError.errors)
                .map(([field, error]) => {
                  const message = typeof error === 'string' ? error :
                    typeof error === 'object' && 'message' in error ? error.message :
                    Array.isArray(error) ? error.join(', ') :
                    'Invalid value';
                  return `${field}: ${message}`;
                })
                .join('\n');
              enhancedError.message = messages;
            }
            reject(enhancedError);
          },
        },
      );
    });
  };

  return {
    updateBillingInfo,
    isLoading,
  };
}
