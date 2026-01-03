import type { Encoder, EncoderResult, UploadOptions } from "./types";
import { EncoderError } from "./error";

/**
 * Base64 encoder - converts base64 strings to File objects.
 */
export class Base64Encoder implements Encoder<string> {
  async encode(
    base64String: string,
    options?: UploadOptions,
  ): Promise<EncoderResult> {
    try {
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/octet-stream" });
      const filename = options?.name || "file.bin";
      const file = new File([blob], filename, {
        type: "application/octet-stream",
      });

      return {
        file,
        options: {
          name: options?.name,
          keyvalues: options?.keyvalues,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new EncoderError(
          `Base64 encoding failed: ${error.message}`,
          "INVALID_BASE64",
          error,
        );
      }
      throw new EncoderError(
        "Base64 encoding failed: unknown error",
        "INVALID_BASE64",
      );
    }
  }
}

/**
 * Encode a base64 string to a File object.
 */
export async function base64ToFile(
  base64String: string,
  options?: UploadOptions,
): Promise<EncoderResult> {
  const encoder = new Base64Encoder();
  return encoder.encode(base64String, options);
}
