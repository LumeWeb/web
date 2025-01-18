import { PaymentInfo, PaymentStatus } from "../types/payment.types";
import { BillingInfo } from "@/features/subscription/types/billing.types";

export class PaymentService {
  public getPaymentStatus(payment: PaymentInfo): PaymentStatus {
    if (!payment) return "PENDING";

    return "PROCESSING";
  }

  public isPaymentExpired(payment: PaymentInfo): boolean {
    if (!payment.expires_at) return false;

    const expiryDate = new Date(payment.expires_at);
    return expiryDate <= new Date();
  }
}
