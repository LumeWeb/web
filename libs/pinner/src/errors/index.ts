export class PinnerError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryable: boolean,
    public cause?: Error
  ) {
    super(message);
    this.name = "PinnerError";
  }
}

export class ConfigurationError extends PinnerError {
  constructor(message: string, cause?: Error) {
    super("CONFIGURATION_ERROR", message, false, cause);
    this.name = "ConfigurationError";
  }
}

export class AuthenticationError extends PinnerError {
  constructor(message: string = "Authentication failed", cause?: Error) {
    super("AUTHENTICATION_ERROR", message, false, cause);
    this.name = "AuthenticationError";
  }
}

export class UploadError extends PinnerError {
  code = "UPLOAD_ERROR";

  constructor(
    message: string,
    public override retryable: boolean = false,
    cause?: Error
  ) {
    super("UPLOAD_ERROR", message, retryable, cause);
    this.name = "UploadError";
  }
}

export class NetworkError extends UploadError {
  constructor(message: string = "Network request failed", cause?: Error) {
    super(message, true, cause);
    this.name = "NetworkError";
    this.code = "NETWORK_ERROR";
    this.retryable = true;
  }
}

export class ValidationError extends UploadError {
  constructor(message: string, public field?: string, cause?: Error) {
    super(message, false, cause);
    this.name = "ValidationError";
    this.code = "VALIDATION_ERROR";
    this.retryable = false;
  }
}

export class EmptyFileError extends ValidationError {
  constructor(message: string = "Cannot upload empty file", cause?: Error) {
    super(message, "file", cause);
    this.name = "EmptyFileError";
    this.code = "EMPTY_FILE_ERROR";
  }
}

export class TimeoutError extends UploadError {
  constructor(message: string = "Request timed out", cause?: Error) {
    super(message, true, cause);
    this.name = "TimeoutError";
    this.code = "TIMEOUT_ERROR";
    this.retryable = true;
  }
}

export class PinError extends PinnerError {
  constructor(message: string = "Pin operation failed", retryable: boolean = false, cause?: Error) {
    super("PIN_ERROR", message, retryable, cause);
    this.name = "PinError";
  }
}

export class NotFoundError extends PinError {
  constructor(message: string = "Resource not found", cause?: Error) {
    super(message, false, cause);
    this.name = "NotFoundError";
    this.code = "NOT_FOUND";
    this.retryable = false;
  }
}

export class RateLimitError extends PinError {
  /**
   * Seconds to wait before retry.
   */
  retryAfter?: number;

  constructor(message: string = "Rate limit exceeded", retryAfter?: number, cause?: Error) {
    super(message, true, cause);
    this.name = "RateLimitError";
    this.code = "RATE_LIMIT_EXCEEDED";
    this.retryable = true;
    this.retryAfter = retryAfter;
  }
}

export class EnvironmentError extends PinnerError {
  constructor(message: string = "Unsupported environment", cause?: Error) {
    super("ENVIRONMENT_ERROR", message, false, cause);
    this.name = "EnvironmentError";
  }
}