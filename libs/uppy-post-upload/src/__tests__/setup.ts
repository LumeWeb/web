/**
 * Shared test utilities and configuration for uppy-xhr-upload tests
 */

// Counter for generating unique request IDs
let requestCounter = 0;

export function resetRequestCounter(): void {
  requestCounter = 0;
}

export function getNextRequestId(): number {
  requestCounter++;
  return requestCounter;
}

// Mock file generator
export function createMockFile(overrides: Partial<File> = {}): File {
  const defaultFile = new File([new Uint8Array(8192)], 'test.jpg', {
    type: 'image/jpeg',
  });

  return Object.assign(defaultFile, overrides);
}

// Mock blob generator
export function createMockBlob(size = 8192): Blob {
  return new Blob([new Uint8Array(size)], { type: 'application/octet-stream' });
}

// Common test configuration
export const testConfig = {
  apiUrl: 'https://api.test.com',
  mockDelay: 50,
  defaultTimeout: 30_000,
} as const;
