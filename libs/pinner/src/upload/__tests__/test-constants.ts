import type { UploadResult } from "@/types/upload";
import { TUS_SIZE_THRESHOLD } from "@/types/constants";

/**
 * Test constants shared across tests.
 * This file contains only constants with no mock setup to avoid import side effects.
 */

export const DEFAULT_UPLOAD_LIMIT = TUS_SIZE_THRESHOLD; // 100 MB
export const CUSTOM_UPLOAD_LIMIT = 200 * 1024 * 1024; // 200 MB

// Mock configuration for tests
export const MOCK_CONFIG = {
  jwt: "test-jwt-token",
  endpoint: "https://api.test.com",
  gateway: "https://gateway.test.com",
};

// Lazy getter for MOCK_UPLOAD_RESULT to avoid calling getMockCID at module load time
export const MOCK_UPLOAD_RESULT: UploadResult = {
  id: "test-id",
  cid: null as any, // Set by unit-mocks.ts during setup
  name: "test.car",
  size: 1024,
  mimeType: "application/vnd.ipld.car",
  createdAt: new Date(),
  numberOfFiles: 1,
  operationId: 12345,
};
