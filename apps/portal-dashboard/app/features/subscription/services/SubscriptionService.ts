import {
  SubscriptionState,
  SubscriptionEvent,
  Subscription,
  SubscriptionPlan,
  BillingInfo,
  DEFAULT_SUBSCRIPTION,
  SubscriptionError,
} from "../types/subscription.types";
import { SubscriptionStateManager } from "../states/SubscriptionStateManager";
import { SubscriptionPlanStatus } from "portal-shared/dataProviders/accountProvider";

export class SubscriptionService {
  private readonly stateManager: SubscriptionStateManager;
  private currentState: SubscriptionState;

  constructor() {
    this.stateManager = SubscriptionStateManager.getInstance();
    this.currentState = this.stateManager.getState();
    
    // Subscribe to state changes
    this.stateManager.subscribe((state) => {
      this.currentState = state;
    });
  }

  public getState(): SubscriptionState {
    return this.currentState;
  }

  public async loadSubscription(
    subscription: Subscription | null,
  ): Promise<SubscriptionState> {
    try {
      return await this.stateManager.transition({
        type: "SUBSCRIPTION_LOADED",
        subscription: subscription || DEFAULT_SUBSCRIPTION,
      });
    } catch (error) {
      return this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async createSubscription(
    plan: SubscriptionPlan,
  ): Promise<SubscriptionState> {
    try {
      // Validate plan selection
      if (!plan) {
        throw new Error("No plan selected");
      }

      const newState = await this.stateManager.transition({
        type: "CREATE_SUBSCRIPTION",
        plan,
      });

      // Handle payment requirement
      if (!plan.is_free && newState.type === "PENDING") {
        return this.stateManager.transition({
          type: "UPDATE_BILLING",
          billing: (newState as any).billing,
        });
      }

      return newState;
    } catch (error) {
      return this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async updateSubscription(
    plan: SubscriptionPlan,
  ): Promise<SubscriptionState> {
    try {
      // Validate plan change
      if (this.currentState.type === "ACTIVE") {
        const isValid = await this.validatePlanChange(
          this.currentState.subscription.plan,
          plan
        );
        if (!isValid) {
          throw new Error("Invalid plan change");
        }
      }

      return await this.stateManager.transition({
        type: "CREATE_SUBSCRIPTION",
        plan,
      });
    } catch (error) {
      return this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async updateBilling(billing: BillingInfo): Promise<SubscriptionState> {
    try {
      if (!this.canUpdateBilling()) {
        throw new Error("Cannot update billing in current state");
      }

      return await this.stateManager.transition({
        type: "UPDATE_BILLING",
        billing,
      });
    } catch (error) {
      return this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async completePayment(
    paymentMethodId: string,
  ): Promise<SubscriptionState> {
    try {
      if (!this.canCompletePayment()) {
        throw new Error("Cannot complete payment in current state");
      }

      return await this.stateManager.transition({
        type: "COMPLETE_PAYMENT",
        paymentMethodId,
      });
    } catch (error) {
      return this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async cancelSubscription(): Promise<SubscriptionState> {
    try {
      if (!this.canCancelSubscription()) {
        throw new Error("Cannot cancel subscription in current state");
      }

      return await this.stateManager.transition({
        type: "CANCEL_SUBSCRIPTION",
      });
    } catch (error) {
      return this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async handleError(error: Error): Promise<SubscriptionState> {
    console.error("Subscription service error:", error);
    return this.stateManager.transition({
      type: "ERROR_OCCURRED",
      error,
    });
  }

  public async validatePlanChange(
    currentPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan,
  ): Promise<boolean> {
    // Don't allow downgrades if current plan has higher resources
    if (
      newPlan.resources.storage < currentPlan.resources.storage ||
      newPlan.resources.upload < currentPlan.resources.upload ||
      newPlan.resources.download < currentPlan.resources.download
    ) {
      return false;
    }

    // Don't allow changing from yearly to monthly in the middle of a period
    if (
      currentPlan.period === "YEARLY" &&
      newPlan.period === "MONTHLY" &&
      this.currentState.type === "ACTIVE" &&
      this.currentState.subscription.current_period_end
    ) {
      const periodEnd = new Date(this.currentState.subscription.current_period_end);
      if (periodEnd > new Date()) {
        return false;
      }
    }

    return true;
  }

  private canUpdateBilling(): boolean {
    return (
      this.currentState.type === "PENDING" ||
      this.currentState.type === "PENDING_PAYMENT"
    );
  }

  private canCompletePayment(): boolean {
    return (
      this.currentState.type === "PENDING" ||
      this.currentState.type === "PENDING_PAYMENT"
    );
  }

  private canCancelSubscription(): boolean {
    return this.currentState.type === "ACTIVE";
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
