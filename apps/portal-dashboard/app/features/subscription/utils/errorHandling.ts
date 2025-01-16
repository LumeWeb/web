import axios from 'axios';
import { SubscriptionError } from '../types/subscription.types';

export function handleSubscriptionError(error: unknown): SubscriptionError {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    let message = error.response?.data?.message || 'Subscription operation failed';

    // Enhance error message based on status code
    if (statusCode === 400) {
      message = 'Invalid subscription request - please check plan details';
    } else if (statusCode === 403) {
      message = 'Not authorized to create subscription';
    } else if (statusCode === 409) {
      message = 'Subscription already exists';
    }

    return {
      message,
      statusCode,
      code: error.response?.data?.code,
      details: error.response?.data?.details
    };
  }

  return {
    message: error instanceof Error ? error.message : 'Unknown error occurred'
  };
}
