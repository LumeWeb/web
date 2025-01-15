import { z } from "zod";

// Base schema for required fields
const baseSchema = {
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  organization: z
    .string()
    .max(100, "Organization must not exceed 100 characters")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(56, "Country must not exceed 56 characters"),
  address_line1: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address line 1 must not exceed 100 characters"),
  address_line2: z
    .string()
    .max(100, "Address line 2 must not exceed 100 characters")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  postal_code: z
    .string()
    .min(3, "Postal code must be at least 3 characters")
    .max(20, "Postal code must not exceed 20 characters"),
};

// Additional fields that may be required based on country
const conditionalFields = {
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must not exceed 100 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must not exceed 50 characters"),
  dependent_locality: z
    .string()
    .min(2, "Dependent locality must be at least 2 characters")
    .max(100, "Dependent locality must not exceed 100 characters"),
  sorting_code: z
    .string()
    .min(2, "Sorting code must be at least 2 characters")
    .max(20, "Sorting code must not exceed 20 characters"),
};

// Entity codes for different address fields
export type EntityCode = "C" | "S" | "D" | "X";

// Field names that correspond to entity codes
export type FieldName = keyof typeof conditionalFields;

// Mapping between entity codes and field names
export const fieldMapping: Record<EntityCode, FieldName> = {
  C: "city",
  S: "state",
  D: "dependent_locality",
  X: "sorting_code",
};

// Type for the complete schema including conditional fields
type SchemaType = typeof baseSchema & {
  [K in keyof typeof conditionalFields]?: (typeof conditionalFields)[K];
};

/**
 * Creates a Zod schema for billing information based on supported entities
 * @param supportedEntities Array of entity codes that determine which fields are required
 * @returns Zod schema for billing information
 */
export const createBillingInfoSchema = (
  supportedEntities: EntityCode[] = [],
) => {
  const schema: SchemaType = { ...baseSchema };

  // Add conditional fields based on supported entities
  supportedEntities.forEach((entity) => {
    const field = fieldMapping[entity];
    if (field) {
      schema[field] = conditionalFields[field];
    }
  });

  return z.object(schema);
};

// Export types for the schema
export type BillingInfoSchema = ReturnType<typeof createBillingInfoSchema>;
export type BillingInfoFields = z.infer<BillingInfoSchema>;

// Type for country data that includes supported entities
export interface CountryMetadata {
  code: string;
  name: string;
  supported_entities: EntityCode[];
}

// Type for the complete address structure
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  dependent_locality?: string;
  sorting_code?: string;
}

// Type for the complete billing information
export interface Billing {
  name: string;
  organization?: string;
  address: Address;
}
