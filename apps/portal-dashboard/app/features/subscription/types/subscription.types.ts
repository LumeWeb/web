import { z } from "zod";
import { StateValue } from 'robot3';
import { BillingInfo, billingInfoSchema } from "./billing.types";
export type { BillingInfo } from "./billing.types";
import { PaymentInfo, paymentInfoSchema } from "./payment.types";
import { HttpError } from "@refinedev/core";

export type SubscriptionStateValue = 
  | 'loading'
  | 'inactive'
  | 'pending'
  | 'pendingPayment'
  | 'active'
  | 'cancelled'
  | 'error'
  | 'updatingPayment';

export interface SubscriptionMachineState {
  value: StateValue;
  context: SubscriptionContext;
}

export interface SubscriptionError extends HttpError {
  code?: string;
  details?: Record<string, unknown>;
}

// Import and re-export subscription types
import {
  SubscriptionPlanStatus,
  SubscriptionPlan as SharedSubscriptionPlan,
  Subscription as SharedSubscription,
  Resources,
  SubscriptionResponse as SharedSubscriptionResponse,
} from "portal-shared/dataProviders/accountProvider";

// Re-export subscription plan period as our own type
export enum SubscriptionPlanPeriod {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

// Core subscription states
export type SubscriptionStatus = SubscriptionPlanStatus;

// Resource limits/quotas
export type SubscriptionResources = Resources;

// Subscription Plan
export type SubscriptionPlan = SharedSubscriptionPlan;

// Active Subscription
export type Subscription = SharedSubscription;

// Default empty subscription
export const DEFAULT_SUBSCRIPTION: Subscription = {
  id: "",
  status: SubscriptionPlanStatus.PENDING,
  plan: {
    id: "",
    name: "",
    period: SubscriptionPlanPeriod.MONTHLY,
    price: 0,
    is_free: true,
    resources: {
      storage: 0,
      upload: 0,
      download: 0,
    },
  },
};

// Subscription Response
export type SubscriptionResponse = SharedSubscriptionResponse;

// Subscription State
export type SubscriptionState =
  | { type: "LOADING" }
  | { type: "ERROR"; error: Error }
  | { type: "INACTIVE" }
  | { type: "PENDING"; plan: SubscriptionPlan; billing?: BillingInfo }
  | {
      type: "PENDING_PAYMENT";
      payment: Subscription["payment"];
      plan: SubscriptionPlan;
      billing: BillingInfo;
    }
  | { type: "ACTIVE"; subscription: Subscription }
  | { type: "CANCELLED"; subscription: Subscription };

// Robot State Machine Events
export type SubscriptionEvent =
  | { type: "LOADED"; subscription: Subscription }
  | { type: "SELECT_PLAN"; plan: SubscriptionPlan }
  | { type: "UPDATE_BILLING"; billing: BillingInfo }
  | { type: "COMPLETE"; paymentMethodId?: string }
  | { type: "CANCEL" }
  | { type: "REACTIVATE" }
  | { type: "RETRY" }
  | { type: "ERROR"; error: Error }
  | { type: "PAYMENT_METHOD_UPDATE_INITIATED" }
  | { type: "PAYMENT_METHOD_UPDATED"; paymentMethodId: string }
  | { type: "PAYMENT_METHOD_UPDATE_FAILED"; error: Error };

// Zod schema for runtime validation
export const subscriptionResourcesSchema = z.object({
  storage: z.number(),
  upload: z.number(),
  download: z.number(),
});

export const subscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  period: z.nativeEnum(SubscriptionPlanPeriod),
  price: z.number(),
  is_free: z.boolean(),
  resources: subscriptionResourcesSchema,
});

export const subscriptionSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(SubscriptionPlanStatus),
  plan: subscriptionPlanSchema,
  current_period_start: z.string().optional(),
  current_period_end: z.string().optional(),
  cancel_at_period_end: z.boolean().optional(),
  billing: billingInfoSchema.optional(),
  payment: paymentInfoSchema.optional(),
});
