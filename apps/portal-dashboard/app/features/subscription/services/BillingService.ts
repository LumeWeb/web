import { BillingInfo, BillingErrors } from "../types/billing.types";
import { Address } from "portal-shared/dataProviders/accountProvider";
import { formatBillingInfo } from "../utils/formatBillingInfo";

export class BillingService {
  public async validateAddress(address: Address): Promise<BillingErrors | null> {
    const errors: BillingErrors = [];
    
    if (!address) {
      errors.push({ field: 'address', message: 'Address is required' });
      return errors;
    }

    // Basic required field validation
    const line1Errors = this.validateAddressField(address.line1, 'line1');
    const cityErrors = this.validateAddressField(address.city, 'city');
    const stateErrors = this.validateAddressField(address.state, 'state');
    const postalCodeErrors = this.validateAddressField(address.postal_code, 'postal_code');
    const countryErrors = this.validateAddressField(address.country, 'country');

    if (line1Errors) errors.push(...line1Errors);
    if (cityErrors) errors.push(...cityErrors);
    if (stateErrors) errors.push(...stateErrors);
    if (postalCodeErrors) errors.push(...postalCodeErrors);
    if (countryErrors) errors.push(...countryErrors);

    return errors.length > 0 ? errors : null;
  }

  private validateAddressField(value: string | undefined, fieldName: keyof Address): BillingErrors | null {
    if (!value?.trim()) {
      return [{
        field: fieldName,
        message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
      }];
    }
    return null;
  }

  public async validateBillingInfo(billing: BillingInfo): Promise<BillingErrors | null> {
    try {
      const errors: BillingErrors = [];

      // Validate required fields
      if (!billing) {
        errors.push({ field: 'name', message: 'Billing information is required' });
        return errors;
      }

      // Basic field validation
      if (!this.validateBasicFields(billing, errors)) {
        return errors;
      }

      // Address validation
      if (!billing.address) {
        errors.push({ field: 'address', message: 'Address is required' });
      } else {
        const addressErrors = await this.validateAddress(billing.address);
        if (addressErrors) {
          errors.push(...addressErrors);
        }
      }

      return errors.length > 0 ? errors : null;
    } catch (error) {
      console.error('Billing validation error:', error);
      return [{
        field: 'name',
        message: error instanceof Error ? error.message : 'Billing validation failed'
      }];
    }
  }

  private validateBasicFields(billing: BillingInfo, errors: BillingErrors): boolean {
    let isValid = true;

    // Name validation
    if (!billing.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
      isValid = false;
    } else if (billing.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
      isValid = false;
    } else if (billing.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
      isValid = false;
    }

    // Organization validation (optional)
    if (billing.organization && billing.organization.trim().length > 100) {
      errors.push({ field: 'organization', message: 'Organization must not exceed 100 characters' });
      isValid = false;
    }

    return isValid;
  }

  public formatBillingInfo(billing: BillingInfo) {
    return formatBillingInfo(billing);
  }

  public async validateCountry(countryCode: string): Promise<boolean> {
    return /^[A-Z]{2}$/.test(countryCode);
  }

  public async validatePostalCode(postalCode: string, countryCode: string): Promise<BillingErrors | null> {
    const errors: BillingErrors = [];

    if (!postalCode?.trim()) {
      errors.push({
        field: 'postal_code',
        message: 'Postal code is required'
      });
    }

    // Add country-specific postal code validation
    switch (countryCode) {
      case 'US':
        if (!/^\d{5}(-\d{4})?$/.test(postalCode)) {
          errors.push({
            field: 'postal_code',
            message: 'Invalid US postal code format (e.g., 12345 or 12345-6789)'
          });
        }
        break;
      case 'CA':
        if (!/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(postalCode.toUpperCase())) {
          errors.push({
            field: 'postal_code',
            message: 'Invalid Canadian postal code format (e.g., A1A 1A1)'
          });
        }
        break;
      // Add more country-specific validations as needed
    }

    return errors.length > 0 ? errors : null;
  }

  public async validateState(state: string): Promise<BillingErrors | null> {
    if (!state?.trim()) {
      return [{
        field: 'state',
        message: 'State is required'
      }];
    }
    return null;
  }
}
