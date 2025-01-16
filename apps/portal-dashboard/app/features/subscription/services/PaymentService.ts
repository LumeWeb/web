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

  public async validatePaymentAmount(amount: number): Promise<boolean> {
    return amount > 0 && amount <= 999999.99; // Maximum payment amount
  }

  public async validatePaymentCurrency(currency: string): Promise<boolean> {
    const validCurrencies = ['USD', 'EUR', 'GBP']; // Add supported currencies
    return validCurrencies.includes(currency.toUpperCase());
  }

  public async encryptPaymentData(data: any, publicKey: string): Promise<string> {
    // Implement payment data encryption
    // This would typically use a library like hybrid-crypto-js
    return ''; // Placeholder - implement actual encryption
  }

  public getPaymentErrorMessage(error: PaymentError): string {
    const errorMessages: Record<string, string> = {
      'card_declined': 'Your card was declined. Please try another card.',
      'expired_card': 'Your card has expired. Please use a different card.',
      'insufficient_funds': 'Insufficient funds. Please use a different card.',
      'invalid_number': 'Invalid card number. Please check and try again.',
      'invalid_expiry': 'Invalid expiration date. Please check and try again.',
      'invalid_cvc': 'Invalid security code. Please check and try again.',
      'default': 'An error occurred processing your payment. Please try again.'
    };

    return errorMessages[error.code] || errorMessages.default;
  }
}
