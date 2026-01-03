/**
 * Unit tests for retry logic
 * Verifies that our retry.ts implementation matches ky's retry behavior
 */

import { describe, expect, it, vi } from "vitest";
import {
  calculateRetryDelay,
  DEFAULT_RETRY_OPTIONS,
  getRetryDelay,
  shouldRetryRequest,
} from "../node/retry";

describe("retry.ts", () => {
  describe("DEFAULT_RETRY_OPTIONS", () => {
    it("should have correct default values matching ky", () => {
      expect(DEFAULT_RETRY_OPTIONS.limit).toBe(2);
      expect(DEFAULT_RETRY_OPTIONS.methods).toEqual([
        "get",
        "put",
        "head",
        "delete",
        "options",
        "trace",
      ]);
      expect(DEFAULT_RETRY_OPTIONS.statusCodes).toEqual([
        408, 413, 429, 500, 502, 503, 504,
      ]);
      expect(DEFAULT_RETRY_OPTIONS.afterStatusCodes).toEqual([413, 429, 503]);
      expect(DEFAULT_RETRY_OPTIONS.maxRetryAfter).toBe(
        Number.POSITIVE_INFINITY,
      );
      expect(DEFAULT_RETRY_OPTIONS.backoffLimit).toBe(Number.POSITIVE_INFINITY);
      expect(DEFAULT_RETRY_OPTIONS.delay(1)).toBe(300); // 0.3 * 2^0 * 1000
      expect(DEFAULT_RETRY_OPTIONS.delay(2)).toBe(600); // 0.3 * 2^1 * 1000
      expect(DEFAULT_RETRY_OPTIONS.delay(3)).toBe(1200); // 0.3 * 2^2 * 1000
      expect(DEFAULT_RETRY_OPTIONS.delay(4)).toBe(2400); // 0.3 * 2^3 * 1000
      expect(DEFAULT_RETRY_OPTIONS.delay(5)).toBe(4800); // 0.3 * 2^4 * 1000
      expect(DEFAULT_RETRY_OPTIONS.jitter).toBeUndefined();
      expect(DEFAULT_RETRY_OPTIONS.retryOnTimeout).toBe(false);
    });
  });

  describe("calculateRetryDelay", () => {
    it("should calculate exponential backoff delay", () => {
      expect(calculateRetryDelay(1, DEFAULT_RETRY_OPTIONS)).toBe(300);
      expect(calculateRetryDelay(2, DEFAULT_RETRY_OPTIONS)).toBe(600);
      expect(calculateRetryDelay(3, DEFAULT_RETRY_OPTIONS)).toBe(1200);
      expect(calculateRetryDelay(4, DEFAULT_RETRY_OPTIONS)).toBe(2400);
      expect(calculateRetryDelay(5, DEFAULT_RETRY_OPTIONS)).toBe(4800);
    });

    it("should apply jitter when enabled as boolean", () => {
      const options = { ...DEFAULT_RETRY_OPTIONS, jitter: true };
      const delay = calculateRetryDelay(1, options);
      // With jitter, delay should be between 0 and the base delay
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(300);
    });

    it("should apply custom jitter function", () => {
      const customJitter = vi.fn((delay: number) => delay / 2);
      const options = { ...DEFAULT_RETRY_OPTIONS, jitter: customJitter };
      expect(calculateRetryDelay(1, options)).toBe(150);
      expect(customJitter).toHaveBeenCalledWith(300);
    });

    it("should handle invalid jitter function output", () => {
      const invalidJitter = vi.fn(() => NaN);
      const options = { ...DEFAULT_RETRY_OPTIONS, jitter: invalidJitter };
      expect(calculateRetryDelay(1, options)).toBe(300); // Fallback to base delay
    });

    it("should handle negative jitter function output", () => {
      const negativeJitter = vi.fn(() => -100);
      const options = { ...DEFAULT_RETRY_OPTIONS, jitter: negativeJitter };
      expect(calculateRetryDelay(1, options)).toBe(300); // Fallback to base delay
    });

    it("should respect backoffLimit", () => {
      const options = { ...DEFAULT_RETRY_OPTIONS, backoffLimit: 1000 };
      expect(calculateRetryDelay(4, options)).toBe(1000); // Backoff would be 2400, limited to 1000
    });

    it("should handle undefined backoffLimit as Infinity", () => {
      const options = { ...DEFAULT_RETRY_OPTIONS, backoffLimit: undefined };
      expect(calculateRetryDelay(10, options)).toBe(153600); // No limit
    });
  });

  describe("getRetryDelay", () => {
    it("should return base delay when no response is provided", () => {
      expect(getRetryDelay(1, DEFAULT_RETRY_OPTIONS)).toBe(300);
    });

    it("should return base delay when response has no Retry-After header", () => {
      const response = new Response("", { status: 500 });
      expect(getRetryDelay(1, DEFAULT_RETRY_OPTIONS, response)).toBe(300);
    });

    it("should parse numeric Retry-After header", () => {
      const response = new Response("", {
        status: 429,
        headers: { "Retry-After": "5" },
      });
      expect(getRetryDelay(1, DEFAULT_RETRY_OPTIONS, response)).toBe(5000);
    });

    it("should parse HTTP-date Retry-After header", () => {
      const futureDate = new Date(Date.now() + 10000);
      const httpDate = futureDate.toUTCString();
      const response = new Response("", {
        status: 429,
        headers: { "Retry-After": httpDate },
      });
      const delay = getRetryDelay(1, DEFAULT_RETRY_OPTIONS, response);
      expect(delay).toBeGreaterThanOrEqual(9000); // Allow ~1s tolerance
      expect(delay).toBeLessThanOrEqual(11000);
    });

    it("should handle large number as timestamp", () => {
      const futureTimestamp = Math.floor((Date.now() + 10000) / 1000); // Convert to seconds
      const response = new Response("", {
        status: 429,
        headers: { "Retry-After": String(futureTimestamp) },
      });
      const delay = getRetryDelay(1, DEFAULT_RETRY_OPTIONS, response);
      expect(delay).toBeGreaterThanOrEqual(9000);
      expect(delay).toBeLessThanOrEqual(11000);
    });

    it("should respect maxRetryAfter", () => {
      const response = new Response("", {
        status: 429,
        headers: { "Retry-After": "100" },
      });
      const options = { ...DEFAULT_RETRY_OPTIONS, maxRetryAfter: 5000 };
      expect(getRetryDelay(1, options, response)).toBe(5000);
    });

    it("should not apply jitter when Retry-After is present", () => {
      const response = new Response("", {
        status: 429,
        headers: { "Retry-After": "10" },
      });
      const options = { ...DEFAULT_RETRY_OPTIONS, jitter: true };
      expect(getRetryDelay(1, options, response)).toBe(10000); // Exactly 10 seconds, no jitter
    });

    it("should check alternative Retry-After headers", () => {
      const headers = [
        ["RateLimit-Reset", "5"],
        ["X-RateLimit-Retry-After", "5"],
        ["X-RateLimit-Reset", "5"],
        ["X-Rate-Limit-Reset", "5"],
      ];

      for (const [header, value] of headers) {
        const response = new Response("", {
          status: 429,
          headers: { [header]: value },
        });
        expect(getRetryDelay(1, DEFAULT_RETRY_OPTIONS, response)).toBe(5000);
      }
    });

    it("should only apply Retry-After for statuses in afterStatusCodes", () => {
      // 429 is in afterStatusCodes
      const response429 = new Response("", {
        status: 429,
        headers: { "Retry-After": "5" },
      });
      expect(getRetryDelay(1, DEFAULT_RETRY_OPTIONS, response429)).toBe(5000);

      // 500 is not in afterStatusCodes
      const response500 = new Response("", {
        status: 500,
        headers: { "Retry-After": "5" },
      });
      expect(getRetryDelay(1, DEFAULT_RETRY_OPTIONS, response500)).toBe(300);
    });
  });

  describe("shouldRetryRequest", () => {
    it("should return false when retryCount exceeds limit", () => {
      const error = new Error("Test error");
      const options = { ...DEFAULT_RETRY_OPTIONS, limit: 2 };
      expect(shouldRetryRequest(error, "GET", 2, options)).toBe(false);
      expect(shouldRetryRequest(error, "GET", 3, options)).toBe(false);
    });

    it("should return true when retryCount is within limit", () => {
      const error = new Error("Test error");
      const options = { ...DEFAULT_RETRY_OPTIONS, limit: 2 };
      expect(shouldRetryRequest(error, "GET", 0, options)).toBe(true);
      expect(shouldRetryRequest(error, "GET", 1, options)).toBe(true);
    });

    it("should call userShouldRetry hook", () => {
      const error = new Error("Test error");
      const userShouldRetry = vi.fn(() => false);
      expect(
        shouldRetryRequest(
          error,
          "GET",
          0,
          DEFAULT_RETRY_OPTIONS,
          userShouldRetry,
        ),
      ).toBe(false);
      expect(userShouldRetry).toHaveBeenCalledWith(error);
    });

    it("should default to true when userShouldRetry is not provided", () => {
      const error = new Error("Test error");
      expect(shouldRetryRequest(error, "GET", 0, DEFAULT_RETRY_OPTIONS)).toBe(
        true,
      );
    });

    describe("HTTP errors", () => {
      it("should return false for non-retriable methods", () => {
        const error = new Error("Test error") as any;
        error.response = new Response("", { status: 500 });
        expect(
          shouldRetryRequest(error, "POST", 0, DEFAULT_RETRY_OPTIONS),
        ).toBe(false); // POST is not in ky's default methods
        expect(shouldRetryRequest(error, "GET", 0, DEFAULT_RETRY_OPTIONS)).toBe(
          true,
        ); // GET is allowed
        expect(shouldRetryRequest(error, "PUT", 0, DEFAULT_RETRY_OPTIONS)).toBe(
          true,
        ); // PUT is allowed
        expect(
          shouldRetryRequest(error, "HEAD", 0, DEFAULT_RETRY_OPTIONS),
        ).toBe(true); // HEAD is allowed
        expect(
          shouldRetryRequest(error, "DELETE", 0, DEFAULT_RETRY_OPTIONS),
        ).toBe(true); // DELETE is allowed
        // PATCH is not in default methods
        expect(
          shouldRetryRequest(error, "PATCH", 0, DEFAULT_RETRY_OPTIONS),
        ).toBe(false);
      });

      it("should return false for non-retriable status codes", () => {
        const error = new Error("Test error") as any;
        error.response = new Response("", { status: 404 });
        expect(shouldRetryRequest(error, "GET", 0, DEFAULT_RETRY_OPTIONS)).toBe(
          false,
        );
      });

      it("should return true for retriable status codes", () => {
        const retriableStatuses = [408, 413, 429, 500, 502, 503, 504];
        for (const status of retriableStatuses) {
          const error = new Error("Test error") as any;
          error.response = new Response("", { status });
          if (status === 413) {
            // 413 is special case - never retried
            expect(
              shouldRetryRequest(error, "GET", 0, DEFAULT_RETRY_OPTIONS),
            ).toBe(false);
          } else {
            expect(
              shouldRetryRequest(error, "GET", 0, DEFAULT_RETRY_OPTIONS),
            ).toBe(true);
          }
        }
      });

      it("should return false for 413 (Payload Too Large) regardless of settings", () => {
        const error = new Error("Test error") as any;
        error.response = new Response("", { status: 413 });
        expect(shouldRetryRequest(error, "GET", 0, DEFAULT_RETRY_OPTIONS)).toBe(
          false,
        );
      });

      it("should check method case-insensitively", () => {
        const error = new Error("Test error") as any;
        error.response = new Response("", { status: 500 });
        expect(shouldRetryRequest(error, "get", 0, DEFAULT_RETRY_OPTIONS)).toBe(
          true,
        );
        expect(shouldRetryRequest(error, "GET", 0, DEFAULT_RETRY_OPTIONS)).toBe(
          true,
        );
        expect(shouldRetryRequest(error, "Get", 0, DEFAULT_RETRY_OPTIONS)).toBe(
          true,
        );
      });

      it("should respect userShouldRetry for HTTP errors", () => {
        const error = new Error("Test error") as any;
        error.response = new Response("", { status: 500 });
        const userShouldRetry = vi.fn(() => false);
        expect(
          shouldRetryRequest(
            error,
            "GET",
            0,
            DEFAULT_RETRY_OPTIONS,
            userShouldRetry,
          ),
        ).toBe(false);
      });
    });

    describe("Network errors", () => {
      it("should return false when userShouldRetry returns false", () => {
        const error = new Error("Network error");
        const userShouldRetry = vi.fn(() => false);
        expect(
          shouldRetryRequest(
            error,
            "GET",
            0,
            DEFAULT_RETRY_OPTIONS,
            userShouldRetry,
          ),
        ).toBe(false);
      });

      it("should return true when userShouldRetry returns true", () => {
        const error = new Error("Network error");
        const userShouldRetry = vi.fn(() => true);
        expect(
          shouldRetryRequest(
            error,
            "GET",
            0,
            DEFAULT_RETRY_OPTIONS,
            userShouldRetry,
          ),
        ).toBe(true);
      });

      it("should return true by default for network errors", () => {
        const error = new Error("Network error");
        expect(shouldRetryRequest(error, "GET", 0, DEFAULT_RETRY_OPTIONS)).toBe(
          true,
        );
      });
    });

    describe("Timeout errors", () => {
      it("should return false when retryOnTimeout is false", () => {
        const error = new Error("Timeout");
        error.name = "TimeoutError";
        expect(shouldRetryRequest(error, "GET", 0, DEFAULT_RETRY_OPTIONS)).toBe(
          false,
        );
      });

      it("should return true when retryOnTimeout is true", () => {
        const error = new Error("Timeout");
        error.name = "TimeoutError";
        const options = { ...DEFAULT_RETRY_OPTIONS, retryOnTimeout: true };
        expect(shouldRetryRequest(error, "GET", 0, options)).toBe(true);
      });

      it("should detect timeout errors by name", () => {
        const error = new Error("Timeout");
        error.name = "TimeoutError";
        const options = { ...DEFAULT_RETRY_OPTIONS, retryOnTimeout: false };
        expect(shouldRetryRequest(error, "GET", 0, options)).toBe(false);

        const abortError = new Error("Aborted");
        abortError.name = "AbortError";
        expect(shouldRetryRequest(abortError, "GET", 0, options)).toBe(false);
      });

      it("should detect timeout errors by message content", () => {
        const error1 = new Error("The request timed out");
        const options = { ...DEFAULT_RETRY_OPTIONS, retryOnTimeout: false };
        expect(shouldRetryRequest(error1, "GET", 0, options)).toBe(false);

        const error2 = new Error("Network timeout occurred");
        expect(shouldRetryRequest(error2, "GET", 0, options)).toBe(false);
      });
    });
  });
});
