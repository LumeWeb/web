export enum BillingSSEEventType {
  PaymentCompleted = "payment.completed",
  SubscriptionActive = "subscription.active",
  SubscriptionCreated = "subscription.created",
  SubscriptionUpdated = "subscription.updated",
  SubscriptionCancelled = "subscription.cancelled",
  PlanChanged = "plan.changed",
  PlanChangedCreditOnly = "plan.changed.credit_only",
  PlanChangedZeroAmount = "plan.changed.zero_amount",
}

export interface PaymentCompletedEventData {
  amount: string;
  gateway: string;
  invoice_id: string;
  external_id: string;
  paid_at: string;
}

export interface SubscriptionCreatedEventData {
  subscription_id: string;
  gateway: string;
  plan_id: number;
  period_id: number;
  created_at: string;
}

export interface SubscriptionActiveEventData {
  subscription_id: string;
  gateway: string;
  plan_id: number;
  period_id: number;
  activated_at: string;
}

export interface SubscriptionUpdatedEventData {
  subscription_id: string;
  gateway: string;
  old_plan_id?: number;
  new_plan_id: number;
  old_period_id?: number;
  new_period_id: number;
  updated_at: string;
}

export interface SubscriptionCancelledEventData {
  subscription_id: string;
  gateway: string;
  plan_id: number;
  cancelled_at: string;
}

export interface PlanChangedEventData {
  subscription_id: string;
  gateway: string;
  old_plan_id: number;
  old_period_id: number;
  new_plan_id: number;
  new_period_id: number;
  prorated_credit: string;
  prorated_charge: string;
  net_amount: string;
  changed_at: string;
}

export interface PlanChangeCreditOnlyEventData {
  subscription_id: string;
  gateway: string;
  old_plan_id: number;
  old_period_id: number;
  new_plan_id: number;
  new_period_id: number;
  credit_amount: string;
  effective_from: string;
  billing_cycle_end: string;
  completed_at: string;
}

export interface PlanChangeZeroAmountEventData {
  subscription_id: string;
  gateway: string;
  old_plan_id: number;
  old_period_id: number;
  new_plan_id: number;
  new_period_id: number;
  prorated_credit: string;
  prorated_charge: string;
  effective_from: string;
  billing_cycle_end: string;
  completed_at: string;
}

export type BillingSSEEventDataMap = {
  [BillingSSEEventType.PaymentCompleted]: PaymentCompletedEventData;
  [BillingSSEEventType.SubscriptionActive]: SubscriptionActiveEventData;
  [BillingSSEEventType.SubscriptionCreated]: SubscriptionCreatedEventData;
  [BillingSSEEventType.SubscriptionUpdated]: SubscriptionUpdatedEventData;
  [BillingSSEEventType.SubscriptionCancelled]: SubscriptionCancelledEventData;
  [BillingSSEEventType.PlanChanged]: PlanChangedEventData;
  [BillingSSEEventType.PlanChangedCreditOnly]: PlanChangeCreditOnlyEventData;
  [BillingSSEEventType.PlanChangedZeroAmount]: PlanChangeZeroAmountEventData;
};

export interface BillingSSEEvent<T extends BillingSSEEventType = BillingSSEEventType> {
  event: T;
  data: BillingSSEEventDataMap[T];
  id?: string;
  retry?: number;
}
