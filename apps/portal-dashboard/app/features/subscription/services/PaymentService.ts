import { PaymentInfo, PaymentStatus } from "../types/payment.types";

export class PaymentService {
  public getPaymentStatus(payment: PaymentInfo | null | undefined): PaymentStatus {
    if (!payment) {
      return 'PENDING';
    }

    if (payment.status) {
      return payment.status;
    }

    if (payment.last_payment_error) {
      return 'FAILED';
    }

    if (this.isPaymentExpired(payment)) {
      return 'CANCELLED';
    }

    if (payment.client_secret && payment.publishable_key) {
      return 'PROCESSING';
    }

    return 'PENDING';
  }

  public isPaymentExpired(payment: PaymentInfo): boolean {
    if (!payment?.expires_at) return false;
    
    try {
      const expiryDate = new Date(payment.expires_at);
      const now = new Date();
      return expiryDate <= now;
    } catch (error) {
      console.error('Invalid expiry date format:', error);
      return false;
    }
  }
}
