import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useList } from '@refinedev/core';
import { BillingInfo } from '../../types/billing.types';

import { EntityCode } from '../../types/billing.types';

interface CountryData {
  code: string;
  name: string;
  supported_entities: EntityCode[];
  required_fields: EntityCode[];
}

export function useCountryData(form: UseFormReturn<BillingInfo>) {
  const { data: countryData } = useList<CountryData>({
    resource: 'account/subscription/billing/countries'
  });

  const selectedCountry = form.watch('address.country');
  const selectedCountryData = countryData?.data.find(
    (country) => country.code === selectedCountry
  );

  const handleCountryChange = useCallback((countryCode: string) => {
    // Reset state and city when country changes
    form.setValue('address.state', '', { shouldDirty: true });
    form.setValue('address.city', '', { shouldDirty: true });
    
    // Set the selected country
    form.setValue('address.country', countryCode, { shouldDirty: true });
  }, [form]);

  const useCountryList = useCallback(() => {
    return countryData?.data.map(country => ({
      value: country.code,
      label: country.name
    })) || [];
  }, [countryData]);

  return {
    countryData: countryData?.data,
    selectedCountry,
    selectedCountryData,
    handleCountryChange,
    useCountryList
  };
}
