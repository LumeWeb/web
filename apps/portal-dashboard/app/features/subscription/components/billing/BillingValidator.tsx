import React from 'react';
import { BillingInfo, BillingErrors } from '../../types/billing.types';
import { Alert, AlertDescription, AlertTitle } from 'portal-shared/components/ui/alert';
import { AlertCircle } from 'portal-shared/components/icons';

interface BillingValidatorProps {
  billingInfo: BillingInfo;
  errors: BillingErrors | null;
}

export function BillingValidator({ billingInfo, errors }: BillingValidatorProps) {
  if (!errors || errors.length === 0) return null;

  const getFieldErrors = (field: string) => {
    return errors.filter(error => error.field === field).map(error => error.message);
  };

  const renderErrors = (fieldName: string, label: string) => {
    const fieldErrors = getFieldErrors(fieldName);
    if (fieldErrors.length === 0) return null;

    return (
      <div key={fieldName} className="mb-2">
        <h4 className="font-medium">{label}</h4>
        <ul className="list-disc list-inside">
          {fieldErrors.map((error, index) => (
            <li key={index} className="text-sm">{error}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Invalid Billing Information</AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          {renderErrors('name', 'Name')}
          {renderErrors('organization', 'Organization')}
          {renderErrors('country', 'Country')}
          {renderErrors('address_line1', 'Address Line 1')}
          {renderErrors('address_line2', 'Address Line 2')}
          {renderErrors('city', 'City')}
          {renderErrors('state', 'State/Province')}
          {renderErrors('postal_code', 'Postal Code')}
          {renderErrors('dependent_locality', 'District/Ward')}
          {renderErrors('sorting_code', 'Sorting Code')}
          {renderErrors('general', 'General')}
        </div>
      </AlertDescription>
    </Alert>
  );
}
