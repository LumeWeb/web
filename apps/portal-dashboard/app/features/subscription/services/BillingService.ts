import { BillingInfo, BillingErrors } from "../types/billing.types";
import { Address } from "portal-shared/dataProviders/accountProvider";

export class BillingService {
  public async validateAddress(address: Address): Promise<BillingErrors | null> {
    const errors: BillingErrors = [];
    
    if (!address) {
      errors.push({ field: 'general', message: 'Address is required' });
      return errors;
    }

    try {
      // Validate country
      const countryData = await this.getCountryData(address.country);
      if (!countryData) {
        errors.push({ field: 'country', message: 'Invalid country code' });
        return errors;
      }

      // Required fields validation
      const requiredFields = this.getRequiredFields(countryData);
      requiredFields.forEach(field => {
        const value = this.getAddressField(address, field);
        if (!value?.trim()) {
          errors.push({ 
            field: field.toLowerCase(), 
            message: `${field} is required for ${countryData.Name}` 
          });
        }
      });

      // Postal code validation
      if (address.postal_code) {
        const postalErrors = await this.validatePostalCode(
          address.postal_code, 
          address.country,
          countryData
        );
        if (postalErrors) errors.push(...postalErrors);
      }

      // State/Province validation
      if (address.state) {
        const stateErrors = await this.validateState(
          address.state, 
          address.country,
          countryData
        );
        if (stateErrors) errors.push(...stateErrors);
      }

      // City validation if country has city list
      if (address.city && countryData.AdministrativeAreas) {
        const cityErrors = await this.validateCity(
          address.city,
          address.state,
          countryData
        );
        if (cityErrors) errors.push(...cityErrors);
      }

    } catch (error) {
      console.error('Address validation error:', error);
      errors.push({ 
        field: 'general', 
        message: error instanceof Error ? error.message : 'Address validation failed' 
      });
    }

    return errors.length > 0 ? errors : null;
  }

  private async getCountryData(countryCode: string) {
    try {
      return await address.GetCountry(countryCode);
    } catch (error) {
      console.error('Error fetching country data:', error);
      return null;
    }
  }

  private getRequiredFields(countryData: any): string[] {
    return countryData.Required || [];
  }

  private getAddressField(address: Address, field: string): string | undefined {
    return address[field.toLowerCase() as keyof Address];
  }

  public async validateBillingInfo(billing: BillingInfo): Promise<BillingErrors | null> {
    try {
      const errors: BillingErrors = [];

      // Validate required fields
      if (!billing) {
        errors.push({ field: 'general', message: 'Billing information is required' });
        return errors;
      }

      // Name validation
      if (!billing.name?.trim()) {
        errors.push({ field: 'name', message: 'Name is required' });
      } else if (billing.name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
      } else if (billing.name.trim().length > 100) {
        errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
      }

      // Organization validation (optional)
      if (billing.organization && billing.organization.trim().length > 100) {
        errors.push({ field: 'organization', message: 'Organization must not exceed 100 characters' });
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

  public async validatePostalCode(postalCode: string, countryCode: string): Promise<boolean> {
    // Basic postal code validation per country
    const postalCodePatterns: Record<string, RegExp> = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
      GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/,
      // Add more country patterns as needed
    };

    const pattern = postalCodePatterns[countryCode];
    if (!pattern) return true; // Skip validation if country pattern not defined
    
    return pattern.test(postalCode);
  }

  public async validateStateForCountry(state: string, countryCode: string): Promise<boolean> {
    // Implement state/province validation logic per country
    // This would typically involve checking against a list of valid states for each country
    return true; // Placeholder - implement actual validation
  }
}
