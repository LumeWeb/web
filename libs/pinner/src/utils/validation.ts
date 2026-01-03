/**
 * URL validation utilities to prevent SSRF and other security issues.
 */

import { ValidationError } from "@/errors";

export { ValidationError };

/**
 * Validates a URL string to ensure it's safe to fetch.
 * Only allows HTTP/HTTPS protocols and validates the URL format.
 *
 * @param urlString - The URL string to validate
 * @throws ValidationError if the URL is invalid or uses an unsafe protocol
 */
export function validateUrl(urlString: string): void {
  // Reject URLs with spaces or other invalid characters that shouldn't be in URLs
  if (/\s/.test(urlString)) {
    throw new ValidationError(
      `Invalid URL: contains whitespace characters`,
      "url",
    );
  }

  try {
    const url = new URL(urlString);

    // Only allow HTTP and HTTPS protocols
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new ValidationError(
        `Invalid URL protocol: ${url.protocol}. Only http: and https: are allowed.`,
        "url",
      );
    }

    // Prevent localhost and private IP addresses in server environments
    const hostname = url.hostname.toLowerCase();

    // Block localhost variants
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]" ||
      hostname.startsWith("127.")
    ) {
      throw new ValidationError(
        "Access to localhost addresses is not allowed",
        "url",
      );
    }

    // Block private IP ranges
    if (isPrivateIpAddress(hostname)) {
      throw new ValidationError(
        "Access to private IP addresses is not allowed",
        "url",
      );
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(
      `Invalid URL format: ${urlString}`,
      "url",
      error as Error,
    );
  }
}

/**
 * Check if a hostname is a private IP address.
 * This is a basic check that handles common IPv4 patterns.
 */
function isPrivateIpAddress(hostname: string): boolean {
  // IPv4 private ranges
  const ipv4PrivatePatterns = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./, // Link-local
    /^0\./, // Current network
  ];

  for (const pattern of ipv4PrivatePatterns) {
    if (pattern.test(hostname)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates a URL and returns the parsed URL object if valid.
 *
 * @param urlString - The URL string to validate
 * @returns The parsed URL object
 * @throws ValidationError if the URL is invalid
 */
export function parseValidatedUrl(urlString: string): URL {
  validateUrl(urlString);
  return new URL(urlString);
}
