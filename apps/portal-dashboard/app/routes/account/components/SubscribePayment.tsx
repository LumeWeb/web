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
import { cn } from "portal-shared/util/cn.js";
import HyperPayment from "./HyperPayment.js";
import { useSubscriptionContext } from "../contexts/SubscriptionContext.js";
import useSubmitSubscriptionConnect from "@/routes/account/hooks/useSubmitSubscriptionConnect.js";

interface SubscribePaymentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: 'active' | 'ending-soon' | 'expired';
}

export default function SubscribePayment({ open, onOpenChange, status }: SubscribePaymentProps) {
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
          <div className={cn(
            "text-sm mb-2",
            status === 'active' ? "text-muted-foreground" : 
            status === 'ending-soon' ? "text-yellow-500" :
            "text-red-500"
          )}>
            {status === 'active' && "Payment session active"}
            {status === 'ending-soon' && "Payment session ending soon"}
            {status === 'expired' && "Payment session expired"}
          </div>
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
