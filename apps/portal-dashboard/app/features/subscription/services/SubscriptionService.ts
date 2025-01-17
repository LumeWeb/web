import {
  SubscriptionState,
  SubscriptionEvent,
  Subscription,
  SubscriptionPlan,
  BillingInfo,
  DEFAULT_SUBSCRIPTION,
} from "../types/subscription.types";
import { SubscriptionStateManager } from "../states/SubscriptionStateManager";

export class SubscriptionService {
  private readonly stateManager: SubscriptionStateManager;

  constructor() {
    this.stateManager = SubscriptionStateManager.getInstance();
  }

  public getState(): SubscriptionState {
    return this.stateManager.getState();
  }

  public async loadSubscription(
    subscription: Subscription | null,
  ): Promise<SubscriptionState> {
    return this.stateManager.transition({
      type: "SUBSCRIPTION_LOADED",
      subscription: subscription || DEFAULT_SUBSCRIPTION,
    });
  }

  public async createSubscription(
    plan: SubscriptionPlan,
  ): Promise<SubscriptionState> {
    return this.stateManager.transition({
      type: "CREATE_SUBSCRIPTION",
      plan,
    });
  }

  public async updateBilling(billing: BillingInfo): Promise<SubscriptionState> {
    return this.stateManager.transition({
      type: "UPDATE_BILLING",
      billing,
    });
  }

  public async completePayment(
    paymentMethodId: string,
  ): Promise<SubscriptionState> {
    return this.stateManager.transition({
      type: "COMPLETE_PAYMENT",
      paymentMethodId,
    });
  }

  public async cancelSubscription(): Promise<SubscriptionState> {
    return this.stateManager.transition({
      type: "CANCEL_SUBSCRIPTION",
    });
  }

  public async handleError(error: Error): Promise<SubscriptionState> {
    return this.stateManager.transition({
      type: "ERROR_OCCURRED",
      error,
    });
  }

  public async validatePlanChange(
    currentPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan,
  ): Promise<boolean> {
    // Implement plan change validation logic
    // e.g., check if downgrade is allowed, verify resource limits, etc.
    return true; // Placeholder - implement actual validation
  }

  public getSubscriptionPeriodDates(
    plan: SubscriptionPlan,
    startDate: Date = new Date(),
  ): { start: Date; end: Date } {
    const start = new Date(startDate);
    const end = new Date(startDate);

    if (plan.period === "MONTHLY") {
      end.setMonth(end.getMonth() + 1);
    } else if (plan.period === "YEARLY") {
      end.setFullYear(end.getFullYear() + 1);
    }

    return { start, end };
  }

}
