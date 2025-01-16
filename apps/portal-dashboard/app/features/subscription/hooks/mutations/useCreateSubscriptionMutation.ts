import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { SubscriptionPlan } from '../../types/subscription.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';
import { handleSubscriptionError } from '../../utils/errorHandling';

export function useCreateSubscriptionMutation() {
  const apiUrl = useApiUrl();
  
  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      try {
        const response = await axios.post(`${apiUrl}/api/account/subscription`, {
          plan_id: plan.id
        });
        
        if (!response.data?.subscription) {
          throw new Error('Invalid server response - missing subscription data');
        }
        
        return response.data;
      } catch (error) {
        throw handleSubscriptionError(error);
      }
    }
  });
}
