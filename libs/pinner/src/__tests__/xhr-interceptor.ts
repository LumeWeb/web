/**
 * XHR Interceptor for MSW browser tests
 *
 * This interceptor allows XHR event handlers (onload, onerror, onprogress, etc.) to fire
 * in browser-based tests with MSW. Without this, MSW's Service Worker intercepts requests
 * before XHR events fire, preventing hooks like onBeforeRequest, onAfterResponse, and shouldRetry
 * from being called.
 *
 * @see https://mswjs.io/docs/recipes/xmlhttprequest-progress-events
 */

import type { RequestHandler } from "msw";
import { getResponse } from "msw";
import { XMLHttpRequestInterceptor } from "@mswjs/interceptors/XMLHttpRequest";

// Create a single global interceptor instance
// XMLHttpRequest can only be patched once per browser context
const interceptor = new XMLHttpRequestInterceptor();

// Store the current handlers (can be updated dynamically)
let currentHandlers: RequestHandler[] = [];

interceptor.on("request", async ({ request, controller }) => {
  // Resolve the request against our MSW handlers
  const response = await getResponse(currentHandlers, request);

  if (response) {
    // If we have a matching handler, use its response
    controller.respondWith(response);
  }
  // If no handler matches, let the request proceed normally
});

/**
 * Apply the interceptor to patch XMLHttpRequest
 * This must be called before any XHR requests are made
 */
export function applyXHRInterceptor() {
  interceptor.apply();
}

/**
 * Update the handlers list dynamically
 */
export function updateHandlers(handlers: RequestHandler[]) {
  currentHandlers = handlers;
}
