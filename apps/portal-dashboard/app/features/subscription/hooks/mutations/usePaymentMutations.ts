import { useCallback } from 'react';
import { useCustomMutation } from '@refinedev/core';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

export function usePaymentMutations() {
  const apiUrl = useApiUrl();
  const { mutate: connectMutation } = useCustomMutation();

  const connectPaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      return connectMutation({
        url: `${apiUrl}/api/account/subscription/connect`,
        method: 'post',
        values: { payment_method_id: paymentMethodId }
      });
    },
    [connectMutation, apiUrl]
  );

  return {
    connectPaymentMethod
  };
}
