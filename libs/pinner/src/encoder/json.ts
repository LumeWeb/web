import type { Encoder, EncoderResult, UploadOptions } from "./types";
import { EncoderError } from "./error";

/**
 * JSON encoder - converts JSON objects to File objects.
 */
export class JsonEncoder implements Encoder<object> {
  async encode(data: object, options?: UploadOptions): Promise<EncoderResult> {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const filename = options?.name || "data.json";
      const file = new File([blob], filename, { type: "application/json" });

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
          `JSON encoding failed: ${error.message}`,
          "INVALID_JSON",
          error,
        );
      }
      throw new EncoderError(
        "JSON encoding failed: unknown error",
        "INVALID_JSON",
      );
    }
  }
}

/**
 * Encode a JSON object to a File object.
 */
export async function jsonToFile(
  data: object,
  options?: UploadOptions,
): Promise<EncoderResult> {
  const encoder = new JsonEncoder();
  return encoder.encode(data, options);
}
