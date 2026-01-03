// MSW error handlers for testing error scenarios
// This file provides mock handlers for various error responses

import { http, HttpResponse } from "msw";
import { testConfig } from "./setup";

// ============================================================================
// PIN ERROR HANDLERS
// ============================================================================

// Handler for 404 - Pin not found (empty results)
export const pinNotFoundHandler = http.get(`${testConfig.apiUrl}/pins`, () => {
  return HttpResponse.json(
    {
      count: 0,
      results: [],
    },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
});

// Handler for 401 - Unauthorized
export const unauthorizedHandler = http.all(
  `${testConfig.apiUrl}/pins*`,
  () => {
    return HttpResponse.json(
      {
        error: {
          reason: "UNAUTHORIZED",
          details: "Invalid or missing JWT token",
        },
      },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  },
);

// Handler for 429 - Rate limit exceeded
export const rateLimitHandler = http.all(`${testConfig.apiUrl}/pins*`, () => {
  return HttpResponse.json(
    {
      error: {
        reason: "RATE_LIMIT_EXCEEDED",
        details: "Too many requests",
      },
    },
    {
      status: 429,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Retry-After": "60",
      },
    },
  );
});

// Handler for 500 - Internal server error
export const serverErrorHandler = http.all(`${testConfig.apiUrl}/pins*`, () => {
  return HttpResponse.json(
    {
      error: {
        reason: "INTERNAL_SERVER_ERROR",
        details: "Something went wrong",
      },
    },
    {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
});

// ============================================================================
// UPLOAD ERROR HANDLERS
// ============================================================================

// Handler for upload failure
export const uploadErrorHandler = http.post(
  `${testConfig.apiUrl}/api/upload`,
  () => {
    return HttpResponse.json(
      {
        success: false,
        error: "Upload failed",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  },
);

// Handler for TUS upload failure
export const tusErrorHandler = http.all(
  `${testConfig.apiUrl}/api/upload/tus*`,
  () => {
    return HttpResponse.json(
      {
        error: "TUS upload failed",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  },
);

// ============================================================================
// COMBINED ERROR HANDLERS
// ============================================================================

// All error handlers combined
export const errorHandlers = [
  pinNotFoundHandler,
  unauthorizedHandler,
  rateLimitHandler,
  serverErrorHandler,
  uploadErrorHandler,
  tusErrorHandler,
];
