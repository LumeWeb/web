import { useCallback, useState } from 'react';
import { useCustomMutation, HttpError } from '@refinedev/core';
import { BillingInfo, BillingErrors } from '../../types/billing.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

interface BillingResponse {
  data: {
    billing: BillingInfo;
  };
}

interface BillingError extends HttpError {
  errors?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface UseBillingMutationsResult {
  updateBillingInfo: (billing: BillingInfo) => Promise<BillingResponse>;
  isLoading: boolean;
  error: BillingError | null;
}

export function useBillingMutations(): UseBillingMutationsResult {
  const apiUrl = useApiUrl();
  const { mutate, isLoading } = useCustomMutation<BillingResponse>();
  const [error, setError] = useState<BillingError | null>(null);

  const updateBillingInfo = useCallback(
    async (billing: BillingInfo) => {
      setError(null);
      try {
        return await mutate({
          url: `${apiUrl}/api/account/subscription/billing`,
          method: 'put',
          values: billing
        });
      } catch (err) {
        const error = err as BillingError;
        setError(error);
        throw error;
      }
    },
    [mutate, apiUrl]
  );

  return {
    updateBillingInfo,
    isLoading,
    error
  };
}
