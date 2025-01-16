import { PaymentInfo, PaymentStatus } from '../types/payment.types';

export class PaymentService {
  public getPaymentStatus(payment: PaymentInfo): PaymentStatus {
    if (!payment) return 'PENDING';
    
    if (payment.errorMessage) return 'FAILED';
    
    if (payment.paymentMethodId) return 'COMPLETED';
    
    return 'PROCESSING';
  }

  public isPaymentExpired(payment: PaymentInfo): boolean {
    if (!payment.expiresAt) return false;
    
    const expiryDate = new Date(payment.expiresAt);
    return expiryDate <= new Date();
  }
}
