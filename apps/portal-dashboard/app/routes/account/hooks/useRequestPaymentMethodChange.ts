import { useCustomMutation } from "@refinedev/core";
import useApiUrl from "portal-shared/hooks/useApiUrl";
import { useCallback, useState } from "react";

interface RequestPaymentMethodChangeResponse {
  client_secret: string;
}

export default function useRequestPaymentMethodChange() {
  const apiUrl = useApiUrl();
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { mutateAsync } =
    useCustomMutation<RequestPaymentMethodChangeResponse>();

  const requestPaymentMethodChange = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await mutateAsync({
        url: `${apiUrl}/api/account/subscription/request-payment-method-change`,
        method: "post",
        values: {},
      });
      setClientSecret(data.client_secret);
    } catch (error) {
      console.error("Failed to request payment method change:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutateAsync, apiUrl]);

  return {
    requestPaymentMethodChange,
    clientSecret,
    isLoading,
  };
}
