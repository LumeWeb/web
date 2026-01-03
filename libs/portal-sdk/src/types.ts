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
  public fields?: Record<string, string>;

  constructor(
    message: string,
    public readonly statusCode: number,
    details?: any,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AccountError";
    this.details = details;
    this.fields = fields;
  }

  toJSON() {
    return {
      details: this.details,
      fields: this.fields,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Helper function to normalize field values
 */
function normalizeFields(fields: Record<string, any>): Record<string, string> | undefined {
  if (!fields) return undefined;
  
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      normalized[key] = value.join(', ');
    } else if (value === null || value === undefined) {
      normalized[key] = '';
    } else if (typeof value === 'object') {
      normalized[key] = JSON.stringify(value);
    } else {
      normalized[key] = String(value);
    }
  }
  return normalized;
}

/**
 * Extract error details from a response JSON object
 */
function extractErrorDetails(data: any): {
  message: string;
  details?: any;
  fields?: Record<string, string>;
} {
  let result: {
    message: string;
    details?: any;
    fields?: Record<string, string>;
  } = {
    message: '',
    details: undefined,
    fields: undefined
  };

  // Handle standard error format
  if (data?.error) {
    if (typeof data.error === 'string') {
      result.message = data.error;
    } else if (data.error?.message) {
      result.message = data.error.message;
      result.details = data.error.details;
      result.fields = normalizeFields(data.error.fields);
    }
  } 
  // Handle alternative error formats
  else if (data?.message) {
    result.message = data.message;
    result.details = data.details;
    result.fields = normalizeFields(data.fields);
  } else {
    result.message = JSON.stringify(data);
  }

  // Always include fields if they exist at any level
  if (!result.fields) {
    result.fields = normalizeFields(data?.fields) || normalizeFields(data?.error?.fields);
  }

  return result;
}

/**
 * Convert a failed fetch Response to an AccountError
 * @param response The failed Response object
 * @returns A properly formatted AccountError
 */
export async function handleFetchError(
  response: Response,
): Promise<AccountError> {
  try {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.toLowerCase()?.includes('json');
    const clone = response.clone();
    let errorData: any;

    if (isJson) {
      try {
        errorData = await response.json();
      } catch {
        // Preserve status; fall back to text/statusText
        const txt = await clone.text().catch(() => '');
        errorData = txt || response.statusText;
      }
    } else {
      errorData = await response.text();
      if (!errorData) errorData = response.statusText;
    }

    const { message, details, fields } = typeof errorData === 'string' 
      ? { message: errorData }
      : extractErrorDetails(errorData);

    return new AccountError(
      message || 'Unknown error',
      response.status,
      details,
      fields
    );
  } catch (e) {
    // As a last resort, still preserve the HTTP status when possible
    return new AccountError(
      response.statusText || 'Unknown error',
      response.status,
      { cause: e }
    );
  }
}

/**
 * Convert an unknown error to an AccountError
 * @param e The unknown error
 * @returns A properly formatted AccountError
 */
export function handleUnknownError(e: unknown): AccountError {
  if (e instanceof AccountError) {
    return e;
  }

  if (e instanceof Error) {
    return new AccountError(e.message, 500, { cause: e });
  }

  if (typeof e === "object" && e !== null) {
    let msg: string;
    try {
      msg = JSON.stringify(e);
    } catch {
      msg = String(e);
    }
    return new AccountError(msg, 500, { cause: e });
  }

  return new AccountError(String(e), 500);
}
