import React from 'react';
import { Card, CardContent } from 'portal-shared/components/ui/card';
import HyperPayment from '../HyperPayment';

interface PaymentStatusProps {
  onSuccess: () => void;
}

export function PaymentStatus({ onSuccess }: PaymentStatusProps) {
  return (
    <Card>
      <CardContent>
        <HyperPayment mode="subscribe" onSuccess={onSuccess} />
      </CardContent>
    </Card>
  );
}
