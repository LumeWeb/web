import React from 'react';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'portal-shared/components/ui/card';
import { usePaymentHistory } from '../../hooks/usePaymentHistory';
import { formatDate } from '../../utils/formatDate';

export function PaymentHistory() {
  const { data, isLoading } = usePaymentHistory();
  const payments = data?.data;

  if (isLoading) {
    return <div>Loading payment history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments?.map((payment) => (
            <div key={payment.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-medium">${payment.amount}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(payment.date)}
                </div>
              </div>
              <div className="text-sm">
                {payment.status === 'succeeded' ? (
                  <span className="text-green-600">Paid</span>
                ) : (
                  <span className="text-red-600">Failed</span>
                )}
              </div>
            </div>
          ))}
          {!payments?.length && (
            <div className="text-center text-muted-foreground">
              No payment history available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
