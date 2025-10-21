import { useCustomMutation, type HttpError } from "@refinedev/core";
import type { CustomerPortalResponse } from "@/types/subscription";
import type { UseCustomMutationProps } from "@refinedev/core";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

interface UseCustomerPortalConfig {
  return_url?: string;
  mutationOptions?: UseCustomMutationProps<
    CustomerPortalResponse,
    HttpError,
    unknown
  >["mutationOptions"];
}

interface UseCustomerPortalResult {
  mutate: () => void;
  isLoading: boolean;
  data?: CustomerPortalResponse;
  error?: HttpError | null;
}

export function useCustomerPortal(
  config: UseCustomerPortalConfig = {},
): UseCustomerPortalResult {
  const { return_url, mutationOptions } = config;

  const mutation = useCustomMutation<CustomerPortalResponse>({
    mutationOptions,
  });

  const mutate = () => {
    mutation.mutate({
      url: "/account/billing/customer-portal",
      method: "post",
      values: {
        return_url,
      },
      dataProviderName: DATA_PROVIDER_NAME,
    });
  };

  return {
    mutate,
    isLoading: mutation.isLoading,
    data: mutation.data?.data,
    error: mutation.error,
  };
}
