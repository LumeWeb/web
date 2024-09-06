import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.js";
import React, { useEffect } from "react";
import HyperPayment from "./HyperPayment.js";
import { useSubscriptionContext } from "../contexts/SubscriptionContext.js";
import useSubmitSubscriptionConnect from "@/routes/account/hooks/useSubmitSubscriptionConnect.js";

export default function ChangePaymentMethod() {
  const [showDialog, setShowDialog] = React.useState(false);

  const { subscription, selectedPlan } = useSubscriptionContext();
  const { connectPaymentMethod, setConnectSuccessHandler } =
    useSubmitSubscriptionConnect();

  useEffect(() => {
    setConnectSuccessHandler(() => {
      setShowDialog(false);
    });
  }, [setConnectSuccessHandler]);

  const handleSuccess = (paymentMethodId: string) => {
    connectPaymentMethod(paymentMethodId);
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Payment</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {`Please complete your payment to subscribe to the ${selectedPlan?.name} plan.`}
              <HyperPayment
                mode={"subscribe"}
                onPaymentSuccess={handleSuccess}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
