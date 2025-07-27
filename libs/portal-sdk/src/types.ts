export interface RequestInit extends Omit<globalThis.RequestInit, "headers"> {
  headers?: Record<string, string>;
}

/**
 * Generic Result type for consistent error handling
 * @template T The type of data returned on success
 */
export type Result<T> =
  | {
      data: T;
      success: true;
    }
  | {
      error: AccountError;
      success: false;
    };


/**
 * Standard error type for account-related operations
 */
export class AccountError extends Error {
  public details?: any;

  constructor(
    message: string,
    public readonly statusCode: number,
    details?: any
  ) {
    super(message);
    this.name = "AccountError";
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details
    };
  }
}

/**
 * Convert a failed fetch Response to an AccountError
 * @param response The failed Response object
 * @returns A properly formatted AccountError
 */
export async function handleFetchError(
  response: Response,
): Promise<AccountError> {
  const statusCode = response.status;
  let errorMessage: string;
  let errorDetails: any = null;

  try {
    const data = await response.json();
    
    // Handle different error response formats
    if (data && typeof data === 'object') {
      if (data.error) {
        // Case 1: Error object with message
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error.message) {
          errorMessage = data.error.message;
          errorDetails = data.error.details || null;
        } else {
          errorMessage = JSON.stringify(data.error);
        }
      } else if (data.message) {
        // Case 2: Top-level message field
        errorMessage = data.message;
        errorDetails = data.details || null;
      } else {
        // Case 3: Fallback to stringify
        errorMessage = JSON.stringify(data);
      }
    } else if (typeof data === 'string') {
      // Case 4: Plain text error
      errorMessage = data;
    } else {
      // Case 5: Unknown format
      errorMessage = 'Unknown error occurred';
    }
  } catch (parseError) {
    // Fallback to text if JSON parsing fails
    errorMessage = (await response.text()) || response.statusText;
  }

  const error = new AccountError(errorMessage, statusCode);
  if (errorDetails) {
    error.details = errorDetails;
  }
  return error;
}

/**
 * Convert an unknown error to an AccountError
 * @param e The unknown error
 * @returns A properly formatted AccountError
 */
export function handleUnknownError(e: unknown): AccountError {
  if (e instanceof Error) {
    return new AccountError(e.message, 500);
  }

  if (typeof e === "object" && e !== null) {
    return new AccountError(JSON.stringify(e), 500);
  }

  return new AccountError(String(e), 500);
}
