import { z } from "zod";

import { z } from "zod";

// Simplified payment status
export type PaymentStatus = 
  | 'PENDING'    // Initial payment state
  | 'PROCESSING' // Payment is being processed
  | 'COMPLETED'  // Payment successful
  | 'FAILED';    // Payment failed

// Simplified payment information
export interface PaymentInfo {
  clientSecret: string;        // Stripe client secret
  publishableKey: string;      // Stripe publishable key
  expiresAt: string;          // Payment session expiry
  paymentMethodId?: string;    // Stored payment method ID
  status: PaymentStatus;       // Current payment status
  errorMessage?: string;       // Last error message if any
}

// Payment validation schema
export const paymentInfoSchema = z.object({
  clientSecret: z.string(),
  publishableKey: z.string(),
  expiresAt: z.string(),
  paymentMethodId: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  errorMessage: z.string().optional()
});

// Payment error interface
export interface PaymentError {
  message: string;
  code?: string;
}
