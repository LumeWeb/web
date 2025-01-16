import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BillingInfo } from '../../types/billing.types';
import { BillingFormInput } from './BillingFormInput';
import { BillingAddressComboBox } from './BillingAddressComboBox';

type EntityCode = 'S' | 'C' | 'D' | 'X';

interface BillingFormFieldProps {
  fieldName: string;
  form: UseFormReturn<BillingInfo>;
  entityCode: EntityCode;
  supportedEntities: EntityCode[];
  useStateList: () => { value: string; label: string }[];
  useCityList: () => { value: string; label: string }[];
  handleStateChange: () => void;
}

export function BillingFormField({
  fieldName,
  form,
  entityCode,
  supportedEntities,
  useStateList,
  useCityList,
  handleStateChange
}: BillingFormFieldProps) {
  if (!supportedEntities.includes(entityCode)) {
    return null;
  }

  switch (fieldName) {
    case 'state':
      return (
        <BillingAddressComboBox
          name="state"
          control={form.control}
          label="State/Province"
          placeholder="Select State/Province"
          useList={useStateList}
          onSelectionChange={handleStateChange}
        />
      );
    case 'city':
      return (
        <BillingAddressComboBox
          name="city"
          control={form.control}
          label="City"
          placeholder="Select City"
          useList={useCityList}
        />
      );
    default:
      return (
        <BillingFormInput
          name={fieldName}
          label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace('_', ' ')}
          form={form}
        />
      );
  }
}
