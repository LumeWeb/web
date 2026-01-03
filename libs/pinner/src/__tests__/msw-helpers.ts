// MSW helper functions for creating mock data
// This file provides utilities for generating mock responses

import type { Pin, PinStatus } from "@ipfs-shipyard/pinning-service-client";
import { Status } from "@ipfs-shipyard/pinning-service-client";
import type { UploadResult } from "@/types/upload";
import { createMockCID, getNextRequestId, testConfig } from "./setup";

// ============================================================================
// PIN HELPERS
// ============================================================================

// Mock pin status generator
export async function createMockPinStatus(
  overrides: Partial<PinStatus> = {},
  pinOverrides?: Partial<Pin>,
): Promise<PinStatus> {
  const requestId = getNextRequestId();
  const cid = await createMockCID(requestId);

  return {
    requestid: overrides.requestid || `req-${Date.now()}-${requestId}`,
    status: overrides.status || Status.Pinned,
    created: overrides.created || new Date(),
    pin: {
      cid: pinOverrides?.cid || overrides.pin?.cid || cid,
      name:
        pinOverrides?.name || overrides.pin?.name || `test-pin-${requestId}`,
      meta: pinOverrides?.meta || overrides.pin?.meta || {},
      origins: pinOverrides?.origins || overrides.pin?.origins || [],
    },
    delegates: overrides.delegates || [],
    info: overrides.info || {},
  };
}

// ============================================================================
// UPLOAD HELPERS
// ============================================================================

// Mock upload result generator
export async function createMockUploadResult(
  overrides: Partial<UploadResult> = {},
): Promise<UploadResult> {
  const requestId = getNextRequestId();
  const cid = overrides.cid || (await createMockCID(requestId));

  return {
    id: overrides.id || "test-upload-id",
    cid,
    name: overrides.name || "test.car",
    size: overrides.size || 1024,
    mimeType: overrides.mimeType || "application/vnd.ipld.car",
    createdAt: overrides.createdAt || new Date(),
    numberOfFiles: overrides.numberOfFiles || 1,
    keyvalues: overrides.keyvalues,
    isDirectory: overrides.isDirectory,
    operationId: overrides.operationId,
  };
}

// ============================================================================
// DELAY HELPERS
// ============================================================================

// Apply mock delay for simulating network latency
export async function applyMockDelay(
  delay: number = testConfig.mockDelay,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delay));
}
