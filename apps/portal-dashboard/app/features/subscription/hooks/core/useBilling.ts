import { useCallback } from 'react';
import { BillingService } from '../../services/BillingService';
import { BillingInfo, BillingErrors } from '../../types/billing.types';
import { Address } from 'portal-shared/dataProviders/accountProvider';

export function useBilling() {
  const billingService = new BillingService();

  const validateAddress = useCallback(
    async (address: Address) => {
      return billingService.validateAddress(address);
    },
    [billingService]
  );

  const validateBillingInfo = useCallback(
    async (billing: BillingInfo) => {
      return billingService.validateBillingInfo(billing);
    },
    [billingService]
  );

  const formatBillingInfo = useCallback(
    async (billing: BillingInfo) => {
      return billingService.formatBillingInfo(billing);
    },
    [billingService]
  );

  const validateCountry = useCallback(
    async (countryCode: string) => {
      return billingService.validateCountry(countryCode);
    },
    [billingService]
  );

  const validatePostalCode = useCallback(
    async (postalCode: string, countryCode: string) => {
      return billingService.validatePostalCode(postalCode, countryCode);
    },
    [billingService]
  );

  return {
    validateAddress,
    validateBillingInfo,
    formatBillingInfo,
    validateCountry,
    validatePostalCode
  };
}
