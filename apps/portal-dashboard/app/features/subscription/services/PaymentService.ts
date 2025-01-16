import { PaymentInfo, PaymentStatus, PaymentError } from "../types/payment.types";

export class PaymentService {
  public async validatePaymentMethod(paymentMethodId: string): Promise<PaymentError | null> {
    if (!paymentMethodId?.trim()) {
      return {
        code: 'invalid_payment_method',
        message: 'Payment method ID is required'
      };
    }
    return null;
  }

  public async getPaymentStatus(payment: PaymentInfo): Promise<PaymentStatus> {
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

  public async handlePaymentError(error: PaymentError): Promise<PaymentInfo> {
    return {
      status: 'FAILED',
      last_payment_error: error.message
    };
  }
}
