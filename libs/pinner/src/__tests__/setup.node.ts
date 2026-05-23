// Node.js specific test setup with MSW server
// This file sets up MSW server for Node.js test environment

import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { setupServer } from "msw/node";
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
import { setupCarPreprocessor } from "./setup";
import { destroyCarPreprocessor } from "@/upload/car";

const pinStore = new PinStore();
const tusStore = new TusStore();
const operationStore = new OperationStore();
const websiteStore = new WebsiteStore();
const ipnsStore = new IPNSStore();

await pinStore.initializeDefaults();
await websiteStore.initializeDefaults();
await ipnsStore.initializeDefaults();

const allHandlers = [
  ...createPinHandlers(pinStore),
  ...createUploadHandlers(tusStore, operationStore),
  ...createWebsiteHandlers(websiteStore, ipnsStore),
];

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
  server.resetHandlers(...allHandlers);
  await destroyCarPreprocessor();
});
