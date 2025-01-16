import { PaymentInfo, PaymentStatus, PaymentError } from "../types/payment.types";

interface PaymentResult<T> {
  success: boolean;
  data?: T;
  error?: PaymentError;
}

export class PaymentService {
  public getPaymentStatus(payment: PaymentInfo | null | undefined): PaymentResult<PaymentStatus> {
    try {
      if (!payment) {
        return { success: true, data: 'PENDING' };
      }

      if (payment.status) {
        return { success: true, data: payment.status };
      }

      if (payment.last_payment_error) {
        return { 
          success: false, 
          data: 'FAILED',
          error: {
            code: 'PAYMENT_FAILED',
            message: payment.last_payment_error
          }
        };
      }

      if (this.isPaymentExpired(payment)) {
        return { 
          success: false, 
          data: 'CANCELLED',
          error: {
            code: 'PAYMENT_EXPIRED',
            message: 'Payment session has expired'
          }
        };
      }

      if (payment.client_secret && payment.publishable_key) {
        return { success: true, data: 'PROCESSING' };
      }

      return { success: true, data: 'PENDING' };
    } catch (error) {
      return {
        success: false,
        data: 'FAILED',
        error: {
          code: 'PAYMENT_ERROR',
          message: error instanceof Error ? error.message : 'Unknown payment error'
        }
      };
    }
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

  public validatePaymentMethod(paymentMethodId: string): PaymentResult<boolean> {
    if (!paymentMethodId?.trim()) {
      return {
        success: false,
        error: {
          code: 'INVALID_PAYMENT_METHOD',
          message: 'Payment method ID is required'
        }
      };
    }

    // Add additional payment method validation as needed
    return { success: true, data: true };
  }

  public async processPayment(
    paymentMethodId: string, 
    amount: number
  ): Promise<PaymentResult<PaymentInfo>> {
    try {
      const validation = this.validatePaymentMethod(paymentMethodId);
      if (!validation.success) {
        return validation as PaymentResult<PaymentInfo>;
      }

      // Process payment logic here
      // This is a placeholder - implement actual payment processing

      return {
        success: true,
        data: {
          status: 'PROCESSING',
          payment_method_id: paymentMethodId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PAYMENT_PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Payment processing failed'
        }
      };
    }
  }
}
