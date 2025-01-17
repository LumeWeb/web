import { useMemo } from 'react';
import { useList } from '@refinedev/core';
import { UseFormReturn } from 'react-hook-form';
import { BillingInfo } from '../../types/billing.types';

interface LocationEntry {
  code: string;
  name: string;
}

export function useLocationLists(form: UseFormReturn<BillingInfo>) {
  const country = form.watch('address.country');
  const state = form.watch('address.state');
  const useStateList = useMemo(
    () => () => {
      const { data } = useList<LocationEntry>({
        resource: 'account/subscription/billing/states',
        filters: [
          { field: 'country', operator: 'eq', value: country }
        ]
      });
      return data?.data.map(item => ({
        value: item.code,
        label: item.name
      })) || [];
    },
    [country]
  );

  const useCityList = useMemo(
    () => () => {
      const { data } = useList<LocationEntry>({
        resource: 'account/subscription/billing/cities',
        filters: [
          { field: 'country', operator: 'eq', value: country },
          { field: 'state', operator: 'eq', value: state }
        ]
      });
      return data?.data.map(item => ({
        value: item.code,
        label: item.name
      })) || [];
    },
    [country, state]
  );

  return {
    useStateList,
    useCityList
  };
}
