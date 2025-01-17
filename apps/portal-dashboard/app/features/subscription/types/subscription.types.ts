import { z } from "zod";
import { BillingInfo, billingInfoSchema } from "./billing.types";
import { PaymentInfo, paymentInfoSchema } from "./payment.types";
import { HttpError } from "@refinedev/core";
// Import and re-export subscription types
import {
  Resources,
  Subscription as SharedSubscription,
  SubscriptionPlan as SharedSubscriptionPlan,
  SubscriptionPlanStatus,
  SubscriptionResponse as SharedSubscriptionResponse,
} from "portal-shared/dataProviders/accountProvider";

export type { BillingInfo } from "./billing.types";

export type SubscriptionStateValue =
  | "idle"
  | "loading"
  | "inactive"
  | "pending"
  | "editingBilling"
  | "pendingPayment"
  | "active"
  | "cancelled"
  | "error";

export interface SubscriptionContext {
  subscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  billing: BillingInfo | null;
  payment: PaymentInfo | null;
  error: Error | null;
}

export interface SubscriptionMachineState {
  value: SubscriptionStateValue;
  context: SubscriptionContext;
}

export interface SubscriptionError extends HttpError {
  code?: string;
  details?: Record<string, unknown>;
}

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
  | { type: "SUBSCRIPTION_LOADED"; subscription: Subscription }
  | { type: "PLAN_SELECTED"; plan: SubscriptionPlan }
  | { type: "SELECT_PLAN"; plan: SubscriptionPlan }
  | { type: "COMPLETE" }
  | { type: "CANCEL" }
  | { type: "REACTIVATED" }
  | { type: "RETRIED" }
  | { type: "ERROR_OCCURRED"; error: Error }
  | { type: "PAYMENT_METHOD_UPDATE_INITIATED" }
  | { type: "PAYMENT_COMPLETE"; paymentMethodId: string }
  | { type: "ERROR"; error: Error };

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
