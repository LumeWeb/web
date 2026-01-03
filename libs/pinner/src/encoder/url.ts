import ky, { isHTTPError, isTimeoutError } from "ky";
import type { Encoder, EncoderResult, UploadOptions } from "./types";
import { EncoderError } from "./error";

/**
 * URL encoder - fetches content from URLs and converts to File objects.
 */
export class UrlEncoder implements Encoder<string> {
  async encode(
    urlString: string,
    options?: UploadOptions,
  ): Promise<EncoderResult> {
    try {
      const blob = await ky(urlString, { fetch: options?.fetch }).blob();
      const filename =
        options?.name || new URL(urlString).pathname.split("/").pop() || "file";
      const file = new File([blob], filename, { type: blob.type });

      return {
        file,
        options: {
          name: options?.name,
          keyvalues: options?.keyvalues,
        },
      };
    } catch (error) {
      if (isHTTPError(error) || isTimeoutError(error)) {
        throw new EncoderError(
          `URL encoding failed: ${error.message}`,
          "NETWORK_ERROR",
          error,
        );
      }

      if (error instanceof Error) {
        throw new EncoderError(
          `URL encoding failed: ${error.message}`,
          "NETWORK_ERROR",
          error,
        );
      }

      throw new EncoderError("URL encoding failed: unknown error", "UNKNOWN");
    }
  }
}

/**
 * Encode a URL to a File object by fetching the content.
 */
export async function urlToFile(
  urlString: string,
  options?: UploadOptions,
): Promise<EncoderResult> {
  const encoder = new UrlEncoder();
  return encoder.encode(urlString, options);
}
