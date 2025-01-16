import React from "react";
import { SubscriptionManager } from "../../features/subscription/components/subscription/SubscriptionManager";
import { SubscriptionProvider } from "../../features/subscription/contexts/SubscriptionContext";
import { SubscriptionStateProvider } from "../../features/subscription/contexts/SubscriptionStateContext";

export default function Subscription() {
  return (
    <SubscriptionProvider>
      <SubscriptionStateProvider>
        <SubscriptionManager />
      </SubscriptionStateProvider>
    </SubscriptionProvider>
  );
}
