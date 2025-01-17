import { SubscriptionStateMachine } from "./SubscriptionStateMachine";
import { SubscriptionState, SubscriptionEvent } from "../types/subscription.types";

export class SubscriptionStateManager {
  private static instance: SubscriptionStateManager;
  private stateMachine: SubscriptionStateMachine;
  private subscribers: Set<(state: SubscriptionState) => void>;

  private constructor() {
    this.stateMachine = new SubscriptionStateMachine();
    this.subscribers = new Set();
  }

  public static getInstance(): SubscriptionStateManager {
    if (!SubscriptionStateManager.instance) {
      SubscriptionStateManager.instance = new SubscriptionStateManager();
    }
    return SubscriptionStateManager.instance;
  }

  public transition(event: SubscriptionEvent): SubscriptionState {
    const newState = this.stateMachine.transition(event);
    this.notifySubscribers(newState);
    return newState;
  }

  public getState(): SubscriptionState {
    return this.stateMachine.getState();
  }

  public subscribe(callback: (state: SubscriptionState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(state: SubscriptionState): void {
    this.subscribers.forEach(callback => callback(state));
  }
}
