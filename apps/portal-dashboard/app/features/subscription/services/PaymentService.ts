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
      // Validate inputs
      if (!paymentMethodId?.trim()) {
        return {
          success: false,
          error: {
            code: 'INVALID_PAYMENT_METHOD',
            message: 'Payment method ID is required'
          }
        };
      }

      if (amount <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Payment amount must be greater than 0'
          }
        };
      }

      // Validate payment method
      const validation = await this.validatePaymentMethod(paymentMethodId);
      if (!validation.success) {
        return validation as PaymentResult<PaymentInfo>;
      }

      // Process payment logic here
      // This is a placeholder - implement actual payment processing
      try {
        // Simulate payment processing
        const result = {
          success: true,
          data: {
            status: 'PROCESSING' as const,
            payment_method_id: paymentMethodId,
            amount: amount,
            created_at: new Date().toISOString()
          }
        };

        return result;
      } catch (processingError) {
        return {
          success: false,
          error: {
            code: 'PAYMENT_PROCESSING_ERROR',
            message: processingError instanceof Error ? 
              processingError.message : 
              'Payment processing failed',
            decline_code: processingError instanceof Error ? 
              processingError.name : 
              'unknown_error'
          }
        };
      }
    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: {
          code: 'PAYMENT_SYSTEM_ERROR',
          message: 'An unexpected error occurred while processing payment',
          decline_code: error instanceof Error ? error.name : 'system_error'
        }
      };
    }
  }
}
