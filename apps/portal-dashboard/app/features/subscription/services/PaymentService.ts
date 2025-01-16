import { PaymentInfo, PaymentStatus } from "../types/payment.types";

import { PaymentInfo, PaymentStatus } from '../types/payment.types';

export class PaymentService {
  public getPaymentStatus(payment: PaymentInfo | null | undefined): PaymentStatus {
    if (!payment) return 'PENDING';
    
    // Handle expired payments first
    if (this.isPaymentExpired(payment)) {
      return 'FAILED';
    }
    
    // Then check explicit error states
    if (payment.errorMessage || !payment.clientSecret) {
      return 'FAILED';
    }
    
    // Check completion state
    if (payment.paymentMethodId && payment.status === 'COMPLETED') {
      return 'COMPLETED';
    }
    
    // Check processing state
    if (payment.status === 'PROCESSING') {
      return 'PROCESSING';
    }
    
    // Default to pending if no other conditions met
    return 'PENDING';
  }

  public isPaymentExpired(payment: PaymentInfo | null | undefined): boolean {
    if (!payment?.expiresAt) return false;
    
    try {
      return new Date(payment.expiresAt) <= new Date();
    } catch (error) {
      console.error('Invalid payment expiry date:', error);
      return true; // Fail safe - treat invalid dates as expired
    }
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

  public formatPaymentError(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'An unknown error occurred during payment processing';
  }
}
