import { http, HttpResponse } from "msw";

/**
 * Create a 401 Unauthorized handler for any URL pattern.
 * Matches the existing unauthorizedHandler pattern.
 */
export function createUnauthorizedHandler(urlPattern: string) {
  return http.all(urlPattern, () => {
    return HttpResponse.json(
      {
        error: {
          reason: "UNAUTHORIZED",
          details: "Invalid or missing JWT token",
        },
      },
      {
        status: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  });
}

/**
 * Create a 404 Not Found handler for any URL pattern.
 */
export function createNotFoundHandler(urlPattern: string) {
  return http.all(urlPattern, () => {
    return HttpResponse.json(
      {
        error: {
          reason: "NOT_FOUND",
          details: "Resource not found",
        },
      },
      {
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  });
}

/**
 * Create a 429 Rate Limit handler for any URL pattern.
 * Matches the existing rateLimitHandler pattern.
 */
export function createRateLimitHandler(urlPattern: string) {
  return http.all(urlPattern, () => {
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
}

/**
 * Create a 500 Internal Server Error handler for any URL pattern.
 * Matches the existing serverErrorHandler pattern.
 */
export function createServerErrorHandler(urlPattern: string) {
  return http.all(urlPattern, () => {
    return HttpResponse.json(
      {
        error: {
          reason: "INTERNAL_SERVER_ERROR",
          details: "Something went wrong",
        },
      },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  });
}
