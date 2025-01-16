import { z } from "zod";

// Address information
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

// Complete billing information
export interface BillingInfo {
  name: string;
  organization?: string;
  address: Address;
}

// Billing validation schemas
export const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country code must be at least 2 characters"),
  dependent_locality: z.string().optional(),
  sorting_code: z.string().optional(),
});

export const billingInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  organization: z.string().optional(),
  address: addressSchema,
});

// Billing error types
export interface BillingValidationError {
  field: keyof BillingInfo | keyof Address;
  message: string;
}

export type BillingErrors = BillingValidationError[];

export type EntityCode = "C" | "S" | "D" | "X";
