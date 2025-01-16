import { useCustomMutation } from '@refinedev/core';
import { SubscriptionPlan, Subscription, SubscriptionError } from '../../types/subscription.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

interface SubscriptionResponse {
  data: {
    subscription: Subscription;
  };
}

export function useUpdateSubscriptionMutation() {
  const apiUrl = useApiUrl();

  const { mutate, isLoading } = useCustomMutation<SubscriptionResponse>();

  const mutateAsync = async (plan: SubscriptionPlan): Promise<SubscriptionResponse> => {
    return new Promise((resolve, reject) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/plan`,
          method: 'put',
          values: { plan_id: plan.id }
        },
        {
          onSuccess: (response) => {
            if (!response?.data?.subscription) {
              reject(new Error('Invalid server response - missing subscription data'));
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
