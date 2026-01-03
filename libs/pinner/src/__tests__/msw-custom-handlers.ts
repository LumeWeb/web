// MSW custom handler helpers for testing edge cases
// This file provides utilities to create custom handlers for testing

import { http, HttpResponse } from "msw";
import {
  applyMockDelay,
  createMockPinStatus,
  createMockUploadResult,
} from "./msw-helpers";

// ============================================================================
// CUSTOM PIN HANDLERS
// ============================================================================

// Helper to create custom pin handlers for testing edge cases
export function createCustomPinHandlers(config: {
  endpoint?: string;
  shouldFail?: boolean;
  statusCode?: number;
  delay?: number;
}) {
  const endpoint = config.endpoint || "https://api.test.com";
  const shouldFail = config.shouldFail || false;
  const statusCode = config.statusCode || 500;
  const delay = config.delay || 50;

  return [
    http.post(`${endpoint}/pins`, async () => {
      await applyMockDelay(delay);

      if (shouldFail) {
        return HttpResponse.json(
          { error: "Pin creation failed" },
          { status: statusCode },
        );
      }

      const mockPin = await createMockPinStatus();
      return HttpResponse.json(mockPin, { status: 202 });
    }),

    http.get(`${endpoint}/pins`, async () => {
      await applyMockDelay(delay);

      if (shouldFail) {
        return HttpResponse.json(
          { error: "Pin list failed" },
          { status: statusCode },
        );
      }

      return HttpResponse.json(
        {
          count: 1,
          results: [await createMockPinStatus()],
        },
        { status: 200 },
      );
    }),

    http.post(`${endpoint}/pins/:requestid`, async () => {
      await applyMockDelay(delay);

      if (shouldFail) {
        return HttpResponse.json(
          { error: "Pin update failed" },
          { status: statusCode },
        );
      }

      const mockPin = await createMockPinStatus();
      return HttpResponse.json(mockPin, { status: 202 });
    }),
  ];
}

// ============================================================================
// CUSTOM UPLOAD HANDLERS
// ============================================================================

// Helper to create custom upload handlers for testing edge cases
export function createCustomUploadHandlers(config: {
  endpoint?: string;
  shouldFail?: boolean;
  uploadLimit?: number;
  delay?: number;
}) {
  const endpoint = config.endpoint || "https://api.test.com";
  const shouldFail = config.shouldFail || false;
  const delay = config.delay || 100;

  return [
    http.post(`${endpoint}/api/upload`, async () => {
      await applyMockDelay(delay);

      if (shouldFail) {
        return HttpResponse.json(
          { success: false, error: "Upload failed" },
          { status: 500 },
        );
      }

      const result = await createMockUploadResult();
      return HttpResponse.json(result, { status: 200 });
    }),
  ];
}
