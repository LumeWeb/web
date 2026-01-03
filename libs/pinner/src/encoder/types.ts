/**
 * Upload options for encoders.
 */
export interface UploadOptions {
  name?: string;
  keyvalues?: Record<string, string>;
  fetch?: typeof fetch;
}

/**
 * Encoder result.
 */
export interface EncoderResult {
  file: File;
  options: UploadOptions;
}

/**
 * Generic encoder interface.
 */
export interface Encoder<TInput = unknown> {
  encode(input: TInput, options?: UploadOptions): Promise<EncoderResult>;
}
