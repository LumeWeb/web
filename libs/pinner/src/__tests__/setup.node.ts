// Node.js specific test setup with MSW server
// This file sets up MSW server for Node.js test environment

import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { setupServer } from "msw/node";
import { allHandlers, resetRequestCounter } from "./msw-handlers";
import { setupCarPreprocessor } from "./setup";
import { destroyCarPreprocessor } from "@/upload/car";

// Setup MSW server for Node.js environment
export const server = setupServer(...allHandlers);

// Configure CAR preprocessor for all tests
beforeEach(() => {
  setupCarPreprocessor();
});

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Reset handlers and clean up CAR preprocessor after each test for test isolation
afterEach(async () => {
  server.resetHandlers();
  resetRequestCounter();
  await destroyCarPreprocessor();
});
