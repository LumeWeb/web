/**
 * URL validation utilities to prevent SSRF and other security issues.
 */

import { ValidationError } from "@/errors";
import ipaddr from "ipaddr.js";

export { ValidationError };

// IPv4 ranges to block
const BLOCKED_IPV4_RANGES = new Set([
  "private", // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  "loopback", // 127.0.0.0/8
  "linkLocal", // 169.254.0.0/16
  "reserved",
  "broadcast",
  "carrierGradeNat", // 100.64.0.0/10
  "unspecified", // 0.0.0.0/8
]);

// IPv6 ranges to block
const BLOCKED_IPV6_RANGES = new Set([
  "uniqueLocal", // fc00::/7
  "loopback", // ::1
  "linkLocal", // fe80::/10
  "reserved",
  "multicast", // ff00::/8
  "ipv4Mapped", // ::ffff:0:0/96
  "unspecified", // ::
]);

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

    const hostname = url.hostname.toLowerCase();

    // Block localhost (case-insensitive)
    if (hostname === "localhost") {
      throw new ValidationError(
        "Access to localhost addresses is not allowed",
        "url",
      );
    }

    // Strip brackets from IPv6 addresses for ipaddr.js
    const cleanHostname = hostname.replace(/^\[|\]$/g, "");

    // Block IP addresses using ipaddr.js
    // This library handles alternative notations (decimal, octal, hex)
    // and comprehensive private range detection for both IPv4 and IPv6
    if (ipaddr.isValid(cleanHostname)) {
      const addr = ipaddr.parse(cleanHostname);

      // Check for IPv4 private ranges
      if (addr.kind() === "ipv4") {
        const ipv4Addr = addr as ipaddr.IPv4;
        const range = ipv4Addr.range();

        if (BLOCKED_IPV4_RANGES.has(range)) {
          throw new ValidationError(
            "Access to private IP addresses is not allowed",
            "url",
          );
        }
      }

      // Check for IPv6 private ranges
      if (addr.kind() === "ipv6") {
        const ipv6Addr = addr as ipaddr.IPv6;
        const range = ipv6Addr.range();

        if (BLOCKED_IPV6_RANGES.has(range)) {
          throw new ValidationError(
            "Access to private IP addresses is not allowed",
            "url",
          );
        }
      }
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
