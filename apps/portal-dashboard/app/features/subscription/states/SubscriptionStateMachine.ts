import { SubscriptionState, SubscriptionEvent, Subscription, SubscriptionPlan, BillingInfo } from "../types/subscription.types";

export class SubscriptionStateMachine {
  private currentState: SubscriptionState;

  constructor() {
    this.currentState = { type: 'LOADING' };
  }

  public getState(): SubscriptionState {
    return this.currentState;
  }

  private readonly validTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
    'INACTIVE': ['PENDING', 'ACTIVE'],
    'PENDING': ['ACTIVE', 'CANCELLED', 'INACTIVE'],
    'ACTIVE': ['CANCELLED'],
    'CANCELLED': ['INACTIVE']
  };

  private canTransition(event: SubscriptionEvent): boolean {
    const allowedEvents = this.validTransitions[this.currentState.type];
    if (!allowedEvents) {
      console.error(`Invalid state: ${this.currentState.type}`);
      return false;
    }

    const canTransition = allowedEvents.includes(event.type);
    if (!canTransition) {
      console.error(
        `Invalid transition: Cannot handle ${event.type} in state ${this.currentState.type}. ` +
        `Allowed events: ${allowedEvents.join(', ')}`
      );
    }

    return canTransition;
  }

  public transition(event: SubscriptionEvent): SubscriptionState {
    if (!this.canTransition(event)) {
      // Keep current state but mark as error
      return {
        type: 'ERROR',
        error: new Error(`Invalid transition: Cannot handle ${event.type} in state ${this.currentState.type}`),
        previousState: this.currentState
      };
    }

    try {
      const newState = this.handleTransition(event);
      this.currentState = newState;
      return newState;
    } catch (error) {
      const errorState = {
        type: 'ERROR' as const,
        error: error instanceof Error ? error : new Error('Unknown error during transition'),
        previousState: this.currentState
      };
      this.currentState = errorState;
      return errorState;
    }
  }

  private handleTransition(newStatus: SubscriptionStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${newStatus}`);
    }
    this.currentState = newStatus;
  }

  public getState(): SubscriptionStatus {
    return this.currentState;
  }

  private canTransitionTo(newStatus: SubscriptionStatus): boolean {
    return this.validTransitions[this.currentState]?.includes(newStatus) ?? false;
  }

  private handleSubscriptionLoaded(subscription: Subscription): SubscriptionState {
    switch (subscription.status) {
      case 'INACTIVE':
        return { type: 'INACTIVE' };
      case 'PENDING':
        if (subscription.billing) {
          return { 
            type: 'PENDING_PAYMENT',
            plan: subscription.plan,
            billing: subscription.billing
          };
        }
        return { 
          type: 'PENDING_BILLING',
          plan: subscription.plan
        };
      case 'ACTIVE':
        return { type: 'ACTIVE', subscription };
      case 'CANCELLED':
        return { type: 'CANCELLED', subscription };
      case 'SUSPENDED':
        return { type: 'SUSPENDED', subscription };
      case 'PROCESSING_PAYMENT':
        return {
          type: 'PROCESSING_PAYMENT',
          plan: subscription.plan,
          billing: subscription.billing,
          paymentMethodId: subscription.payment?.payment_method_id || ''
        };
      default:
        return { type: 'ERROR', error: new Error('Invalid subscription status') };
    }
  }
}
