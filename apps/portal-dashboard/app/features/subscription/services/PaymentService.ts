import { PaymentInfo, PaymentStatus } from "../types/payment.types";

import { PaymentInfo, PaymentStatus, PaymentError } from '../types/payment.types';

export class PaymentService {
  public getPaymentStatus(payment: PaymentInfo | null | undefined): PaymentStatus {
    if (!payment) return 'PENDING';
    return payment.status;
  }

  public isPaymentExpired(payment: PaymentInfo | null | undefined): boolean {
    if (!payment?.expiresAt) return false;
    
    try {
      return new Date(payment.expiresAt) <= new Date();
    } catch (error) {
      console.error('Invalid payment expiry date:', error);
      return false;
    }
  }

  public validatePayment(payment: PaymentInfo): PaymentError | null {
    if (!payment.clientSecret || !payment.publishableKey) {
      return {
        message: 'Invalid payment configuration'
      };
    }

    if (this.isPaymentExpired(payment)) {
      return {
        message: 'Payment session expired',
        code: 'SESSION_EXPIRED'
      };
    }

    return null;
  }

  public getTimeRemaining(payment: PaymentInfo): number {
    if (!payment.expiresAt) return 0;
    
    try {
      const expiry = new Date(payment.expiresAt).getTime();
      const now = new Date().getTime();
      return Math.max(0, expiry - now);
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return 0;
    }
  }
}
