import { useState } from "react";
import { useManagementCapabilities } from "@/hooks/useManagementCapabilities";
import { useManagementAction } from "@/hooks/useManagementAction";
import { useBillingContext } from "@/ui/context/BillingContext";
import { PlanChangeDialogContainer } from "./PlanChangeDialogContainer";
import { LoadingState } from "./SubscriptionManagement/LoadingState";
import { ManagementGrid } from "./SubscriptionManagement/ManagementGrid";
import type { ManagementOperation } from "@/types/subscription";
import { ManagementAction } from "@/types/subscription";
import type { ManagementActionResult, OperationState } from "@/hooks/useManagementAction";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  cn,
} from "@lumeweb/portal-framework-ui-core";
import { useBillingAnalytics } from "@/ui/hooks/useBillingAnalytics";

interface SubscriptionManagementProps {
  className?: string;
}

function useFilteredOperations(
  operations: Record<string, boolean> | undefined,
  isPaused: boolean,
  isCancelScheduled: boolean
) {
  const hasCustomerPortal = Object.entries(operations ?? {}).some(
    ([op, enabled]) => op === "customer_portal" && enabled === true
  );

  const supportedOps = Object.entries(operations ?? {})
    .filter(([, enabled]) => enabled === true)
    .map(([op]) => op)
    .filter((op) => op !== "change_plan")
    .filter((op) => op !== "customer_portal")
    .filter((op) => {
      if (op === "pause") return !isPaused;
      if (op === "resume") return isPaused;
      if (op === "cancel") return !isCancelScheduled;
      return true;
    });

  return { hasCustomerPortal, supportedOps };
}

export function SubscriptionManagement({ className }: SubscriptionManagementProps) {
  const { subscription } = useBillingContext();
  const { data: capabilities, isLoading, operations, canChangePlan } = useManagementCapabilities(
    {},
    { isSubscribed: subscription.data?.is_subscribed }
  );
  const { execute, getOperationState } = useManagementAction({
    onSuccess: () => subscription.silentRefetch(),
  });
  const [showPlanChange, setShowPlanChange] = useState(false);
  const [pendingCancelOp, setPendingCancelOp] = useState<string | null>(null);
  const analytics = useBillingAnalytics();

  const isPaused = !!subscription.data?.paused_at;
  const isCancelScheduled = !!subscription.data?.will_cancel_at;
  const { hasCustomerPortal, supportedOps } = useFilteredOperations(operations, isPaused, isCancelScheduled);

  function handleExecute(operation: ManagementOperation): Promise<ManagementActionResult> {
    if (operation === "cancel") {
      analytics.cancellationInitiated({
        plan_id: subscription.data?.pricing_plan_period_id,
        plan_name: undefined,
      });
      setPendingCancelOp(operation);
      return new Promise<ManagementActionResult>(() => {});
    }
    return execute(operation);
  }

  async function handleConfirmCancel() {
    if (!pendingCancelOp) return;
    const op = pendingCancelOp;
    setPendingCancelOp(null);
    const res = await execute(op);
    if (res.type === ManagementAction.Complete || res.type === "complete") {
      analytics.cancellationCompleted({
        plan_id: subscription.data?.pricing_plan_period_id,
      });
    }
  }

  function handleCancelKeep() {
    analytics.cancellationAborted({
      plan_id: subscription.data?.pricing_plan_period_id,
    });
    setPendingCancelOp(null);
  }

  if (isLoading) {
    return <LoadingState className={className} />;
  }

  if (!capabilities) return null;

  return (
    <div className={className}>
      <h3 className="mb-4 text-lg font-semibold">Subscription Management</h3>

      <ManagementGrid
        operations={supportedOps}
        hasCustomerPortal={hasCustomerPortal}
        canChangePlan={canChangePlan}
        onExecute={handleExecute}
        getOperationState={getOperationState}
        onChangePlan={() => setShowPlanChange(true)}
      />

      {showPlanChange && (
        <PlanChangeDialogContainer onClose={() => setShowPlanChange(false)} />
      )}

      <AlertDialog open={pendingCancelOp !== null} onOpenChange={(open: boolean) => !open && setPendingCancelOp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will lose access to your plan features at the end of your billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelKeep}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>Yes, Cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
