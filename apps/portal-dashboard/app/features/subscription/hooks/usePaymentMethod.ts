import { useCallback, useState } from 'react';
import { useCustomMutation, useNotification } from '@refinedev/core';
import useApiUrl from 'portal-shared/hooks/useApiUrl';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';

export function usePaymentMethod() {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { refetchSubscription } = useSubscriptionContext();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { mutate: setupMutate, isLoading: isInitializing } = useCustomMutation();
  const { mutate: saveMutate, isLoading: isSaving } = useCustomMutation();

  const initializePayment = useCallback(async () => {
    try {
      const result = await setupMutate({
        url: `${apiUrl}/api/account/subscription/payment/setup`,
        method: 'post'
      });
      
      if (result?.data?.client_secret) {
        setClientSecret(result.data.client_secret);
      }
    } catch (error) {
      open?.({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to initialize payment setup'
      });
    }
  }, [setupMutate, open, apiUrl]);

  const savePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      await saveMutate({
        url: `${apiUrl}/api/account/subscription/payment`,
        method: 'put',
        values: { payment_method_id: paymentMethodId }
      });

      open?.({
        type: 'success',
        message: 'Payment method updated successfully'
      });

      setClientSecret(null);
      refetchSubscription();
    } catch (error) {
      open?.({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save payment method'
      });
    }
  }, [saveMutate, open, apiUrl, refetchSubscription]);

  return {
    clientSecret,
    isInitializing,
    isSaving,
    initializePayment,
    savePaymentMethod
  };
}
