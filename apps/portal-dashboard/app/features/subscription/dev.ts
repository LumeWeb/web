import { visualize } from "robot3/visualize";
import { subscriptionMachine } from "./machines/subscriptionMachine";
import { billingMachine } from "./machines/billingMachine";
import { paymentMethodMachine } from "./machines/paymentMethodMachine";

// Only enable visualization in development
if (process.env.NODE_ENV === 'development') {
  // Visualize all state machines
  visualize(subscriptionMachine, { id: 'subscription' });
  visualize(billingMachine, { id: 'billing' });
  visualize(paymentMethodMachine, { id: 'payment' });
}
