import { createDebugger, visualize } from 'robot3/debug';
import { subscriptionMachine } from './machines/subscriptionMachine';

if (process.env.NODE_ENV === 'development') {
  const debug = createDebugger();
  debug(subscriptionMachine);
  
  // Add state machine visualization
  console.log('Subscription Machine States:', visualize(subscriptionMachine));
}
