import React from "react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { SubscriptionPlan } from "../../types/subscription.types";
import { PlanCard } from "./planSelector/PlanCard";
import { PlanCardSkeleton } from "./planSelector/PlanCardSkeleton";
import { CancellationDialog } from "./planSelector/CancellationDialog";

interface PlanSelectorProps {
  onPlanSelect: (plan: SubscriptionPlan) => void;
}

export function PlanSelector({ onPlanSelect }: PlanSelectorProps) {
  const { plans, isLoading } = useSubscriptionContext();

  if (isLoading || !plans) {
    return <PlanCardSkeleton count={3} />;
  }

  if (!plans?.length) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No subscription plans available</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onSelect={onPlanSelect} />
        ))}
      </div>
      <CancellationDialog />
    </>
  );
}
