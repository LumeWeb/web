import { z } from "zod";
import { BillingInfo, billingInfoSchema } from "./billing.types";
import { PaymentInfo, paymentInfoSchema } from "./payment.types";

// Subscription Status
export type SubscriptionStatus = 
  | 'INACTIVE'      // No active subscription
  | 'PENDING'       // Subscription created but not active (e.g. waiting for payment)
  | 'ACTIVE'        // Subscription is active and paid
  | 'CANCELLED'     // Subscription has been cancelled
  | 'SUSPENDED';    // Subscription suspended (e.g. payment failed)

// Subscription Period
export type SubscriptionPeriod = 'MONTHLY' | 'YEARLY';

// Resource limits/quotas
export interface SubscriptionResources {
  storage: number;     // Storage limit in bytes
  upload: number;      // Upload bandwidth limit in bytes
  download: number;    // Download bandwidth limit in bytes
}

// Subscription Plan
export interface SubscriptionPlan {
  id: string;
  name: string;
  period: SubscriptionPeriod;
  price: number;
  is_free: boolean;
  resources: SubscriptionResources;
}

// Active Subscription
export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  billing?: BillingInfo;
  payment?: PaymentInfo;
}

// Subscription State for state machine
export type SubscriptionState =
  | { type: 'LOADING' }
  | { type: 'ERROR'; error: Error }
  | { type: 'INACTIVE' }
  | { type: 'PENDING_BILLING'; plan: SubscriptionPlan }
  | { type: 'PENDING_PAYMENT'; plan: SubscriptionPlan; billing: BillingInfo }
  | { type: 'ACTIVE'; subscription: Subscription }
  | { type: 'CANCELLED'; subscription: Subscription }
  | { type: 'SUSPENDED'; subscription: Subscription }
  | { type: 'PROCESSING_PAYMENT'; subscription: Subscription; paymentMethodId: string };

// Subscription Events for state machine
export type SubscriptionEvent =
  | { type: 'LOAD_SUBSCRIPTION' }
  | { type: 'SUBSCRIPTION_LOADED'; subscription: Subscription }
  | { type: 'CREATE_SUBSCRIPTION'; plan: SubscriptionPlan }
  | { type: 'UPDATE_BILLING'; billing: BillingInfo }
  | { type: 'COMPLETE_PAYMENT'; paymentMethodId: string }
  | { type: 'CANCEL_SUBSCRIPTION' }
  | { type: 'ERROR_OCCURRED'; error: Error };

// Zod schema for runtime validation
export const subscriptionResourcesSchema = z.object({
  storage: z.number(),
  upload: z.number(),
  download: z.number()
});

export const subscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  period: z.enum(['MONTHLY', 'YEARLY']),
  price: z.number(),
  is_free: z.boolean(),
  resources: subscriptionResourcesSchema
});

export const subscriptionSchema = z.object({
  id: z.string(),
  status: z.enum(['INACTIVE', 'PENDING', 'ACTIVE', 'CANCELLED', 'SUSPENDED']),
  plan: subscriptionPlanSchema,
  current_period_start: z.string().optional(),
  current_period_end: z.string().optional(),
  cancel_at_period_end: z.boolean().optional(),
  billing: billingInfoSchema.optional(),
  payment: paymentInfoSchema.optional()
});
