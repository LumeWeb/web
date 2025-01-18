import axios from "axios";
import { BillingInfo, SubscriptionError } from "../types/subscription.types";

export function handleSubscriptionError(error: unknown): SubscriptionError {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    let message =
      error.response?.data?.message || "Subscription operation failed";

    // Enhance error message based on status code
    if (statusCode === 400) {
      message = "Invalid subscription request - please check plan details";
    } else if (statusCode === 403) {
      message = "Not authorized to create subscription";
    } else if (statusCode === 409) {
      message = "Subscription already exists";
    }

    return {
      message,
      statusCode,
      code: error.response?.data?.code,
      details: error.response?.data?.details,
    };
  }

  return {
    message: error instanceof Error ? error.message : "Unknown error occurred",
  };
}

interface BillingErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface BillingError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: BillingValidationError[];
}

export function handleBillingError(error: unknown | any): BillingError {
  if (axios.isAxiosError(error) || error?.name === "AxiosError") {
    const response = error.response?.data as BillingErrorResponse;

    if (response?.details) {
      return {
        message: response.message || "Validation failed",
        code: response.code,
        errors: Object.entries(response.details).map(([field, message]) => ({
          field: field as keyof BillingInfo,
          message,
        })),
      };
    }

    return {
      message: response?.message || "Billing operation failed",
      code: response?.code,
      statusCode: error.response?.status,
    };
  }

  return {
    message:
      error instanceof Error ? error.message : "Unknown billing error occurred",
  };
}
