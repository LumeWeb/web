/**
 * Browser-specific test setup for integration tests
 */

import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { resetRequestCounter } from "./setup";
import { applyXHRInterceptor, updateHandlers } from "./xhr-interceptor";
import { resetNetworkClient } from "../network/index.js";
import { allHandlers } from "./msw-handlers";
import type { RequestHandler } from "msw";

beforeAll(() => {
  // Apply the global XHR interceptor once before all tests
  // XMLHttpRequest can only be patched once per browser context
  applyXHRInterceptor();
});

beforeEach(async () => {
  // Reset state before each test
  resetRequestCounter();
  // Reset handlers to base handlers before each test
  updateHandlers(allHandlers);
});

afterEach(() => {
  // Cleanup after each test
  resetRequestCounter();
  // Reset network client to clear any hooks set by previous tests
  resetNetworkClient();
});

afterAll(() => {
  // Note: We don't dispose the interceptor as it's global for the test run
});

/**
 * Updates the handlers in the XHR interceptor.
 * This is called by the test fixture when handlers are added or reset.
 */
export function updateInterceptorHandlers(handlers: readonly any[]) {
  updateHandlers(handlers as RequestHandler[]);
}
