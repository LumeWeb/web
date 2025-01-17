import { SubscriptionPlanStatus } from "portal-shared/dataProviders/accountProvider";
import {
  SubscriptionState,
  SubscriptionEvent,
  Subscription,
  SubscriptionPlan,
  BillingInfo,
  SubscriptionStatus,
} from "../types/subscription.types";

export class SubscriptionStateMachine {
  private currentState: SubscriptionState;

  constructor() {
    this.currentState = { type: "LOADING" };
  }

  public getState(): SubscriptionState {
    return this.currentState;
  }

  private readonly validTransitions: Record<
    SubscriptionStatus,
    SubscriptionStatus[]
  > = {
    [SubscriptionPlanStatus.INACTIVE]: [
      SubscriptionPlanStatus.PENDING,
      SubscriptionPlanStatus.ACTIVE,
    ],
    [SubscriptionPlanStatus.PENDING]: [
      SubscriptionPlanStatus.ACTIVE,
      SubscriptionPlanStatus.CANCELLED,
      SubscriptionPlanStatus.INACTIVE,
      SubscriptionPlanStatus.PENDING_PAYMENT,
    ],
    [SubscriptionPlanStatus.PENDING_PAYMENT]: [
      SubscriptionPlanStatus.ACTIVE,
      SubscriptionPlanStatus.CANCELLED,
      SubscriptionPlanStatus.INACTIVE,
    ],
    [SubscriptionPlanStatus.ACTIVE]: [SubscriptionPlanStatus.CANCELLED],
    [SubscriptionPlanStatus.CANCELLED]: [SubscriptionPlanStatus.INACTIVE],
  };

  public transition(event: SubscriptionEvent): SubscriptionState {
    try {
      const newState = this.handleTransition(event);

      // Validate state transition
      if (
        this.currentState.type !== "LOADING" &&
        this.currentState.type !== "ERROR"
      ) {
        const currentStatus = this.getStatusFromState(this.currentState);
        const newStatus = this.getStatusFromState(newState);

        if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
          throw new Error(
            `Invalid transition from ${currentStatus} to ${newStatus}`,
          );
        }
      }

      this.currentState = newState;
      return newState;
    } catch (error) {
      const errorState = {
        type: "ERROR" as const,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error during transition"),
      };
      this.currentState = errorState;
      return errorState;
    }
  }

  private getStatusFromState(state: SubscriptionState): SubscriptionStatus {
    switch (state.type) {
      case "INACTIVE":
        return SubscriptionPlanStatus.INACTIVE;
      case "PENDING":
        return SubscriptionPlanStatus.PENDING;
      case "ACTIVE":
        return SubscriptionPlanStatus.ACTIVE;
      case "CANCELLED":
        return SubscriptionPlanStatus.CANCELLED;
      case "LOADING":
      case "ERROR":
        return SubscriptionPlanStatus.INACTIVE;
      default:
        throw new Error(`Invalid state type: ${state.type}`);
    }
  }

  private handleTransition(event: SubscriptionEvent): SubscriptionState {
    switch (event.type) {
      case "SUBSCRIPTION_LOADED":
        return this.handleSubscriptionLoaded(event.subscription);
      case "CREATE_SUBSCRIPTION":
        return { type: "PENDING", plan: event.plan };
      case "UPDATE_BILLING":
        if (this.currentState.type !== "PENDING") {
          throw new Error("Can only update billing in PENDING state");
        }
        return {
          ...this.currentState,
          billing: event.billing,
        };
      case "COMPLETE_PAYMENT":
        if (
          this.currentState.type !== "PENDING" &&
          this.currentState.type !== "ACTIVE"
        ) {
          throw new Error(
            "Can only complete payment in PENDING or ACTIVE state",
          );
        }
        return {
          ...this.currentState,
        };
      case "CANCEL_SUBSCRIPTION":
        if (this.currentState.type !== "ACTIVE") {
          throw new Error("Can only cancel active subscriptions");
        }
        return {
          type: "CANCELLED",
          subscription: this.currentState.subscription,
        };
      case "ERROR_OCCURRED":
        return { type: "ERROR", error: event.error };
      default:
        throw new Error(`Unhandled event type: ${(event as any).type}`);
    }
  }

  private handleSubscriptionLoaded(
    subscription: Subscription,
  ): SubscriptionState {
    switch (subscription.status) {
      case SubscriptionPlanStatus.INACTIVE:
        return { type: "INACTIVE" };
      case SubscriptionPlanStatus.PENDING:
        if (subscription.billing) {
          return {
            type: "PENDING",
            plan: subscription.plan,
            billing: subscription.billing,
          };
        }
        return {
          type: "PENDING",
          plan: subscription.plan,
        };
      case SubscriptionPlanStatus.PENDING_PAYMENT:
        return {
          type: "PENDING_PAYMENT",
          plan: subscription.plan,
          billing: subscription.billing,
        };
      case SubscriptionPlanStatus.ACTIVE:
        return { type: "ACTIVE", subscription };
      case SubscriptionPlanStatus.CANCELLED:
        return { type: "CANCELLED", subscription };
      default:
        return {
          type: "ERROR",
          error: new Error("Invalid subscription status"),
        };
    }
  }
}
