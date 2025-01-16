import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { SubscriptionError } from '../../types/subscription.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';
import { handleSubscriptionError } from '../../utils/errorHandling';

export function useCancelSubscriptionMutation() {
  const apiUrl = useApiUrl();

  return useMutation<void, SubscriptionError, void>({
    mutationFn: async () => {
      try {
        await axios.post(`${apiUrl}/api/account/subscription/cancel`);
      } catch (error) {
        throw handleSubscriptionError(error);
      }
    }
  });
}
