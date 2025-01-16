import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "portal-shared/components/ui/dialog";
import HyperPayment from "./HyperPayment";

interface SubscribePaymentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscribePayment({ open, onOpenChange }: SubscribePaymentProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <HyperPayment mode="subscribe" onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
