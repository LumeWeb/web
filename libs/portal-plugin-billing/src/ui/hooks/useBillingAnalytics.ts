import { useAnalytics } from "@lumeweb/analytics";

// --- Event Names ---
export type BillingEventName =
  | "pricing_viewed"
  | "checkout_initiated"
  | "checkout_completed"
  | "checkout_abandoned"
  | "upgrade_initiated"
  | "upgrade_completed"
  | "downgrade_initiated"
  | "cancellation_initiated"
  | "cancellation_completed"
  | "cancellation_aborted";

// --- Property Types ---

export interface PricingViewedProps {
  plan_count?: number;
}

export interface CheckoutInitiatedProps {
  plan_id?: number;
  plan_name?: string;
  period?: string;
  gateway?: string;
}

export interface CheckoutCompletedProps {
  plan_id?: number;
  plan_name?: string;
  period?: string;
  gateway?: string;
  session_id?: string;
}

export interface CheckoutAbandonedProps {
  plan_id?: number;
  plan_name?: string;
  period?: string;
  gateway?: string;
}

export interface UpgradeInitiatedProps {
  current_plan_id?: number;
  target_plan_id?: number;
}

export interface UpgradeCompletedProps {
  old_plan_id?: number;
  new_plan_id?: number;
}

export interface DowngradeInitiatedProps {
  current_plan_id?: number;
  target_plan_id?: number;
}

export interface CancellationInitiatedProps {
  plan_id?: number;
  plan_name?: string;
}

export interface CancellationCompletedProps {
  plan_id?: number;
  plan_name?: string;
}

export interface CancellationAbortedProps {
  plan_id?: number;
  plan_name?: string;
}

// --- Hook Return Type ---

export interface UseBillingAnalyticsReturn {
  /** User is considering plans (activation interest) */
  pricingViewed: (props?: PricingViewedProps) => void;
  /** User wants to subscribe (activation intent) */
  checkoutInitiated: (props?: CheckoutInitiatedProps) => void;
  /** User has subscribed (activation achieved) */
  checkoutCompleted: (props?: CheckoutCompletedProps) => void;
  /** User left checkout without completing (lost activation) */
  checkoutAbandoned: (props?: CheckoutAbandonedProps) => void;
  /** User wants more value (ascension intent) */
  upgradeInitiated: (props?: UpgradeInitiatedProps) => void;
  /** User got more value (ascension achieved) */
  upgradeCompleted: (props?: UpgradeCompletedProps) => void;
  /** User wants less (ascension risk) */
  downgradeInitiated: (props?: DowngradeInitiatedProps) => void;
  /** User is considering leaving (churn risk) */
  cancellationInitiated: (props?: CancellationInitiatedProps) => void;
  /** User has left (churn event) */
  cancellationCompleted: (props?: CancellationCompletedProps) => void;
  /** User reconsidered (churn prevented) */
  cancellationAborted: (props?: CancellationAbortedProps) => void;
}

// --- Hook Implementation ---

export function useBillingAnalytics(): UseBillingAnalyticsReturn {
  const { capture } = useAnalytics();

  return {
    pricingViewed: (props) => capture("pricing_viewed", props),
    checkoutInitiated: (props) => capture("checkout_initiated", props),
    checkoutCompleted: (props) => capture("checkout_completed", props),
    checkoutAbandoned: (props) => capture("checkout_abandoned", props),
    upgradeInitiated: (props) => capture("upgrade_initiated", props),
    upgradeCompleted: (props) => capture("upgrade_completed", props),
    downgradeInitiated: (props) => capture("downgrade_initiated", props),
    cancellationInitiated: (props) => capture("cancellation_initiated", props),
    cancellationCompleted: (props) => capture("cancellation_completed", props),
    cancellationAborted: (props) => capture("cancellation_aborted", props),
  };
}
