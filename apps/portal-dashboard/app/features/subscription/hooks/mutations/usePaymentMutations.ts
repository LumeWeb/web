import { useCallback, useState } from 'react';
import { useCustomMutation, HttpError } from '@refinedev/core';
import { PaymentInfo, PaymentError } from '../../types/payment.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

interface PaymentResponse {
  data: {
    payment: PaymentInfo;
  };
}

interface PaymentMutationError extends HttpError {
  errors?: PaymentError[];
}

export interface UsePaymentMutationsResult {
  connectPaymentMethod: (paymentMethodId: string) => Promise<PaymentResponse>;
  isLoading: boolean;
  error: PaymentMutationError | null;
}

export function usePaymentMutations(): UsePaymentMutationsResult {
  const apiUrl = useApiUrl();
  const { mutate: connectMutation, isLoading } = useCustomMutation<PaymentResponse>();
  const [error, setError] = useState<PaymentMutationError | null>(null);

  const connectPaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      setError(null);
      try {
        return await connectMutation({
          url: `${apiUrl}/api/account/subscription/connect`,
          method: 'post',
          values: { payment_method_id: paymentMethodId }
        });
      } catch (err) {
        const error = err as PaymentMutationError;
        setError(error);
        throw error;
      }
    },
    [connectMutation, apiUrl]
  );

  return {
    connectPaymentMethod,
    isLoading,
    error
  };
}
