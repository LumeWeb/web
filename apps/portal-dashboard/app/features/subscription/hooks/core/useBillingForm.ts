import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BillingInfo } from '../../types/billing.types';
import { billingInfoSchema } from '../../types/billing.types';

type EntityCode = 'S' | 'C' | 'D' | 'X';

export function useBillingForm() {
  const [supportedEntities, setSupportedEntities] = useState<EntityCode[]>(['S', 'C']);
  const [initialValues, setInitialValues] = useState<BillingInfo | null>(null);

  const form = useForm<BillingInfo>({
    resolver: zodResolver(billingInfoSchema),
    defaultValues: {
      name: '',
      organization: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        dependent_locality: '',
        sorting_code: ''
      }
    }
  });

  const updateFormSchema = useCallback((entities: EntityCode[], requiredFields: EntityCode[]) => {
    // Update form validation schema based on country requirements
    const newSchema = billingInfoSchema;
    form.clearErrors();
  }, [form]);

  const hasFormChanges = useCallback(() => {
    if (!initialValues) return form.formState.isDirty;
    
    const currentValues = form.getValues();
    return JSON.stringify(currentValues) !== JSON.stringify(initialValues);
  }, [form, initialValues]);

  const initializeForm = useCallback((billing: BillingInfo) => {
    setInitialValues(billing);
    form.reset(billing);
  }, [form]);

  return {
    form,
    supportedEntities,
    setSupportedEntities,
    initialValues,
    setInitialValues,
    hasFormChanges,
    updateFormSchema,
    initializeForm
  };
}
