import { PaymentInfo, PaymentStatus, PaymentError } from "../types/payment.types";

export class PaymentService {
  public getPaymentStatus(payment: PaymentInfo): PaymentStatus {
    if (!payment) {
      return 'PENDING';
    }

    if (payment.status) {
      return payment.status;
    }

    if (payment.last_payment_error) {
      return 'FAILED';
    }

    if (payment.expires_at && new Date(payment.expires_at) <= new Date()) {
      return 'CANCELLED';
    }

    if (payment.client_secret && payment.publishable_key) {
      return 'PROCESSING';
    }

    return 'PENDING';
  }

  public isPaymentExpired(payment: PaymentInfo): boolean {
    return payment?.expires_at ? new Date(payment.expires_at) <= new Date() : false;
  }

}
