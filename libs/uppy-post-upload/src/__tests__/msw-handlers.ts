/**
 * MSW (Mock Service Worker) handlers for XHRUpload integration tests
 * Provides mock HTTP responses for upload endpoints
 */

import { vi, type Mock } from "vitest";
import { http, HttpResponse } from "msw";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Standard CORS headers for test handlers
 */
const CORS_HEADERS = {
  "access-control-allow-method": "POST",
  "access-control-allow-origin": "*",
} as const;

/**
 * Creates a standard OPTIONS handler for a given URL pattern
 * @param urlPattern - URL pattern or string to match
 * @param additionalHeaders - Optional additional headers to include
 */
export function createOptionsHandler(
  urlPattern: string | RegExp,
  additionalHeaders: Record<string, string> = {},
) {
  return http.options(urlPattern, () => {
    return HttpResponse.json(null, {
      status: 204,
      headers: { ...CORS_HEADERS, ...additionalHeaders },
    });
  });
}

/**
 * Creates a standard POST handler with CORS headers
 * @param urlPattern - URL pattern or string to match
 * @param body - Response body or function returning body
 * @param status - HTTP status code (default: 200)
 * @param additionalHeaders - Optional additional headers to include
 */
export function createPostHandler(
  urlPattern: string | RegExp,
  body: unknown | ((...args: any[]) => unknown),
  status = 200,
  additionalHeaders: Record<string, string> = {},
) {
  return http.post(urlPattern, (...args: any[]) => {
    const responseBody = typeof body === "function" ? body(...args) : body;
    return HttpResponse.json(responseBody as any, {
      status,
      headers: { ...CORS_HEADERS, ...additionalHeaders },
    });
  });
}

/**
 * Creates a header spy handler that captures a specific header value
 * @param spy - Vitest spy function to capture header value
 * @param headerName - Name of the header to spy on
 * @param url - URL to match (default: "https://api.test.com/upload")
 * @param responseBody - Response body to return (default: standard success response)
 */
export function createHeaderSpyHandler(
  spy: Mock,
  headerName: string,
  url = "https://api.test.com/upload",
  responseBody: unknown = { url: "https://api.test.com/files/random-id" },
) {
  return http.post(url, ({ request }) => {
    spy(request.headers.get(headerName));
    return HttpResponse.json(responseBody as Record<string, unknown>, {
      status: 200,
      headers: CORS_HEADERS,
    });
  });
}

/**
 * Creates OPTIONS + POST handler pair for upload endpoints
 * @param endpoint - The upload endpoint (e.g., "upload" or "upload-bundle")
 * @param responseBody - Response body for the POST handler
 */
export function createUploadHandlerPair(
  endpoint: string,
  responseBody: unknown = { url: "https://api.test.com/files/random-id" },
) {
  return [
    createOptionsHandler(`https://api.test.com/${endpoint}`),
    createPostHandler(`https://api.test.com/${endpoint}`, responseBody),
  ];
}

// ============================================================================
// SUCCESS HANDLERS
// ============================================================================

export const uploadSuccessHandler = http.post(
  "https://api.test.com/upload",
  async ({ request }) => {
    const body = await request.text();

    return HttpResponse.json(
      {
        url: "https://api.test.com/files/random-id",
        size: body.length,
      },
      {
        status: 200,
        headers: CORS_HEADERS,
      },
    );
  },
);

export const uploadWithOptionsHandler = http.post(
  "https://api.test.com/upload/:filename",
  async ({ request, params }) => {
    const { filename } = params;
    const body = await request.text();

    return HttpResponse.json(
      {
        url: `https://api.test.com/files/${filename}`,
        size: body.length,
      },
      {
        status: 200,
        headers: {
          "access-control-allow-origin": "*",
        },
      },
    );
  },
);

export const uploadBundleHandler = http.post(
  "https://api.test.com/upload-bundle/:filenames",
  async ({ request, params }) => {
    const { filenames } = params;
    const body = await request.text();

    return HttpResponse.json(
      {
        url: `https://api.test.com/files/bundle-${filenames}`,
        size: body.length,
      },
      {
        status: 200,
        headers: {
          "access-control-allow-origin": "*",
        },
      },
    );
  },
);

export const optionsHandler = createOptionsHandler("https://api.test.com/*", {
  "access-control-allow-headers": "x-sample-header",
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

export const unauthorizedHandler = createPostHandler(
  "https://api.test.com/upload",
  { status: 401, message: "Unauthorized" },
  401,
);

export const rateLimitHandler = createPostHandler(
  "https://api.test.com/upload",
  { status: 429, message: "Rate limit exceeded" },
  429,
  { "retry-after": "5" },
);

export const serverErrorHandler = createPostHandler(
  "https://api.test.com/upload",
  { status: 500, message: "Internal server error" },
  500,
);

export const badRequestHandler = createPostHandler(
  "https://api.test.com/upload",
  { status: 400, message: "Bad request" },
  400,
);

export const networkErrorHandler = http.post(
  "https://api.test.com/upload",
  () => {
    return HttpResponse.error();
  },
);

// ============================================================================
// CUSTOM HANDLERS
// ============================================================================

export const createCustomUploadHandler = (
  response: unknown,
  status: number = 200,
) => {
  const headers = {
    "access-control-allow-method": "POST",
    "access-control-allow-origin": "*",
  };

  return http.post("https://api.test.com/upload", () =>
    typeof response === "string"
      ? HttpResponse.text(response, { status, headers })
      : HttpResponse.json(response as any, { status, headers }),
  );
};

// ============================================================================
// HANDLER COLLECTIONS
// ============================================================================

export const successHandlers = [
  optionsHandler,
  uploadSuccessHandler,
  uploadWithOptionsHandler,
  uploadBundleHandler,
];

export const errorHandlers = [
  optionsHandler,
  unauthorizedHandler,
  rateLimitHandler,
  serverErrorHandler,
  badRequestHandler,
  networkErrorHandler,
];

// ============================================================================
// SHARED HANDLERS (Used by both browser and Node integration tests)
// ============================================================================

/**
 * Handler for custom header tests - spies on X-Custom-Header header
 * @param spy - Vitest spy function to capture header value
 */
export const createCustomHeaderSpyHandler = (spy: Mock) =>
  createHeaderSpyHandler(spy, "X-Custom-Header");

/**
 * Handler for file name header tests - spies on X-File-Name header
 * @param spy - Vitest spy function to capture header value
 */
export const createFileNameHeaderSpyHandler = (spy: Mock) =>
  createHeaderSpyHandler(spy, "X-File-Name");

/**
 * Handler for shouldRetry hook tests - always returns 500
 */
export const shouldRetryTestHandler = createPostHandler(
  "https://api.test.com/upload",
  { status: 500, message: "Server error" },
  500,
);

/**
 * Handler for metadata inclusion tests
 * @param fieldName - The metadata field name to capture and return
 * @returns Handler that echoes the metadata field value in response
 */
export const createMetadataEchoHandler = (fieldName: string) =>
  http.post("https://api.test.com/upload", async ({ request }) => {
    const formData = await request.formData();
    const metadata = formData.get(fieldName);
    return HttpResponse.json({
      url: "https://example.com/file",
      metadata,
    });
  });

/**
 * Handler for metadata filtering tests
 * @param allowedField - The field that should be included
 * @param disallowedField - The field that should be excluded
 * @returns Handler that returns both field values for verification
 */
export const createMetadataFilterHandler = (
  allowedField: string,
  disallowedField: string,
) =>
  http.post("https://api.test.com/upload", async ({ request }) => {
    const formData = await request.formData();
    const allowed = formData.get(allowedField);
    const disallowed = formData.get(disallowedField);
    return HttpResponse.json({
      url: "https://example.com/file",
      allowed,
      disallowed,
    });
  });

// Combined handlers for all operations
export const allHandlers = [...successHandlers, ...errorHandlers];

// ============================================================================
// SETUP UTILITIES
// ============================================================================

export { resetRequestCounter } from "./setup";
