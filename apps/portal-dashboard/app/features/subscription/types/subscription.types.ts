import { z } from "zod";
import { BillingInfo, billingInfoSchema } from "./billing.types";
export type { BillingInfo } from "./billing.types";
import { PaymentInfo, paymentInfoSchema } from "./payment.types";
import { HttpError } from "@refinedev/core";

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

// Subscription Events
export type SubscriptionEvent =
  | { type: "LOAD_SUBSCRIPTION" }
  | { type: "SUBSCRIPTION_LOADED"; subscription: Subscription }
  | { type: "CREATE_SUBSCRIPTION"; plan: SubscriptionPlan }
  | { type: "UPDATE_BILLING"; billing: BillingInfo }
  | { type: "COMPLETE_PAYMENT"; paymentMethodId: string }
  | { type: "CANCEL_SUBSCRIPTION" }
  | { type: "ERROR_OCCURRED"; error: Error };

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
