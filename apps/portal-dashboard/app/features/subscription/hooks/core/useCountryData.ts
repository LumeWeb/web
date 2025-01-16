import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useList } from '@refinedev/core';
import { BillingInfo } from '../../types/billing.types';

interface CountryData {
  code: string;
  name: string;
  supported_entities: string[];
  required_fields: string[];
}

export function useCountryData(form: UseFormReturn<BillingInfo>) {
  const { data: countryData } = useList<CountryData>({
    resource: 'account/subscription/billing/countries'
  });

  const selectedCountry = form.watch('address.country');
  const selectedCountryData = countryData?.data.find(
    (country) => country.code === selectedCountry
  );

  const handleCountryChange = useCallback(() => {
    form.setValue('address.state', '', { shouldDirty: true });
    form.setValue('address.city', '', { shouldDirty: true });
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
