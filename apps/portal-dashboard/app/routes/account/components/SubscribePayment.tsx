import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "portal-shared/components/ui/card.js";
import { Button } from "portal-shared/components/ui/button.js";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "portal-shared/components/ui/alert-dialog.js";
import React, { useEffect } from "react";
import HyperPayment from "./HyperPayment.js";
import { useSubscriptionContext } from "../contexts/SubscriptionContext.js";
import useSubmitSubscriptionConnect from "@/routes/account/hooks/useSubmitSubscriptionConnect.js";

interface SubscribePaymentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscribePayment({ open, onOpenChange }: SubscribePaymentProps) {
  const { selectedPlan } = useSubscriptionContext();
  const { connectPaymentMethod } = useSubmitSubscriptionConnect();

  const handleSuccess = (paymentMethodId: string) => {
    connectPaymentMethod(paymentMethodId, () => {
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
