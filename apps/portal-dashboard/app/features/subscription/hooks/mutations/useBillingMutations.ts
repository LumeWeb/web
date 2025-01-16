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
  updateBillingInfo: (billing: BillingInfo) => void;
  isLoading: boolean;
  error: BillingError | null;
  mutationResult?: BillingResponse;
}

export function useBillingMutations(): UseBillingMutationsResult {
  const apiUrl = useApiUrl();
  const [error, setError] = useState<BillingError | null>(null);
  const [mutationResult, setMutationResult] = useState<BillingResponse>();

  const { mutate, isLoading } = useCustomMutation<BillingResponse>();

  const updateBillingInfo = useCallback(
    (billing: BillingInfo) => {
      setError(null);
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/billing`,
          method: 'put',
          values: billing
        },
        {
          onSuccess: (response) => {
            setMutationResult(response);
          },
          onError: (err) => {
            const error = err as BillingError;
            setError(error);
          }
        }
      );
    },
    [mutate, apiUrl]
  );

  return {
    updateBillingInfo,
    isLoading,
    error,
    mutationResult
  };
}
