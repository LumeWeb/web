import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "portal-shared/components/ui/card";
import { usePaymentHistory } from "../../hooks/usePaymentHistory";
import { formatDate } from "../../utils/formatters";
import { PaymentHistoryEntry, PaymentStatus } from "../../types/payment.types";

export function PaymentHistory() {
  const { payments, isLoading } = usePaymentHistory();

  const getStatusDisplay = (status: PaymentStatus) => {
    switch (status) {
      case "COMPLETED":
        return <span className="text-green-600">Paid</span>;
      case "FAILED":
        return <span className="text-red-600">Failed</span>;
      case "PROCESSING":
        return <span className="text-yellow-600">Processing</span>;
      case "PENDING":
        return <span className="text-blue-600">Pending</span>;
      default:
        return <span className="text-muted-foreground">Unknown</span>;
    }
  };

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
          {payments?.map((payment: PaymentHistoryEntry) => (
            <div
              key={payment.id}
              className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-medium">
                  ${payment.amount} {payment.currency}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(payment.date)}
                </div>
                {payment.paymentMethod && (
                  <div className="text-xs text-muted-foreground">
                    {payment.paymentMethod.brand} ••••{" "}
                    {payment.paymentMethod.lastFour}
                  </div>
                )}
              </div>
              <div className="text-sm">{getStatusDisplay(payment.status)}</div>
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
