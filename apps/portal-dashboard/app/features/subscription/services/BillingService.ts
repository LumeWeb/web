import { BillingInfo, BillingErrors } from "../types/billing.types";
import { Address } from "portal-shared/dataProviders/accountProvider";

export class BillingService {
  public async validateAddress(address: Address): Promise<BillingErrors | null> {
    const errors: BillingErrors = [];
    
    if (!address) {
      errors.push({ field: 'general', message: 'Address is required' });
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

  private validateAddressField(value: string | undefined, fieldName: string): BillingErrors | null {
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
        errors.push({ field: 'general', message: 'Billing information is required' });
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
        field: 'general',
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

  public async validateCountry(countryCode: string): Promise<boolean> {
    return /^[A-Z]{2}$/.test(countryCode);
  }

  public async validatePostalCode(postalCode: string, countryCode: string): Promise<BillingErrors | null> {
    if (!postalCode || !countryCode) {
      return [{
        field: 'postal_code',
        message: 'Postal code and country code are required'
      }];
    }

    try {
      const countryData = await this.getCountryData(countryCode);
      
      // Check if postal code is required for this country
      const isRequired = countryData.Required.includes('POSTAL_CODE');
      if (!isRequired && !postalCode) {
        return null;
      }

      const regex = new RegExp(countryData.PostCodeRegex.Regex, 'i');
      if (!regex.test(postalCode)) {
        return [{
          field: 'postal_code',
          message: `Invalid postal code format for ${countryData.Name}`
        }];
      }

      // Check subdivision-specific regex if available
      if (countryData.PostCodeRegex.SubdivisionRegex) {
        const subdivisionRegex = countryData.PostCodeRegex.SubdivisionRegex[countryData.DefaultLanguage];
        if (subdivisionRegex && !new RegExp(subdivisionRegex.Regex, 'i').test(postalCode)) {
          return [{
            field: 'postal_code',
            message: `Invalid postal code format for this region`
          }];
        }
      }

      return null;
    } catch (error) {
      console.error('Postal code validation error:', error);
      return [{
        field: 'postal_code',
        message: error instanceof Error ? error.message : 'Invalid postal code'
      }];
    }
  }

  public async validateState(state: string, countryCode: string, countryData: any): Promise<BillingErrors | null> {
    try {
      const adminArea = countryData.AdministrativeAreas[countryData.DefaultLanguage]?.find(
        (area: any) => area.ID === state
      );

      if (!adminArea) {
        return [{
          field: 'state',
          message: `Invalid state/province for ${countryData.Name}`
        }];
      }

      return null;
    } catch (error) {
      console.error('State validation error:', error);
      return [{
        field: 'state',
        message: error instanceof Error ? error.message : 'Invalid state/province'
      }];
    }
  }
}
