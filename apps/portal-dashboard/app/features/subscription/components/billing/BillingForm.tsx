import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBillingForm } from '../../hooks/useBillingForm';
import { useCountryData } from '../../hooks/useCountryData';
import { useLocationLists } from '../../hooks/useLocationLists';
import { BillingValidator } from './BillingValidator';
import { BillingFormField } from './BillingFormField';
import { BillingFormInput } from './BillingFormInput';
import { BillingAddressComboBox } from './BillingAddressComboBox';
import { Button } from 'portal-shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'portal-shared/components/ui/form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'portal-shared/components/ui/card';
import { useBilling } from '../../hooks/core/useBilling';
import { useBillingMutations } from '../../hooks/mutations/useBillingMutations';
import { BillingInfo } from '../../types/billing.types';

export function BillingForm() {
  const { validateBillingInfo } = useBilling();
  const { updateBillingInfo, isLoading, error } = useBillingMutations();
  const {
    form,
    supportedEntities,
    setSupportedEntities,
    initialValues,
    hasFormChanges,
    updateFormSchema,
    initializeForm
  } = useBillingForm();

  const {
    countryData,
    selectedCountry,
    selectedCountryData,
    handleCountryChange,
    useCountryList
  } = useCountryData(form);

  const { useStateList, useCityList } = useLocationLists(
    form.watch('country'),
    form.watch('state')
  );

  const handleStateChange = () => {
    form.setValue('city', '', { shouldDirty: true });
  };

  const onSubmit = async (data: BillingInfo) => {
    const errors = await validateBillingInfo(data);
    if (errors) {
      errors.forEach(error => {
        form.setError(error.field as any, {
          type: 'manual',
          message: error.message
        });
      });
      return;
    }

    try {
      await updateBillingInfo(data);
      form.reset(data);
    } catch (err) {
      console.error('Failed to update billing info:', err);
    }
  };

  useEffect(() => {
    if (!countryData || !selectedCountry || !selectedCountryData) return;
    
    const entities = selectedCountryData.supported_entities || ['C', 'S'];
    const requiredFields = selectedCountryData.required_fields || [];
    
    setSupportedEntities(entities);
    updateFormSchema(entities, requiredFields);
  }, [selectedCountry, selectedCountryData, countryData, updateFormSchema, setSupportedEntities]);

  return (
    <Card className="bg-secondary/20">
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BillingValidator billingInfo={form.getValues()} errors={error?.errors} />

            <BillingFormInput
              name="name"
              label="Name"
              form={form}
            />

            <BillingFormInput
              name="organization"
              label="Organization"
              form={form}
              optional
            />

            <BillingAddressComboBox
              name="country"
              control={form.control}
              label="Country"
              placeholder="Select Country"
              useList={useCountryList}
              onSelectionChange={handleCountryChange}
            />

            <BillingFormInput
              name="address_line1"
              label="Address Line 1"
              form={form}
            />

            <BillingFormInput
              name="address_line2"
              label="Address Line 2"
              form={form}
              optional
            />

            {Object.entries(fieldMapping).map(([key, fieldName]) => (
              <BillingFormField
                key={key}
                fieldName={fieldName}
                form={form}
                entityCode={key as EntityCode}
                supportedEntities={supportedEntities}
                useStateList={useStateList}
                useCityList={useCityList}
                handleStateChange={handleStateChange}
              />
            ))}

            <BillingFormInput
              name="postal_code"
              label="Postal Code"
              form={form}
            />

            <CardFooter className="px-0">
              <Button
                type="submit"
                className="ml-auto"
                disabled={isLoading || !hasFormChanges()}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
