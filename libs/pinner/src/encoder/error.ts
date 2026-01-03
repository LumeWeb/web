/**
 * Error wrapper for encoder operations.
 */
export class EncoderError extends Error {
  code: "INVALID_JSON" | "INVALID_BASE64" | "INVALID_URL" | "INVALID_CSV" | "INVALID_TEXT" | "NETWORK_ERROR" | "UNKNOWN";
  cause?: Error;

  constructor(
    message: string,
    code: EncoderError["code"],
    cause?: Error,
  ) {
    super(message);
    this.name = "EncoderError";
    this.code = code;
    this.cause = cause;
  }
}
