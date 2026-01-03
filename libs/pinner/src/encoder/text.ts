import type { Encoder, EncoderResult, UploadOptions } from "./types";
import { EncoderError } from "./error";

/**
 * Text encoder - converts text strings to File objects.
 */
export class TextEncoder implements Encoder<string> {
  async encode(data: string, options?: UploadOptions): Promise<EncoderResult> {
    try {
      const blob = new Blob([data], { type: "text/plain" });
      const filename = options?.name || "data.txt";
      const file = new File([blob], filename, { type: "text/plain" });

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
          `Text encoding failed: ${error.message}`,
          "INVALID_TEXT",
          error,
        );
      }
      throw new EncoderError(
        "Text encoding failed: unknown error",
        "INVALID_TEXT",
      );
    }
  }
}

/**
 * Encode a text string to a File object.
 */
export async function textToFile(
  data: string,
  options?: UploadOptions,
): Promise<EncoderResult> {
  const encoder = new TextEncoder();
  return encoder.encode(data, options);
}
