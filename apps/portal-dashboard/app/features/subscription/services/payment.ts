import { PaymentInfo, PaymentStatus } from "../types/payment.types";

export function getPaymentStatus(payment: PaymentInfo): PaymentStatus {
  if (!payment) return "PENDING";
  if (payment.errorMessage) return "FAILED";
  if (payment.paymentMethodId) return "COMPLETED";
  return "PROCESSING";
}

export function isPaymentExpired(payment: PaymentInfo): boolean {
  if (!payment.expiresAt) return false;
  const expiryDate = new Date(payment.expiresAt);
  return expiryDate <= new Date();
}

export function validatePaymentInfo(payment: PaymentInfo): string | null {
  if (!payment.clientSecret) {
    return "Payment session not initialized";
  }

  if (!payment.publishableKey) {
    return "Invalid payment configuration";
  }

  if (isPaymentExpired(payment)) {
    return "Payment session has expired";
  }

  return null;
}
