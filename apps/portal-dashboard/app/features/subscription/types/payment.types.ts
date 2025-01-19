import { z } from "zod";
// Payment status represents the current state of a payment
export type PaymentStatus =
  | "PENDING" // Payment not yet initiated
  | "PROCESSING" // Payment in progress
  | "COMPLETED" // Payment successful
  | "FAILED"; // Payment failed

// Payment method types
export type PaymentMethodType = "card" | "bank_transfer" | "wallet";

export type PaymentButtonState = 
  | "idle" 
  | "processing"
  | "retry"
  | "failed"
  | "succeeded";

export interface PaymentButtonLabels {
  idle: string;
  processing: string;
  retry: string;
  failed: string;
  succeeded: string;
}

export type PaymentMode = "subscribe" | "setup" | "change_payment";

export const DEFAULT_PAYMENT_LABELS: Record<PaymentMode, PaymentButtonLabels> = {
  subscribe: {
    idle: "Subscribe",
    processing: "Processing Payment...",
    retry: "Retry Payment...",
    failed: "Retry Payment",
    succeeded: "Subscription Complete"
  },
  setup: {
    idle: "Set Up Payment Method",
    processing: "Setting Up Payment...",
    retry: "Retry Setup...",
    failed: "Retry Setup",
    succeeded: "Setup Complete"
  },
  change_payment: {
    idle: "Update Payment Method",
    processing: "Updating Payment...",
    retry: "Retry Update...",
    failed: "Retry Update",
    succeeded: "Update Complete"
  }
};

// Payment information structure
export interface PaymentInfo {
  client_secret: string; // Payment intent client secret
  publishable_key: string; // Payment gateway publishable key
  expires_at: string; // Session expiry timestamp
}

// Payment history entry
export interface PaymentHistoryEntry {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: PaymentStatus;
  paymentMethod: {
    type: PaymentMethodType;
    lastFour?: string;
    brand?: string;
  };
}

// Payment response from API
export interface PaymentResponse {
  payment_method_id: string;
  client_secret?: string;
  status: PaymentStatus;
  error?: PaymentError;
}

// Zod schema for payment method
export const paymentMethodSchema = z.object({
  type: z.enum(["card", "bank_transfer", "wallet"]),
  lastFour: z.string().optional(),
  brand: z.string().optional(),
});

// Zod schema for payment info validation
export const paymentInfoSchema = z.object({
  clientSecret: z.string().min(1, "Client secret is required"),
  publishableKey: z.string().min(1, "Publishable key is required"),
  expiresAt: z.string().datetime("Invalid expiry date"),
  paymentMethodId: z.string().optional(),
  paymentMethodType: z.enum(["card", "bank_transfer", "wallet"]).optional(),
  errorMessage: z.string().optional(),
  lastFour: z.string().optional(),
  brand: z.string().optional(),
});

// Zod schema for payment history entry
export const paymentHistoryEntrySchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
  paymentMethod: paymentMethodSchema,
});

// Error information for payment failures
export interface PaymentError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}

// Payment history response
export interface PaymentHistoryResponse {
  payments: PaymentHistoryEntry[];
}

// Zod schema for payment history response
export const paymentHistoryResponseSchema = z.object({
  payments: z.array(paymentHistoryEntrySchema),
});
