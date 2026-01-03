import { PinnerError } from "../errors";

/**
 * Check if error is retryable.
 */
export function isRetryable(error: PinnerError): boolean {
  return error.retryable;
}

/**
 * Check if error is authentication-related.
 */
export function isAuthenticationError(error: PinnerError): boolean {
  return error instanceof PinnerError && error.code === "AUTHENTICATION_ERROR";
}
