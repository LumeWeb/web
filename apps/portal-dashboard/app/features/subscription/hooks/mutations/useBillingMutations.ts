import { useCallback, useState } from 'react';
import { useCustomMutation, HttpError } from '@refinedev/core';
import { BillingInfo, BillingErrors } from '../../types/billing.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

interface BillingResponse {
  data: {
    data: {
      billing: BillingInfo;
    };
  };
}

interface BillingError extends HttpError {
  errors?: {
    [key: string]: string | boolean | string[] | { key: string; message: string; };
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
            if (response?.data?.data?.billing) {
              setMutationResult({
                data: {
                  data: {
                    billing: response.data.data.billing
                  }
                }
              });
            }
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
