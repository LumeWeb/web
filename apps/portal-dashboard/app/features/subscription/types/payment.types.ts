import { z } from "zod";

// Payment status represents the current state of a payment
export type PaymentStatus = 
  | 'PENDING'    // Payment not yet initiated
  | 'PROCESSING' // Payment in progress
  | 'COMPLETED'  // Payment successful
  | 'FAILED';    // Payment failed

// Payment information structure
export interface PaymentInfo {
  clientSecret: string;        // Payment intent client secret
  publishableKey: string;      // Stripe publishable key
  expiresAt: string;          // Session expiry timestamp
  paymentMethodId?: string;    // ID of the payment method used
  errorMessage?: string;       // Error message if payment failed
}

// Zod schema for payment info validation
export const paymentInfoSchema = z.object({
  clientSecret: z.string().min(1, "Client secret is required"),
  publishableKey: z.string().min(1, "Publishable key is required"),
  expiresAt: z.string().datetime("Invalid expiry date"),
  paymentMethodId: z.string().optional(),
  errorMessage: z.string().optional()
});

// Error information for payment failures
export interface PaymentError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}
