// Node.js specific test setup with MSW server
// This file sets up MSW server for Node.js test environment

import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { allHandlers, resetRequestCounter } from "./msw-handlers";

// Setup MSW server for Node.js environment
export const server = setupServer(...allHandlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Reset handlers and clean up after each test for test isolation
afterEach(() => {
  server.resetHandlers();
  resetRequestCounter();
});
