import {
  Card,
  CardContent,
  CardHeader,
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
import useSubmitSubscriptionConnect from "@/routes/account/hooks/useSubmitSubscriptionConnect.js";

export default function ChangePaymentMethod() {
  const [showDialog, setShowDialog] = React.useState(false);

  const { connectPaymentMethod } = useSubmitSubscriptionConnect();

  const handleSuccess = (paymentMethodId: string) => {
    setShowDialog(false);
    connectPaymentMethod(paymentMethodId, () => {
      setShowDialog(false);
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Change Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowDialog(true)}>
            Change Payment Method
          </Button>
        </CardContent>
      </Card>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Payment Method</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <HyperPayment
                  onPaymentSuccess={handleSuccess}
                  mode={"change_payment"}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
