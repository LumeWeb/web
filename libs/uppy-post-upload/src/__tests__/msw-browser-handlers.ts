/**
 * MSW (Mock Service Worker) handlers for browser-only XHRUpload integration tests
 * These handlers are specific to browser testing scenarios
 */

import { vi, type Mock } from "vitest";
import { http, HttpResponse } from "msw";
import {
  createHeaderSpyHandler,
  createOptionsHandler,
  createPostHandler,
  createUploadHandlerPair,
} from "./msw-handlers";

// ============================================================================
// ENDPOINT FUNCTION TESTS
// ============================================================================

/**
 * Handler for endpoint function tests (single file)
 * Endpoint: https://fake-endpoint.uppy.io/upload/:filename
 */
export const endpointFunctionHandler = http.post(
  "https://fake-endpoint.uppy.io/upload/:filename",
  () => {
    return HttpResponse.json(null, {
      status: 200,
      headers: {
        "access-control-allow-origin": "*",
      },
    });
  },
);

/**
 * Handler for endpoint function tests (bundle upload)
 * Endpoint: https://fake-endpoint.uppy.io/upload-bundle/:filenames
 */
export const endpointBundleHandler = http.post(
  "https://fake-endpoint.uppy.io/upload-bundle/:filenames",
  () => {
    return HttpResponse.json(null, {
      status: 200,
      headers: {
        "access-control-allow-origin": "*",
      },
    });
  },
);

// ============================================================================
// FUNCTION HEADERS TESTS
// ============================================================================

/**
 * Handler for headers as function tests
 * Uses the generic createHeaderSpyHandler factory from msw-handlers.ts
 * @param spy - Vitest spy function to capture header value
 */
export const createSampleHeaderSpyHandler = (spy: Mock) =>
  createHeaderSpyHandler(
    spy,
    "x-sample-header",
    "https://fake-endpoint.uppy.io",
    null,
  );

// ============================================================================
// HOOKS TESTS
// ============================================================================

/**
 * Handler for hooks tests with OPTIONS and POST
 */
export const hooksTestHandlers = [
  createOptionsHandler("https://fake-endpoint.uppy.io", {
    "access-control-allow-headers": "*",
  }),
  http.post("https://fake-endpoint.uppy.io", () => {
    return HttpResponse.text("https://fake-endpoint.uppy.io/random-id", {
      status: 200,
      headers: {
        "access-control-allow-method": "POST",
        "access-control-allow-origin": "*",
      },
    });
  }),
];

/**
 * Handler for upload-error event response test
 */
export const uploadErrorResponseHandler = createPostHandler(
  "https://fake-endpoint.uppy.io/",
  { status: 400, message: "Oh no" },
  400,
);

// ============================================================================
// UPLOAD PROGRESS TESTS
// ============================================================================

/**
 * Handler for upload progress tests
 * Consolidated from OPTIONS + POST pair to use createUploadHandlerPair
 */
export const uploadProgressHandlers = createUploadHandlerPair("upload");

/**
 * Handler for bundle upload progress tests
 * Consolidated from OPTIONS + POST pair to use createUploadHandlerPair
 */
export const bundleProgressHandlers = createUploadHandlerPair("upload-bundle", {
  url: "https://api.test.com/files/bundle",
});

// ============================================================================
// CANCELLATION TESTS
// ============================================================================

/**
 * Handler for cancellation tests with OPTIONS
 * Uses the generic createOptionsHandler factory
 */
export const cancellationOptionsHandler = createOptionsHandler(
  "https://api.test.com/upload",
);

/**
 * Handler for cancellation tests with simulated slow upload
 */
export const slowUploadHandler = http.post(
  "https://api.test.com/upload",
  async () => {
    // Simulate long upload
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return HttpResponse.json({ url: "https://example.com/file" });
  },
);

// ============================================================================
// HANDLER COLLECTIONS
// ============================================================================

export const browserTestHandlers = [
  endpointFunctionHandler,
  endpointBundleHandler,
  ...hooksTestHandlers,
  uploadErrorResponseHandler,
  ...uploadProgressHandlers,
  ...bundleProgressHandlers,
];
