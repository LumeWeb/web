import { useCallback } from 'react';
import { PaymentService } from '../../services/PaymentService';
import { PaymentInfo, PaymentStatus } from '../../types/payment.types';

export function usePayment() {
  const paymentService = new PaymentService();

  const getPaymentStatus = useCallback(
    (payment: PaymentInfo): PaymentStatus => {
      return paymentService.getPaymentStatus(payment);
    },
    [paymentService]
  );

  const isPaymentExpired = useCallback(
    (payment: PaymentInfo): boolean => {
      return paymentService.isPaymentExpired(payment);
    },
    [paymentService]
  );

  return {
    getPaymentStatus,
    isPaymentExpired
  };
}
