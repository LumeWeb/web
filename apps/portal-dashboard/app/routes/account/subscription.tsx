import React from "react";
import { SubscriptionManager } from "../../features/subscription/components/subscription/SubscriptionManager";
import { SubscriptionProvider } from "../../features/subscription/contexts/SubscriptionContext";

export default function Subscription() {
  return (
    <SubscriptionProvider>
      <SubscriptionManager />
    </SubscriptionProvider>
  );
}
