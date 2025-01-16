import { z } from "zod";

// Payment status
export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED';

// Payment information
export interface PaymentInfo {
  client_secret?: string;
  publishable_key?: string;
  expires_at?: string;
  payment_method_id?: string;
  status?: PaymentStatus;
  last_payment_error?: string;
}

// Payment validation schema
export const paymentInfoSchema = z.object({
  client_secret: z.string().optional(),
  publishable_key: z.string().optional(),
  expires_at: z.string().optional(),
  payment_method_id: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED']).optional(),
  last_payment_error: z.string().optional()
});

// Payment method types
export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

// Payment error types
export interface PaymentError {
  code: string;
  message: string;
  decline_code?: string;
  payment_method?: PaymentMethod;
}
