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
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AccountError";
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

  try {
    // Try to parse as JSON first
    const data = await response.json();
    errorMessage = typeof data === "string" ? data : JSON.stringify(data);
  } catch {
    // Fallback to text if not JSON
    errorMessage = (await response.text()) || response.statusText;
  }

  return new AccountError(errorMessage, statusCode);
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
