import { useCallback } from 'react';
import { useCustomMutation } from '@refinedev/core';
import { PaymentInfo } from '../../types/payment.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

interface PaymentResponse {
  data: {
    payment: PaymentInfo;
  };
}

export function usePaymentMutations() {
  const apiUrl = useApiUrl();
  const { mutate: connectMutation, isLoading } = useCustomMutation<PaymentResponse>();

  const connectPaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      return await connectMutation({
        url: `${apiUrl}/api/account/subscription/connect`,
        method: 'post',
        values: { payment_method_id: paymentMethodId }
      });
    },
    [connectMutation, apiUrl]
  );

  return {
    connectPaymentMethod,
    isLoading
  };
}
