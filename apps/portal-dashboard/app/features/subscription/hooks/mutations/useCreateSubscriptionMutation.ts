import { useCustomMutation } from '@refinedev/core';
import { SubscriptionPlan, Subscription, SubscriptionError } from '../../types/subscription.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

interface SubscriptionResponse {
  data: {
    subscription: Subscription;
  };
}

export function useCreateSubscriptionMutation() {
  const apiUrl = useApiUrl();
  
  const { mutate, isLoading } = useCustomMutation<SubscriptionResponse>();

  const mutateAsync = async (plan: SubscriptionPlan): Promise<SubscriptionResponse> => {
    return new Promise((resolve, reject) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription`,
          method: 'post',
          values: { plan_id: plan.id }
        },
        {
          onSuccess: (response) => {
            if (!response?.data) {
              reject(new Error('Invalid server response - missing data'));
              return;
            }
            resolve({ data: { subscription: response.data } });
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
