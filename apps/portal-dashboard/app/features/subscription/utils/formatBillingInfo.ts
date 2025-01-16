import { BillingInfo } from '../types/billing.types';

export function formatBillingInfo(billing: BillingInfo): BillingInfo {
  return {
    name: billing.name.trim(),
    organization: billing.organization?.trim(),
    address: {
      line1: billing.address.line1.trim(),
      line2: billing.address.line2?.trim(),
      city: billing.address.city.trim(),
      state: billing.address.state.trim(),
      postal_code: billing.address.postal_code.trim(),
      country: billing.address.country.trim(),
      dependent_locality: billing.address.dependent_locality?.trim(),
      sorting_code: billing.address.sorting_code?.trim()
    }
  };
}
