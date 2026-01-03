/**
 * Browser-specific setup file for unit tests in the upload module.
 * This file sets up mocks that are specific to unit tests running in the browser.
 * Integration tests should NOT use this setup file.
 */

import { setupCommonTestMocks } from "./unit-mocks";

// Setup all shared mocks for unit tests in browser
setupCommonTestMocks();
