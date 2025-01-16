import { useCallback } from 'react';
import { useCustomMutation } from '@refinedev/core';
import { BillingInfo } from '../../types/billing.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

export function useBillingMutations() {
  const apiUrl = useApiUrl();
  const { mutate } = useCustomMutation();

  const updateBillingInfo = useCallback(
    async (billing: BillingInfo) => {
      return mutate({
        url: `${apiUrl}/api/account/subscription/billing`,
        method: 'put',
        values: billing
      });
    },
    [mutate, apiUrl]
  );

  return {
    updateBillingInfo
  };
}
