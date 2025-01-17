import { PaymentInfo, PaymentStatus } from "../types/payment.types";
import { BillingInfo } from "@/features/subscription/types/billing.types";

export class PaymentService {
  public getPaymentStatus(payment: PaymentInfo): PaymentStatus {
    if (!payment) return "PENDING";

    if (payment.errorMessage) return "FAILED";

    if (payment.paymentMethodId) return "COMPLETED";

    return "PROCESSING";
  }

  public isPaymentExpired(payment: PaymentInfo): boolean {
    if (!payment.expiresAt) return false;

    const expiryDate = new Date(payment.expiresAt);
    return expiryDate <= new Date();
  }

  public async initializePayment({
    planId,
    billingInfo,
  }: {
    planId: string;
    billingInfo: BillingInfo;
  }): Promise<PaymentInfo> {
    // This would typically make an API call to initialize payment
    // For now returning mock data
    return {
      clientSecret: "mock_client_secret",
      publishableKey: "mock_publishable_key",
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };
  }
}
