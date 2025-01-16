import { useMemo } from 'react';
import { useList } from '@refinedev/core';

interface LocationEntry {
  code: string;
  name: string;
}

export function useLocationLists(form: UseFormReturn<BillingInfo>) {
  const country = form.watch('address.country');
  const state = form.watch('address.state');
  const useStateList = useMemo(
    () => () => 
      useList<LocationEntry>({
        resource: 'account/subscription/billing/states',
        filters: [
          { field: 'country', operator: 'eq', value: country }
        ]
      }),
    [country]
  );

  const useCityList = useMemo(
    () => () =>
      useList<LocationEntry>({
        resource: 'account/subscription/billing/cities',
        filters: [
          { field: 'country', operator: 'eq', value: country },
          { field: 'state', operator: 'eq', value: state }
        ]
      }),
    [country, state]
  );

  return {
    useStateList,
    useCityList
  };
}
