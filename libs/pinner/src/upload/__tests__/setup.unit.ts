/**
 * Setup file for unit tests in the upload module.
 * This file sets up mocks that are specific to unit tests.
 * Integration tests should NOT use this setup file.
 */

import { setupCommonTestMocks } from "./unit-mocks";

// Setup all shared mocks for unit tests
// Only run in Node environment - browser tests use MSW handlers
if (typeof process !== "undefined" && process.env?.VITEST_ENV === "node") {
  setupCommonTestMocks();
}
