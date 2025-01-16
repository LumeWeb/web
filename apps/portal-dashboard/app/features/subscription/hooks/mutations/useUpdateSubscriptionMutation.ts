import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { SubscriptionPlan, Subscription, SubscriptionError } from '../../types/subscription.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';
import { handleSubscriptionError } from '../../utils/errorHandling';

interface SubscriptionResponse {
  subscription: Subscription;
}

export function useUpdateSubscriptionMutation() {
  const apiUrl = useApiUrl();

  return useMutation<SubscriptionResponse, SubscriptionError, SubscriptionPlan>({
    mutationFn: async (plan: SubscriptionPlan) => {
      try {
        const response = await axios.put(`${apiUrl}/api/account/subscription/plan`, {
          plan_id: plan.id
        });
        return response.data;
      } catch (error) {
        throw handleSubscriptionError(error);
      }
    }
  });
}
