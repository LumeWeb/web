// Shared test utilities and configuration
// This file provides common setup for all pinner tests

import { MemoryDatastore } from "datastore-core/memory";
import { configureCar } from "@/upload/car";

// Mock CID generator - creates real valid CIDs dynamically
// Cache of generated mock CIDs
const mockCIDCache = new Map<number, string>();

export async function createMockCID(index: number = 0): Promise<string> {
  // Return cached CID if available
  if (mockCIDCache.has(index)) {
    return mockCIDCache.get(index)!;
  }

  // Create data to hash
  const data = new TextEncoder().encode(`mock-data-${index}`);

  // Create hash using sha256
  const { sha256 } = await import("multiformats/hashes/sha2");
  const hash = await sha256.digest(data);

  // Create CID v1 with raw codec (0x55)
  const { CID } = await import("multiformats/cid");
  const cid = CID.create(1, 0x55, hash);

  const cidString = cid.toString();
  mockCIDCache.set(index, cidString);
  return cidString;
}

// Counter for generating unique request IDs
let requestCounter = 0;

export function resetRequestCounter(): void {
  requestCounter = 0;
}

export function getNextRequestId(): number {
  requestCounter++;
  return requestCounter;
}

// Mock UUID generator for testing - generates deterministic UUIDs
const mockUUIDCache = new Map<number, string>();

export function createMockUUID(index: number = 0): string {
  if (mockUUIDCache.has(index)) {
    return mockUUIDCache.get(index)!;
  }

  // Generate a deterministic UUID-like format for testing
  // Format: 550e8400-e29b-41d4-a716-446655440000
  const segment1 = (index + 0x550e8400).toString(16).padStart(8, "0");
  const segment2 = (index + 0xe29b).toString(16).padStart(4, "0");
  const segment3 = (index + 0x41d4).toString(16).padStart(4, "0");
  const segment4 = "a716";
  const segment5 = (index + 0x446655440000).toString(16).padStart(12, "0");

  const uuid = `${segment1}-${segment2}-${segment3}-${segment4}-${segment5}`;
  mockUUIDCache.set(index, uuid);
  return uuid;
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Create a memory datastore for tests
export function createMemoryDatastore(): MemoryDatastore {
  return new MemoryDatastore();
}

// Common test configuration
export const testConfig = {
  apiUrl: "https://test.pinner.xyz/api",
  mockDelay: 50,
  defaultUploadLimit: 104857600, // 100MB
} as const;

/**
 * Get the account API URL from the base API URL
 * Transforms api.test.com -> account.api.test.com (matching portal-sdk behavior)
 */
export function getAccountApiUrl(baseUrl: string = testConfig.apiUrl): string {
  const urlParsed = new URL(baseUrl);
  urlParsed.hostname = `account.${urlParsed.hostname}`;
  return urlParsed.toString().replace(/\/$/, "");
}

/**
 * Shared CAR preprocessor setup for both Node and browser environments
 * This should be called in beforeEach hooks to configure the CAR preprocessor
 * with a fresh memory datastore for each test
 */
export function setupCarPreprocessor() {
  const datastore = createMemoryDatastore();
  configureCar({ datastore });
}
