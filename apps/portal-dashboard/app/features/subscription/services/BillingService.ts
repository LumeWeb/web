import { BillingInfo, BillingErrors } from "../types/billing.types";
import { Address } from "portal-shared/dataProviders/accountProvider";

export class BillingService {
  public async validateAddress(address: Address): Promise<BillingErrors | null> {
    const errors: BillingErrors = [];
    
    try {
      const countryData = address.GetCountry(address.country);
      if (!countryData) {
        errors.push({ field: 'country', message: 'Invalid country code' });
        return errors;
      }

      // Validate required fields based on country
      countryData.Required.forEach(field => {
        const value = address[field.toLowerCase()];
        if (!value?.trim()) {
          errors.push({ field: field.toLowerCase(), message: `${field} is required for ${countryData.Name}` });
        }
      });

      // Validate postal code format if country has specific rules
      if (address.postal_code && countryData.PostCodeRegex.Regex) {
        const regex = new RegExp(countryData.PostCodeRegex.Regex);
        if (!regex.test(address.postal_code)) {
          errors.push({ field: 'postal_code', message: 'Invalid postal code format' });
        }
      }

      // Validate state/province if country has subdivisions
      if (address.state && countryData.AdministrativeAreas) {
        const validState = Object.values(countryData.AdministrativeAreas).some(
          areas => areas.some(area => area.ID === address.state)
        );
        if (!validState) {
          errors.push({ field: 'state', message: 'Invalid state/province' });
        }
      }

    } catch (error) {
      errors.push({ field: 'general', message: 'Address validation failed' });
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
