/**
 * Browser-specific test setup for integration tests
 */

import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import {
  PinStore,
  createPinHandlers,
  TusStore,
  OperationStore,
  createUploadHandlers,
  WebsiteStore,
  IPNSStore,
  createWebsiteHandlers,
} from "./msw";
import { resetRequestCounter } from "./setup";
import { applyXHRInterceptor, updateHandlers } from "./xhr-interceptor";
import { setupCarPreprocessor } from "./setup";
import { destroyCarPreprocessor } from "../upload/car";
import type { RequestHandler } from "msw";

const pinStore = new PinStore();
const tusStore = new TusStore();
const operationStore = new OperationStore();
const websiteStore = new WebsiteStore();
const ipnsStore = new IPNSStore();

const allHandlers = [
  ...createPinHandlers(pinStore),
  ...createUploadHandlers(tusStore, operationStore),
  ...createWebsiteHandlers(websiteStore, ipnsStore),
];

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
  tusStore.reset();
  operationStore.reset();
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
