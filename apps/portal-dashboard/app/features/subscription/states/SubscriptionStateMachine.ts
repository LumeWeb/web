import { SubscriptionState, SubscriptionEvent, Subscription, SubscriptionPlan, BillingInfo } from "../types/subscription.types";

export class SubscriptionStateMachine {
  private currentState: SubscriptionState;

  constructor() {
    this.currentState = { type: 'LOADING' };
  }

  public getState(): SubscriptionState {
    return this.currentState;
  }

  private canTransition(event: SubscriptionEvent): boolean {
    switch (this.currentState.type) {
      case 'LOADING':
        return event.type === 'SUBSCRIPTION_LOADED' || event.type === 'ERROR_OCCURRED';
        
      case 'INACTIVE':
        return event.type === 'CREATE_SUBSCRIPTION';
        
      case 'PENDING_BILLING':
        return event.type === 'UPDATE_BILLING' || event.type === 'ERROR_OCCURRED';
        
      case 'PENDING_PAYMENT':
        return event.type === 'COMPLETE_PAYMENT' || event.type === 'ERROR_OCCURRED';
        
      case 'PROCESSING_PAYMENT':
        return event.type === 'COMPLETE_PAYMENT' || event.type === 'ERROR_OCCURRED';
        
      case 'ACTIVE':
        return event.type === 'CREATE_SUBSCRIPTION' || event.type === 'CANCEL_SUBSCRIPTION';
        
      case 'CANCELLED':
        return event.type === 'CREATE_SUBSCRIPTION';
        
      case 'SUSPENDED':
        return event.type === 'COMPLETE_PAYMENT' || event.type === 'CANCEL_SUBSCRIPTION';
        
      case 'ERROR':
        return event.type === 'LOAD_SUBSCRIPTION';
        
      default:
        return false;
    }
  }

  public transition(event: SubscriptionEvent): SubscriptionState {
    if (!this.canTransition(event)) {
      throw new Error(`Invalid transition: Cannot handle ${event.type} in state ${this.currentState.type}`);
    }

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
