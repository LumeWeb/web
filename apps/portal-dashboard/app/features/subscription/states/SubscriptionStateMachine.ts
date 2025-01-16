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

  public transition(event: SubscriptionEvent): SubscriptionState {
    try {
      const newState = this.handleTransition(event);
      
      // Validate state transition
      if (this.currentState.type !== 'LOADING' && this.currentState.type !== 'ERROR') {
        const currentStatus = this.getStatusFromState(this.currentState);
        const newStatus = this.getStatusFromState(newState);
        
        if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
          throw new Error(
            `Invalid transition from ${currentStatus} to ${newStatus}`
          );
        }
      }
      
      this.currentState = newState;
      return newState;
    } catch (error) {
      const errorState = {
        type: 'ERROR' as const,
        error: error instanceof Error ? error : new Error('Unknown error during transition')
      };
      this.currentState = errorState;
      return errorState;
    }
  }

  private getStatusFromState(state: SubscriptionState): SubscriptionStatus {
    switch (state.type) {
      case 'INACTIVE':
        return 'INACTIVE';
      case 'PENDING':
        return 'PENDING';
      case 'ACTIVE':
        return 'ACTIVE';
      case 'CANCELLED':
        return 'CANCELLED';
      case 'LOADING':
      case 'ERROR':
        return 'INACTIVE';
      default:
        throw new Error(`Invalid state type: ${state.type}`);
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
