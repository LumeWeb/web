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
        this.currentState = this.handleSubscriptionLoaded(event.subscription);
        break;

      case 'CREATE_SUBSCRIPTION':
        this.currentState = { type: 'PENDING_BILLING' };
        break;

      case 'UPDATE_BILLING':
        this.currentState = { type: 'PENDING_PAYMENT' };
        break;

      case 'COMPLETE_PAYMENT':
        if (this.currentState.type === 'PENDING_PAYMENT' || this.currentState.type === 'SUSPENDED') {
          this.currentState = { 
            type: 'ACTIVE',
            subscription: 'subscription' in this.currentState ? this.currentState.subscription : undefined
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
        this.currentState = { type: 'ERROR', error: event.error };
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
        return subscription.billing 
          ? { type: 'PENDING_PAYMENT' }
          : { type: 'PENDING_BILLING' };
      case 'ACTIVE':
        return { type: 'ACTIVE', subscription };
      case 'CANCELLED':
        return { type: 'CANCELLED', subscription };
      case 'SUSPENDED':
        return { type: 'SUSPENDED', subscription };
      default:
        return { type: 'ERROR', error: new Error('Invalid subscription status') };
    }
  }
}
