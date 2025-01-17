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
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatBytes(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}
