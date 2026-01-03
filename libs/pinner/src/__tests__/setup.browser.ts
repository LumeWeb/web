/**
 * Browser-specific test setup for integration tests
 */

import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { allHandlers, resetRequestCounter } from "./msw-handlers";
import { clearAllTusUploadStates } from "./msw-upload-handlers";
import { applyXHRInterceptor, updateHandlers } from "./xhr-interceptor";
import { setupCarPreprocessor } from "./setup";
import { destroyCarPreprocessor } from "../upload/car";
import type { RequestHandler } from "msw";

beforeAll(() => {
  // Apply the global XHR interceptor once before all tests
  // XMLHttpRequest can only be patched once per browser context
  applyXHRInterceptor();
});

beforeEach(async () => {
  // Configure CAR preprocessor for all tests
  setupCarPreprocessor();

  // Reset state before each test
  resetRequestCounter();
  // Reset handlers to base handlers before each test
  updateHandlers(allHandlers as RequestHandler[]);
});

afterEach(async () => {
  // Cleanup after each test
  resetRequestCounter();
  clearAllTusUploadStates();
  // Destroy CAR preprocessor
  await destroyCarPreprocessor();
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
