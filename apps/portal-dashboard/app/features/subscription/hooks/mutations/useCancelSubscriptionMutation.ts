import { useCustomMutation } from '@refinedev/core';
import { SubscriptionError } from '../../types/subscription.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

export function useCancelSubscriptionMutation() {
  const apiUrl = useApiUrl();

  const { mutate, isLoading } = useCustomMutation();

  const mutateAsync = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/cancel`,
          method: 'post'
        },
        {
          onSuccess: () => {
            resolve();
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
