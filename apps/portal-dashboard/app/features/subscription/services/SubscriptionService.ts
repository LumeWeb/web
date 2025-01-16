import { SubscriptionState, SubscriptionEvent, Subscription, SubscriptionPlan, BillingInfo } from "../types/subscription.types";
import { SubscriptionStateMachine } from "../states/SubscriptionStateMachine";

export class SubscriptionService {
  private stateMachine: SubscriptionStateMachine;

  constructor() {
    this.stateMachine = new SubscriptionStateMachine();
  }

  public getState(): SubscriptionState {
    return this.stateMachine.getState();
  }

  public async loadSubscription(subscription: Subscription | null): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'SUBSCRIPTION_LOADED',
      subscription: subscription || {
        id: '',
        status: 'INACTIVE',
        plan: null
      } as Subscription
    });
  }

  public async createSubscription(plan: SubscriptionPlan): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'CREATE_SUBSCRIPTION',
      plan
    });
  }

  public async updateBilling(billing: BillingInfo): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'UPDATE_BILLING',
      billing
    });
  }

  public async completePayment(paymentMethodId: string): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'COMPLETE_PAYMENT',
      paymentMethodId
    });
  }

  public async cancelSubscription(): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'CANCEL_SUBSCRIPTION'
    });
  }

  public async handleError(error: Error): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'ERROR_OCCURRED',
      error
    });
  }
}
