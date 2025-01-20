import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "portal-shared/components/ui/alert-dialog";
import { useSubscriptionContext } from "../../../contexts/SubscriptionContext";

interface CancellationDialogProps {}

export function CancellationDialog({}: CancellationDialogProps) {
  const { actions } = useSubscriptionContext();
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    actions.cancelSubscription();
  };

  const handleAbortCancel = () => {
    setShowCancelConfirm(false);
    actions.abortCancellation();
  };

  return (
    <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your subscription? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleAbortCancel}>
            No, Keep Subscription
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmCancel}
            className="bg-destructive hover:bg-destructive/90">
            Yes, Cancel Subscription
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
