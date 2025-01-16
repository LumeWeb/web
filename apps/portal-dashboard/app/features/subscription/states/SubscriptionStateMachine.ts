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

  private handleTransition(event: SubscriptionEvent): SubscriptionState {

    switch (event.type) {
      case 'SUBSCRIPTION_LOADED':
        const newState = this.handleSubscriptionLoaded(event.subscription);
        // Preserve plan and billing info when transitioning to PENDING states
        if (newState.type === 'PENDING_BILLING' && this.currentState.type === 'PENDING_BILLING') {
          newState.plan = this.currentState.plan;
        } else if (newState.type === 'PENDING_PAYMENT' && this.currentState.type === 'PENDING_PAYMENT') {
          newState.plan = this.currentState.plan;
          newState.billing = this.currentState.billing;
        }
        this.currentState = newState;
        break;

      case 'CREATE_SUBSCRIPTION':
        this.currentState = { 
          type: 'PENDING_BILLING',
          plan: event.plan 
        };
        break;

      case 'UPDATE_BILLING':
        if (this.currentState.type === 'PENDING_BILLING') {
          this.currentState = { 
            type: 'PENDING_PAYMENT',
            plan: this.currentState.plan,
            billing: event.billing
          };
        }
        break;

      case 'COMPLETE_PAYMENT':
        if (this.currentState.type === 'PENDING_PAYMENT') {
          // Move to processing with plan and billing info preserved
          this.currentState = { 
            type: 'PROCESSING_PAYMENT',
            plan: this.currentState.plan,
            billing: this.currentState.billing,
            paymentMethodId: event.paymentMethodId
          };
        } else if (this.currentState.type === 'PROCESSING_PAYMENT') {
          // Payment completed successfully
          this.currentState = { 
            type: 'ACTIVE',
            subscription: {
              id: '', // Will be set by backend
              status: 'ACTIVE',
              plan: this.currentState.plan,
              billing: this.currentState.billing
            }
          };
        } else if (this.currentState.type === 'SUSPENDED') {
          // Reactivate suspended subscription
          this.currentState = { 
            type: 'ACTIVE',
            subscription: this.currentState.subscription
          };
        }
        break;

      case 'CANCEL_SUBSCRIPTION':
        if ('subscription' in this.currentState) {
          this.currentState = { 
            type: 'CANCELLED', 
            subscription: this.currentState.subscription 
          };
        }
        break;

      case 'ERROR_OCCURRED':
        // Preserve the previous state's data in the error state
        const errorState = { type: 'ERROR' as const, error: event.error };
        if (this.currentState.type === 'PENDING_BILLING') {
          Object.assign(errorState, { plan: this.currentState.plan });
        } else if (this.currentState.type === 'PENDING_PAYMENT') {
          Object.assign(errorState, { 
            plan: this.currentState.plan,
            billing: this.currentState.billing 
          });
        } else if (this.currentState.type === 'PROCESSING_PAYMENT') {
          Object.assign(errorState, {
            plan: this.currentState.plan,
            billing: this.currentState.billing,
            paymentMethodId: this.currentState.paymentMethodId
          });
        }
        this.currentState = errorState;
        break;

      case 'LOAD_SUBSCRIPTION':
        this.currentState = { type: 'LOADING' };
        break;
    }

    return this.currentState;
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
