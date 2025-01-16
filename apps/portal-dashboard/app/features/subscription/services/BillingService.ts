import { BillingInfo, BillingErrors } from "../types/billing.types";
import { Address } from "portal-shared/dataProviders/accountProvider";

export class BillingService {
  public async validateAddress(address: Address): Promise<BillingErrors | null> {
    const errors: BillingErrors = [];

    // Basic validation
    if (!address.line1?.trim()) {
      errors.push({ field: 'line1', message: 'Address line 1 is required' });
    }
    if (!address.city?.trim()) {
      errors.push({ field: 'city', message: 'City is required' });
    }
    if (!address.state?.trim()) {
      errors.push({ field: 'state', message: 'State is required' });
    }
    if (!address.postal_code?.trim()) {
      errors.push({ field: 'postal_code', message: 'Postal code is required' });
    }
    if (!address.country?.trim()) {
      errors.push({ field: 'country', message: 'Country is required' });
    }

    return errors.length > 0 ? errors : null;
  }

  public async validateBillingInfo(billing: BillingInfo): Promise<BillingErrors | null> {
    const errors: BillingErrors = [];

    // Basic validation
    if (!billing.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    // Validate address
    const addressErrors = await this.validateAddress(billing.address);
    if (addressErrors) {
      errors.push(...addressErrors);
    }

    return errors.length > 0 ? errors : null;
  }

  public async formatBillingInfo(billing: BillingInfo): Promise<BillingInfo> {
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
}
