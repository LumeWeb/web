// components/SubscriptionHistory.js
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscriptionContext } from "../contexts/SubscriptionContext";
import React, { MouseEventHandler, useEffect } from "react";
import useSubmitSubscriptionCancellation from "@/routes/account/hooks/useSubmitSubscriptionCancellation.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.js";

export default function SubscriptionHistory() {
  const [showDialog, setShowDialog] = React.useState(false);

  const { subscription } = useSubscriptionContext();
  const { cancelSubscription } = useSubmitSubscriptionCancellation();

  const doAction = () => {
    cancelSubscription(() => {
      setShowDialog(true);
    });
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
        </CardHeader>
        <CardContent>{/* ... (subscription history content) */}</CardContent>
        {subscription?.plan && (
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDialog(true)}>
              Cancel Subscription
            </Button>
          </CardFooter>
        )}
      </Card>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {`Are you sure you want to cancel your subscription to the ${subscription?.plan?.name} plan?`}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doAction}>
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
