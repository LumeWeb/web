import { useCallback, useState } from 'react';
import { useCustom } from '@refinedev/core';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'succeeded' | 'failed';
}

interface PaymentHistoryResponse {
  payments: Payment[];
}

export function usePaymentHistory() {
  const apiUrl = useApiUrl();
  
  const { data, isLoading, refetch } = useCustom<PaymentHistoryResponse>({
    url: `${apiUrl}/api/account/subscription/payments`,
    method: 'get'
  });

  return {
    payments: data?.payments,
    isLoading,
    refetch
  };
}
